package com.greenmart.payment.service;

import com.greenmart.payment.dto.PaymentRequest;
import com.greenmart.payment.entity.Transaction;
import com.greenmart.payment.entity.Transaction.TransactionStatus;
import com.greenmart.payment.gateway.MockPaymentGateway;
import com.greenmart.payment.gateway.MockPaymentGateway.PaymentResult;
import com.greenmart.payment.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final TransactionRepository transactionRepository;
    private final MockPaymentGateway paymentGateway;

    @Transactional
    public Transaction processPayment(PaymentRequest request) {
        log.info("Processing payment for order: {}", request.getOrderId());

        // Create pending transaction
        Transaction transaction = new Transaction();
        transaction.setOrderId(request.getOrderId());
        transaction.setUserId(request.getUserId());
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setStatus(TransactionStatus.PENDING);

        transaction = transactionRepository.save(transaction);
        log.info("Created pending transaction: {}", transaction.getId());

        // Process payment through gateway
        PaymentResult result = paymentGateway.processPayment(
                request.getOrderId(),
                request.getAmount(),
                request.getPaymentMethod());

        // Update transaction based on result
        if (result.success()) {
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setProviderTransactionId(result.providerTransactionId());
            log.info("Payment completed for transaction: {}", transaction.getId());
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
            transaction.setFailureReason(result.failureReason());
            log.warn("Payment failed for transaction: {}. Reason: {}", transaction.getId(), result.failureReason());
        }

        return transactionRepository.save(transaction);
    }

    public Transaction getTransaction(UUID transactionId, String userId) {
        log.info("Getting transaction: {} for user: {}", transactionId, userId);

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Verify user owns this transaction
        if (!transaction.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to transaction");
        }

        return transaction;
    }

    public Transaction getTransactionById(UUID transactionId) {
        log.info("Getting transaction: {} (internal)", transactionId);
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
    }

    public Transaction getTransactionByOrderId(String orderId) {
        log.info("Getting transaction for order: {}", orderId);
        return transactionRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Transaction not found for order"));
    }

    public List<Transaction> getUserTransactions(String userId) {
        log.info("Getting transactions for user: {}", userId);
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Transaction refundTransaction(UUID transactionId) {
        log.info("Processing refund for transaction: {}", transactionId);

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.COMPLETED) {
            throw new RuntimeException("Can only refund completed transactions");
        }

        // Process refund through gateway
        PaymentResult result = paymentGateway.processRefund(
                transaction.getProviderTransactionId(),
                transaction.getAmount());

        if (result.success()) {
            transaction.setStatus(TransactionStatus.REFUNDED);
            log.info("Refund completed for transaction: {}", transactionId);
        } else {
            throw new RuntimeException("Refund failed: " + result.failureReason());
        }

        return transactionRepository.save(transaction);
    }
}
