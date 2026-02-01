# Order Service Analysis & Testing Guide

## 📋 Service Overview

The **Order Service** manages shopping carts and orders in the Green Mart e-commerce platform. It provides endpoints for cart management (add, update, remove items) and order lifecycle (create from cart, track status).

### Architecture
- **Port**: 8085
- **Database**: PostgreSQL
- **Framework**: Spring Boot 3.x (Java)
- **Authentication**: Uses `X-User-Id` header
- **Service Discovery**: Eureka Client
- **Key Features**: Cart auto-creation, order from cart, status tracking

---

## 🔍 Endpoints Analysis

### Cart Endpoints (5)

#### 1. **GET** `/api/orders/cart`
- **Purpose**: Get user's cart (auto-creates if not exists)
- **Auth**: Requires `X-User-Id` header
- **Response**: Cart with items and total price

#### 2. **POST** `/api/orders/cart/add`
- **Purpose**: Add item to cart (or update quantity if exists)
- **Auth**: Requires `X-User-Id` header
- **Body**: `{ productId, name, price, quantity }`
- **Response**: Updated cart

#### 3. **PUT** `/api/orders/cart/update`
- **Purpose**: Update item quantity in cart
- **Auth**: Requires `X-User-Id` header
- **Query Params**: `productId`, `quantity`
- **Response**: Updated cart

#### 4. **DELETE** `/api/orders/cart/remove`
- **Purpose**: Remove item from cart
- **Auth**: Requires `X-User-Id` header
- **Query Params**: `productId`
- **Response**: Updated cart

#### 5. **DELETE** `/api/orders/cart/clear`
- **Purpose**: Clear all items from cart
- **Auth**: Requires `X-User-Id` header
- **Response**: Success message

### Order Endpoints (4)

#### 6. **GET** `/api/orders`
- **Purpose**: Get all orders for user
- **Auth**: Requires `X-User-Id` header
- **Response**: List of orders sorted by creation date (desc)

#### 7. **GET** `/api/orders/{orderId}`
- **Purpose**: Get specific order by ID
- **Auth**: Requires `X-User-Id` header
- **Params**: `orderId` (UUID)
- **Authorization**: User can only access their own orders
- **Response**: Order with items and shipping address

#### 8. **POST** `/api/orders/internal/create` (Internal)
- **Purpose**: Create order from user's cart
- **Auth**: Requires `X-User-Id` header
- **Body**: `{ street?, city?, zip?, country? }` (optional shipping address)
- **Action**: Copies cart items to order, clears cart
- **Response**: Created order

#### 9. **PUT** `/api/orders/internal/{orderId}/status` (Internal)
- **Purpose**: Update order status
- **Params**: `orderId` (UUID)
- **Body**: `{ status }` (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- **Response**: Updated order

---

## 📊 PostgreSQL Schema

### Cart Table
```sql
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    price DECIMAL(10,2),
    quantity INTEGER NOT NULL DEFAULT 1
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Order statuses: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
```

### Order Items Table
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    price DECIMAL(10,2),
    quantity INTEGER NOT NULL
);
```

### Shipping Address Table
```sql
CREATE TABLE shipping_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    street VARCHAR(255),
    city VARCHAR(100),
    zip VARCHAR(20),
    country VARCHAR(100)
);
```

---

## 🗄️ PostgreSQL Test Data

### Seed Data SQL
```sql
-- Insert test carts with items
INSERT INTO carts (id, user_id, total_price, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'user_001', 29.97, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', 'user_002', 67.45, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440003', 'user_003', 0.00, CURRENT_TIMESTAMP);

INSERT INTO cart_items (id, cart_id, product_id, name, price, quantity) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'prod_001_apples', 'Organic Apples', 4.99, 2),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'prod_002_bread', 'Whole Wheat Bread', 3.49, 1),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'prod_003_milk', 'Organic Milk', 5.99, 2),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'prod_005_salmon', 'Fresh Salmon Fillet', 18.99, 2),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'prod_007_beef', 'Grass-Fed Beef', 24.99, 1),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'prod_004_eggs', 'Free Range Eggs', 6.49, 1);

-- Insert test orders
INSERT INTO orders (id, user_id, total_amount, status, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'user_001', 45.95, 'DELIVERED', '2026-01-15 10:30:00', '2026-01-20 14:00:00'),
('770e8400-e29b-41d4-a716-446655440002', 'user_001', 89.97, 'SHIPPED', '2026-01-25 15:45:00', '2026-01-28 09:30:00'),
('770e8400-e29b-41d4-a716-446655440003', 'user_002', 156.50, 'CONFIRMED', '2026-01-30 11:20:00', '2026-01-30 14:15:00'),
('770e8400-e29b-41d4-a716-446655440004', 'user_002', 32.47, 'PENDING', '2026-01-31 09:00:00', '2026-01-31 09:00:00'),
('770e8400-e29b-41d4-a716-446655440005', 'user_003', 78.95, 'CANCELLED', '2026-01-20 16:30:00', '2026-01-22 10:00:00');

INSERT INTO order_items (id, order_id, product_id, name, price, quantity) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'prod_001_apples', 'Organic Apples', 4.99, 3),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'prod_011_strawberries', 'Fresh Strawberries', 5.49, 2),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'prod_013_yogurt', 'Greek Yogurt', 4.99, 4),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', 'prod_005_salmon', 'Fresh Salmon Fillet', 18.99, 3),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'prod_012_chicken', 'Organic Chicken Breast', 12.99, 2),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440003', 'prod_007_beef', 'Grass-Fed Beef', 24.99, 4),
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440003', 'prod_016_shrimp', 'Wild Caught Shrimp', 16.99, 3),
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440004', 'prod_002_bread', 'Whole Wheat Bread', 3.49, 2),
('880e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440004', 'prod_003_milk', 'Organic Milk', 5.99, 3),
('880e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440004', 'prod_004_eggs', 'Free Range Eggs', 6.49, 1),
('880e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440005', 'prod_008_cheese', 'Artisan Cheese Selection', 15.99, 3),
('880e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440005', 'prod_017_croissants', 'Croissants', 7.99, 4);

INSERT INTO shipping_addresses (id, order_id, street, city, zip, country) VALUES
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '123 Main Street', 'New York', '10001', 'USA'),
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '456 Oak Avenue', 'Los Angeles', '90001', 'USA'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '789 Pine Road', 'Chicago', '60601', 'USA'),
('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '321 Elm Boulevard', 'Houston', '77001', 'USA'),
('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', '654 Maple Lane', 'Phoenix', '85001', 'USA');
```

---

## 🧪 Postman Test Cases (27 Total)

### Environment Variables
```json
{
  "base_url": "http://localhost:8085",
  "user_id_with_cart": "user_001",
  "user_id_with_orders": "user_002",
  "user_id_new": "user_new_test",
  "order_id": "770e8400-e29b-41d4-a716-446655440001",
  "product_id": "prod_001_apples"
}
```

### Test Categories:
- **Health Checks** (2 tests)
- **Cart Operations** (10 tests)
- **Order Operations** (8 tests)
- **Internal Endpoints** (4 tests)
- **Error Scenarios** (3 tests)

---

### Health Check Tests (2)

#### Test 1: Health Check
```
GET {{base_url}}/actuator/health
Expected (200): { "status": "UP" }
```

#### Test 2: Custom Health Check
```
GET {{base_url}}/health
Expected (200): { "status": "Order Service is running" }
```

---

### Cart Operation Tests (10)

#### Test 3: Get Cart (Existing User)
```
GET {{base_url}}/api/orders/cart
Headers: X-User-Id: {{user_id_with_cart}}

Expected (200):
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "id": "...",
    "userId": "user_001",
    "totalPrice": 29.97,
    "items": [
      { "productId": "prod_001_apples", "name": "Organic Apples", "price": 4.99, "quantity": 2 },
      ...
    ]
  }
}
```

#### Test 4: Get Cart (New User - Auto Create)
```
GET {{base_url}}/api/orders/cart
Headers: X-User-Id: {{user_id_new}}

Expected (200):
{
  "success": true,
  "data": {
    "userId": "user_new_test",
    "totalPrice": 0,
    "items": []
  }
}
```

#### Test 5: Add Item to Cart
```
POST {{base_url}}/api/orders/cart/add
Headers: X-User-Id: {{user_id_new}}
Body: {
  "productId": "prod_005_salmon",
  "name": "Fresh Salmon Fillet",
  "price": 18.99,
  "quantity": 2
}

Expected (200):
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "totalPrice": 37.98,
    "items": [{ "productId": "prod_005_salmon", "quantity": 2, ... }]
  }
}
```

#### Test 6: Add Same Item Again (Quantity Update)
```
POST {{base_url}}/api/orders/cart/add
Headers: X-User-Id: {{user_id_new}}
Body: {
  "productId": "prod_005_salmon",
  "name": "Fresh Salmon Fillet",
  "price": 18.99,
  "quantity": 1
}

Expected (200):
{
  "data": {
    "items": [{ "productId": "prod_005_salmon", "quantity": 3, ... }]
  }
}
```

#### Test 7: Add Different Item
```
POST {{base_url}}/api/orders/cart/add
Headers: X-User-Id: {{user_id_new}}
Body: {
  "productId": "prod_001_apples",
  "name": "Organic Apples",
  "price": 4.99,
  "quantity": 2
}

Expected (200): Cart with 2 different items
```

#### Test 8: Update Cart Item Quantity
```
PUT {{base_url}}/api/orders/cart/update?productId=prod_005_salmon&quantity=5
Headers: X-User-Id: {{user_id_new}}

Expected (200):
{
  "success": true,
  "message": "Cart updated successfully",
  "data": { "items": [{ "productId": "prod_005_salmon", "quantity": 5, ... }] }
}
```

#### Test 9: Remove Item from Cart
```
DELETE {{base_url}}/api/orders/cart/remove?productId=prod_001_apples
Headers: X-User-Id: {{user_id_new}}

Expected (200):
{
  "success": true,
  "message": "Item removed from cart"
}
```

#### Test 10: Clear Cart
```
DELETE {{base_url}}/api/orders/cart/clear
Headers: X-User-Id: {{user_id_new}}

Expected (200):
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

#### Test 11: Get Cart - Missing Header (Error)
```
GET {{base_url}}/api/orders/cart
Headers: (none)

Expected (400/500): Error about missing X-User-Id
```

#### Test 12: Add Item - Validation Error
```
POST {{base_url}}/api/orders/cart/add
Headers: X-User-Id: {{user_id_new}}
Body: {
  "productId": "",
  "price": -5
}

Expected (400): Validation errors
```

---

### Order Operation Tests (8)

#### Test 13: Get User Orders
```
GET {{base_url}}/api/orders
Headers: X-User-Id: {{user_id_with_orders}}

Expected (200):
{
  "success": true,
  "data": [
    { "id": "...", "status": "PENDING", "totalAmount": 32.47, ... },
    { "id": "...", "status": "CONFIRMED", "totalAmount": 156.50, ... }
  ]
}
```

#### Test 14: Get Order by ID
```
GET {{base_url}}/api/orders/{{order_id}}
Headers: X-User-Id: user_001

Expected (200):
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "userId": "user_001",
    "status": "DELIVERED",
    "items": [...],
    "shippingAddress": { "street": "123 Main Street", ... }
  }
}
```

#### Test 15: Get Order - Wrong User (Unauthorized)
```
GET {{base_url}}/api/orders/770e8400-e29b-41d4-a716-446655440001
Headers: X-User-Id: user_999

Expected (500): "Unauthorized access to order"
```

#### Test 16: Get Order - Not Found
```
GET {{base_url}}/api/orders/00000000-0000-0000-0000-000000000000
Headers: X-User-Id: user_001

Expected (500): "Order not found"
```

#### Test 17: Get Orders - New User (Empty List)
```
GET {{base_url}}/api/orders
Headers: X-User-Id: user_no_orders

Expected (200):
{
  "success": true,
  "data": []
}
```

---

### Internal Endpoint Tests (4)

#### Test 18: Create Order from Cart
```
POST {{base_url}}/api/orders/internal/create
Headers: X-User-Id: {{user_id_with_cart}}
Body: {
  "street": "100 Test Street",
  "city": "Test City",
  "zip": "12345",
  "country": "USA"
}

Expected (200):
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "...",
    "status": "PENDING",
    "items": [...],
    "shippingAddress": { "street": "100 Test Street", ... }
  }
}
```

#### Test 19: Create Order - Empty Cart (Error)
```
POST {{base_url}}/api/orders/internal/create
Headers: X-User-Id: user_003

Expected (500): "Cart is empty"
```

#### Test 20: Update Order Status - Confirm
```
PUT {{base_url}}/api/orders/internal/770e8400-e29b-41d4-a716-446655440004/status
Body: { "status": "CONFIRMED" }

Expected (200):
{
  "success": true,
  "message": "Order status updated successfully",
  "data": { "status": "CONFIRMED" }
}
```

#### Test 21: Update Order Status - Ship
```
PUT {{base_url}}/api/orders/internal/770e8400-e29b-41d4-a716-446655440004/status
Body: { "status": "SHIPPED" }

Expected (200): Order with status "SHIPPED"
```

---

### Additional Tests (6)

#### Test 22-27: 
- Update status to DELIVERED
- Update status to CANCELLED
- Create order without shipping address
- Multiple items in single cart add
- Cart total recalculation verification
- Order items count verification

---

## 📝 Database Import Commands

```bash
# Connect to PostgreSQL container
docker exec -it green-mart-postgres psql -U greenmart -d greenmart

# Run the seed SQL (paste the SQL above)
# Or save to file and run:
docker cp order_seed.sql green-mart-postgres:/tmp/order_seed.sql
docker exec -it green-mart-postgres psql -U greenmart -d greenmart -f /tmp/order_seed.sql
```

---

## 🎯 Key Features

1. **Cart Auto-Creation**: Cart automatically created when user first accesses
2. **Item Aggregation**: Adding same product updates quantity instead of duplicating
3. **Total Calculation**: Cart total auto-recalculated on any change
4. **Order from Cart**: Creates order with cart items, clears cart
5. **Authorization**: Users can only access their own orders
6. **Status Workflow**: PENDING → CONFIRMED → SHIPPED → DELIVERED (or CANCELLED)
7. **Shipping Address**: Optional, stored per order

---

## 🔄 Order Status Workflow

```
PENDING → CONFIRMED → SHIPPED → DELIVERED
    ↓
CANCELLED (can cancel from PENDING or CONFIRMED)
```

---

## 📌 Notes

- Uses PostgreSQL (not MongoDB like product/inventory services)
- Cart and Order are separate entities
- Internal endpoints are for service-to-service communication
- Shipping address is optional when creating order
- Order items are copied from cart (not referenced)
- Cart is cleared after order creation
