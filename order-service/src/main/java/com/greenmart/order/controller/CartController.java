package com.greenmart.order.controller;

import com.greenmart.order.dto.AddToCartRequest;
import com.greenmart.order.dto.ApiResponse;
import com.greenmart.order.entity.Cart;
import com.greenmart.order.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<Cart>> getCart(@RequestHeader("X-User-Id") String userId) {
        log.info("GET /api/orders/cart - userId: {}", userId);
        Cart cart = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Cart>> addToCart(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody AddToCartRequest request) {
        log.info("POST /api/orders/cart/add - userId: {}, productId: {}", userId, request.getProductId());
        Cart cart = cartService.addToCart(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Cart>> updateCartItem(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam String productId,
            @RequestParam Integer quantity) {
        log.info("PUT /api/orders/cart/update - userId: {}, productId: {}, quantity: {}",
                userId, productId, quantity);
        Cart cart = cartService.updateCartItem(userId, productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully", cart));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<Cart>> removeFromCart(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam String productId) {
        log.info("DELETE /api/orders/cart/remove - userId: {}, productId: {}", userId, productId);
        Cart cart = cartService.removeFromCart(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(@RequestHeader("X-User-Id") String userId) {
        log.info("DELETE /api/orders/cart/clear - userId: {}", userId);
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}
