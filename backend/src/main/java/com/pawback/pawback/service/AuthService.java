package com.pawback.pawback.service;

import com.pawback.pawback.dto.request.ForgotPasswordRequest;
import com.pawback.pawback.dto.request.LoginRequest;
import com.pawback.pawback.dto.request.RegisterRequest;
import com.pawback.pawback.dto.request.ResetPasswordRequest;
import com.pawback.pawback.dto.request.VerifyOtpRequest;
import com.pawback.pawback.dto.response.AuthResponse;
import com.pawback.pawback.dto.response.UserResponse;
import com.pawback.pawback.exception.EmailAlreadyExistsException;
import com.pawback.pawback.exception.InvalidCredentialsException;
import com.pawback.pawback.model.AuthProvider;
import com.pawback.pawback.model.Role;
import com.pawback.pawback.model.User;
import com.pawback.pawback.repository.UserRepository;
import com.pawback.pawback.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    // Registers a new user account with email and BCrypt hashed password
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("An account with this email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .provider(AuthProvider.LOCAL)
                .role(Role.OWNER)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromUser(savedUser))
                .build();
    }

    // Authenticates a user with email and password, returning JWT token
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromUser(user))
                .build();
    }

    // Triggers a password reset by generating a 6-digit OTP, storing its hash, and emailing it
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // We look up the user, but we don't throw an exception if not found to prevent enumeration
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String otp = String.format("%06d", secureRandom.nextInt(1000000));
            user.setResetOtpHash(passwordEncoder.encode(otp));
            user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
            emailService.sendPasswordResetOtp(user.getEmail(), otp);
        });
    }

    // Verifies the provided OTP against the hashed OTP in the DB, checking expiry
    @Transactional(readOnly = true)
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid OTP or expired"));

        if (user.getResetOtpHash() == null || user.getResetOtpExpiry() == null || user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Invalid OTP or expired");
        }

        if (!passwordEncoder.matches(request.getOtp(), user.getResetOtpHash())) {
            throw new InvalidCredentialsException("Invalid OTP or expired");
        }
    }

    // Sets a new password for the user, verifying the OTP one last time and invalidating it
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid OTP or expired"));

        if (user.getResetOtpHash() == null || user.getResetOtpExpiry() == null || user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Invalid OTP or expired");
        }

        if (!passwordEncoder.matches(request.getOtp(), user.getResetOtpHash())) {
            throw new InvalidCredentialsException("Invalid OTP or expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtpHash(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);
    }
}
