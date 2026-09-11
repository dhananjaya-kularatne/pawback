package com.pawback.pawback.service;

import com.pawback.pawback.dto.response.AdminScanReportResponse;
import com.pawback.pawback.dto.response.PagedResponse;
import com.pawback.pawback.exception.ResourceNotFoundException;
import com.pawback.pawback.model.Pet;
import com.pawback.pawback.model.ScanReport;
import com.pawback.pawback.repository.ScanReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminReportServiceTest {

    @Mock
    private ScanReportRepository scanReportRepository;

    @InjectMocks
    private AdminReportService adminReportService;

    private Pet pet;
    private ScanReport report;

    @BeforeEach
    void setUp() {
        pet = Pet.builder().id(5L).name("Rex").petUuid(UUID.randomUUID()).build();
        report = ScanReport.builder()
                .id(1L)
                .message("Seen near the park")
                .pet(pet)
                .createdAt(Instant.now())
                .build();
    }

    @Test
    void listReports_MapsPetInfoOntoEachReport() {
        Page<ScanReport> page = new PageImpl<>(List.of(report), Pageable.ofSize(20), 1);
        when(scanReportRepository.search(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        PagedResponse<AdminScanReportResponse> result =
                adminReportService.listReports(null, null, null, 0, 20);

        assertEquals(1, result.getTotalElements());
        AdminScanReportResponse first = result.getContent().get(0);
        assertEquals(1L, first.getId());
        assertEquals(5L, first.getPetId());
        assertEquals("Rex", first.getPetName());
        assertEquals(pet.getPetUuid(), first.getPetUuid());
    }

    @Test
    void listReports_PassesPetIdFilterThrough() {
        Page<ScanReport> page = new PageImpl<>(List.of(report), Pageable.ofSize(20), 1);
        when(scanReportRepository.search(eq(5L), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        adminReportService.listReports(5L, null, null, 0, 20);

        verify(scanReportRepository).search(eq(5L), isNull(), isNull(), any(Pageable.class));
    }

    @Test
    void listReports_ConvertsDateRangeToUtcInstantBounds() {
        Page<ScanReport> page = new PageImpl<>(List.of(), Pageable.ofSize(20), 0);
        ArgumentCaptor<Instant> fromCaptor = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> toCaptor = ArgumentCaptor.forClass(Instant.class);
        when(scanReportRepository.search(isNull(), fromCaptor.capture(), toCaptor.capture(), any(Pageable.class)))
                .thenReturn(page);

        adminReportService.listReports(null, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 10), 0, 20);

        assertEquals(Instant.parse("2026-09-01T00:00:00Z"), fromCaptor.getValue());
        assertEquals(Instant.parse("2026-09-11T00:00:00Z"), toCaptor.getValue());
    }

    @Test
    void deleteReport_ExistingReport_DeletesById() {
        when(scanReportRepository.existsById(1L)).thenReturn(true);

        adminReportService.deleteReport(1L);

        verify(scanReportRepository).deleteById(1L);
    }

    @Test
    void deleteReport_UnknownReport_ThrowsAndNeverDeletes() {
        when(scanReportRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> adminReportService.deleteReport(99L));
        verify(scanReportRepository, never()).deleteById(anyLong());
    }
}
