package com.greenmart.payment.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Random;
import java.util.UUID;

/**
 * Mock Payment Gateway that simulates external payment processing.
 * In production, this would integrate with Stripe, RazorPay, PayPal, etc.
 */
@Component
@Slf4j
public class MockPaymentGateway {

    private static final double SUCCESS_RATE = 0.9; // 90% success rate
    private static final int MIN_DELAY_MS = 100;
    private static final int MAX_DELAY_MS = 500;

    private final Random random = new Random();

    public PaymentResult processPayment(String orderId, BigDecimal amount, String paymentMethod) {
        log.info("Processing payment for order: {}, amount: {}, method: {}", orderId, amount, paymentMethod);

        // Simulate processing delay
        simulateDelay();

        // Simulate success/failure based on success rate
        boolean isSuccess = random.nextDouble() < SUCCESS_RATE;

        if (isSuccess) {
            String providerTxnId = "MOCK_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
            log.info("Payment successful. Provider Transaction ID: {}", providerTxnId);
            return PaymentResult.success(providerTxnId);
        } else {
            String failureReason = getRandomFailureReason();
            log.warn("Payment failed. Reason: {}", failureReason);
            return PaymentResult.failure(failureReason);
        }
    }

    public PaymentResult processRefund(String providerTransactionId, BigDecimal amount) {
        log.info("Processing refund for transaction: {}, amount: {}", providerTransactionId, amount);

        simulateDelay();

        // Refunds have higher success rate (95%)
        if (random.nextDouble() < 0.95) {
            String refundId = "REFUND_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            log.info("Refund successful. Refund ID: {}", refundId);
            return PaymentResult.success(refundId);
        } else {
            return PaymentResult.failure("Refund processing temporarily unavailable");
        }
    }

    private void simulateDelay() {
        try {
            int delay = MIN_DELAY_MS + random.nextInt(MAX_DELAY_MS - MIN_DELAY_MS);
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String getRandomFailureReason() {
        String[] reasons = {
                "Insufficient funds",
                "Card declined",
                "Invalid card number",
                "Payment gateway timeout",
                "Transaction limit exceeded"
        };
        return reasons[random.nextInt(reasons.length)];
    }

    public record PaymentResult(boolean success, String providerTransactionId, String failureReason) {
        public static PaymentResult success(String providerTransactionId) {
            return new PaymentResult(true, providerTransactionId, null);
        }

        public static PaymentResult failure(String reason) {
            return new PaymentResult(false, null, reason);
        }
    }
}
