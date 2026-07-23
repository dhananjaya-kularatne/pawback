package com.pawback.pawback.repository;

import com.pawback.pawback.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}