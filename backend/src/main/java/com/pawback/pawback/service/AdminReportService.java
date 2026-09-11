package com.pawback.pawback.service;

import com.pawback.pawback.dto.response.AdminScanReportResponse;
import com.pawback.pawback.dto.response.PagedResponse;
import com.pawback.pawback.exception.ResourceNotFoundException;
import com.pawback.pawback.model.ScanReport;
import com.pawback.pawback.repository.ScanReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

/**
 * Admin moderation over scan reports platform-wide. The calling controller is already gated to ADMIN by SecurityConfig's method security. Unlike pets,
 * reports have no soft-delete column, so removing one here is permanent, it disappears from this view and the owning pet's report history in the same
 * transaction.
 */
@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final ScanReportRepository scanReportRepository;

    // Every scan report platform-wide, newest first, optionally narrowed to one
    // pet and/or a date range. `from`/`to` are whole days in UTC; `to` is
    // inclusive of that day, exclusive of the next.
    @Transactional(readOnly = true)
    public PagedResponse<AdminScanReportResponse> listReports(
            Long petId, LocalDate from, LocalDate to, int page, int size) {

        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant = to != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;

        Page<ScanReport> reports = scanReportRepository.search(
                petId, fromInstant, toInstant,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return PagedResponse.from(reports.map(this::toResponse));
    }

    // Permanently deletes a report. It's a hard delete, not the soft-delete
    // pattern used for pets. Rejects an unknown id rather than silently no-op-ing.
    @Transactional
    public void deleteReport(Long reportId) {
        if (!scanReportRepository.existsById(reportId)) {
            throw new ResourceNotFoundException("Report not found");
        }
        scanReportRepository.deleteById(reportId);
    }

    private AdminScanReportResponse toResponse(ScanReport report) {
        return AdminScanReportResponse.builder()
                .id(report.getId())
                .message(report.getMessage())
                .photoUrl(report.getPhotoUrl())
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .createdAt(report.getCreatedAt())
                .petId(report.getPet().getId())
                .petName(report.getPet().getName())
                .petUuid(report.getPet().getPetUuid())
                .build();
    }
}
