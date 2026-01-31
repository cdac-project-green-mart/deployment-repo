# Inventory Service Analysis & Testing Guide

## 📋 Service Overview

The **Inventory Service** manages product stock levels in the Green Mart e-commerce platform. It provides endpoints for stock management, reservation system for orders, low stock monitoring, and bulk availability checks.

### Architecture
- **Port**: 8086
- **Database**: MongoDB
- **Authentication**: No authentication required (internal service)
- **Service Discovery**: Eureka Client
- **Key Features**: Stock reservation, low stock alerts, auto-creation of inventory records

---

## 🔍 Endpoints Analysis

### 1. **GET** `/api/inventory`
- **Purpose**: Get all inventory items with pagination and filtering
- **Auth**: None (internal service)
- **Query Parameters**:
  - `lowStockOnly` (optional, "true"/"false")
  - `page` (optional, default: 1)
  - `limit` (optional, default: 50, max: 100)
- **Response**: Inventory items array with pagination metadata

### 2. **GET** `/api/inventory/:productId`
- **Purpose**: Get inventory for specific product (auto-creates if not exists)
- **Auth**: None
- **Params**: `productId` (string)
- **Response**: Single inventory object
- **Note**: Creates default inventory (quantity: 0) if product not found

### 3. **PUT** `/api/inventory/:productId`
- **Purpose**: Set absolute stock level for product
- **Auth**: None
- **Params**: `productId` (string)
- **Body**: `{ quantity, lowStockThreshold? }`
- **Response**: Updated inventory object

### 4. **POST** `/api/inventory/:productId/add`
- **Purpose**: Add stock (increment quantity)
- **Auth**: None
- **Params**: `productId` (string)
- **Body**: `{ quantity }`
- **Response**: Updated inventory object

### 5. **POST** `/api/inventory/:productId/reduce`
- **Purpose**: Reduce stock (decrement quantity)
- **Auth**: None
- **Params**: `productId` (string)
- **Body**: `{ quantity }`
- **Response**: Updated inventory object
- **Validation**: Checks available stock (quantity - reservedQuantity)

### 6. **POST** `/api/inventory/:productId/reserve`
- **Purpose**: Reserve stock for pending order
- **Auth**: None
- **Params**: `productId` (string)
- **Body**: `{ quantity }`
- **Response**: Updated inventory object
- **Validation**: Checks available stock before reserving

### 7. **POST** `/api/inventory/:productId/release`
- **Purpose**: Release reserved stock (cancel order/timeout)
- **Auth**: None
- **Params**: `productId` (string)
- **Body**: `{ quantity }`
- **Response**: Updated inventory object

### 8. **POST** `/api/inventory/:productId/confirm`
- **Purpose**: Confirm reservation (order completed)
- **Auth**: None
- **Params**: `productId` (string)
- **Body**: `{ quantity }`
- **Response**: Updated inventory object
- **Action**: Reduces both quantity and reservedQuantity

### 9. **POST** `/api/inventory/check-availability`
- **Purpose**: Check stock availability for multiple products
- **Auth**: None
- **Body**: `{ items: [{ productId, quantity }] }`
- **Response**: Availability status for each product + overall status

---

## 📊 MongoDB Schema

```javascript
Inventory {
  productId: String (required, unique, indexed),
  quantity: Number (required, default: 0, min: 0),
  reservedQuantity: Number (default: 0, min: 0),
  lowStockThreshold: Number (default: 10, min: 0),
  createdAt: Date,
  updatedAt: Date,
  
  // Virtual fields (computed)
  availableQuantity: quantity - reservedQuantity,
  isLowStock: quantity <= lowStockThreshold
}

// Indexes:
// - productId (unique)
// - { quantity: 1, lowStockThreshold: 1 } (for low stock queries)
```

---

## 🗄️ MongoDB Test Data (18 Inventory Records)

Matching the 18 products from product service:

```json
[
  {
    "productId": "prod_001_apples",
    "quantity": 150,
    "reservedQuantity": 10,
    "lowStockThreshold": 20
  },
  {
    "productId": "prod_002_bread",
    "quantity": 80,
    "reservedQuantity": 5,
    "lowStockThreshold": 15
  },
  {
    "productId": "prod_003_milk",
    "quantity": 200,
    "reservedQuantity": 25,
    "lowStockThreshold": 30
  },
  {
    "productId": "prod_004_eggs",
    "quantity": 120,
    "reservedQuantity": 15,
    "lowStockThreshold": 25
  },
  {
    "productId": "prod_005_salmon",
    "quantity": 45,
    "reservedQuantity": 8,
    "lowStockThreshold": 10
  },
  {
    "productId": "prod_006_spinach",
    "quantity": 90,
    "reservedQuantity": 12,
    "lowStockThreshold": 20
  },
  {
    "productId": "prod_007_beef",
    "quantity": 60,
    "reservedQuantity": 10,
    "lowStockThreshold": 15
  },
  {
    "productId": "prod_008_cheese",
    "quantity": 75,
    "reservedQuantity": 8,
    "lowStockThreshold": 12
  },
  {
    "productId": "prod_009_tomatoes",
    "quantity": 110,
    "reservedQuantity": 18,
    "lowStockThreshold": 25
  },
  {
    "productId": "prod_010_sourdough",
    "quantity": 50,
    "reservedQuantity": 6,
    "lowStockThreshold": 10
  },
  {
    "productId": "prod_011_strawberries",
    "quantity": 85,
    "reservedQuantity": 14,
    "lowStockThreshold": 20
  },
  {
    "productId": "prod_012_chicken",
    "quantity": 95,
    "reservedQuantity": 12,
    "lowStockThreshold": 18
  },
  {
    "productId": "prod_013_yogurt",
    "quantity": 140,
    "reservedQuantity": 20,
    "lowStockThreshold": 25
  },
  {
    "productId": "prod_014_blueberries",
    "quantity": 70,
    "reservedQuantity": 9,
    "lowStockThreshold": 15
  },
  {
    "productId": "prod_015_carrots",
    "quantity": 130,
    "reservedQuantity": 16,
    "lowStockThreshold": 22
  },
  {
    "productId": "prod_016_shrimp",
    "quantity": 8,
    "reservedQuantity": 2,
    "lowStockThreshold": 10
  },
  {
    "productId": "prod_017_croissants",
    "quantity": 6,
    "reservedQuantity": 1,
    "lowStockThreshold": 8
  },
  {
    "productId": "prod_018_bananas",
    "quantity": 180,
    "reservedQuantity": 22,
    "lowStockThreshold": 30
  }
]
```

**Data Features**:
- **High stock items**: Milk (200), Bananas (180), Apples (150)
- **Low stock items**: Shrimp (8), Croissants (6) - below threshold
- **Reserved quantities**: Simulating pending orders
- **Available quantities**: quantity - reservedQuantity

---

## 🧪 Postman Test Cases (25 Total)

### Test Categories:
- **Health Checks** (2 tests)
- **Get Inventory** (5 tests)
- **Stock Management** (6 tests)
- **Reservation System** (7 tests)
- **Availability Checks** (3 tests)
- **Error Scenarios** (2 tests)

### Environment Variables
```json
{
  "base_url": "http://localhost:8086",
  "product_id_high_stock": "prod_001_apples",
  "product_id_low_stock": "prod_016_shrimp",
  "product_id_new": "prod_999_test"
}
```

---

### Test 1: Health Check
```
GET {{base_url}}/health

Expected (200):
{
  "status": "Inventory Service is running"
}
```

### Test 2: Actuator Health
```
GET {{base_url}}/actuator/health

Expected (200):
{
  "status": "UP"
}
```

### Test 3: Get All Inventory
```
GET {{base_url}}/api/inventory

Expected (200):
{
  "success": true,
  "data": [...18 items],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 18,
    "pages": 1
  }
}
```

### Test 4: Get All Inventory with Pagination
```
GET {{base_url}}/api/inventory?page=1&limit=5

Expected (200):
{
  "success": true,
  "data": [5 items],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 18,
    "pages": 4
  }
}
```

### Test 5: Get Low Stock Items Only
```
GET {{base_url}}/api/inventory?lowStockOnly=true

Expected (200):
{
  "success": true,
  "data": [items where quantity <= lowStockThreshold],
  "pagination": {...}
}
```

### Test 6: Get Inventory for Specific Product
```
GET {{base_url}}/api/inventory/{{product_id_high_stock}}

Expected (200):
{
  "success": true,
  "data": {
    "id": "...",
    "productId": "prod_001_apples",
    "quantity": 150,
    "reservedQuantity": 10,
    "lowStockThreshold": 20,
    "availableQuantity": 140,
    "isLowStock": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Test 7: Get Inventory for Non-Existent Product (Auto-Create)
```
GET {{base_url}}/api/inventory/{{product_id_new}}

Expected (200):
{
  "success": true,
  "data": {
    "productId": "prod_999_test",
    "quantity": 0,
    "reservedQuantity": 0,
    "lowStockThreshold": 10,
    "availableQuantity": 0,
    "isLowStock": true,
    ...
  }
}
```

### Test 8: Set Stock Level (Absolute)
```
PUT {{base_url}}/api/inventory/{{product_id_high_stock}}
Body: {
  "quantity": 200,
  "lowStockThreshold": 25
}

Expected (200):
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "productId": "prod_001_apples",
    "quantity": 200,
    "lowStockThreshold": 25,
    ...
  }
}
```

### Test 9: Add Stock (Increment)
```
POST {{base_url}}/api/inventory/{{product_id_high_stock}}/add
Body: {
  "quantity": 50
}

Expected (200):
{
  "success": true,
  "message": "Added 50 units to stock",
  "data": {
    "quantity": 250,  // 200 + 50
    ...
  }
}
```

### Test 10: Reduce Stock (Decrement)
```
POST {{base_url}}/api/inventory/{{product_id_high_stock}}/reduce
Body: {
  "quantity": 30
}

Expected (200):
{
  "success": true,
  "message": "Reduced 30 units from stock",
  "data": {
    "quantity": 220,  // 250 - 30
    ...
  }
}
```

### Test 11: Reserve Stock
```
POST {{base_url}}/api/inventory/{{product_id_high_stock}}/reserve
Body: {
  "quantity": 20
}

Expected (200):
{
  "success": true,
  "message": "Reserved 20 units",
  "data": {
    "quantity": 220,
    "reservedQuantity": 30,  // 10 + 20
    "availableQuantity": 190,  // 220 - 30
    ...
  }
}
```

### Test 12: Release Reserved Stock
```
POST {{base_url}}/api/inventory/{{product_id_high_stock}}/release
Body: {
  "quantity": 10
}

Expected (200):
{
  "success": true,
  "message": "Released 10 reserved units",
  "data": {
    "quantity": 220,
    "reservedQuantity": 20,  // 30 - 10
    "availableQuantity": 200,  // 220 - 20
    ...
  }
}
```

### Test 13: Confirm Reservation
```
POST {{base_url}}/api/inventory/{{product_id_high_stock}}/confirm
Body: {
  "quantity": 15
}

Expected (200):
{
  "success": true,
  "message": "Confirmed reservation of 15 units",
  "data": {
    "quantity": 205,  // 220 - 15
    "reservedQuantity": 5,  // 20 - 15
    "availableQuantity": 200,  // 205 - 5
    ...
  }
}
```

### Test 14: Check Availability - All Available
```
POST {{base_url}}/api/inventory/check-availability
Body: {
  "items": [
    { "productId": "prod_001_apples", "quantity": 50 },
    { "productId": "prod_003_milk", "quantity": 30 }
  ]
}

Expected (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "prod_001_apples",
        "requested": 50,
        "available": 200,
        "sufficient": true
      },
      {
        "productId": "prod_003_milk",
        "requested": 30,
        "available": 175,
        "sufficient": true
      }
    ],
    "allAvailable": true
  }
}
```

### Test 15: Check Availability - Insufficient Stock
```
POST {{base_url}}/api/inventory/check-availability
Body: {
  "items": [
    { "productId": "prod_016_shrimp", "quantity": 20 },
    { "productId": "prod_017_croissants", "quantity": 10 }
  ]
}

Expected (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "prod_016_shrimp",
        "requested": 20,
        "available": 6,
        "sufficient": false
      },
      {
        "productId": "prod_017_croissants",
        "requested": 10,
        "available": 5,
        "sufficient": false
      }
    ],
    "allAvailable": false
  }
}
```

### Test 16: Reduce Stock - Insufficient Available (Error)
```
POST {{base_url}}/api/inventory/{{product_id_low_stock}}/reduce
Body: {
  "quantity": 100
}

Expected (500):
{
  "success": false,
  "message": "Insufficient stock. Available: 6, Requested: 100"
}
```

### Test 17: Reserve Stock - Insufficient Available (Error)
```
POST {{base_url}}/api/inventory/{{product_id_low_stock}}/reserve
Body: {
  "quantity": 50
}

Expected (500):
{
  "success": false,
  "message": "Insufficient stock. Available: 6, Requested: 50"
}
```

### Test 18-25: Additional Tests
- Set stock with validation errors
- Add stock to new product
- Complex reservation workflow
- Pagination edge cases
- Low stock threshold updates
- Bulk availability with mixed results

---

## 📝 MongoDB Import Commands

```bash
# Copy seed file
docker cp inventory_seed.json green-mart-mongodb:/tmp/inventory_seed.json

# Import to MongoDB
docker exec green-mart-mongodb mongoimport \
  --uri="mongodb://greenmart:greenmart123@localhost:27017/inventory_service?authSource=admin" \
  --collection=inventories \
  --file=/tmp/inventory_seed.json \
  --jsonArray \
  --drop
```

---

## 🎯 Key Features Tested

1. **Auto-Creation**: Inventory auto-created when accessing non-existent product
2. **Stock Management**: Set, add, reduce operations
3. **Reservation System**: Reserve → Release/Confirm workflow
4. **Available Stock**: Calculated as quantity - reservedQuantity
5. **Low Stock Detection**: Virtual field isLowStock
6. **Bulk Availability**: Check multiple products at once
7. **Pagination**: Efficient data retrieval
8. **Validation**: Prevents negative stock, insufficient stock errors

---

## 🔄 Reservation Workflow

```
1. Reserve Stock (Order Created)
   → reservedQuantity increases
   → availableQuantity decreases
   
2a. Confirm Reservation (Order Completed)
   → quantity decreases
   → reservedQuantity decreases
   → Stock permanently reduced
   
2b. Release Reservation (Order Cancelled/Timeout)
   → reservedQuantity decreases
   → availableQuantity increases
   → Stock returned to available pool
```

---

## 📌 Notes

- No authentication required (internal service)
- Auto-creates inventory records with quantity: 0
- Uses MongoDB for persistence
- Virtual fields computed on retrieval
- Prevents negative quantities
- Checks available stock (not just total quantity)
