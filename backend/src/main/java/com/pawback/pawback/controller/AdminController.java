package com.pawback.pawback.controller;

import com.pawback.pawback.dto.response.ApiResponse;
import com.pawback.pawback.dto.response.UserResponse;
import com.pawback.pawback.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only endpoints. Every route here requires an ADMIN role claim in the JWT —
 * the class-level @PreAuthorize gate rejects any other caller with 403 before the
 * handler runs. This controller is the baseline role check; the richer admin
 * features (user management, platform stats, scan reports) live in their own stories.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    // Confirms the caller holds a valid ADMIN token and echoes back their identity
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> currentAdmin(Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return ResponseEntity.ok(
                ApiResponse.success("Admin access granted", UserResponse.fromUser(admin))
        );
    }
}
