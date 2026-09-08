package com.pawback.pawback.service;

import com.pawback.pawback.dto.response.PagedResponse;
import com.pawback.pawback.dto.response.UserResponse;
import com.pawback.pawback.exception.AccessDeniedException;
import com.pawback.pawback.exception.ResourceNotFoundException;
import com.pawback.pawback.model.Role;
import com.pawback.pawback.model.User;
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
    void disableUser_TargetUser_SetsEnabledFalseAndSaves() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(member));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse result = adminUserService.disableUser(2L);

        assertFalse(result.isEnabled());
        assertFalse(member.isEnabled());
        verify(userRepository).save(member);
    }

    @Test
    void disableUser_OwnAccount_ThrowsAndNeverTouchesRepository() {
        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> adminUserService.disableUser(1L)
        );

        assertTrue(exception.getMessage().toLowerCase().contains("cannot disable their own"));
        verify(userRepository, never()).findById(anyLong());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void disableUser_UnknownUser_ThrowsResourceNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> adminUserService.disableUser(99L));
        verify(userRepository, never()).save(any(User.class));
    }
}
