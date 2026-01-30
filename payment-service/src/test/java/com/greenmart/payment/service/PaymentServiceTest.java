package com.greenmart.payment.service;

import com.greenmart.payment.dto.PaymentRequest;
import com.greenmart.payment.entity.Transaction;
import com.greenmart.payment.entity.Transaction.TransactionStatus;
import com.greenmart.payment.gateway.MockPaymentGateway;
import com.greenmart.payment.gateway.MockPaymentGateway.PaymentResult;
import com.greenmart.payment.repository.TransactionRepository;
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
class PaymentServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private MockPaymentGateway paymentGateway;

    @InjectMocks
    private PaymentService paymentService;

    private PaymentRequest testRequest;
    private Transaction testTransaction;
    private String testUserId;
    private String testOrderId;

    @BeforeEach
    void setUp() {
        testUserId = "user-123";
        testOrderId = "order-456";

        testRequest = new PaymentRequest();
        testRequest.setOrderId(testOrderId);
        testRequest.setUserId(testUserId);
        testRequest.setAmount(new BigDecimal("99.99"));
        testRequest.setCurrency("USD");
        testRequest.setPaymentMethod("CARD");

        testTransaction = new Transaction();
        testTransaction.setId(UUID.randomUUID());
        testTransaction.setOrderId(testOrderId);
        testTransaction.setUserId(testUserId);
        testTransaction.setAmount(new BigDecimal("99.99"));
        testTransaction.setStatus(TransactionStatus.PENDING);
    }

    @Test
    void processPayment_Success_ReturnsCompletedTransaction() {
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(paymentGateway.processPayment(any(), any(), any()))
                .thenReturn(PaymentResult.success("MOCK_TXN_123"));

        Transaction result = paymentService.processPayment(testRequest);

        assertNotNull(result);
        assertEquals(TransactionStatus.COMPLETED, result.getStatus());
        verify(transactionRepository, times(2)).save(any(Transaction.class));
    }

    @Test
    void processPayment_Failure_ReturnsFailedTransaction() {
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(paymentGateway.processPayment(any(), any(), any()))
                .thenReturn(PaymentResult.failure("Card declined"));

        Transaction result = paymentService.processPayment(testRequest);

        assertNotNull(result);
        assertEquals(TransactionStatus.FAILED, result.getStatus());
        assertEquals("Card declined", result.getFailureReason());
    }

    @Test
    void getTransaction_ValidTransaction_ReturnsTransaction() {
        UUID txnId = testTransaction.getId();
        when(transactionRepository.findById(txnId)).thenReturn(Optional.of(testTransaction));

        Transaction result = paymentService.getTransaction(txnId, testUserId);

        assertNotNull(result);
        assertEquals(txnId, result.getId());
    }

    @Test
    void getTransaction_NotFound_ThrowsException() {
        UUID txnId = UUID.randomUUID();
        when(transactionRepository.findById(txnId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> paymentService.getTransaction(txnId, testUserId));
    }

    @Test
    void getTransaction_UnauthorizedUser_ThrowsException() {
        UUID txnId = testTransaction.getId();
        when(transactionRepository.findById(txnId)).thenReturn(Optional.of(testTransaction));

        assertThrows(RuntimeException.class, () -> paymentService.getTransaction(txnId, "wrong-user"));
    }

    @Test
    void getUserTransactions_ReturnsTransactionList() {
        when(transactionRepository.findByUserIdOrderByCreatedAtDesc(testUserId))
                .thenReturn(List.of(testTransaction));

        List<Transaction> result = paymentService.getUserTransactions(testUserId);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void refundTransaction_Success_ReturnsRefundedTransaction() {
        testTransaction.setStatus(TransactionStatus.COMPLETED);
        testTransaction.setProviderTransactionId("MOCK_TXN_123");

        when(transactionRepository.findById(testTransaction.getId()))
                .thenReturn(Optional.of(testTransaction));
        when(paymentGateway.processRefund(any(), any()))
                .thenReturn(PaymentResult.success("REFUND_123"));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        Transaction result = paymentService.refundTransaction(testTransaction.getId());

        assertNotNull(result);
        assertEquals(TransactionStatus.REFUNDED, result.getStatus());
    }

    @Test
    void refundTransaction_NotCompleted_ThrowsException() {
        testTransaction.setStatus(TransactionStatus.PENDING);
        when(transactionRepository.findById(testTransaction.getId()))
                .thenReturn(Optional.of(testTransaction));

        assertThrows(RuntimeException.class,
                () -> paymentService.refundTransaction(testTransaction.getId()));
    }
}
