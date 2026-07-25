package com.pawback.pawback.service;

import com.pawback.pawback.dto.request.CreatePetRequest;
import com.pawback.pawback.dto.response.PetResponse;
import com.pawback.pawback.model.Pet;
import com.pawback.pawback.model.PetStatus;
import com.pawback.pawback.model.User;
import com.pawback.pawback.repository.PetRepository;
import com.pawback.pawback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

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
                .status(pet.getStatus())
                .build();
    }
}