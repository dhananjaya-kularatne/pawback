package com.pawback.pawback.service;

import com.pawback.pawback.dto.response.AdminStatsResponse;
import com.pawback.pawback.dto.response.PagedResponse;
import com.pawback.pawback.dto.response.UserResponse;
import com.pawback.pawback.exception.AccessDeniedException;
import com.pawback.pawback.exception.ResourceNotFoundException;
import com.pawback.pawback.model.PetStatus;
import com.pawback.pawback.model.Role;
import com.pawback.pawback.model.User;
import com.pawback.pawback.repository.PetRepository;
import com.pawback.pawback.repository.ScanReportRepository;
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
    private final PetRepository petRepository;
    private final ScanReportRepository scanReportRepository;

    // Headline counts for the admin console summary tiles. Each value is a live
    // repository count read on every request — nothing here is cached, so a
    // refresh always reflects the current state of the data.
    @Transactional(readOnly = true)
    public AdminStatsResponse stats() {
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .activeUsers(userRepository.countByEnabled(true))
                .disabledUsers(userRepository.countByEnabled(false))
                .admins(userRepository.countByRole(Role.ADMIN))
                .totalPets(petRepository.count())
                .totalReports(scanReportRepository.count())
                .lostPets(petRepository.countByStatus(PetStatus.LOST))
                .build();
    }

    // Every registered user, ordered by a stable id sort so page boundaries
    // don't shift between requests.
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> listUsers(int page, int size) {
        Page<User> users = userRepository.findAll(
                PageRequest.of(page, size, Sort.by("id").ascending()));
        return PagedResponse.from(users.map(UserResponse::fromUser));
    }

    // Flips the target user's enabled flag. An admin may re-enable anyone, but
    // must never disable their own account — that check runs before any DB write.
    @Transactional
    public UserResponse setUserEnabled(Long targetUserId, boolean enabled) {
        if (!enabled && currentUser().getId().equals(targetUserId)) {
            throw new AccessDeniedException("An admin cannot disable their own account");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        target.setEnabled(enabled);
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
