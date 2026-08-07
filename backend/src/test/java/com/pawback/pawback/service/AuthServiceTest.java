package com.pawback.pawback.service;

import com.pawback.pawback.dto.request.RegisterRequest;
import com.pawback.pawback.dto.response.AuthResponse;
import com.pawback.pawback.exception.EmailAlreadyExistsException;
import com.pawback.pawback.model.AuthProvider;
import com.pawback.pawback.model.Role;
import com.pawback.pawback.model.User;
import com.pawback.pawback.repository.UserRepository;
import com.pawback.pawback.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private User savedUser;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .password("secret123")
                .phone("0771234567")
                .build();

        savedUser = User.builder()
                .id(1L)
                .name("Jane Doe")
                .email("jane@example.com")
                .passwordHash("encoded_secret123")
                .phone("0771234567")
                .provider(AuthProvider.LOCAL)
                .role(Role.OWNER)
                .enabled(true)
                .build();
    }

    @Test
    void register_SuccessfulRegistration_EncodesPasswordAndReturnsTokenAndUser() {
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded_secret123");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(savedUser)).thenReturn("jwt.test.token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("jwt.test.token", response.getToken());
        assertNotNull(response.getUser());
        assertEquals("jane@example.com", response.getUser().getEmail());
        assertEquals("Jane Doe", response.getUser().getName());
        assertEquals(Role.OWNER, response.getUser().getRole());

        verify(passwordEncoder).encode("secret123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsEmailAlreadyExistsException() {
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        EmailAlreadyExistsException exception = assertThrows(
                EmailAlreadyExistsException.class,
                () -> authService.register(registerRequest)
        );

        assertTrue(exception.getMessage().contains("already exists"));
        verify(userRepository, never()).save(any(User.class));
    }
}
