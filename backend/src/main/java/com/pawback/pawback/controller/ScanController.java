package com.pawback.pawback.controller;

import com.pawback.pawback.dto.response.ApiResponse;
import com.pawback.pawback.dto.response.PublicPetResponse;
import com.pawback.pawback.service.PetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}