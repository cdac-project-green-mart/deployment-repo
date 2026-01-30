package com.greenmart.checkout.client;

import com.greenmart.checkout.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.util.Map;

@Component("paymentClient")
@Slf4j
public class PaymentServiceClient {

    private final WebClient webClient;

    public PaymentServiceClient(@Qualifier("paymentServiceClient") WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * Process payment
     */
    public Map<String, Object> processPayment(String orderId, String userId,
            BigDecimal amount, String paymentMethod) {
        log.info("Processing payment for order: {}, amount: {}", orderId, amount);

        try {
            Map<String, Object> requestBody = Map.of(
                    "orderId", orderId,
                    "userId", userId,
                    "amount", amount,
                    "currency", "USD",
                    "paymentMethod", paymentMethod);

            ApiResponse response = webClient.post()
                    .uri("/api/payments")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(ApiResponse.class)
                    .block();

            if (response != null && response.isSuccess()) {
                log.info("Payment processed successfully");
                return (Map<String, Object>) response.getData();
            } else {
                String errorMsg = response != null ? response.getMessage() : "Unknown error";
                log.error("Payment failed: {}", errorMsg);
                throw new RuntimeException("Payment failed: " + errorMsg);
            }
        } catch (WebClientResponseException e) {
            log.error("Payment service error: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Payment service error: " + e.getMessage());
        }
    }

    /**
     * Refund payment (compensation)
     */
    public void refundPayment(String transactionId) {
        log.info("Refunding payment: {}", transactionId);

        try {
            webClient.post()
                    .uri("/api/payments/internal/{transactionId}/refund", transactionId)
                    .retrieve()
                    .bodyToMono(ApiResponse.class)
                    .block();

            log.info("Payment refunded successfully");
        } catch (Exception e) {
            log.error("Failed to refund payment: {}", e.getMessage());
            // Continue even if refund fails - needs manual intervention
        }
    }
}
