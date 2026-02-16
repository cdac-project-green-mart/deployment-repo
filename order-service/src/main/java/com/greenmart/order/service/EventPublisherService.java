package com.greenmart.order.service;

import com.greenmart.order.config.RabbitMQConfig;
import com.greenmart.order.dto.OrderStatusChangeEvent;
import com.greenmart.order.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisherService {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderStatusChange(UUID orderId, String userId, Order.OrderStatus newStatus) {
        try {
            OrderStatusChangeEvent event = OrderStatusChangeEvent.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .status(newStatus)
                    .timestamp(LocalDateTime.now())
                    .build();

            rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_STATUS_QUEUE, event);
            log.info("Published order status change event: orderId={}, status={}", orderId, newStatus);
        } catch (Exception e) {
            // Log error but don't fail the order status update
            log.error("Failed to publish order status change event: {}", e.getMessage(), e);
        }
    }
}
