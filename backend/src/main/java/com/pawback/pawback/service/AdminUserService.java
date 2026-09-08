package com.pawback.pawback.service;

import com.pawback.pawback.dto.response.PagedResponse;
import com.pawback.pawback.dto.response.UserResponse;
import com.pawback.pawback.exception.AccessDeniedException;
import com.pawback.pawback.exception.ResourceNotFoundException;
import com.pawback.pawback.model.User;
import com.pawback.pawback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin moderation actions over user accounts. The calling controller is already
 * gated to ADMIN by SecurityConfig's method security, so these methods assume an
 * admin principal and focus on the business rules — notably that an admin can
 * never disable their own account.
 */
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    // Every registered user, newest control first via a stable id sort so page
    // boundaries don't shift between requests.
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> listUsers(int page, int size) {
        Page<User> users = userRepository.findAll(
                PageRequest.of(page, size, Sort.by("id").ascending()));
        return PagedResponse.from(users.map(UserResponse::fromUser));
    }

    // Sets the target user's enabled flag to false. Rejects an admin trying to
    // disable themselves before touching the database.
    @Transactional
    public UserResponse disableUser(Long targetUserId) {
        User currentAdmin = currentUser();

        if (currentAdmin.getId().equals(targetUserId)) {
            throw new AccessDeniedException("An admin cannot disable their own account");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        target.setEnabled(false);
        return UserResponse.fromUser(userRepository.save(target));
    }

    // The admin making the request, resolved from the JWT-populated SecurityContext.
    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new AccessDeniedException("Not authenticated");
        }

        return user;
    }
}
