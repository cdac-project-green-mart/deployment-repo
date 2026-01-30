package com.greenmart.checkout.service;

import com.greenmart.checkout.client.InventoryServiceClient;
import com.greenmart.checkout.client.OrderServiceClient;
import com.greenmart.checkout.client.PaymentServiceClient;
import com.greenmart.checkout.dto.CheckoutRequest;
import com.greenmart.checkout.dto.CheckoutResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * SAGA Orchestrator for checkout process.
 * Implements the choreography-based SAGA pattern with compensation logic.
 * 
 * Flow:
 * 1. Create Order (status: PENDING)
 * 2. Reserve Inventory
 * 3. Process Payment
 * 4. Confirm Order (status: CONFIRMED)
 * 
 * Compensation Flow (on failure):
 * - Payment fails -> Release Inventory, Cancel Order
 * - Inventory fails -> Cancel Order
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutService {

    private final OrderServiceClient orderServiceClient;
    private final InventoryServiceClient inventoryServiceClient;
    private final PaymentServiceClient paymentServiceClient;

    public CheckoutResponse processCheckout(String userId, CheckoutRequest request) {
        log.info("Starting checkout for user: {}", userId);

        String orderId = null;
        List<Map<String, Object>> orderItems = null;
        boolean inventoryReserved = false;
        String transactionId = null;

        try {
            // Step 1: Get cart and validate
            log.info("Step 1: Getting cart for user");
            Map<String, Object> cart = orderServiceClient.getCart(userId);
            orderItems = (List<Map<String, Object>>) cart.get("items");

            if (orderItems == null || orderItems.isEmpty()) {
                return CheckoutResponse.failure("Cart is empty");
            }

            BigDecimal totalAmount = new BigDecimal(String.valueOf(cart.get("totalPrice")));
            log.info("Cart retrieved with {} items, total: {}", orderItems.size(), totalAmount);

            // Step 2: Create Order (status: PENDING)
            log.info("Step 2: Creating order");
            Map<String, Object> order = orderServiceClient.createOrder(userId, request.getShippingAddress());
            orderId = order.get("id").toString();
            log.info("Order created: {}", orderId);

            // Step 3: Reserve Inventory
            log.info("Step 3: Reserving inventory");
            inventoryReserved = inventoryServiceClient.reserveInventory(orderItems);

            if (!inventoryReserved) {
                log.error("Inventory reservation failed, cancelling order");
                orderServiceClient.updateOrderStatus(orderId, "CANCELLED");
                return CheckoutResponse.failure("Insufficient stock for one or more items");
            }
            log.info("Inventory reserved successfully");

            // Step 4: Process Payment
            log.info("Step 4: Processing payment");
            try {
                Map<String, Object> payment = paymentServiceClient.processPayment(
                        orderId, userId, totalAmount, request.getPaymentMethod());
                transactionId = payment.get("id").toString();
                log.info("Payment successful: {}", transactionId);
            } catch (Exception e) {
                log.error("Payment failed: {}", e.getMessage());
                // Compensation: Release inventory and cancel order
                inventoryServiceClient.releaseInventory(orderItems);
                orderServiceClient.updateOrderStatus(orderId, "CANCELLED");
                return CheckoutResponse.failure("Payment failed: " + e.getMessage());
            }

            // Step 5: Confirm Order and Inventory
            log.info("Step 5: Confirming order and inventory");
            orderServiceClient.updateOrderStatus(orderId, "CONFIRMED");
            inventoryServiceClient.confirmInventory(orderItems);

            log.info("Checkout completed successfully. Order: {}, Transaction: {}", orderId, transactionId);
            return CheckoutResponse.success(orderId, transactionId);

        } catch (Exception e) {
            log.error("Checkout failed with exception: {}", e.getMessage());

            // Compensation logic
            if (transactionId != null) {
                paymentServiceClient.refundPayment(transactionId);
            }
            if (inventoryReserved && orderItems != null) {
                inventoryServiceClient.releaseInventory(orderItems);
            }
            if (orderId != null) {
                try {
                    orderServiceClient.updateOrderStatus(orderId, "CANCELLED");
                } catch (Exception ex) {
                    log.error("Failed to cancel order: {}", ex.getMessage());
                }
            }

            return CheckoutResponse.failure("Checkout failed: " + e.getMessage());
        }
    }
}
