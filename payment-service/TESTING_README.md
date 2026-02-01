# Payment Service Testing Resources

## 📁 Files

- **PAYMENT_SERVICE_ANALYSIS.md** - Complete endpoint documentation (5 endpoints)
- **payment_seed.sql** - PostgreSQL seed data (8 transactions)
- **Payment_Service_Postman_Collection.json** - 20 ready-to-run tests

## 🚀 Quick Start

### 1. Start the Service

```bash
docker-compose up -d postgres eureka-server payment-service
```

### 2. Import Test Data

```bash
docker cp payment_seed.sql green-mart-postgres:/tmp/payment_seed.sql
docker exec -it green-mart-postgres psql -U greenmart -d greenmart -f /tmp/payment_seed.sql
```

### 3. Import Postman Collection

1. Open Postman → Import → Select `Payment_Service_Postman_Collection.json`

## 📊 Test Coverage

- **2 Health Check tests**
- **5 Payment Processing tests** (Credit Card, UPI, Debit, Net Banking, Wallet)
- **4 Transaction Retrieval tests**
- **3 Internal Endpoint tests** (Order lookup, Refund)
- **6 Error Scenario tests**

**Environment Variables** (pre-configured):
- `base_url`: http://localhost:8087
- `user_id_with_txns`: user_001
- `transaction_id_completed`: aa0e8400-e29b-41d4-a716-446655440001
- `transaction_id_for_refund`: aa0e8400-e29b-41d4-a716-446655440004

## 🗄️ Test Data

**8 Transactions across 3 users:**

| User | Status | Payment Method | Amount |
|------|--------|----------------|--------|
| user_001 | COMPLETED | CREDIT_CARD | $45.95 |
| user_001 | COMPLETED | DEBIT_CARD | $89.97 |
| user_001 | REFUNDED | UPI | $32.50 |
| user_002 | COMPLETED | CREDIT_CARD | $156.50 |
| user_002 | FAILED | NET_BANKING | $78.25 |
| user_002 | PENDING | WALLET | $42.99 |
| user_003 | COMPLETED | CREDIT_CARD | $99.99 |
| user_003 | FAILED | DEBIT_CARD | $25.00 |

## 🔄 Transaction Status Workflow

```
PENDING → COMPLETED (90% success rate)
    ↓
   FAILED (10% failure rate)

COMPLETED → REFUNDED (95% refund success rate)
```

## 🔑 Key Features

- **Mock Payment Gateway**: 90% success rate for testing
- **Multiple Payment Methods**: CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, WALLET
- **Authorization**: Users can only view their own transactions
- **Refunds**: Only COMPLETED transactions can be refunded
- **Internal APIs**: For checkout service integration

## ⚠️ Notes

- Uses PostgreSQL (same as Order Service)
- Mock gateway simulates real payment processing
- Failed payments include realistic failure reasons
- Refund attempts may fail (5% of the time)
