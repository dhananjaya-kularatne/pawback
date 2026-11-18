package com.pawback.pawback.repository;

import com.pawback.pawback.model.Role;
import com.pawback.pawback.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    boolean existsByProviderAndProviderId(com.pawback.pawback.model.AuthProvider provider, String providerId);
    long countByEnabled(boolean enabled);
    long countByRole(Role role);
}
