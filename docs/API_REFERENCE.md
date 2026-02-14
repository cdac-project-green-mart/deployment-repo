# Green Mart API Reference

Complete API documentation for frontend developers. All endpoints are accessible through the **API Gateway**.

- **Production:** `http://68.183.86.246:8080`
- **Local Development:** `http://localhost:8080`

---

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

The API Gateway validates the token and injects the following headers into downstream requests:

| Header | Description |
|--------|-------------|
| `X-User-Id` | User's UUID (extracted from JWT) |
| `X-User-Role` | User's role: `CUSTOMER`, `VENDOR`, or `ADMIN` |

---

## Base URLs

| Service | Gateway Path | Direct (Dev Only) |
|---------|-------------|-------------------|
| Auth | `/api/auth` | `localhost:9001` |
| User | `/api/users` | `localhost:9002` |
| Product | `/api/products` | `localhost:9003` |
| Inventory | `/api/inventory` | `localhost:9004` |
| Order | `/api/orders` | `localhost:9005` |
| Checkout | `/api/checkout` | `localhost:9006` |
| Payment | `/api/payments` | `localhost:9007` |

---

## 1. Auth Service

### 1.1 Register User

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "CUSTOMER"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | |
| `email` | string | ✅ | Must be valid email |
| `password` | string | ✅ | Min 6 characters |
| `role` | string | ❌ | `CUSTOMER` (default), `VENDOR`, `ADMIN` |

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

**Errors:** `400` Validation error · `409` Email already exists

---

### 1.2 Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
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

> [!TIP]
> Store the `token` value and include it as `Authorization: Bearer <token>` in all protected requests.

**Errors:** `401` Invalid credentials

---

### 1.3 Validate Token

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

**Errors:** `401` Missing/invalid token

---

### 1.4 Health Check

```http
GET /api/auth/health
```

**Response (200):** `"Auth Service is running"`

---

## 2. User Service

> [!NOTE]
> All User Service endpoints require the `X-User-Id` header (set by API Gateway from JWT).

### 2.1 Get User Profile

```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "mongo-id",
    "userId": "auth-uuid",
    "phone": "+1234567890",
    "addresses": [
      {
        "_id": "address-mongo-id",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "USA",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": true,
      "theme": "light"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 2.2 Update User Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "+1234567890",
  "preferences": {
    "newsletter": false,
    "theme": "dark"
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| `phone` | string | ❌ |
| `preferences.newsletter` | boolean | ❌ |
| `preferences.theme` | string | ❌ |

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### 2.3 Add Address

```http
POST /api/users/address
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "street": "456 Oak Ave",
  "city": "Los Angeles",
  "state": "CA",
  "zip": "90001",
  "country": "USA",
  "isDefault": false
}
```

| Field | Type | Required |
|-------|------|----------|
| `street` | string | ❌ |
| `city` | string | ❌ |
| `state` | string | ❌ |
| `zip` | string | ❌ |
| `country` | string | ❌ |
| `isDefault` | boolean | ❌ |

**Response (201):**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "_id": "address-mongo-id",
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90001",
    "country": "USA",
    "isDefault": false
  }
}
```

---

### 2.4 Get All Addresses

```http
GET /api/users/addresses
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "address-mongo-id",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "USA",
      "isDefault": true
    }
  ]
}
```

---

### 2.5 Update Address

```http
PUT /api/users/address/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "street": "789 Elm St",
  "city": "Chicago",
  "state": "IL",
  "zip": "60601",
  "country": "USA",
  "isDefault": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": { ... }
}
```

**Errors:** `404` Address not found

---

### 2.6 Delete Address

```http
DELETE /api/users/address/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

**Errors:** `404` Address not found

---

## 3. Product Service

### 3.1 Get All Products (Public)

```http
GET /api/products
GET /api/products?category=Electronics&page=1&limit=10&minPrice=10&maxPrice=100&search=mouse
```

| Query Param | Type | Default | Notes |
|-------------|------|---------|-------|
| `page` | int | 1 | Min 1 |
| `limit` | int | 10 | 1–100 |
| `category` | string | — | Filter by category |
| `minPrice` | float | — | Minimum price filter |
| `maxPrice` | float | — | Maximum price filter |
| `search` | string | — | Text search on name & description |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "mongo-id",
      "name": "Organic Apples",
      "description": "Fresh organic apples",
      "price": 4.99,
      "category": "Fruits",
      "userId": "vendor-uuid",
      "images": [
        "https://greenmart-images.sgp1.cdn.digitaloceanspaces.com/products/apple.jpg"
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

---

### 3.2 Get All Categories (Public)

```http
GET /api/products/categories
```

**Response (200):**
```json
{
  "success": true,
  "data": ["Fruits", "Vegetables", "Dairy", "Bakery", "Beverages"]
}
```

---

### 3.3 Get Product by ID (Public)

```http
GET /api/products/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "mongo-id",
    "name": "Organic Apples",
    "description": "Fresh organic apples",
    "price": 4.99,
    "category": "Fruits",
    "userId": "vendor-uuid",
    "images": ["url1", "url2"],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Errors:** `404` Product not found

---

### 3.4 Get My Products (Vendor)

```http
GET /api/products/vendor/me
Authorization: Bearer <token>
```

Returns all products created by the authenticated vendor.

**Response (200):**
```json
{
  "success": true,
  "data": [ ...products ]
}
```

---

### 3.5 Create Product (Admin/Vendor)

Supports two content types:
- **`multipart/form-data`** — Upload image files directly (max 5 images, 5MB each)
- **`application/json`** — Provide image URLs in the `images` array

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

name=Organic Apples
description=Fresh organic apples
price=4.99
category=Fruits
images=<file1>
images=<file2>
```

**OR (JSON with image URLs):**

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Organic Apples",
  "description": "Fresh organic apples",
  "price": 4.99,
  "category": "Fruits",
  "images": ["https://example.com/apple1.jpg", "https://example.com/apple2.jpg"]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | |
| `description` | string | ✅ | |
| `price` | float | ✅ | Must be ≥ 0 |
| `category` | string | ✅ | |
| `images` | file[] or string[] | ✅ | At least 1 image required |

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "new-mongo-id",
    "name": "Organic Apples",
    "description": "Fresh organic apples",
    "price": 4.99,
    "category": "Fruits",
    "userId": "vendor-uuid",
    "images": ["https://cdn-url/products/uuid.jpg"],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Errors:** `400` Validation / no images · `401` Not authenticated · `403` Not admin/vendor

---

### 3.6 Update Product (Admin/Vendor)

```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "price": 5.99,
  "category": "Organic",
  "images": ["https://example.com/new-image.jpg"]
}
```

> [!NOTE]
> If `images` is omitted, existing images are preserved. Supports both `multipart/form-data` (file upload) and JSON (URL array) like the create endpoint.

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

**Errors:** `401` Not authenticated · `403` Not admin/vendor · `404` Product not found

---

### 3.7 Delete Product (Admin/Vendor)

```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

> [!IMPORTANT]
> Deleting a product also removes its associated inventory record.

**Errors:** `401` Not authenticated · `403` Not admin/vendor · `404` Product not found

---

## 4. Inventory Service

### Frontend-Facing Endpoints

#### 4.1 Get All Inventory

```http
GET /api/inventory
GET /api/inventory?lowStockOnly=true&page=1&limit=20
```

| Query Param | Type | Default | Notes |
|-------------|------|---------|-------|
| `lowStockOnly` | string | `false` | `true` to filter low-stock items |
| `page` | int | 1 | |
| `limit` | int | 10 | 1–100 |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "productId": "product-id",
      "quantity": 150,
      "reserved": 5,
      "lowStockThreshold": 10,
      "lastUpdated": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

#### 4.2 Get Inventory for Product

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
    "reserved": 5,
    "lowStockThreshold": 10,
    "lastUpdated": "2024-01-15T10:00:00Z"
  }
}
```

**Errors:** `404` Inventory not found

---

#### 4.3 Set Stock Level (Vendor/Admin)

```http
PUT /api/inventory/:productId
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 200,
  "lowStockThreshold": 20
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `quantity` | int | ✅ | Must be ≥ 0 |
| `lowStockThreshold` | int | ❌ | Must be ≥ 0 |

**Response (200):**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": { ... }
}
```

---

#### 4.4 Add Stock (Vendor/Admin)

```http
POST /api/inventory/:productId/add
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 50
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Added 50 units to stock",
  "data": { ... }
}
```

---

#### 4.5 Reduce Stock (Vendor/Admin)

```http
POST /api/inventory/:productId/reduce
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reduced 10 units from stock",
  "data": { ... }
}
```

**Errors:** `400` Insufficient stock

---

#### 4.6 Check Stock Availability

```http
POST /api/inventory/check-availability
Content-Type: application/json
```

**Request Body:**
```json
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

#### 4.7 Delete Inventory

```http
DELETE /api/inventory/:productId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory deleted successfully"
}
```

---

### Internal Endpoints (used by Checkout Service)

> [!NOTE]
> These endpoints are called internally by the Checkout Service during the SAGA flow. You typically do not call these from the frontend.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/inventory/:productId/reserve` | Reserve stock for a product |
| `POST` | `/api/inventory/:productId/release` | Release reserved stock |
| `POST` | `/api/inventory/:productId/confirm` | Confirm a reservation |
| `POST` | `/api/inventory/reserve` | Bulk reserve (body: `{productId, quantity}`) |
| `POST` | `/api/inventory/confirm` | Bulk confirm reservation |
| `POST` | `/api/inventory/release` | Bulk release reserved stock |

All internal endpoints accept `{ "quantity": <int> }` (or `{ "productId": "<id>", "quantity": <int> }` for bulk).

---

#### 4.8 Health Check

```http
GET /api/inventory/health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory service is healthy",
  "status": "UP"
}
```

---

## 5. Order Service — Cart

> [!NOTE]
> All cart endpoints require the `X-User-Id` header (set automatically by API Gateway from JWT).

### 5.1 Get User's Cart

```http
GET /api/orders/cart
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "userId": "user-id",
    "items": [
      {
        "productId": "product-id",
        "name": "Organic Apples",
        "quantity": 2,
        "price": 4.99
      }
    ],
    "total": 9.98
  }
}
```

---

### 5.2 Add Item to Cart

```http
POST /api/orders/cart/add
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "product-id",
  "name": "Organic Apples",
  "price": 4.99,
  "quantity": 2
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `productId` | string | ✅ | |
| `name` | string | ✅ | Product display name |
| `price` | decimal | ✅ | Must be positive |
| `quantity` | int | ✅ | Must be positive |

**Response (200):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": { ...cart }
}
```

---

### 5.3 Update Cart Item Quantity

```http
PUT /api/orders/cart/update?productId=<id>&quantity=<qty>
Authorization: Bearer <token>
```

| Query Param | Type | Required |
|-------------|------|----------|
| `productId` | string | ✅ |
| `quantity` | int | ✅ |

**Response (200):**
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "data": { ...cart }
}
```

---

### 5.4 Remove Item from Cart

```http
DELETE /api/orders/cart/remove?productId=<id>
Authorization: Bearer <token>
```

| Query Param | Type | Required |
|-------------|------|----------|
| `productId` | string | ✅ |

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": { ...cart }
}
```

---

### 5.5 Clear Cart

```http
DELETE /api/orders/cart/clear
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": null
}
```

---

## 6. Order Service — Orders

### 6.1 Get User's Orders

```http
GET /api/orders
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": "order-uuid",
      "userId": "user-id",
      "status": "COMPLETED",
      "items": [
        {
          "productId": "product-id",
          "name": "Organic Apples",
          "quantity": 2,
          "price": 4.99
        }
      ],
      "totalAmount": 9.98,
      "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "zip": "10001",
        "country": "USA"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 6.2 Get Order by ID

```http
GET /api/orders/:orderId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": "order-uuid",
    "userId": "user-id",
    "status": "COMPLETED",
    "items": [...],
    "totalAmount": 9.98,
    "shippingAddress": {...},
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Errors:** `404` Order not found

---

### Order Statuses

| Status | Description |
|--------|-------------|
| `PENDING` | Order created, awaiting payment |
| `CONFIRMED` | Payment successful |
| `COMPLETED` | Order fulfilled |
| `CANCELLED` | Order cancelled |
| `FAILED` | Order failed (rollback triggered) |

---

### Internal Endpoints (used by Checkout Service)

> [!NOTE]
> These are called internally by the Checkout Service. Not intended for frontend use.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders/internal/create` | Create order from user's cart |
| `PUT` | `/api/orders/internal/:orderId/status` | Update order status |

---

## 7. Checkout Service (SAGA Orchestrator)

### 7.1 Execute Checkout

This endpoint orchestrates the entire checkout flow:
1. Retrieves user's cart
2. Reserves inventory for each item
3. Creates an order
4. Processes payment
5. Confirms order & inventory

> [!IMPORTANT]
> If any step fails, the SAGA automatically rolls back all previous steps (releases inventory, cancels order, refunds payment).

```http
POST /api/checkout
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
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

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `shippingAddress.street` | string | ✅ | |
| `shippingAddress.city` | string | ✅ | |
| `shippingAddress.zip` | string | ✅ | |
| `shippingAddress.country` | string | ✅ | |
| `paymentMethod` | string | ✅ | e.g. `CREDIT_CARD`, `UPI`, `WALLET` |

**Response (200):**
```json
{
  "success": true,
  "orderId": "order-uuid",
  "transactionId": "txn-uuid",
  "message": "Order placed successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "orderId": null,
  "transactionId": null,
  "message": "Insufficient stock for product: Organic Apples"
}
```

**Errors:** `400` Cart empty / insufficient stock / payment failed

---

### 7.2 Health Check

```http
GET /api/checkout/health
```

**Response (200):** `"Checkout Service is running"`

---

## 8. Payment Service

### 8.1 Get Transaction by ID

```http
GET /api/payments/:transactionId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn-uuid",
    "orderId": "order-uuid",
    "userId": "user-id",
    "amount": 9.98,
    "currency": "USD",
    "status": "COMPLETED",
    "paymentMethod": "CREDIT_CARD",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Errors:** `404` Transaction not found

---

### 8.2 Get Payment History

```http
GET /api/payments
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "transactionId": "txn-uuid",
      "orderId": "order-uuid",
      "userId": "user-id",
      "amount": 9.98,
      "currency": "USD",
      "status": "COMPLETED",
      "paymentMethod": "CREDIT_CARD",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### Transaction Statuses

| Status | Description |
|--------|-------------|
| `PENDING` | Payment initiated |
| `COMPLETED` | Payment successful |
| `FAILED` | Payment failed |
| `REFUNDED` | Payment refunded |

---

### Internal Endpoints (used by Checkout Service)

> [!NOTE]
> These are called internally by the Checkout Service. Not intended for frontend use.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments` | Process payment |
| `GET` | `/api/payments/internal/order/:orderId` | Get transaction by order ID |
| `POST` | `/api/payments/internal/:transactionId/refund` | Refund a transaction |

---

## Error Response Format

All services return errors in a consistent format:

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
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient role permissions) |
| `404` | Not Found |
| `409` | Conflict (duplicate entry, insufficient stock) |
| `500` | Internal Server Error |

---

## Quick Reference — Frontend Integration Flow

### 🛒 Shopping Flow

```
1. Browse Products    →  GET  /api/products?category=Fruits&page=1
2. View Product       →  GET  /api/products/:id
3. Check Stock        →  GET  /api/inventory/:productId
4. Add to Cart        →  POST /api/orders/cart/add
5. View Cart          →  GET  /api/orders/cart
6. Update Quantity    →  PUT  /api/orders/cart/update?productId=X&quantity=3
7. Remove Item        →  DELETE /api/orders/cart/remove?productId=X
8. Checkout           →  POST /api/checkout
9. View Orders        →  GET  /api/orders
10. View Payment      →  GET  /api/payments/:transactionId
```

### 👤 User Flow

```
1. Register           →  POST /api/auth/register
2. Login              →  POST /api/auth/login  (save token)
3. Get Profile        →  GET  /api/users/profile
4. Update Profile     →  PUT  /api/users/profile
5. Add Address        →  POST /api/users/address
6. Get Addresses      →  GET  /api/users/addresses
7. Update Address     →  PUT  /api/users/address/:id
8. Delete Address     →  DELETE /api/users/address/:id
```

### 🏪 Vendor Flow

```
1. Login as Vendor    →  POST /api/auth/login
2. Create Product     →  POST /api/products  (multipart/form-data with images)
3. View My Products   →  GET  /api/products/vendor/me
4. Update Product     →  PUT  /api/products/:id
5. Delete Product     →  DELETE /api/products/:id
6. Set Stock Level    →  PUT  /api/inventory/:productId
7. Add Stock          →  POST /api/inventory/:productId/add
```

---

## Health Check Endpoints

| Service | Endpoint |
|---------|----------|
| Auth | `GET /api/auth/health` |
| Inventory | `GET /api/inventory/health` |
| Checkout | `GET /api/checkout/health` |
| Order | `GET /actuator/health` (Spring Boot) |
| Payment | `GET /actuator/health` (Spring Boot) |
| Eureka | `GET http://localhost:8761/actuator/health` |
