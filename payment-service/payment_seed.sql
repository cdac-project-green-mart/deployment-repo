-- Payment Service Seed Data for Testing
-- Run this in PostgreSQL after starting the payment-service

-- Clear existing test data
DELETE FROM transactions WHERE user_id IN ('user_001', 'user_002', 'user_003', 'user_test');

-- Insert test transactions
-- User 001: 3 transactions (2 COMPLETED, 1 REFUNDED)
INSERT INTO transactions (id, order_id, user_id, amount, currency, payment_method, status, provider_transaction_id, failure_reason, created_at, updated_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'order_001', 'user_001', 45.95, 'USD', 'CREDIT_CARD', 'COMPLETED', 'MOCK_TXN_ABC123', NULL, '2026-01-15 10:30:00', '2026-01-15 10:30:05'),
('aa0e8400-e29b-41d4-a716-446655440002', 'order_002', 'user_001', 89.97, 'USD', 'DEBIT_CARD', 'COMPLETED', 'MOCK_TXN_DEF456', NULL, '2026-01-25 15:45:00', '2026-01-25 15:45:03'),
('aa0e8400-e29b-41d4-a716-446655440003', 'order_003', 'user_001', 32.50, 'USD', 'UPI', 'REFUNDED', 'MOCK_TXN_GHI789', NULL, '2026-01-20 11:00:00', '2026-01-22 09:30:00');

-- User 002: 3 transactions (1 COMPLETED, 1 FAILED, 1 PENDING)
INSERT INTO transactions (id, order_id, user_id, amount, currency, payment_method, status, provider_transaction_id, failure_reason, created_at, updated_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440004', 'order_004', 'user_002', 156.50, 'USD', 'CREDIT_CARD', 'COMPLETED', 'MOCK_TXN_JKL012', NULL, '2026-01-30 11:20:00', '2026-01-30 11:20:04'),
('aa0e8400-e29b-41d4-a716-446655440005', 'order_005', 'user_002', 78.25, 'USD', 'NET_BANKING', 'FAILED', NULL, 'Insufficient funds', '2026-01-28 14:00:00', '2026-01-28 14:00:02'),
('aa0e8400-e29b-41d4-a716-446655440006', 'order_006', 'user_002', 42.99, 'USD', 'WALLET', 'PENDING', NULL, NULL, '2026-01-31 09:00:00', '2026-01-31 09:00:00');

-- User 003: 2 transactions (1 COMPLETED, 1 FAILED)
INSERT INTO transactions (id, order_id, user_id, amount, currency, payment_method, status, provider_transaction_id, failure_reason, created_at, updated_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440007', 'order_007', 'user_003', 99.99, 'USD', 'CREDIT_CARD', 'COMPLETED', 'MOCK_TXN_MNO345', NULL, '2026-01-29 16:30:00', '2026-01-29 16:30:05'),
('aa0e8400-e29b-41d4-a716-446655440008', 'order_008', 'user_003', 25.00, 'USD', 'DEBIT_CARD', 'FAILED', NULL, 'Card declined', '2026-01-30 10:15:00', '2026-01-30 10:15:01');

-- Verify data
SELECT 'Transactions by Status:' AS info;
SELECT status, COUNT(*) as count FROM transactions GROUP BY status ORDER BY status;

SELECT 'Transactions by User:' AS info;
SELECT user_id, COUNT(*) as count FROM transactions GROUP BY user_id ORDER BY user_id;

SELECT 'Total Transactions: ' || COUNT(*) AS total FROM transactions;
