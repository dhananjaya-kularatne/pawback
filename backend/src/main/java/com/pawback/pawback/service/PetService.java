package com.pawback.pawback.service;

import com.pawback.pawback.dto.request.CreatePetRequest;
import com.pawback.pawback.dto.request.CreateReportRequest;
import com.pawback.pawback.dto.request.UpdatePetRequest;
import com.pawback.pawback.dto.response.PetResponse;
import com.pawback.pawback.dto.response.PublicPetResponse;
import com.pawback.pawback.dto.response.ScanReportResponse;
import com.pawback.pawback.exception.AccessDeniedException;
import com.pawback.pawback.exception.BadRequestException;
import com.pawback.pawback.exception.ConflictException;
import com.pawback.pawback.exception.ResourceNotFoundException;
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

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final QrCodeService qrCodeService;
    private final ScanReportRepository scanReportRepository; 
    private final EmailService emailService;
    private final AssetCleanupService assetCleanup;
    private final ImageValidationService imageValidation;
    private final jakarta.persistence.EntityManager entityManager;
    private final ReportRateLimiter reportRateLimiter;

    @Transactional
    public PetResponse createPet(CreatePetRequest request, MultipartFile image, String idempotencyKey) {

        Long ownerId = getCurrentOwnerId();

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        imageValidation.validate(image);
        String creationKey = idempotencyKey == null ? null : hash(ownerId + ":" + validateKey(idempotencyKey));
        String requestHash = registrationHash(request, image);
        if (creationKey != null) {
            var previous = petRepository.findByCreationKey(creationKey);
            if (previous.isPresent()) {
                if (previous.get().getDeletedAt() != null || !requestHash.equals(previous.get().getRequestHash())) {
                    throw new ConflictException("This registration was already completed. Refresh your pets before trying again.");
                }
                return mapToResponse(previous.get());
            }
        }
        UploadedAsset photo = cloudinaryService.uploadPetImage(image);

        Pet pet = Pet.builder()
                .name(request.getName())
                .breed(request.getBreed())
                .description(request.getDescription())
                .ifFoundInstructions(request.getIfFoundInstructions())
                .photoUrl(photo.url())
                .photoPublicId(photo.publicId())
                .creationKey(creationKey)
                .requestHash(requestHash)
                .status(PetStatus.SAFE)
                .owner(owner)
                .build();

        UploadedAsset qr = qrCodeService.generateAndUploadQrCode(pet.getPetUuid().toString());
        pet.setQrCodeUrl(qr.url());
        pet.setQrCodePublicId(qr.publicId());
        Pet savedPet;
        try { savedPet = petRepository.saveAndFlush(pet); }
        catch (org.springframework.dao.DataIntegrityViolationException exception) {
            if (creationKey != null && String.valueOf(exception.getMostSpecificCause().getMessage()).contains("creation_key")) {
                throw new ConflictException("Registration was already submitted. Retry the same request to retrieve it.");
            }
            throw exception;
        }
        assetCleanup.attach(photo);
        assetCleanup.attach(qr);

        return mapToResponse(savedPet);
    }

    // Resolves the authenticated owner from the JWT-populated SecurityContext.
    // JwtAuthenticationFilter sets the principal to the loaded User entity.
    private Long getCurrentOwnerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new AccessDeniedException("Not authenticated");
        }

        return user.getId();
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

        Long ownerId = getCurrentOwnerId();

        List<Pet> pets = petRepository.findByOwnerIdAndDeletedAtIsNull(ownerId);

        return pets.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Updates an existing pet's details, including an optional new photo
    @Transactional
    public PetResponse updatePet(Long petId, UpdatePetRequest request, MultipartFile image) {

        Pet pet = lockOwnedPet(petId);

        pet.setName(request.getName());
        pet.setBreed(request.getBreed());
        pet.setDescription(request.getDescription());
        pet.setIfFoundInstructions(request.getIfFoundInstructions());

        // Only replace the photo if a new one was actually provided
        if (image != null) {
            UploadedAsset photo = cloudinaryService.uploadPetImage(image);
            cloudinaryService.retire(pet.getPhotoPublicId(), pet.getPhotoUrl());
            pet.setPhotoUrl(photo.url());
            pet.setPhotoPublicId(photo.publicId());
            assetCleanup.attach(photo);
        }

        Pet updatedPet = petRepository.save(pet);

        return mapToResponse(updatedPet);
    }

    // Returns a single pet by id — only if it belongs to the current owner
    public PetResponse getPetById(Long petId) {
        return mapToResponse(getOwnedPet(petId));
    }

    // Updates a pet's status (Safe/Lost) — only the owning user may perform this
    @Transactional
    public PetResponse updateStatus(Long petId, PetStatus newStatus) {

        Pet pet = lockOwnedPet(petId);

        pet.setStatus(newStatus);
        Pet updatedPet = petRepository.save(pet);

        return mapToResponse(updatedPet);
    }

    // Returns public-safe info for a pet by its UUID — no authentication required.
    // Used by the finder-facing scan page. Never exposes owner details.
    public PublicPetResponse getPetByUuid(String petUuid) {
        Pet pet = getPublicPet(petUuid);

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
    @Transactional
    public ScanReportResponse createReport(String petUuid, CreateReportRequest request, MultipartFile photo,
            String remoteAddress, String idempotencyKey) {

        Pet pet = getPublicPet(petUuid);
        // Check before any upload or save; the public page alone cannot enforce this.
        entityManager.refresh(pet, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        if (pet.getDeletedAt() != null) throw new ResourceNotFoundException("Pet not found");
        if (pet.getStatus() != PetStatus.LOST) {
            throw new ConflictException("This pet is no longer marked as lost. Reports are not being accepted.");
        }

        String submissionKey = idempotencyKey == null ? null : hash(pet.getPetUuid() + ":" + validateKey(idempotencyKey));
        String requestHash;
        try {
            requestHash = hashFields(photo == null ? new byte[0] : photo.getBytes(), request.getMessage(),
                    String.valueOf(request.getLatitude()), String.valueOf(request.getLongitude()));
        } catch (java.io.IOException exception) { throw new IllegalStateException(exception); }
        if (submissionKey != null) {
            var previous = scanReportRepository.findBySubmissionKey(submissionKey);
            if (previous.isPresent()) {
                if (!requestHash.equals(previous.get().getRequestHash())) throw new ConflictException("This report was already submitted with different details.");
                ScanReport existing = previous.get();
                return ScanReportResponse.builder().id(existing.getId()).message(existing.getMessage()).photoUrl(existing.getPhotoUrl())
                        .latitude(existing.getLatitude()).longitude(existing.getLongitude()).createdAt(existing.getCreatedAt()).build();
            }
        }
        if (!reportRateLimiter.tryConsume(pet.getPetUuid(), remoteAddress)) {
            throw new com.pawback.pawback.exception.TooManyReportsException(reportRateLimiter.retryAfterSeconds());
        }

        UploadedAsset photoAsset = photo == null ? null : cloudinaryService.uploadReportImage(photo);

        ScanReport report = ScanReport.builder()
                .message(request.getMessage())
                .photoUrl(photoAsset == null ? null : photoAsset.url())
                .photoPublicId(photoAsset == null ? null : photoAsset.publicId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .pet(pet)
                .submissionKey(submissionKey)
                .requestHash(requestHash)
                .build();

        ScanReport savedReport = scanReportRepository.saveAndFlush(report);
        if (photoAsset != null) assetCleanup.attach(photoAsset);

        if (pet.getStatus() == PetStatus.LOST) {
            String email = pet.getOwner().getEmail();
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { emailService.sendReportNotification(email, savedReport); }
            });
        }

        return ScanReportResponse.builder()
                .id(savedReport.getId())
                .message(savedReport.getMessage())
                .photoUrl(savedReport.getPhotoUrl())
                .latitude(savedReport.getLatitude())
                .longitude(savedReport.getLongitude())
                .createdAt(savedReport.getCreatedAt())
                .build();
    }

    private Pet getOwnedPet(Long petId) {
        Long ownerId = getCurrentOwnerId();
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));
        if (pet.getDeletedAt() != null) throw new ResourceNotFoundException("Pet not found");
        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new AccessDeniedException("You do not have permission to access this pet");
        }
        return pet;
    }

    private Pet getPublicPet(String petUuid) {
        UUID uuid;
        try {
            uuid = UUID.fromString(petUuid);
            if (!uuid.toString().equalsIgnoreCase(petUuid)) {
                throw new IllegalArgumentException("Non-canonical UUID");
            }
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Invalid pet QR code");
        }
        Pet pet = petRepository.findByPetUuid(uuid);
        if (pet == null || pet.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Pet not found");
        }
        return pet;
    }

    @Transactional
    public void deletePet(Long petId) {
        Pet pet = petRepository.findById(petId).orElseThrow(() -> new ResourceNotFoundException("Pet not found"));
        if (!pet.getOwner().getId().equals(getCurrentOwnerId())) throw new AccessDeniedException("You do not have permission to remove this pet");
        entityManager.refresh(pet, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        if (pet.getDeletedAt() != null) return;
        for (ScanReport report : scanReportRepository.findByPetId(petId)) {
            cloudinaryService.retire(report.getPhotoPublicId(), report.getPhotoUrl());
            scanReportRepository.delete(report);
        }
        cloudinaryService.retire(pet.getPhotoPublicId(), pet.getPhotoUrl());
        cloudinaryService.retire(pet.getQrCodePublicId(), pet.getQrCodeUrl());
        pet.setDeletedAt(java.time.Instant.now());
        pet.setStatus(PetStatus.SAFE);
        petRepository.save(pet);
    }

    @Transactional
    public PetResponse regenerateQr(Long petId) {
        Pet pet = lockOwnedPet(petId);
        UploadedAsset qr = qrCodeService.generateAndUploadQrCode(pet.getPetUuid().toString());
        cloudinaryService.retire(pet.getQrCodePublicId(), pet.getQrCodeUrl());
        pet.setQrCodePublicId(qr.publicId()); pet.setQrCodeUrl(qr.url());
        assetCleanup.attach(qr);
        return mapToResponse(petRepository.saveAndFlush(pet));
    }

    private String validateKey(String key) {
        try { return UUID.fromString(key).toString(); }
        catch (IllegalArgumentException exception) { throw new BadRequestException("Invalid registration request key"); }
    }
    private Pet lockOwnedPet(Long id) {
        Pet pet = getOwnedPet(id);
        entityManager.refresh(pet, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        if (pet.getDeletedAt() != null) throw new ResourceNotFoundException("Pet not found");
        return pet;
    }
    private String hash(String value) {
        try { return java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException exception) { throw new IllegalStateException(exception); }
    }
    private String registrationHash(CreatePetRequest request, MultipartFile image) {
        try {
            return hashFields(image.getBytes(), request.getName(), request.getBreed(), request.getDescription(), request.getIfFoundInstructions());
        } catch (java.io.IOException exception) { throw new IllegalStateException(exception); }
    }
    private String hashFields(byte[] image, String... fields) {
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            for (String field : fields) {
                byte[] bytes = field == null ? new byte[0] : field.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                digest.update(java.nio.ByteBuffer.allocate(4).putInt(field == null ? -1 : bytes.length).array());
                digest.update(bytes);
            }
            digest.update(image);
            return java.util.HexFormat.of().formatHex(digest.digest());
        } catch (java.security.NoSuchAlgorithmException exception) { throw new IllegalStateException(exception); }
    }
}
