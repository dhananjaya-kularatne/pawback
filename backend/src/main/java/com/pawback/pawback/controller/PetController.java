package com.pawback.pawback.controller;

import com.pawback.pawback.dto.request.CreatePetRequest;
import com.pawback.pawback.dto.request.UpdatePetRequest;
import com.pawback.pawback.dto.request.UpdateStatusRequest;
import com.pawback.pawback.dto.response.ApiResponse;
import com.pawback.pawback.dto.response.PetResponse;
import com.pawback.pawback.dto.response.PagedResponse;
import com.pawback.pawback.dto.response.ScanReportResponse;
import com.pawback.pawback.service.OwnerReportService;
import com.pawback.pawback.service.PetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.RequiredArgsConstructor;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;
    private final OwnerReportService ownerReportService;
    

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<PetResponse>> createPet(
            @RequestPart("pet") @Valid CreatePetRequest request,
            @RequestPart("image") MultipartFile image,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {

        PetResponse response = petService.createPet(request, image, idempotencyKey);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Pet registered successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePet(@PathVariable Long id) {
        petService.deletePet(id);
        return ResponseEntity.ok(ApiResponse.success("Pet removed successfully", null));
    }

    // Returns all pets belonging to the currently authenticated owner
    @GetMapping
    public ResponseEntity<ApiResponse<List<PetResponse>>> getMyPets() {

        List<PetResponse> pets = petService.getMyPets();

        return ResponseEntity.ok(
                ApiResponse.success("Pets retrieved successfully", pets)
        );
    }

    // Updates an existing pet — only the owning user may perform this
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<PetResponse>> updatePet(
            @PathVariable Long id,
            @RequestPart("pet") @Valid UpdatePetRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        PetResponse response = petService.updatePet(id, request, image);

        return ResponseEntity.ok(
                ApiResponse.success("Pet updated successfully", response)
        );
    }
    // Returns a single pet by id, if owned by the current user
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PetResponse>> getPetById(@PathVariable Long id) {
        PetResponse response = petService.getPetById(id);
        return ResponseEntity.ok(ApiResponse.success("Pet retrieved successfully", response));
    }

    // Report history is private to the pet's owner, including after it is Safe again.
    @GetMapping("/{id}/reports")
    public ResponseEntity<ApiResponse<PagedResponse<ScanReportResponse>>> getReports(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(ApiResponse.success("Reports retrieved successfully",
                ownerReportService.listReports(id, page, size)));
    }

    // Updates a pet's Lost/Safe status
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PetResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid UpdateStatusRequest request) {

        PetResponse response = petService.updateStatus(id, request.getStatus());

        return ResponseEntity.ok(
                ApiResponse.success("Pet status updated successfully", response)
        );
    }

}
