package com.greenmart.checkout.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutResponse {
    private boolean success;
    private String orderId;
    private String transactionId;
    private String message;

    public static CheckoutResponse success(String orderId, String transactionId) {
        return new CheckoutResponse(true, orderId, transactionId, "Order placed successfully");
    }

    public static CheckoutResponse failure(String message) {
        return new CheckoutResponse(false, null, null, message);
    }
}
