package com.greenmart.auth.controller;

import com.greenmart.auth.dto.*;
import com.greenmart.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request received for email: {}", request.getEmail());
        ApiResponse<UserResponse> response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<UserResponse>> validateToken(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Token validation request received");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);
        ApiResponse<UserResponse> response = authService.validateToken(token);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth Service is running");
    }

    // === Internal endpoints for notification service ===

    @GetMapping("/users/by-role")
    public ResponseEntity<?> getUsersByRole(@RequestParam String role) {
        log.info("Fetching users with role: {}", role);
        try {
            var users = authService.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users by role: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/users/{userId}/email")
    public ResponseEntity<?> getUserEmail(@PathVariable java.util.UUID userId) {
        log.info("Fetching email for userId: {}", userId);
        try {
            var email = authService.getUserEmailById(userId);
            return ResponseEntity.ok(java.util.Map.of("email", email));
        } catch (Exception e) {
            log.error("Error fetching email for userId {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
