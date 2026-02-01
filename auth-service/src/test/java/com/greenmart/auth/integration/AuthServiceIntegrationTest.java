package com.greenmart.auth.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Integration tests for Auth Service
 * 
 * Uses Testcontainers for real PostgreSQL database
 * Tests the full authentication flow: registration, login, token validation
 * 
 * Prerequisites:
 * - Docker must be running
 * - Add testcontainers dependency to pom.xml
 * 
 * Run: mvn test -Dtest=AuthServiceIntegrationTest
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class AuthServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("auth_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String testEmail;
    private String testPassword = "Test@123456";

    @BeforeEach
    void setUp() {
        testEmail = "test_" + System.currentTimeMillis() + "@test.com";
    }

    @Test
    @DisplayName("Health check endpoint returns OK")
    void healthCheck_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/auth/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("User registration with valid data succeeds")
    void register_WithValidData_ReturnsSuccess() throws Exception {
        String requestBody = String.format("""
                {
                    "name": "Test User",
                    "email": "%s",
                    "password": "%s",
                    "role": "CUSTOMER"
                }
                """, testEmail, testPassword);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(testEmail))
                .andExpect(jsonPath("$.data.name").value("Test User"));
    }

    @Test
    @DisplayName("User registration with duplicate email fails")
    void register_WithDuplicateEmail_ReturnsConflict() throws Exception {
        // First registration
        String requestBody = String.format("""
                {
                    "name": "Test User",
                    "email": "%s",
                    "password": "%s",
                    "role": "CUSTOMER"
                }
                """, testEmail, testPassword);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isCreated());

        // Duplicate registration
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("User login with valid credentials returns token")
    void login_WithValidCredentials_ReturnsToken() throws Exception {
        // Register user first
        String registerBody = String.format("""
                {
                    "name": "Test User",
                    "email": "%s",
                    "password": "%s",
                    "role": "CUSTOMER"
                }
                """, testEmail, testPassword);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody))
                .andExpect(status().isCreated());

        // Login
        String loginBody = String.format("""
                {
                    "email": "%s",
                    "password": "%s"
                }
                """, testEmail, testPassword);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("User login with invalid password fails")
    void login_WithInvalidPassword_ReturnsUnauthorized() throws Exception {
        // Register user first
        String registerBody = String.format("""
                {
                    "name": "Test User",
                    "email": "%s",
                    "password": "%s",
                    "role": "CUSTOMER"
                }
                """, testEmail, testPassword);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody))
                .andExpect(status().isCreated());

        // Login with wrong password
        String loginBody = String.format("""
                {
                    "email": "%s",
                    "password": "wrongpassword"
                }
                """, testEmail);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Token validation with valid token succeeds")
    void validate_WithValidToken_ReturnsUserData() throws Exception {
        // Register and login
        String registerBody = String.format("""
                {
                    "name": "Test User",
                    "email": "%s",
                    "password": "%s",
                    "role": "CUSTOMER"
                }
                """, testEmail, testPassword);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody));

        String loginBody = String.format("""
                {
                    "email": "%s",
                    "password": "%s"
                }
                """, testEmail, testPassword);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
                .andReturn();

        JsonNode response = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = response.get("token").asText();

        // Validate token
        mockMvc.perform(get("/api/auth/validate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(testEmail));
    }

    @Test
    @DisplayName("Token validation without token fails")
    void validate_WithoutToken_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/validate"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Registration with weak password fails")
    void register_WithWeakPassword_ReturnsBadRequest() throws Exception {
        String requestBody = String.format("""
                {
                    "name": "Test User",
                    "email": "%s",
                    "password": "weak",
                    "role": "CUSTOMER"
                }
                """, testEmail);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
    }
}
