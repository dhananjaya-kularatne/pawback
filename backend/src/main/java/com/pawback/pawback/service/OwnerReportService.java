package com.pawback.pawback.service;

import com.pawback.pawback.dto.response.PagedResponse;
import com.pawback.pawback.dto.response.ScanReportResponse;
import com.pawback.pawback.exception.AccessDeniedException;
import com.pawback.pawback.exception.ResourceNotFoundException;
import com.pawback.pawback.model.Pet;
import com.pawback.pawback.model.ScanReport;
import com.pawback.pawback.model.User;
import com.pawback.pawback.repository.PetRepository;
import com.pawback.pawback.repository.ScanReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OwnerReportService {

    private final PetRepository petRepository;
    private final ScanReportRepository scanReportRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ScanReportResponse> listReports(Long petId, int page, int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User owner)) {
            throw new AccessDeniedException("Not authenticated");
        }

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));
        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You do not have permission to view this pet's reports");
        }

        // The id breaks timestamp ties so reports have a consistent page order.
        PageRequest pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return PagedResponse.from(scanReportRepository.findByPetId(petId, pageable)
                .map(this::toResponse));
    }

    private ScanReportResponse toResponse(ScanReport report) {
        return ScanReportResponse.builder()
                .id(report.getId())
                .message(report.getMessage())
                .photoUrl(report.getPhotoUrl())
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
