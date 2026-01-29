package com.greenmart.auth.service;

import com.greenmart.auth.dto.*;
import com.greenmart.auth.entity.User;
import com.greenmart.auth.exception.EmailAlreadyExistsException;
import com.greenmart.auth.exception.InvalidCredentialsException;
import com.greenmart.auth.repository.UserRepository;
import com.greenmart.auth.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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
    private LoginRequest loginRequest;
    private User testUser;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();

        registerRequest = new RegisterRequest();
        registerRequest.setName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setRole(User.Role.CUSTOMER);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedPassword");
        testUser.setRole(User.Role.CUSTOMER);
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        ApiResponse<UserResponse> response = authService.register(registerRequest);

        assertTrue(response.isSuccess());
        assertEquals("User registered successfully", response.getMessage());
        assertNotNull(response.getData());
        assertEquals("test@example.com", response.getData().getEmail());

        verify(userRepository).existsByEmail("test@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_EmailAlreadyExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> {
            authService.register(registerRequest);
        });

        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(any(UUID.class), anyString(), anyString())).thenReturn("jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertTrue(response.isSuccess());
        assertEquals("jwt-token", response.getToken());
        assertNotNull(response.getUser());
        assertEquals("test@example.com", response.getUser().getEmail());

        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", "hashedPassword");
        verify(jwtUtil).generateToken(eq(testUserId), eq("test@example.com"), eq("CUSTOMER"));
    }

    @Test
    void login_UserNotFound() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> {
            authService.login(loginRequest);
        });

        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void login_InvalidPassword() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> {
            authService.login(loginRequest);
        });

        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", "hashedPassword");
        verify(jwtUtil, never()).generateToken(any(UUID.class), anyString(), anyString());
    }

    @Test
    void validateToken_Success() {
        when(jwtUtil.validateToken(anyString())).thenReturn(true);
        when(jwtUtil.extractEmail(anyString())).thenReturn("test@example.com");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        ApiResponse<UserResponse> response = authService.validateToken("valid-token");

        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertEquals("test@example.com", response.getData().getEmail());
    }

    @Test
    void validateToken_InvalidToken() {
        when(jwtUtil.validateToken(anyString())).thenReturn(false);

        ApiResponse<UserResponse> response = authService.validateToken("invalid-token");

        assertFalse(response.isSuccess());
        assertEquals("Invalid or expired token", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void validateToken_UserNotFound() {
        when(jwtUtil.validateToken(anyString())).thenReturn(true);
        when(jwtUtil.extractEmail(anyString())).thenReturn("notfound@example.com");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        ApiResponse<UserResponse> response = authService.validateToken("valid-token");

        assertFalse(response.isSuccess());
        assertEquals("User not found", response.getMessage());
    }
}
