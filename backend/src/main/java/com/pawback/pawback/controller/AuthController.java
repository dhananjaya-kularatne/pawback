package com.pawback.pawback.controller;

import com.pawback.pawback.dto.request.ForgotPasswordRequest;
import com.pawback.pawback.dto.request.LoginRequest;
import com.pawback.pawback.dto.request.RegisterRequest;
import com.pawback.pawback.dto.request.ResetPasswordRequest;
import com.pawback.pawback.dto.request.VerifyOtpRequest;
import com.pawback.pawback.dto.response.ApiResponse;
import com.pawback.pawback.dto.response.AuthResponse;
import com.pawback.pawback.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Registers a new user account with email and password, returning JWT token
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Account created successfully", response));
    }

    // Authenticates a user with email and password, returning JWT token
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // Requests a password reset OTP to be sent to the given email
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        // We always return the same success message to prevent email enumeration
        return ResponseEntity.ok(ApiResponse.success("If this email is registered, a password reset code has been sent.", null));
    }

    // Verifies the 6-digit OTP sent to the user's email
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully. You may now reset your password.", null));
    }

    // Sets a new password using the verified OTP
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully.", null));
    }
}
