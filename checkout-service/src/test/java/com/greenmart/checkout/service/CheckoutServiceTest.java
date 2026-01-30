package com.greenmart.checkout.service;

import com.greenmart.checkout.client.InventoryServiceClient;
import com.greenmart.checkout.client.OrderServiceClient;
import com.greenmart.checkout.client.PaymentServiceClient;
import com.greenmart.checkout.dto.CheckoutRequest;
import com.greenmart.checkout.dto.CheckoutRequest.ShippingAddress;
import com.greenmart.checkout.dto.CheckoutResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {

    @Mock
    private OrderServiceClient orderServiceClient;

    @Mock
    private InventoryServiceClient inventoryServiceClient;

    @Mock
    private PaymentServiceClient paymentServiceClient;

    @InjectMocks
    private CheckoutService checkoutService;

    private String testUserId;
    private CheckoutRequest testRequest;
    private Map<String, Object> testCart;
    private List<Map<String, Object>> testItems;
    private Map<String, Object> testOrder;
    private Map<String, Object> testPayment;

    @BeforeEach
    void setUp() {
        testUserId = "user-123";

        ShippingAddress address = new ShippingAddress("123 Main St", "New York", "10001", "USA");
        testRequest = new CheckoutRequest(address, "CARD");

        testItems = List.of(
                Map.of("productId", "prod-1", "quantity", 2, "price", 49.99),
                Map.of("productId", "prod-2", "quantity", 1, "price", 99.99));

        testCart = Map.of(
                "id", UUID.randomUUID().toString(),
                "items", testItems,
                "totalPrice", new BigDecimal("199.97"));

        testOrder = Map.of(
                "id", UUID.randomUUID().toString(),
                "status", "PENDING");

        testPayment = Map.of(
                "id", UUID.randomUUID().toString(),
                "status", "COMPLETED");
    }

    @Test
    void processCheckout_Success_ReturnsSuccessResponse() {
        when(orderServiceClient.getCart(testUserId)).thenReturn(testCart);
        when(orderServiceClient.createOrder(eq(testUserId), any())).thenReturn(testOrder);
        when(inventoryServiceClient.reserveInventory(anyList())).thenReturn(true);
        when(paymentServiceClient.processPayment(any(), eq(testUserId), any(), eq("CARD")))
                .thenReturn(testPayment);

        CheckoutResponse result = checkoutService.processCheckout(testUserId, testRequest);

        assertTrue(result.isSuccess());
        assertNotNull(result.getOrderId());
        assertNotNull(result.getTransactionId());
        verify(orderServiceClient).updateOrderStatus(any(), eq("CONFIRMED"));
        verify(inventoryServiceClient).confirmInventory(anyList());
    }

    @Test
    void processCheckout_EmptyCart_ReturnsFailure() {
        Map<String, Object> emptyCart = Map.of(
                "id", UUID.randomUUID().toString(),
                "items", List.of(),
                "totalPrice", BigDecimal.ZERO);
        when(orderServiceClient.getCart(testUserId)).thenReturn(emptyCart);

        CheckoutResponse result = checkoutService.processCheckout(testUserId, testRequest);

        assertFalse(result.isSuccess());
        assertEquals("Cart is empty", result.getMessage());
    }

    @Test
    void processCheckout_InventoryFails_CancelsOrderAndReturnsFailure() {
        when(orderServiceClient.getCart(testUserId)).thenReturn(testCart);
        when(orderServiceClient.createOrder(eq(testUserId), any())).thenReturn(testOrder);
        when(inventoryServiceClient.reserveInventory(anyList())).thenReturn(false);

        CheckoutResponse result = checkoutService.processCheckout(testUserId, testRequest);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Insufficient stock"));
        verify(orderServiceClient).updateOrderStatus(any(), eq("CANCELLED"));
        verify(paymentServiceClient, never()).processPayment(any(), any(), any(), any());
    }

    @Test
    void processCheckout_PaymentFails_ReleasesInventoryAndCancelsOrder() {
        when(orderServiceClient.getCart(testUserId)).thenReturn(testCart);
        when(orderServiceClient.createOrder(eq(testUserId), any())).thenReturn(testOrder);
        when(inventoryServiceClient.reserveInventory(anyList())).thenReturn(true);
        when(paymentServiceClient.processPayment(any(), eq(testUserId), any(), eq("CARD")))
                .thenThrow(new RuntimeException("Card declined"));

        CheckoutResponse result = checkoutService.processCheckout(testUserId, testRequest);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Payment failed"));
        verify(inventoryServiceClient).releaseInventory(anyList());
        verify(orderServiceClient).updateOrderStatus(any(), eq("CANCELLED"));
    }

    @Test
    void processCheckout_OrderCreationFails_ReturnsFailure() {
        when(orderServiceClient.getCart(testUserId)).thenReturn(testCart);
        when(orderServiceClient.createOrder(eq(testUserId), any()))
                .thenThrow(new RuntimeException("Order service unavailable"));

        CheckoutResponse result = checkoutService.processCheckout(testUserId, testRequest);

        assertFalse(result.isSuccess());
        verify(inventoryServiceClient, never()).reserveInventory(anyList());
        verify(paymentServiceClient, never()).processPayment(any(), any(), any(), any());
    }

    @Test
    void processCheckout_CartFetchFails_ReturnsFailure() {
        when(orderServiceClient.getCart(testUserId))
                .thenThrow(new RuntimeException("Order service unavailable"));

        CheckoutResponse result = checkoutService.processCheckout(testUserId, testRequest);

        assertFalse(result.isSuccess());
        verify(orderServiceClient, never()).createOrder(any(), any());
    }
}
