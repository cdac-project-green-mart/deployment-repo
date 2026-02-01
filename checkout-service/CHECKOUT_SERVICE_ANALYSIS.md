# Checkout Service Analysis & Testing Guide

## 📋 Service Overview

The **Checkout Service** is a SAGA orchestrator that coordinates the checkout process across multiple microservices. It's a **stateless** service that doesn't have its own database.

### Architecture
- **Port**: 8088
- **Database**: None (stateless orchestrator)
- **Framework**: Spring Boot 3.x (Java)
- **Authentication**: `X-User-Id` header
- **Service Discovery**: Eureka Client
- **Pattern**: SAGA Choreography with Compensation

### Dependencies
- Order Service (8085) - Cart & Order management
- Inventory Service (8086) - Stock reservation
- Payment Service (8087) - Payment processing

---

## 🔍 Endpoints Analysis

### 1. **POST** `/api/checkout`
- **Purpose**: Process complete checkout workflow
- **Auth**: Requires `X-User-Id` header
- **Body**:
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001",
    "country": "USA"
  },
  "paymentMethod": "CREDIT_CARD"
}
```
- **Response (Success)**:
```json
{
  "success": true,
  "orderId": "uuid",
  "transactionId": "uuid",
  "message": "Order placed successfully"
}
```
- **Response (Failure)**:
```json
{
  "success": false,
  "orderId": null,
  "transactionId": null,
  "message": "Error description"
}
```

### 2. **GET** `/api/checkout/health`
- **Purpose**: Health check
- **Response**: `"Checkout Service is running"`

---

## 🔄 SAGA Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      CHECKOUT SAGA FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Get Cart                                              │
│    └── Order Service: GET /api/orders/cart                     │
│                                                                 │
│  Step 2: Create Order (PENDING)                                │
│    └── Order Service: POST /api/orders/internal/create         │
│                                                                 │
│  Step 3: Reserve Inventory                                     │
│    └── Inventory Service: POST /api/inventory/{id}/reserve     │
│                                                                 │
│  Step 4: Process Payment                                       │
│    └── Payment Service: POST /api/payments                     │
│                                                                 │
│  Step 5: Confirm Order & Inventory                             │
│    ├── Order Service: PUT /api/orders/internal/{id}/status     │
│    └── Inventory Service: POST /api/inventory/{id}/confirm     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ❌ Compensation Logic

When a step fails, previous steps are compensated:

| Failure Point | Compensation Actions |
|---------------|---------------------|
| Cart empty | None (no changes made) |
| Order creation | None (nothing to compensate) |
| Inventory reservation | Cancel Order |
| Payment | Release Inventory + Cancel Order |
| Confirmation | Refund Payment + Release Inventory + Cancel Order |

---

## 🧪 Postman Test Cases (15 Total)

### Environment Variables
```json
{
  "base_url": "http://localhost:8088",
  "user_id_with_cart": "user_001",
  "user_id_empty_cart": "user_003",
  "user_id_new": "user_test_checkout"
}
```

### Prerequisites
Before testing checkout, ensure:
1. User has items in cart (Order Service)
2. Inventory has sufficient stock (Inventory Service)
3. All dependent services are running

---

### Health Check Tests (2)

#### Test 1: Health Check
```
GET {{base_url}}/api/checkout/health
Expected (200): "Checkout Service is running"
```

#### Test 2: Actuator Health
```
GET {{base_url}}/actuator/health
Expected (200): { "status": "UP" }
```

---

### Successful Checkout Tests (4)

#### Test 3: Checkout - Credit Card
```
POST {{base_url}}/api/checkout
Headers: X-User-Id: {{user_id_with_cart}}
Body: {
  "shippingAddress": {
    "street": "123 Test Street",
    "city": "Test City",
    "zip": "12345",
    "country": "USA"
  },
  "paymentMethod": "CREDIT_CARD"
}

Expected (200):
{
  "success": true,
  "orderId": "uuid",
  "transactionId": "uuid",
  "message": "Order placed successfully"
}
```

#### Test 4: Checkout - UPI
```
POST {{base_url}}/api/checkout
Headers: X-User-Id: {{user_id_with_cart}}
Body: {
  "shippingAddress": {...},
  "paymentMethod": "UPI"
}
```

#### Test 5: Checkout - Debit Card
```
POST {{base_url}}/api/checkout
Headers: X-User-Id: {{user_id_with_cart}}
Body: {
  "shippingAddress": {...},
  "paymentMethod": "DEBIT_CARD"
}
```

#### Test 6: Checkout - Net Banking
```
POST {{base_url}}/api/checkout
Headers: X-User-Id: {{user_id_with_cart}}
Body: {
  "shippingAddress": {...},
  "paymentMethod": "NET_BANKING"
}
```

---

### Error Scenario Tests (6)

#### Test 7: Checkout - Empty Cart
```
POST {{base_url}}/api/checkout
Headers: X-User-Id: {{user_id_empty_cart}}
Body: {
  "shippingAddress": {...},
  "paymentMethod": "CREDIT_CARD"
}

Expected (400):
{
  "success": false,
  "message": "Cart is empty"
}
```

#### Test 8: Checkout - Missing Header
```
POST {{base_url}}/api/checkout
Headers: (none)
Body: {
  "shippingAddress": {...},
  "paymentMethod": "CREDIT_CARD"
}

Expected (400/500): Error about missing X-User-Id
```

#### Test 9: Checkout - Invalid Request Body
```
POST {{base_url}}/api/checkout
Headers: X-User-Id: {{user_id_with_cart}}
Body: {}

Expected (400): Validation errors
```

#### Test 10: Checkout - Missing Shipping Address
```
POST {{base_url}}/api/checkout
Headers: X-User-Id: {{user_id_with_cart}}
Body: {
  "paymentMethod": "CREDIT_CARD"
}

Expected (400): "Shipping address is required"
```

#### Test 11: Checkout - Missing Payment Method
```
POST {{base_url}}/api/checkout
Headers: X-User-Id: {{user_id_with_cart}}
Body: {
  "shippingAddress": {...}
}

Expected (400): "Payment method is required"
```

#### Test 12: Checkout - Incomplete Address
```
POST {{base_url}}/api/checkout
Headers: X-User-Id: {{user_id_with_cart}}
Body: {
  "shippingAddress": {
    "street": "123 Test St"
  },
  "paymentMethod": "CREDIT_CARD"
}

Expected (400): Validation errors for missing fields
```

---

### Integration Tests (3)

#### Test 13: End-to-End Flow
1. Add items to cart (Order Service)
2. Process checkout
3. Verify order created (Order Service)
4. Verify inventory reduced (Inventory Service)
5. Verify transaction created (Payment Service)

#### Test 14: Payment Failure Compensation
1. Setup cart with items
2. Mock payment to fail
3. Verify inventory released
4. Verify order cancelled

#### Test 15: Inventory Failure Compensation
1. Setup cart with items exceeding stock
2. Process checkout
3. Verify order cancelled
4. Verify inventory not reserved

---

## 📋 Testing Prerequisites

### 1. Setup Cart for Testing
```bash
# Add items to cart (Order Service)
curl -X POST http://localhost:8085/api/orders/cart/add \
  -H "X-User-Id: user_test_checkout" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_001_apples",
    "name": "Organic Apples",
    "price": 4.99,
    "quantity": 2
  }'
```

### 2. Ensure Inventory Available
```bash
# Check inventory (Inventory Service)
curl http://localhost:8086/api/inventory/prod_001_apples
```

### 3. All Services Running
- Order Service (8085)
- Inventory Service (8086)
- Payment Service (8087)
- Checkout Service (8088)
- PostgreSQL
- MongoDB
- Eureka Server

---

## 🎯 Key Features

1. **SAGA Pattern**: Distributed transaction management
2. **Compensation Logic**: Automatic rollback on failures
3. **Stateless**: No database, pure orchestration
4. **Service Integration**: Coordinates 3 services
5. **Payment Methods**: CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, WALLET

---

## ⚠️ Notes

- Checkout is a complex integration endpoint
- Test after other services are seeded with data
- Payment may fail (10% mock failure rate)
- Cart is cleared after successful checkout
- Inventory is reserved then confirmed on success


### Working as expected. All postman route tests passed.