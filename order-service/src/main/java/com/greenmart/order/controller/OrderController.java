package com.greenmart.order.controller;

import com.greenmart.order.dto.ApiResponse;
import com.greenmart.order.dto.ShippingAddressRequest;
import com.greenmart.order.dto.UpdateOrderStatusRequest;
import com.greenmart.order.entity.Order;
import com.greenmart.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    // User-facing endpoints

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getUserOrders(
            @RequestHeader("X-User-Id") String userId) {
        log.info("GET /api/orders - userId: {}", userId);
        List<Order> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Order>> getOrderById(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID orderId) {
        log.info("GET /api/orders/{} - userId: {}", orderId, userId);
        Order order = orderService.getOrderById(orderId, userId);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    // Internal endpoints (called by Checkout Service)

    @PostMapping("/internal/create")
    public ResponseEntity<ApiResponse<Order>> createOrder(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody(required = false) ShippingAddressRequest shippingAddress) {
        log.info("POST /api/orders/internal/create - userId: {}", userId);
        Order order = orderService.createOrderFromCart(userId, shippingAddress);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", order));
    }

    @PutMapping("/internal/{orderId}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable UUID orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        log.info("PUT /api/orders/internal/{}/status - status: {}", orderId, request.getStatus());
        Order order = orderService.updateOrderStatus(orderId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order));
    }
}
