package com.greenmart.order.service;

import com.greenmart.order.dto.AddToCartRequest;
import com.greenmart.order.entity.Cart;
import com.greenmart.order.entity.CartItem;
import com.greenmart.order.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @InjectMocks
    private CartService cartService;

    private Cart testCart;
    private String testUserId;

    @BeforeEach
    void setUp() {
        testUserId = "user-123";
        testCart = new Cart();
        testCart.setUserId(testUserId);
    }

    @Test
    void getCart_WhenCartExists_ReturnsCart() {
        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.of(testCart));
        Cart result = cartService.getCart(testUserId);
        assertNotNull(result);
        assertEquals(testUserId, result.getUserId());
    }

    @Test
    void getCart_WhenCartDoesNotExist_CreatesNewCart() {
        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);
        Cart result = cartService.getCart(testUserId);
        assertNotNull(result);
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void addToCart_NewItem_AddsItemSuccessfully() {
        AddToCartRequest request = new AddToCartRequest("product-1", "Test Product", new BigDecimal("99.99"), 2);
        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        Cart result = cartService.addToCart(testUserId, request);

        assertNotNull(result);
        assertEquals(1, result.getItems().size());
    }

    @Test
    void addToCart_ExistingItem_UpdatesQuantity() {
        CartItem existingItem = new CartItem();
        existingItem.setProductId("product-1");
        existingItem.setName("Test Product");
        existingItem.setPrice(new BigDecimal("99.99"));
        existingItem.setQuantity(2);
        testCart.addItem(existingItem);

        AddToCartRequest request = new AddToCartRequest("product-1", "Test Product", new BigDecimal("99.99"), 3);
        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        Cart result = cartService.addToCart(testUserId, request);

        assertEquals(1, result.getItems().size());
        assertEquals(5, result.getItems().get(0).getQuantity());
    }

    @Test
    void updateCartItem_ValidItem_UpdatesQuantity() {
        CartItem item = new CartItem();
        item.setProductId("product-1");
        item.setPrice(new BigDecimal("10.00"));
        item.setQuantity(2);
        testCart.addItem(item);

        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        Cart result = cartService.updateCartItem(testUserId, "product-1", 5);

        assertEquals(5, result.getItems().get(0).getQuantity());
    }

    @Test
    void updateCartItem_CartNotFound_ThrowsException() {
        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> cartService.updateCartItem(testUserId, "product-1", 5));
    }

    @Test
    void removeFromCart_ValidItem_RemovesItem() {
        CartItem item = new CartItem();
        item.setProductId("product-1");
        item.setPrice(new BigDecimal("10.00"));
        item.setQuantity(1);
        testCart.addItem(item);

        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        Cart result = cartService.removeFromCart(testUserId, "product-1");

        assertEquals(0, result.getItems().size());
    }

    @Test
    void clearCart_ValidCart_ClearsAllItems() {
        CartItem item = new CartItem();
        item.setProductId("product-1");
        item.setPrice(new BigDecimal("10.00"));
        item.setQuantity(1);
        testCart.addItem(item);

        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        cartService.clearCart(testUserId);

        assertEquals(0, testCart.getItems().size());
    }
}
