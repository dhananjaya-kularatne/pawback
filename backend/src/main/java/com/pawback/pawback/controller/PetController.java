package com.pawback.pawback.controller;

import com.pawback.pawback.dto.request.CreatePetRequest;
import com.pawback.pawback.dto.request.UpdatePetRequest;
import com.pawback.pawback.dto.response.ApiResponse;
import com.pawback.pawback.dto.response.PetResponse;
import com.pawback.pawback.service.PetService;
import jakarta.validation.Valid;
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
    

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<PetResponse>> createPet(
            @RequestPart("pet") @Valid CreatePetRequest request,
            @RequestPart("image") MultipartFile image) {

        PetResponse response = petService.createPet(request, image);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Pet registered successfully", response));
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
}