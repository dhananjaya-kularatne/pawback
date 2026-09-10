package com.pawback.pawback.repository;

import com.pawback.pawback.model.Pet;
import com.pawback.pawback.model.PetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByOwnerId(Long ownerId);

    Pet findByPetUuid(UUID petUuid);

    // Live count of pets in a given status — used by the admin platform stats
    // to report how many pets are currently marked Lost.
    long countByStatus(PetStatus status);
}