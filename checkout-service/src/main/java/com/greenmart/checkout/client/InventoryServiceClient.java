package com.greenmart.checkout.client;

import com.greenmart.checkout.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Component("inventoryClient")
@Slf4j
public class InventoryServiceClient {

    private final WebClient webClient;

    public InventoryServiceClient(@Qualifier("inventoryServiceClient") WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * Reserve inventory for items
     */
    public boolean reserveInventory(List<Map<String, Object>> items) {
        log.info("Reserving inventory for {} items", items.size());

        try {
            for (Map<String, Object> item : items) {
                String productId = (String) item.get("productId");
                Integer quantity = item.get("quantity") instanceof Integer
                        ? (Integer) item.get("quantity")
                        : ((Number) item.get("quantity")).intValue();

                Map<String, Object> requestBody = Map.of(
                        "productId", productId,
                        "quantity", quantity);

                ApiResponse response = webClient.post()
                        .uri("/api/inventory/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(ApiResponse.class)
                        .block();

                if (response == null || !response.isSuccess()) {
                    log.error("Failed to reserve inventory for product: {}", productId);
                    return false;
                }
            }

            log.info("Inventory reserved successfully");
            return true;
        } catch (WebClientResponseException e) {
            log.error("Inventory reservation failed: {}", e.getResponseBodyAsString());
            return false;
        }
    }

    /**
     * Release reserved inventory (compensation)
     */
    public void releaseInventory(List<Map<String, Object>> items) {
        log.info("Releasing inventory for {} items", items.size());

        try {
            for (Map<String, Object> item : items) {
                String productId = (String) item.get("productId");
                Integer quantity = item.get("quantity") instanceof Integer
                        ? (Integer) item.get("quantity")
                        : ((Number) item.get("quantity")).intValue();

                Map<String, Object> requestBody = Map.of(
                        "productId", productId,
                        "quantity", quantity);

                webClient.post()
                        .uri("/api/inventory/release")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(ApiResponse.class)
                        .block();
            }

            log.info("Inventory released successfully");
        } catch (Exception e) {
            log.error("Failed to release inventory: {}", e.getMessage());
            // Continue even if release fails - compensating transaction
        }
    }

    /**
     * Confirm reserved inventory after successful payment
     */
    public void confirmInventory(List<Map<String, Object>> items) {
        log.info("Confirming inventory for {} items", items.size());

        try {
            for (Map<String, Object> item : items) {
                String productId = (String) item.get("productId");
                Integer quantity = item.get("quantity") instanceof Integer
                        ? (Integer) item.get("quantity")
                        : ((Number) item.get("quantity")).intValue();

                Map<String, Object> requestBody = Map.of(
                        "productId", productId,
                        "quantity", quantity);

                webClient.post()
                        .uri("/api/inventory/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(ApiResponse.class)
                        .block();
            }

            log.info("Inventory confirmed successfully");
        } catch (Exception e) {
            log.error("Failed to confirm inventory: {}", e.getMessage());
        }
    }
}
