package com.greenmart.checkout.controller;

import com.greenmart.checkout.dto.CheckoutRequest;
import com.greenmart.checkout.dto.CheckoutResponse;
import com.greenmart.checkout.service.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Slf4j
public class CheckoutController {

    private final CheckoutService checkoutService;

    /**
     * Process checkout for authenticated user
     * User ID is extracted from X-User-Id header (set by API Gateway after JWT
     * validation)
     */
    @PostMapping
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody CheckoutRequest request) {
        log.info("Checkout request received for user: {}", userId);

        CheckoutResponse response = checkoutService.processCheckout(userId, request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Checkout Service is running");
    }
}
