package com.greenmart.order.service;

import com.greenmart.order.dto.AddToCartRequest;
import com.greenmart.order.entity.Cart;
import com.greenmart.order.entity.CartItem;
import com.greenmart.order.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;

    @Transactional(readOnly = true)
    public Cart getCart(String userId) {
        log.info("Getting cart for user: {}", userId);
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createCart(userId));
    }

    @Transactional
    public Cart addToCart(String userId, AddToCartRequest request) {
        log.info("Adding item to cart for user: {}, productId: {}", userId, request.getProductId());

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCart(userId));

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // Update quantity if item exists
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            log.info("Updated quantity for existing item: {}", request.getProductId());
        } else {
            // Add new item
            CartItem newItem = new CartItem();
            newItem.setProductId(request.getProductId());
            newItem.setName(request.getName());
            newItem.setPrice(request.getPrice());
            newItem.setQuantity(request.getQuantity());
            cart.addItem(newItem);
            log.info("Added new item to cart: {}", request.getProductId());
        }

        cart.recalculateTotal();
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateCartItem(String userId, String productId, Integer quantity) {
        log.info("Updating cart item for user: {}, productId: {}, quantity: {}", userId, productId, quantity);

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        item.setQuantity(quantity);
        cart.recalculateTotal();

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeFromCart(String userId, String productId) {
        log.info("Removing item from cart for user: {}, productId: {}", userId, productId);

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem itemToRemove = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        cart.removeItem(itemToRemove);
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(String userId) {
        log.info("Clearing cart for user: {}", userId);

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.clearItems();
        cartRepository.save(cart);
    }

    private Cart createCart(String userId) {
        log.info("Creating new cart for user: {}", userId);
        Cart cart = new Cart();
        cart.setUserId(userId);
        return cartRepository.save(cart);
    }
}
