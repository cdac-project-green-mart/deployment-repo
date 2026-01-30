package com.greenmart.payment.controller;

import com.greenmart.payment.dto.ApiResponse;
import com.greenmart.payment.dto.PaymentRequest;
import com.greenmart.payment.entity.Transaction;
import com.greenmart.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Process payment (called by Checkout Service)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Transaction>> processPayment(
            @Valid @RequestBody PaymentRequest request) {
        log.info("Processing payment for order: {}", request.getOrderId());

        Transaction transaction = paymentService.processPayment(request);

        if (transaction.getStatus() == Transaction.TransactionStatus.COMPLETED) {
            return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", transaction));
        } else {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Payment failed: " + transaction.getFailureReason()));
        }
    }

    /**
     * Get transaction by ID (user-facing)
     */
    @GetMapping("/{transactionId}")
    public ResponseEntity<ApiResponse<Transaction>> getTransaction(
            @PathVariable UUID transactionId,
            @RequestHeader("X-User-Id") String userId) {
        log.info("Getting transaction: {} for user: {}", transactionId, userId);

        Transaction transaction = paymentService.getTransaction(transactionId, userId);
        return ResponseEntity.ok(ApiResponse.success(transaction));
    }

    /**
     * Get user's transaction history (user-facing)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Transaction>>> getUserTransactions(
            @RequestHeader("X-User-Id") String userId) {
        log.info("Getting transactions for user: {}", userId);

        List<Transaction> transactions = paymentService.getUserTransactions(userId);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    // ==================== Internal APIs ====================

    /**
     * Get transaction by order ID (internal - for Checkout Service)
     */
    @GetMapping("/internal/order/{orderId}")
    public ResponseEntity<ApiResponse<Transaction>> getTransactionByOrderId(
            @PathVariable String orderId) {
        log.info("Getting transaction for order: {} (internal)", orderId);

        Transaction transaction = paymentService.getTransactionByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(transaction));
    }

    /**
     * Refund transaction (internal - for admin/Checkout Service)
     */
    @PostMapping("/internal/{transactionId}/refund")
    public ResponseEntity<ApiResponse<Transaction>> refundTransaction(
            @PathVariable UUID transactionId) {
        log.info("Processing refund for transaction: {} (internal)", transactionId);

        Transaction transaction = paymentService.refundTransaction(transactionId);
        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully", transaction));
    }
}
