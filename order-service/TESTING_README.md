# Order Service Testing Resources

This directory contains comprehensive testing resources for the Order Service.

## 📁 Files

- **ORDER_SERVICE_ANALYSIS.md** - Complete service analysis with endpoint documentation
- **order_seed.sql** - PostgreSQL seed data (3 carts, 5 orders, items, addresses)
- **Order_Service_Postman_Collection.json** - Ready-to-import Postman collection with 27 tests

## 🚀 Quick Start

### 1. Start the Service

```bash
docker-compose up -d postgres eureka-server order-service
```

### 2. Import Test Data to PostgreSQL

```bash
# Copy seed file to container
docker cp order_seed.sql green-mart-postgres:/tmp/order_seed.sql

# Run the SQL import
docker exec -it green-mart-postgres psql -U greenmart -d greenmart -f /tmp/order_seed.sql
```

### 3. Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select `Order_Service_Postman_Collection.json`
4. Collection will be imported with all environment variables pre-configured

### 4. Run Tests

The collection includes:
- **2 Health Check tests** - Verify service is running
- **9 Cart Operation tests** - Add, update, remove, clear items
- **4 Order Operation tests** - Get orders, get by ID
- **6 Internal Endpoint tests** - Create order, update status
- **6 Error Scenario tests** - Validation, auth, not found

**Environment Variables** (pre-configured):
- `base_url`: http://localhost:8085
- `user_id_with_cart`: user_001
- `user_id_with_orders`: user_001
- `user_id_new`: user_test_new
- `order_id`: 770e8400-e29b-41d4-a716-446655440001
- `pending_order_id`: 770e8400-e29b-41d4-a716-446655440004

## 📊 Test Coverage

### Cart Operations
✅ Get cart (auto-create for new users)  
✅ Add item to cart  
✅ Add same item again (quantity update)  
✅ Update item quantity  
✅ Remove item from cart  
✅ Clear cart  

### Order Operations
✅ Get all user orders  
✅ Get order by ID  
✅ Get order with unauthorized user  
✅ Create order from cart (internal)  
✅ Update order status workflow  
✅ Cancel order  

### Error Handling
✅ Missing X-User-Id header  
✅ Validation errors  
✅ Unauthorized access  
✅ Order not found  
✅ Empty cart error  

## 📖 Documentation

See **ORDER_SERVICE_ANALYSIS.md** for:
- Detailed endpoint documentation (9 endpoints)
- PostgreSQL schema (5 tables)
- All test data descriptions
- Expected responses for each test
- Order status workflow diagram
- Error scenarios

## 🎯 Test Execution Order

1. **Health Checks** - Verify service is up
2. **Cart Operations** - Test CRUD on cart
3. **Order Operations** - Test order retrieval
4. **Internal Endpoints** - Test order creation and status updates
5. **Error Scenarios** - Test error handling

## 🗄️ Test Data Summary

**3 Carts:**
- user_001: Cart with 3 items ($29.97)
- user_002: Cart with 3 items ($67.46)
- user_003: Empty cart ($0.00)

**5 Orders:**
- user_001: 2 orders (DELIVERED, SHIPPED)
- user_002: 2 orders (CONFIRMED, PENDING)
- user_003: 1 order (CANCELLED)

**12 Order Items** across all orders

**5 Shipping Addresses** (one per order)

## 🔄 Order Status Workflow

```
PENDING → CONFIRMED → SHIPPED → DELIVERED
    ↓
CANCELLED
```

## 🔑 Key Features

- **PostgreSQL Database**: Unlike product/inventory (MongoDB)
- **Cart Auto-Creation**: Cart created when user first accesses
- **Item Aggregation**: Adding same product updates quantity
- **Total Calculation**: Auto-recalculated on cart changes
- **Order from Cart**: Creates order, clears cart
- **Authorization**: Users only access their own orders
- **Internal Endpoints**: For service-to-service communication

## ⚠️ Important Notes

1. Order service uses **PostgreSQL** (not MongoDB)
2. Tables are auto-created by Hibernate
3. Seed data should be imported AFTER service starts
4. Internal endpoints are for checkout service use
5. X-User-Id header is required for all user-facing endpoints
