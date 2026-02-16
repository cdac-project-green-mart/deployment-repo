package com.greenmart.order.service;

import com.greenmart.order.dto.ShippingAddressRequest;
import com.greenmart.order.entity.*;
import com.greenmart.order.repository.CartRepository;
import com.greenmart.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final EventPublisherService eventPublisherService;

    @Transactional(readOnly = true)
    public List<Order> getUserOrders(String userId) {
        log.info("Getting orders for user: {}", userId);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Order getOrderById(UUID orderId, String userId) {
        log.info("Getting order: {} for user: {}", orderId, userId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify order belongs to user
        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }

        return order;
    }

    @Transactional
    public Order createOrderFromCart(String userId, ShippingAddressRequest shippingRequest) {
        log.info("Creating order from cart for user: {}", userId);

        // Get user's cart
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Create order
        Order order = new Order();
        order.setUserId(userId);
        order.setTotalAmount(cart.getTotalPrice());
        order.setStatus(Order.OrderStatus.PENDING);

        // Copy cart items to order items
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setName(cartItem.getName());
            orderItem.setPrice(cartItem.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            order.addItem(orderItem);
        }

        // Set shipping address
        if (shippingRequest != null) {
            ShippingAddress address = new ShippingAddress();
            address.setStreet(shippingRequest.getStreet());
            address.setCity(shippingRequest.getCity());
            address.setZip(shippingRequest.getZip());
            address.setCountry(shippingRequest.getCountry());
            order.setShippingAddress(address);
        }

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cart.clearItems();
        cartRepository.save(cart);

        log.info("Order created successfully: {}", savedOrder.getId());
        return savedOrder;
    }

    @Transactional
    public Order updateOrderStatus(UUID orderId, Order.OrderStatus status) {
        log.info("Updating order status: {} to {}", orderId, status);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);

        // Publish order status change event
        eventPublisherService.publishOrderStatusChange(orderId, order.getUserId(), status);

        return updatedOrder;
    }
}
