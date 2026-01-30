package com.greenmart.payment.repository;

import com.greenmart.payment.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByOrderId(String orderId);

    List<Transaction> findByUserIdOrderByCreatedAtDesc(String userId);
}
