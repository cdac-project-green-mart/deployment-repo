package com.greenmart.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private UUID testUserId;
    private String testEmail;
    private String testRole;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();

        // Set test values using reflection
        String secret = Base64.getEncoder().encodeToString(
                "test-secret-key-for-jwt-testing-purposes-minimum-32-bytes-required".getBytes());
        ReflectionTestUtils.setField(jwtUtil, "secretKey", secret);
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", 86400000L);

        testUserId = UUID.randomUUID();
        testEmail = "test@example.com";
        testRole = "CUSTOMER";
    }

    @Test
    void generateToken_Success() {
        String token = jwtUtil.generateToken(testUserId, testEmail, testRole);

        assertNotNull(token);
        assertTrue(token.length() > 0);
        assertTrue(token.contains("."));
    }

    @Test
    void validateToken_ValidToken() {
        String token = jwtUtil.generateToken(testUserId, testEmail, testRole);

        boolean isValid = jwtUtil.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    void validateToken_InvalidToken() {
        boolean isValid = jwtUtil.validateToken("invalid.token.here");

        assertFalse(isValid);
    }

    @Test
    void validateToken_NullToken() {
        boolean isValid = jwtUtil.validateToken(null);

        assertFalse(isValid);
    }

    @Test
    void extractEmail_Success() {
        String token = jwtUtil.generateToken(testUserId, testEmail, testRole);

        String email = jwtUtil.extractEmail(token);

        assertEquals(testEmail, email);
    }

    @Test
    void extractUserId_Success() {
        String token = jwtUtil.generateToken(testUserId, testEmail, testRole);

        String userId = jwtUtil.extractUserId(token);

        assertEquals(testUserId.toString(), userId);
    }

    @Test
    void extractRole_Success() {
        String token = jwtUtil.generateToken(testUserId, testEmail, testRole);

        String role = jwtUtil.extractRole(token);

        assertEquals(testRole, role);
    }

    @Test
    void token_ContainsCorrectClaims() {
        String token = jwtUtil.generateToken(testUserId, testEmail, testRole);

        assertEquals(testEmail, jwtUtil.extractEmail(token));
        assertEquals(testUserId.toString(), jwtUtil.extractUserId(token));
        assertEquals(testRole, jwtUtil.extractRole(token));
    }

    @Test
    void validateToken_WithCorrectEmail() {
        String token = jwtUtil.generateToken(testUserId, testEmail, testRole);

        boolean isValid = jwtUtil.validateToken(token, testEmail);

        assertTrue(isValid);
    }

    @Test
    void validateToken_WithWrongEmail() {
        String token = jwtUtil.generateToken(testUserId, testEmail, testRole);

        boolean isValid = jwtUtil.validateToken(token, "wrong@example.com");

        assertFalse(isValid);
    }
}
