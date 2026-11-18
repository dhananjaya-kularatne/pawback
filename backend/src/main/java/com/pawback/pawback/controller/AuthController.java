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
    private final com.pawback.pawback.security.ClientAddressResolver addresses;
    private final com.pawback.pawback.security.oauth2.OAuthExchangeService exchange;
    public record ExchangeRequest(@jakarta.validation.constraints.Pattern(regexp="[A-Za-z0-9_-]{43}") @jakarta.validation.constraints.NotNull String code) {}
    @PostMapping("/oauth/exchange")
    public ResponseEntity<ApiResponse<AuthResponse>> exchange(@Valid @RequestBody ExchangeRequest body, jakarta.servlet.http.HttpServletRequest request) {
        return ResponseEntity.ok().header("Cache-Control","no-store").body(ApiResponse.success("Google sign-in completed",exchange.exchange(request,body.code())));
    }

    @org.springframework.web.bind.annotation.GetMapping("/me")
    public ResponseEntity<ApiResponse<com.pawback.pawback.dto.response.UserResponse>> currentUser(
            org.springframework.security.core.Authentication authentication) {
        var user = (com.pawback.pawback.model.User) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Account retrieved", com.pawback.pawback.dto.response.UserResponse.fromUser(user)));
    }

    // Registers a new user account with email and password, returning JWT token
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Account created successfully", response));
    }

    // Authenticates a user with email and password, returning JWT token
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        AuthResponse response = authService.login(request, addresses.resolve(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // Requests a password reset OTP to be sent to the given email
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        authService.forgotPassword(request, addresses.resolve(httpRequest));
        // We always return the same success message to prevent email enumeration
        return ResponseEntity.ok(ApiResponse.success("If this account is eligible, a password reset code will be sent.", null));
    }

    // Verifies the 6-digit OTP sent to the user's email
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        authService.verifyOtp(request, addresses.resolve(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully. You may now reset your password.", null));
    }

    // Sets a new password using the verified OTP
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        authService.resetPassword(request, addresses.resolve(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully.", null));
    }
}
