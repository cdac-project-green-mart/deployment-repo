package com.greenmart.order.service;

import com.greenmart.order.dto.ShippingAddressRequest;
import com.greenmart.order.entity.*;
import com.greenmart.order.repository.CartRepository;
import com.greenmart.order.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @InjectMocks
    private OrderService orderService;

    private String testUserId;
    private Cart testCart;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        testUserId = "user-123";

        testCart = new Cart();
        testCart.setUserId(testUserId);
        testCart.setTotalPrice(new BigDecimal("199.98"));

        CartItem cartItem = new CartItem();
        cartItem.setProductId("product-1");
        cartItem.setName("Test Product");
        cartItem.setPrice(new BigDecimal("99.99"));
        cartItem.setQuantity(2);
        testCart.addItem(cartItem);

        testOrder = new Order();
        testOrder.setId(UUID.randomUUID());
        testOrder.setUserId(testUserId);
        testOrder.setTotalAmount(new BigDecimal("199.98"));
        testOrder.setStatus(Order.OrderStatus.PENDING);
    }

    @Test
    void getUserOrders_ReturnsUserOrders() {
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(testUserId)).thenReturn(List.of(testOrder));
        List<Order> result = orderService.getUserOrders(testUserId);
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getOrderById_ValidOrder_ReturnsOrder() {
        UUID orderId = testOrder.getId();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        Order result = orderService.getOrderById(orderId, testUserId);
        assertNotNull(result);
        assertEquals(orderId, result.getId());
    }

    @Test
    void getOrderById_OrderNotFound_ThrowsException() {
        UUID orderId = UUID.randomUUID();
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> orderService.getOrderById(orderId, testUserId));
    }

    @Test
    void getOrderById_UnauthorizedUser_ThrowsException() {
        UUID orderId = testOrder.getId();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        assertThrows(RuntimeException.class, () -> orderService.getOrderById(orderId, "different-user"));
    }

    @Test
    void createOrderFromCart_ValidCart_CreatesOrder() {
        ShippingAddressRequest shippingRequest = new ShippingAddressRequest("123 Main St", "New York", "10001", "USA");
        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.of(testCart));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        Order result = orderService.createOrderFromCart(testUserId, shippingRequest);

        assertNotNull(result);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrderFromCart_EmptyCart_ThrowsException() {
        Cart emptyCart = new Cart();
        emptyCart.setUserId(testUserId);
        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.of(emptyCart));
        assertThrows(RuntimeException.class, () -> orderService.createOrderFromCart(testUserId, null));
    }

    @Test
    void createOrderFromCart_CartNotFound_ThrowsException() {
        when(cartRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> orderService.createOrderFromCart(testUserId, null));
    }

    @Test
    void updateOrderStatus_ValidOrder_UpdatesStatus() {
        UUID orderId = testOrder.getId();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order result = orderService.updateOrderStatus(orderId, Order.OrderStatus.CONFIRMED);

        assertNotNull(result);
        assertEquals(Order.OrderStatus.CONFIRMED, testOrder.getStatus());
    }

    @Test
    void updateOrderStatus_OrderNotFound_ThrowsException() {
        UUID orderId = UUID.randomUUID();
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class,
                () -> orderService.updateOrderStatus(orderId, Order.OrderStatus.CONFIRMED));
    }
}
