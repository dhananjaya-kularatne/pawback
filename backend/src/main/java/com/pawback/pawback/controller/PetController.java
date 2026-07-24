package com.pawback.pawback.controller;

import com.pawback.pawback.dto.request.CreatePetRequest;
import com.pawback.pawback.dto.response.ApiResponse;
import com.pawback.pawback.dto.response.PetResponse;
import com.pawback.pawback.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
}