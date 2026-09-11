package com.pawback.pawback.controller;

import com.pawback.pawback.dto.response.AdminScanReportResponse;
import com.pawback.pawback.dto.response.AdminStatsResponse;
import com.pawback.pawback.dto.response.ApiResponse;
import com.pawback.pawback.dto.response.PagedResponse;
import com.pawback.pawback.dto.response.UserResponse;
import com.pawback.pawback.model.User;
import com.pawback.pawback.service.AdminReportService;
import com.pawback.pawback.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Admin-only endpoints. Every route here requires an ADMIN role claim in the JWT:
 * the class-level @PreAuthorize gate rejects any other caller with 403 before the
 * handler runs. Beyond the baseline role check it covers user moderation (listing,
 * enable/disable) and scan report moderation (platform-wide listing and deletion).
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminUserService adminUserService;
    private final AdminReportService adminReportService;

    // Confirms the caller holds a valid ADMIN token and echoes back their identity
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> currentAdmin(Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return ResponseEntity.ok(
                ApiResponse.success("Admin access granted", UserResponse.fromUser(admin))
        );
    }

    // Headline counts for the admin console summary tiles
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> stats() {
        return ResponseEntity.ok(
                ApiResponse.success("Stats retrieved successfully", adminUserService.stats())
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
                ApiResponse.success("User disabled successfully", adminUserService.setUserEnabled(id, false))
        );
    }

    // Re-enables a previously disabled user account
    @PatchMapping("/users/{id}/enable")
    public ResponseEntity<ApiResponse<UserResponse>> enableUser(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("User enabled successfully", adminUserService.setUserEnabled(id, true))
        );
    }

    // Every scan report platform-wide, paginated and optionally filtered by pet
    // and/or a from/to date range for the admin moderation view
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<PagedResponse<AdminScanReportResponse>>> listReports(
            @RequestParam(required = false) Long petId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                ApiResponse.success("Reports retrieved successfully",
                        adminReportService.listReports(petId, from, to, page, size))
        );
    }

    // Permanently deletes a scan report. It's a hard delete, unlike the soft-delete
    // pattern used for pets. Removes it from this view and the pet's own report
    // history in the same transaction.
    @DeleteMapping("/reports/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable Long id) {
        adminReportService.deleteReport(id);
        return ResponseEntity.ok(ApiResponse.success("Report deleted successfully", null));
    }
}
