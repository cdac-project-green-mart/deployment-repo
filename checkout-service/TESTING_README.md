# Checkout Service Testing Resources

## 📁 Files

- **CHECKOUT_SERVICE_ANALYSIS.md** - SAGA orchestrator documentation
- **Checkout_Service_Postman_Collection.json** - 15 ready-to-run tests

## ⚠️ Important: No Seed Data

Checkout service is **stateless** - it has no database and no seed data. It orchestrates other services.

## 🚀 Quick Start

### 1. Prerequisites

All dependent services must be running with seed data:
```bash
docker-compose up -d postgres mongodb eureka-server \
  order-service inventory-service payment-service checkout-service
```

### 2. Seed Dependent Services

```bash
# MongoDB data (Product, Inventory, User services)
docker cp products_seed.json green-mart-mongodb:/tmp/
docker cp inventory_seed.json green-mart-mongodb:/tmp/
docker exec green-mart-mongodb mongoimport --uri="mongodb://greenmart:greenmart123@localhost:27017/product_service?authSource=admin" --collection=products --file=/tmp/products_seed.json --jsonArray --drop
docker exec green-mart-mongodb mongoimport --uri="mongodb://greenmart:greenmart123@localhost:27017/inventory_service?authSource=admin" --collection=inventories --file=/tmp/inventory_seed.json --jsonArray --drop

# PostgreSQL data (Order, Payment services)
docker cp order_seed.sql green-mart-postgres:/tmp/
docker cp payment_seed.sql green-mart-postgres:/tmp/
docker exec -it green-mart-postgres psql -U greenmart -d greenmart -f /tmp/order_seed.sql
docker exec -it green-mart-postgres psql -U greenmart -d greenmart -f /tmp/payment_seed.sql
```

### 3. Import Postman Collection

Import `Checkout_Service_Postman_Collection.json` → Run in order

## 📊 Test Execution Order

1. **Health Checks** - Verify service is up
2. **Setup** - Add items to cart (calls Order Service)
3. **Checkout** - Process checkout with different payment methods
4. **Verification** - Verify order, transaction, cart cleared
5. **Error Scenarios** - Empty cart, validation errors

## 🔄 SAGA Workflow

```
Get Cart → Create Order → Reserve Inventory → Process Payment → Confirm All
```

**Compensation on failure:**
- Payment fails → Release inventory, cancel order
- Inventory fails → Cancel order

## ⚠️ Notes

- This is an **integration test** - all services must be running
- Cart must have items before checkout
- Payment has 10% mock failure rate
- Checkout clears cart on success
