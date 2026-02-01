# Payment Service Analysis & Testing Guide

## 📋 Service Overview

The **Payment Service** handles payment processing for orders in the Green Mart e-commerce platform. It provides endpoints for processing payments, viewing transaction history, and handling refunds.

### Architecture
- **Port**: 8087
- **Database**: PostgreSQL
- **Framework**: Spring Boot 3.x (Java)
- **Authentication**: `X-User-Id` header for user-facing endpoints
- **Service Discovery**: Eureka Client
- **Key Features**: Mock payment gateway (90% success rate), refund support, transaction tracking

---

## 🔍 Endpoints Analysis

### User-Facing Endpoints (3)

#### 1. **POST** `/api/payments`
- **Purpose**: Process payment for an order
- **Auth**: None (called by Checkout Service with userId in body)
- **Body**: `{ orderId, userId, amount, currency?, paymentMethod }`
- **Response**: Transaction with status (COMPLETED or FAILED)
- **Note**: 90% success rate with mock gateway

#### 2. **GET** `/api/payments/{transactionId}`
- **Purpose**: Get transaction by ID
- **Auth**: Requires `X-User-Id` header
- **Params**: `transactionId` (UUID)
- **Authorization**: User can only access their own transactions
- **Response**: Transaction details

#### 3. **GET** `/api/payments`
- **Purpose**: Get user's transaction history
- **Auth**: Requires `X-User-Id` header
- **Response**: List of transactions sorted by creation date (desc)

### Internal Endpoints (2)

#### 4. **GET** `/api/payments/internal/order/{orderId}`
- **Purpose**: Get transaction by order ID
- **Auth**: None (internal service)
- **Params**: `orderId` (string)
- **Response**: Transaction for the specified order

#### 5. **POST** `/api/payments/internal/{transactionId}/refund`
- **Purpose**: Refund a completed transaction
- **Auth**: None (internal service)
- **Params**: `transactionId` (UUID)
- **Validation**: Can only refund COMPLETED transactions
- **Response**: Updated transaction with REFUNDED status

---

## 📊 PostgreSQL Schema

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    provider_transaction_id VARCHAR(100),
    failure_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Transaction statuses: PENDING, COMPLETED, FAILED, REFUNDED
-- Payment methods: CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, WALLET
```

---

## 🗄️ PostgreSQL Test Data

```sql
-- Clear existing test data
DELETE FROM transactions WHERE user_id IN ('user_001', 'user_002', 'user_003');

-- Insert test transactions
INSERT INTO transactions (id, order_id, user_id, amount, currency, payment_method, status, provider_transaction_id, failure_reason, created_at, updated_at) VALUES
-- User 001 transactions (3)
('aa0e8400-e29b-41d4-a716-446655440001', 'order_001', 'user_001', 45.95, 'USD', 'CREDIT_CARD', 'COMPLETED', 'MOCK_TXN_ABC123', NULL, '2026-01-15 10:30:00', '2026-01-15 10:30:05'),
('aa0e8400-e29b-41d4-a716-446655440002', 'order_002', 'user_001', 89.97, 'USD', 'DEBIT_CARD', 'COMPLETED', 'MOCK_TXN_DEF456', NULL, '2026-01-25 15:45:00', '2026-01-25 15:45:03'),
('aa0e8400-e29b-41d4-a716-446655440003', 'order_003', 'user_001', 32.50, 'USD', 'UPI', 'REFUNDED', 'MOCK_TXN_GHI789', NULL, '2026-01-20 11:00:00', '2026-01-22 09:30:00'),

-- User 002 transactions (3)
('aa0e8400-e29b-41d4-a716-446655440004', 'order_004', 'user_002', 156.50, 'USD', 'CREDIT_CARD', 'COMPLETED', 'MOCK_TXN_JKL012', NULL, '2026-01-30 11:20:00', '2026-01-30 11:20:04'),
('aa0e8400-e29b-41d4-a716-446655440005', 'order_005', 'user_002', 78.25, 'USD', 'NET_BANKING', 'FAILED', NULL, 'Insufficient funds', '2026-01-28 14:00:00', '2026-01-28 14:00:02'),
('aa0e8400-e29b-41d4-a716-446655440006', 'order_006', 'user_002', 42.99, 'USD', 'WALLET', 'PENDING', NULL, NULL, '2026-01-31 09:00:00', '2026-01-31 09:00:00'),

-- User 003 transactions (2)
('aa0e8400-e29b-41d4-a716-446655440007', 'order_007', 'user_003', 99.99, 'USD', 'CREDIT_CARD', 'COMPLETED', 'MOCK_TXN_MNO345', NULL, '2026-01-29 16:30:00', '2026-01-29 16:30:05'),
('aa0e8400-e29b-41d4-a716-446655440008', 'order_008', 'user_003', 25.00, 'USD', 'DEBIT_CARD', 'FAILED', NULL, 'Card declined', '2026-01-30 10:15:00', '2026-01-30 10:15:01');
```

---

## 🧪 Postman Test Cases (20 Total)

### Environment Variables
```json
{
  "base_url": "http://localhost:8087",
  "user_id_with_txns": "user_001",
  "user_id_002": "user_002",
  "transaction_id_completed": "aa0e8400-e29b-41d4-a716-446655440001",
  "transaction_id_for_refund": "aa0e8400-e29b-41d4-a716-446655440004",
  "order_id": "order_001"
}
```

---

### Health Check Tests (2)

#### Test 1: Actuator Health
```
GET {{base_url}}/actuator/health
Expected (200): { "status": "UP" }
```

#### Test 2: Health Check
```
GET {{base_url}}/health
Expected (200): { "status": "Payment Service is running" }
```

---

### Payment Processing Tests (5)

#### Test 3: Process Payment - Credit Card
```
POST {{base_url}}/api/payments
Body: {
  "orderId": "test_order_001",
  "userId": "user_test",
  "amount": 99.99,
  "currency": "USD",
  "paymentMethod": "CREDIT_CARD"
}

Expected (200): Transaction with status COMPLETED or FAILED
```

#### Test 4: Process Payment - UPI
```
POST {{base_url}}/api/payments
Body: {
  "orderId": "test_order_002",
  "userId": "user_test",
  "amount": 50.00,
  "paymentMethod": "UPI"
}
```

#### Test 5: Process Payment - Small Amount
```
POST {{base_url}}/api/payments
Body: {
  "orderId": "test_order_003",
  "userId": "user_test",
  "amount": 5.99,
  "paymentMethod": "DEBIT_CARD"
}
```

#### Test 6: Process Payment - Large Amount
```
POST {{base_url}}/api/payments
Body: {
  "orderId": "test_order_004",
  "userId": "user_test",
  "amount": 999.99,
  "paymentMethod": "NET_BANKING"
}
```

#### Test 7: Process Payment - Validation Error
```
POST {{base_url}}/api/payments
Body: {
  "orderId": "",
  "amount": 0,
  "paymentMethod": ""
}

Expected (400): Validation errors
```

---

### Transaction Retrieval Tests (5)

#### Test 8: Get Transaction by ID
```
GET {{base_url}}/api/payments/{{transaction_id_completed}}
Headers: X-User-Id: {{user_id_with_txns}}

Expected (200):
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "orderId": "order_001",
    "status": "COMPLETED",
    ...
  }
}
```

#### Test 9: Get User Transactions
```
GET {{base_url}}/api/payments
Headers: X-User-Id: {{user_id_with_txns}}

Expected (200): List of 3 transactions for user_001
```

#### Test 10: Get Transactions - User 002
```
GET {{base_url}}/api/payments
Headers: X-User-Id: {{user_id_002}}

Expected (200): List of 3 transactions (COMPLETED, FAILED, PENDING)
```

#### Test 11: Get Transactions - New User (Empty)
```
GET {{base_url}}/api/payments
Headers: X-User-Id: user_no_txns

Expected (200): { "data": [] }
```

#### Test 12: Get Transaction - Wrong User (Unauthorized)
```
GET {{base_url}}/api/payments/{{transaction_id_completed}}
Headers: X-User-Id: user_999

Expected (500): "Unauthorized access to transaction"
```

---

### Internal Endpoint Tests (4)

#### Test 13: Get Transaction by Order ID
```
GET {{base_url}}/api/payments/internal/order/{{order_id}}

Expected (200): Transaction for order_001
```

#### Test 14: Refund Transaction
```
POST {{base_url}}/api/payments/internal/{{transaction_id_for_refund}}/refund

Expected (200):
{
  "success": true,
  "message": "Refund processed successfully",
  "data": { "status": "REFUNDED" }
}
```

#### Test 15: Refund - Already Refunded (Error)
```
POST {{base_url}}/api/payments/internal/aa0e8400-e29b-41d4-a716-446655440003/refund

Expected (500): "Can only refund completed transactions"
```

#### Test 16: Refund - Failed Transaction (Error)
```
POST {{base_url}}/api/payments/internal/aa0e8400-e29b-41d4-a716-446655440005/refund

Expected (500): "Can only refund completed transactions"
```

---

### Error Tests (4)

#### Test 17: Transaction Not Found
```
GET {{base_url}}/api/payments/00000000-0000-0000-0000-000000000000
Headers: X-User-Id: user_001

Expected (500): "Transaction not found"
```

#### Test 18: Order Not Found
```
GET {{base_url}}/api/payments/internal/order/nonexistent_order

Expected (500): "Transaction not found for order"
```

#### Test 19: Missing Required Fields
```
POST {{base_url}}/api/payments
Body: { "orderId": "test" }

Expected (400): Validation errors
```

#### Test 20: Negative Amount
```
POST {{base_url}}/api/payments
Body: {
  "orderId": "test",
  "userId": "user",
  "amount": -10,
  "paymentMethod": "CREDIT_CARD"
}

Expected (400): Amount validation error
```

---

## 🎯 Key Features

1. **Mock Payment Gateway**: 90% success rate for testing
2. **Multiple Payment Methods**: CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, WALLET
3. **Transaction Statuses**: PENDING → COMPLETED/FAILED, COMPLETED → REFUNDED
4. **Authorization**: Users can only view their own transactions
5. **Refunds**: Only completed transactions can be refunded (95% success rate)
6. **Provider Transaction ID**: Generated by mock gateway for successful payments

---

## 🔄 Transaction Status Workflow

```
PENDING → COMPLETED (90% success rate)
    ↓
   FAILED (10% failure rate)

COMPLETED → REFUNDED (95% refund success rate)
```

---

## 📝 Import Commands

```bash
docker cp payment_seed.sql green-mart-postgres:/tmp/payment_seed.sql
docker exec -it green-mart-postgres psql -U greenmart -d greenmart -f /tmp/payment_seed.sql
```
