package com.greenmart.checkout.client;

import com.greenmart.checkout.dto.ApiResponse;
import com.greenmart.checkout.dto.CheckoutRequest.ShippingAddress;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Component("orderClient")
@Slf4j
public class OrderServiceClient {

    private final WebClient webClient;

    public OrderServiceClient(@Qualifier("orderServiceClient") WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * Create order from cart (internal API)
     */
    public Map<String, Object> createOrder(String userId, ShippingAddress address) {
        log.info("Creating order for user: {}", userId);

        try {
            Map<String, Object> requestBody = Map.of(
                    "street", address.getStreet(),
                    "city", address.getCity(),
                    "zip", address.getZip(),
                    "country", address.getCountry());

            ApiResponse response = webClient.post()
                    .uri("/api/orders/internal/create")
                    .header("X-User-Id", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(ApiResponse.class)
                    .block();

            if (response != null && response.isSuccess()) {
                log.info("Order created successfully");
                return (Map<String, Object>) response.getData();
            } else {
                throw new RuntimeException("Failed to create order: " +
                        (response != null ? response.getMessage() : "Unknown error"));
            }
        } catch (WebClientResponseException e) {
            log.error("Order service error: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Order service error: " + e.getMessage());
        }
    }

    /**
     * Update order status (internal API)
     */
    public void updateOrderStatus(String orderId, String status) {
        log.info("Updating order {} status to: {}", orderId, status);

        try {
            Map<String, String> requestBody = Map.of("status", status);

            webClient.put()
                    .uri("/api/orders/internal/{orderId}/status", orderId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(ApiResponse.class)
                    .block();

            log.info("Order status updated successfully");
        } catch (WebClientResponseException e) {
            log.error("Failed to update order status: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Failed to update order status: " + e.getMessage());
        }
    }

    /**
     * Get cart items for user
     */
    public Map<String, Object> getCart(String userId) {
        log.info("Getting cart for user: {}", userId);

        try {
            ApiResponse response = webClient.get()
                    .uri("/api/orders/cart")
                    .header("X-User-Id", userId)
                    .retrieve()
                    .bodyToMono(ApiResponse.class)
                    .block();

            if (response != null && response.isSuccess()) {
                return (Map<String, Object>) response.getData();
            } else {
                throw new RuntimeException("Failed to get cart");
            }
        } catch (WebClientResponseException e) {
            log.error("Failed to get cart: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Failed to get cart: " + e.getMessage());
        }
    }
}
