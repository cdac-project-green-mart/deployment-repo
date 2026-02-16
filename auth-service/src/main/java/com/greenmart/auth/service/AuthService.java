package com.greenmart.auth.service;

import com.greenmart.auth.dto.*;
import com.greenmart.auth.entity.User;
import com.greenmart.auth.exception.EmailAlreadyExistsException;
import com.greenmart.auth.exception.InvalidCredentialsException;
import com.greenmart.auth.repository.UserRepository;
import com.greenmart.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public ApiResponse<UserResponse> register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        // Create user entity
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : User.Role.CUSTOMER)
                .build();

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        return ApiResponse.success("User registered successfully", UserResponse.fromEntity(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.success(token, UserResponse.fromEntity(user));
    }

    public ApiResponse<UserResponse> validateToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            return ApiResponse.error("Invalid or expired token");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ApiResponse.error("User not found");
        }

        return ApiResponse.success(UserResponse.fromEntity(user));
    }

    // === Internal methods for notification service ===

    public java.util.List<java.util.Map<String, String>> getUsersByRole(String role) {
        User.Role userRole = User.Role.valueOf(role.toUpperCase());
        var users = userRepository.findByRole(userRole);
        return users.stream()
                .map(u -> java.util.Map.of(
                        "id", u.getId().toString(),
                        "email", u.getEmail(),
                        "name", u.getName()
                ))
                .collect(java.util.stream.Collectors.toList());
    }

    public String getUserEmailById(java.util.UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return user.getEmail();
    }
}
