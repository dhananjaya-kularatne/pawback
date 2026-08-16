package com.pawback.pawback.controller;

import com.pawback.pawback.dto.request.CreateReportRequest;
import com.pawback.pawback.dto.response.ApiResponse;
import com.pawback.pawback.dto.response.PublicPetResponse;
import com.pawback.pawback.dto.response.ScanReportResponse;
import com.pawback.pawback.service.PetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

// Public endpoints for finders scanning a pet's QR code — no authentication required
@RestController
@RequestMapping("/api/scan")
@RequiredArgsConstructor
public class ScanController {

    private final PetService petService;

    @GetMapping("/{petUuid}")
    public ResponseEntity<ApiResponse<PublicPetResponse>> getPetByUuid(@PathVariable String petUuid) {
        PublicPetResponse response = petService.getPetByUuid(petUuid);
        return ResponseEntity.ok(
                ApiResponse.success("Pet retrieved successfully", response)
        );
    }

    // Submits a finder's report for a Lost pet — no authentication required
    @PostMapping(value = "/{petUuid}/report", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ScanReportResponse>> createReport(
            @PathVariable String petUuid,
            @RequestPart("report") @Valid CreateReportRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        ScanReportResponse response = petService.createReport(petUuid, request, photo);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Report submitted successfully", response));
    }
}