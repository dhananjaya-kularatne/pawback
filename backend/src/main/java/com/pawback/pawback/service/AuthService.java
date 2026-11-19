package com.pawback.pawback.service;

import com.pawback.pawback.dto.request.ForgotPasswordRequest;
import com.pawback.pawback.dto.request.LoginRequest;
import com.pawback.pawback.dto.request.RegisterRequest;
import com.pawback.pawback.dto.request.ResetPasswordRequest;
import com.pawback.pawback.dto.request.VerifyOtpRequest;
import com.pawback.pawback.dto.response.AuthResponse;
import com.pawback.pawback.dto.response.UserResponse;
import com.pawback.pawback.exception.DisabledAccountException;
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
    private final com.pawback.pawback.security.LoginRateLimiter limiter;
    @org.springframework.beans.factory.annotation.Value("${app.security.rate-limit.login.max-attempts:10}") private int loginLimit;
    @org.springframework.beans.factory.annotation.Value("${app.security.rate-limit.login.window-minutes:15}") private int loginWindow;

    private final SecureRandom secureRandom = new SecureRandom();

    // Registers a new user account with email and BCrypt hashed password
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(normalize(request.getEmail()))) {
            throw new EmailAlreadyExistsException("An account with this email already exists");
        }

        User user = User.builder()
                .email(normalize(request.getEmail()))
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
    public AuthResponse login(LoginRequest request, String client) {
        String email=normalize(request.getEmail());
        if(loginLimit<1 || loginLimit>1000 || loginWindow<1 || loginWindow>1440) throw new IllegalStateException("Invalid login rate-limit configuration");
        if(!limiter.tryConsume("login-client",client,loginLimit,loginWindow) || !limiter.tryConsume("login-account",email,loginLimit,loginWindow)) throw limited(loginWindow);

        User user = userRepository.findByEmail(normalize(request.getEmail()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (user.getPasswordHash()==null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // A user an admin has disabled can authenticate with the right password
        // Moderation is enforced before issuing a session.
        if (!user.isEnabled()) {
            throw new DisabledAccountException("This account has been disabled. Please contact support.");
        }

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromUser(user))
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request,String client) {
        String email=normalize(request.getEmail());
        if(!limiter.tryConsume("reset-request-client",client,5,15)) throw limited(15);
        if(!limiter.tryConsume("reset-request-account",email,3,60) || !limiter.tryConsume("reset-cooldown",email,1,1)) return;
        userRepository.findForReset(email).filter(u->u.isEnabled() && u.getProvider()==AuthProvider.LOCAL).ifPresent(user->{
            String otp=String.format("%06d",secureRandom.nextInt(1000000));
            user.setResetOtpHash("v1:"+passwordEncoder.encode(otp));
            user.setResetOtpExpiry(LocalDateTime.now(java.time.ZoneOffset.UTC).plusMinutes(10));
            user.setResetOtpAttempts(0);
            userRepository.save(user);
            emailService.sendPasswordResetOtp(user.getEmail(),otp);
        });
    }
    @Transactional(noRollbackFor=InvalidCredentialsException.class)
    public void verifyOtp(VerifyOtpRequest request,String client) {
        verifyBudget(request.getEmail(),client);
        verifyCode(request.getEmail(),request.getOtp());
    }
    @Transactional(noRollbackFor=InvalidCredentialsException.class)
    public void resetPassword(ResetPasswordRequest request,String client) {
        verifyBudget(request.getEmail(),client);
        User user=verifyCode(request.getEmail(),request.getOtp());
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtpHash(null);user.setResetOtpExpiry(null);user.setResetOtpAttempts(0);
        user.setTokenVersion(user.getTokenVersion()+1);
        emailService.cancelPasswordReset(user.getEmail());
        userRepository.saveAndFlush(user);
    }
    private void verifyBudget(String email,String client){
        if(!limiter.tryConsume("reset-verify-client",client,20,15) || !limiter.tryConsume("reset-verify-account",normalize(email),10,15)) throw limited(15);
    }
    private User verifyCode(String email,String otp){
        User user=userRepository.findForReset(normalize(email)).orElseThrow(this::invalidCode);
        if(!user.isEnabled() || user.getProvider()!=AuthProvider.LOCAL || user.getResetOtpHash()==null || !user.getResetOtpHash().startsWith("v1:") || user.getResetOtpExpiry()==null
                || !user.getResetOtpExpiry().isAfter(LocalDateTime.now(java.time.ZoneOffset.UTC)) || user.getResetOtpAttempts()>=5){
            user.setResetOtpHash(null);user.setResetOtpExpiry(null);emailService.cancelPasswordReset(user.getEmail());userRepository.saveAndFlush(user);throw invalidCode();
        }
        if(!passwordEncoder.matches(otp,user.getResetOtpHash().substring(3))){
            user.setResetOtpAttempts(user.getResetOtpAttempts()+1);
            if(user.getResetOtpAttempts()>=5){user.setResetOtpHash(null);user.setResetOtpExpiry(null);emailService.cancelPasswordReset(user.getEmail());}
            userRepository.saveAndFlush(user);throw invalidCode();
        }
        return user;
    }
    private InvalidCredentialsException invalidCode(){return new InvalidCredentialsException("This reset code is incorrect or has expired.");}
    private com.pawback.pawback.exception.AuthenticationLimitException limited(int minutes){return new com.pawback.pawback.exception.AuthenticationLimitException(minutes*60);}
    private String normalize(String email){return email.trim().toLowerCase(java.util.Locale.ROOT);}
}
