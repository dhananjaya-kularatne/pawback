package com.pawback.pawback.repository;

import com.pawback.pawback.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByOwnerId(Long ownerId);

    Pet findByPetUuid(UUID petUuid);
}