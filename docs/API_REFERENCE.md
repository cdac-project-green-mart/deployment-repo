# Green Mart API Reference

Complete API documentation for frontend developers. All endpoints are accessible through the **API Gateway** at `http://localhost:8080`.

---

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Some endpoints also require `X-User-Id` header (extracted from token by gateway in production).

---

## Base URLs

| Service | Direct URL | Gateway URL |
|---------|-----------|-------------|
| Auth | `http://localhost:8082` | `http://localhost:8080/api/auth` |
| User | `http://localhost:8083` | `http://localhost:8080/api/users` |
| Product | `http://localhost:8084` | `http://localhost:8080/api/products` |
| Order | `http://localhost:8085` | `http://localhost:8080/api/orders` |
| Inventory | `http://localhost:8086` | `http://localhost:8080/api/inventory` |
| Payment | `http://localhost:8087` | `http://localhost:8080/api/payments` |
| Checkout | `http://localhost:8088` | `http://localhost:8080/api/checkout` |

---

## 1. Auth Service

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "CUSTOMER"  // CUSTOMER | VENDOR | ADMIN
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

**Errors:**
- `400` - Validation error (weak password, invalid email)
- `409` - Email already exists

---

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

**Errors:**
- `401` - Invalid credentials

---

### Validate Token

```http
GET /api/auth/validate
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

---

## 2. Product Service

### Get All Products

```http
GET /api/products
GET /api/products?category=Electronics&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "mongo-id",
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse",
      "price": 29.99,
      "category": "Electronics",
      "vendorId": "vendor-uuid",
      "images": ["url1", "url2"],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

### Get Product by ID

```http
GET /api/products/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "mongo-id",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 29.99,
    "category": "Electronics",
    "vendorId": "vendor-uuid"
  }
}
```

**Errors:**
- `404` - Product not found

---

### Create Product (Vendor Only)

```http
POST /api/products
Authorization: Bearer <token>
X-User-Id: <vendor-id>
X-User-Role: VENDOR
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "category": "Electronics",
  "vendorId": "<vendor-uuid>"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "new-mongo-id",
    "name": "New Product",
    ...
  }
}
```

---

### Update Product

```http
PUT /api/products/:id
Authorization: Bearer <token>
X-User-Id: <vendor-id>
Content-Type: application/json

{
  "price": 39.99,
  "description": "Updated description"
}
```

---

### Delete Product (Vendor Only)

```http
DELETE /api/products/:id
Authorization: Bearer <token>
X-User-Id: <vendor-id>
X-User-Role: VENDOR
```

---

## 3. Inventory Service

### Get Inventory for Product

```http
GET /api/inventory/:productId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "productId": "product-id",
    "quantity": 150,
    "lowStockThreshold": 10,
    "lastUpdated": "2024-01-15T10:00:00Z"
  }
}
```

---

### Update Inventory (Vendor Only)

```http
PUT /api/inventory/:productId
X-User-Id: <vendor-id>
Content-Type: application/json

{
  "quantity": 200,
  "lowStockThreshold": 20
}
```

---

### Check Stock Availability

```http
POST /api/inventory/check
Content-Type: application/json

{
  "items": [
    { "productId": "id1", "quantity": 2 },
    { "productId": "id2", "quantity": 1 }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "available": true,
    "items": [
      { "productId": "id1", "available": true, "stock": 50 },
      { "productId": "id2", "available": true, "stock": 30 }
    ]
  }
}
```

---

## 4. Order Service

### Get User's Cart

```http
GET /api/orders/cart
X-User-Id: <user-id>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "items": [
      {
        "productId": "product-id",
        "name": "Wireless Mouse",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "total": 59.98
  }
}
```

---

### Add Item to Cart

```http
POST /api/orders/cart/add
X-User-Id: <user-id>
Content-Type: application/json

{
  "productId": "product-id",
  "name": "Wireless Mouse",
  "quantity": 2,
  "price": 29.99
}
```

---

### Update Cart Item

```http
PUT /api/orders/cart/update?productId=<id>&quantity=<qty>
X-User-Id: <user-id>
```

---

### Remove from Cart

```http
DELETE /api/orders/cart/remove?productId=<id>
X-User-Id: <user-id>
```

---

### Get User's Orders

```http
GET /api/orders
X-User-Id: <user-id>
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "userId": "user-id",
      "status": "COMPLETED",
      "items": [...],
      "totalAmount": 119.97,
      "shippingAddress": {...},
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### Get Order by ID

```http
GET /api/orders/:id
X-User-Id: <user-id>
Authorization: Bearer <token>
```

---

## 5. Checkout Service (SAGA Orchestrator)

### Execute Checkout

This endpoint orchestrates the entire checkout flow:
1. Validates cart
2. Reserves inventory
3. Creates order
4. Processes payment
5. Confirms order

```http
POST /api/checkout
X-User-Id: <user-id>
Authorization: Bearer <token>
Content-Type: application/json

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

**Response (200):**
```json
{
  "success": true,
  "message": "Checkout completed successfully",
  "data": {
    "orderId": "order-uuid",
    "transactionId": "txn-uuid",
    "status": "COMPLETED",
    "totalAmount": 119.97
  }
}
```

**Errors:**
- `400` - Cart is empty
- `409` - Insufficient stock (triggers rollback)
- `402` - Payment failed (triggers rollback)

---

## 6. Payment Service

### Get Transaction by ID

```http
GET /api/payments/:transactionId
X-User-Id: <user-id>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn-uuid",
    "orderId": "order-uuid",
    "userId": "user-id",
    "amount": 119.97,
    "status": "COMPLETED",
    "paymentMethod": "CREDIT_CARD",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### Get User's Payment History

```http
GET /api/payments
X-User-Id: <user-id>
```

---

## Error Response Format

All services return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional details if available"
  }
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate, insufficient stock) |
| 500 | Internal Server Error |

---

## Health Check Endpoints

All services expose health check endpoints:

```http
GET /api/auth/health
GET /health                  # Node.js services
GET /actuator/health         # Spring Boot services
```

---

## Rate Limiting

The API Gateway enforces rate limiting:
- **Anonymous:** 100 requests/minute
- **Authenticated:** 1000 requests/minute

Exceeded limits return `429 Too Many Requests`.
