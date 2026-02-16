package com.greenmart.order.dto;

import com.greenmart.order.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusChangeEvent {
    private UUID orderId;
    private String userId;
    private Order.OrderStatus status;
    private LocalDateTime timestamp;
}
