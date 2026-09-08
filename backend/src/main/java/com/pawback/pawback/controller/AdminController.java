package com.pawback.pawback.controller;

import com.pawback.pawback.dto.response.ApiResponse;
import com.pawback.pawback.dto.response.PagedResponse;
import com.pawback.pawback.dto.response.UserResponse;
import com.pawback.pawback.model.User;
import com.pawback.pawback.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only endpoints. Every route here requires an ADMIN role claim in the JWT —
 * the class-level @PreAuthorize gate rejects any other caller with 403 before the
 * handler runs. Beyond the baseline role check it now covers user moderation:
 * listing every registered user and disabling one.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminUserService adminUserService;

    // Confirms the caller holds a valid ADMIN token and echoes back their identity
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> currentAdmin(Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return ResponseEntity.ok(
                ApiResponse.success("Admin access granted", UserResponse.fromUser(admin))
        );
    }

    // Paginated list of every registered user for the admin moderation view
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                ApiResponse.success("Users retrieved successfully", adminUserService.listUsers(page, size))
        );
    }

    // Disables a user account — server rejects an admin disabling themselves
    @PatchMapping("/users/{id}/disable")
    public ResponseEntity<ApiResponse<UserResponse>> disableUser(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("User disabled successfully", adminUserService.disableUser(id))
        );
    }
}
