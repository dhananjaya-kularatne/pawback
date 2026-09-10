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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private ScanReportRepository scanReportRepository;

    @InjectMocks
    private AdminUserService adminUserService;

    private User admin;
    private User member;

    @BeforeEach
    void setUp() {
        admin = User.builder().id(1L).email("admin@example.com").name("Admin").role(Role.ADMIN).enabled(true).build();
        member = User.builder().id(2L).email("member@example.com").name("Member").role(Role.OWNER).enabled(true).build();
        authenticateAs(admin);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
    }

    @Test
    void listUsers_ReturnsEveryUserWrappedWithPageMetadata() {
        Page<User> page = new PageImpl<>(List.of(admin, member), Pageable.ofSize(20), 2);
        when(userRepository.findAll(any(Pageable.class))).thenReturn(page);

        PagedResponse<UserResponse> result = adminUserService.listUsers(0, 20);

        assertEquals(2, result.getContent().size());
        assertEquals(2, result.getTotalElements());
        assertEquals(0, result.getPage());
        assertTrue(result.isLast());
    }

    @Test
    void setUserEnabled_DisableTargetUser_SetsEnabledFalseAndSaves() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(member));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse result = adminUserService.setUserEnabled(2L, false);

        assertFalse(result.isEnabled());
        assertFalse(member.isEnabled());
        verify(userRepository).save(member);
    }

    @Test
    void setUserEnabled_ReEnableDisabledUser_SetsEnabledTrueAndSaves() {
        member.setEnabled(false);
        when(userRepository.findById(2L)).thenReturn(Optional.of(member));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse result = adminUserService.setUserEnabled(2L, true);

        assertTrue(result.isEnabled());
        assertTrue(member.isEnabled());
        verify(userRepository).save(member);
    }

    @Test
    void setUserEnabled_DisableOwnAccount_ThrowsAndNeverTouchesRepository() {
        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> adminUserService.setUserEnabled(1L, false)
        );

        assertTrue(exception.getMessage().toLowerCase().contains("cannot disable their own"));
        verify(userRepository, never()).findById(anyLong());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void setUserEnabled_EnableOwnAccount_IsAllowed() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> adminUserService.setUserEnabled(1L, true));
        verify(userRepository).save(admin);
    }

    @Test
    void setUserEnabled_UnknownUser_ThrowsResourceNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> adminUserService.setUserEnabled(99L, false));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void stats_AggregatesCountsFromRepository() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByEnabled(true)).thenReturn(8L);
        when(userRepository.countByEnabled(false)).thenReturn(2L);
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(3L);
        when(petRepository.count()).thenReturn(25L);
        when(scanReportRepository.count()).thenReturn(40L);
        when(petRepository.countByStatus(PetStatus.LOST)).thenReturn(5L);

        AdminStatsResponse stats = adminUserService.stats();

        assertEquals(10L, stats.getTotalUsers());
        assertEquals(8L, stats.getActiveUsers());
        assertEquals(2L, stats.getDisabledUsers());
        assertEquals(3L, stats.getAdmins());
        assertEquals(25L, stats.getTotalPets());
        assertEquals(40L, stats.getTotalReports());
        assertEquals(5L, stats.getLostPets());
    }
}
