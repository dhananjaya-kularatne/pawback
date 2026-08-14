package com.pawback.pawback.service;

import com.pawback.pawback.dto.request.CreatePetRequest;
import com.pawback.pawback.dto.request.CreateReportRequest;
import com.pawback.pawback.dto.request.UpdatePetRequest;
import com.pawback.pawback.dto.response.PetResponse;
import com.pawback.pawback.dto.response.PublicPetResponse;
import com.pawback.pawback.dto.response.ScanReportResponse;
import com.pawback.pawback.model.Pet;
import com.pawback.pawback.model.PetStatus;
import com.pawback.pawback.model.ScanReport;
import com.pawback.pawback.model.User;
import com.pawback.pawback.repository.PetRepository;
import com.pawback.pawback.repository.ScanReportRepository;
import com.pawback.pawback.repository.UserRepository;
import lombok.RequiredArgsConstructor;


import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final QrCodeService qrCodeService;
    private final ScanReportRepository scanReportRepository; 

    public PetResponse createPet(CreatePetRequest request, MultipartFile image) {

        // TEMPORARY — will be replaced with real JWT-based lookup once PAW-18 merges
        Long ownerId = getCurrentOwnerId();

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        String photoUrl = cloudinaryService.uploadPetImage(image);

        Pet pet = Pet.builder()
                .name(request.getName())
                .breed(request.getBreed())
                .description(request.getDescription())
                .ifFoundInstructions(request.getIfFoundInstructions())
                .photoUrl(photoUrl)
                .status(PetStatus.SAFE)
                .owner(owner)
                .build();

        Pet savedPet = petRepository.save(pet);

        // Generate the QR code now that petUuid is confirmed, then attach and re-save
        String qrCodeUrl = qrCodeService.generateAndUploadQrCode(savedPet.getPetUuid().toString());
        savedPet.setQrCodeUrl(qrCodeUrl);
        savedPet = petRepository.save(savedPet);

        return mapToResponse(savedPet);
    }

    private Long getCurrentOwnerId() {
        return 1L; // stubbed — must exist as a real row in the users table
    }

    private PetResponse mapToResponse(Pet pet) {
        return PetResponse.builder()
                .id(pet.getId())
                .petUuid(pet.getPetUuid())
                .name(pet.getName())
                .breed(pet.getBreed())
                .description(pet.getDescription())
                .ifFoundInstructions(pet.getIfFoundInstructions())
                .photoUrl(pet.getPhotoUrl())
                .qrCodeUrl(pet.getQrCodeUrl())
                .status(pet.getStatus())
                .build();
    }

    // Returns all pets belonging to the currently authenticated owner
    public List<PetResponse> getMyPets() {

        // TEMPORARY — replace with real JWT-based lookup once PAW-18 merges
        Long ownerId = getCurrentOwnerId();

        List<Pet> pets = petRepository.findByOwnerId(ownerId);

        return pets.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Updates an existing pet's details, including an optional new photo
    public PetResponse updatePet(Long petId, UpdatePetRequest request, MultipartFile image) {

        Long ownerId = getCurrentOwnerId();

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        // Ownership check — enforced here, server-side
        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("You do not have permission to edit this pet");
        }

        pet.setName(request.getName());
        pet.setBreed(request.getBreed());
        pet.setDescription(request.getDescription());
        pet.setIfFoundInstructions(request.getIfFoundInstructions());

        // Only replace the photo if a new one was actually provided
        if (image != null && !image.isEmpty()) {
            String newPhotoUrl = cloudinaryService.uploadPetImage(image);
            pet.setPhotoUrl(newPhotoUrl);
        }

        Pet updatedPet = petRepository.save(pet);

        return mapToResponse(updatedPet);
    }

    // Returns a single pet by id — only if it belongs to the current owner
    public PetResponse getPetById(Long petId) {
        Long ownerId = getCurrentOwnerId();

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("You do not have permission to view this pet");
        }

        return mapToResponse(pet);
    }

    // Updates a pet's status (Safe/Lost) — only the owning user may perform this
    public PetResponse updateStatus(Long petId, PetStatus newStatus) {

        Long ownerId = getCurrentOwnerId();

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("You do not have permission to change this pet's status");
        }

        pet.setStatus(newStatus);
        Pet updatedPet = petRepository.save(pet);

        return mapToResponse(updatedPet);
    }

    // Returns public-safe info for a pet by its UUID — no authentication required.
    // Used by the finder-facing scan page. Never exposes owner details.
    public PublicPetResponse getPetByUuid(String petUuid) {
        Pet pet = petRepository.findByPetUuid(UUID.fromString(petUuid));

        if (pet == null) {
            throw new RuntimeException("Pet not found");
        }

        return PublicPetResponse.builder()
                .name(pet.getName())
                .photoUrl(pet.getPhotoUrl())
                .status(pet.getStatus())
                .breed(pet.getBreed())
                .description(pet.getDescription())
                .ifFoundInstructions(pet.getIfFoundInstructions())
                .build();
    }

    // Creates a scan report for a pet, uploading an optional photo.
    // No ownership check — this is intentionally callable by anyone
    // (the finder), matching the "no login required" requirement.
    public ScanReportResponse createReport(String petUuid, CreateReportRequest request, MultipartFile photo) {

        Pet pet = petRepository.findByPetUuid(UUID.fromString(petUuid));

        if (pet == null) {
            throw new RuntimeException("Pet not found");
        }

        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            photoUrl = cloudinaryService.uploadReportImage(photo);
        }

        ScanReport report = ScanReport.builder()
                .message(request.getMessage())
                .photoUrl(photoUrl)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .pet(pet)
                .build();

        ScanReport savedReport = scanReportRepository.save(report);

        return ScanReportResponse.builder()
                .id(savedReport.getId())
                .message(savedReport.getMessage())
                .photoUrl(savedReport.getPhotoUrl())
                .latitude(savedReport.getLatitude())
                .longitude(savedReport.getLongitude())
                .createdAt(savedReport.getCreatedAt())
                .build();
    }
}