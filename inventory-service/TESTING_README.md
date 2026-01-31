# Inventory Service Testing Resources

This directory contains comprehensive testing resources for the Inventory Service.

## 📁 Files

- **INVENTORY_SERVICE_ANALYSIS.md** - Complete service analysis with endpoint documentation
- **inventory_seed.json** - 18 inventory records with varied stock levels
- **Inventory_Service_Postman_Collection.json** - Ready-to-import Postman collection with 25 tests

## 🚀 Quick Start

### 1. Import Test Data to MongoDB

```bash
# Navigate to inventory-service directory
cd inventory-service

# Using Docker (recommended)
docker cp inventory_seed.json green-mart-mongodb:/tmp/inventory_seed.json
docker exec green-mart-mongodb mongoimport --uri="mongodb://greenmart:greenmart123@localhost:27017/inventory_service?authSource=admin" --collection=inventories --file=/tmp/inventory_seed.json --jsonArray --drop
```

### 2. Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select `Inventory_Service_Postman_Collection.json`
4. Collection will be imported with all environment variables pre-configured

### 3. Run Tests

The collection includes:
- **2 Health Check tests** - Verify service is running
- **5 Get Inventory tests** - Browse, filter, auto-creation
- **6 Stock Management tests** - Set, add, reduce operations
- **7 Reservation System tests** - Reserve, release, confirm workflows
- **3 Availability Check tests** - Bulk availability validation
- **2 Error Scenario tests** - Insufficient stock errors

**Environment Variables** (pre-configured):
- `base_url`: http://localhost:8086
- `product_id_high_stock`: prod_001_apples
- `product_id_low_stock`: prod_016_shrimp
- `product_id_new`: prod_999_test

## 📊 Test Coverage

✅ Auto-creation of inventory records  
✅ Stock management (set, add, reduce)  
✅ Reservation system (reserve, release, confirm)  
✅ Available stock calculation (quantity - reservedQuantity)  
✅ Low stock detection  
✅ Bulk availability checks  
✅ Pagination and filtering  
✅ Validation errors  
✅ Insufficient stock errors  

## 📖 Documentation

See **INVENTORY_SERVICE_ANALYSIS.md** for:
- Detailed endpoint documentation (9 endpoints)
- MongoDB schema with virtual fields
- All test data descriptions
- Expected responses for each test
- Reservation workflow diagrams
- Error scenarios

## 🎯 Test Execution Order

1. **Health Checks** - Verify service is up
2. **Get Inventory** - Test retrieval and auto-creation
3. **Stock Management** - Test set, add, reduce operations
4. **Reservation System** - Test complete workflows
5. **Availability Checks** - Test bulk validation
6. **Error Scenarios** - Test insufficient stock handling

## 🗄️ Test Data

**18 Inventory Records:**
- **High stock**: Milk (200), Bananas (180), Apples (150)
- **Low stock**: Shrimp (8), Croissants (6) - below threshold
- **Reserved quantities**: Simulating pending orders
- **Available stock**: Calculated as quantity - reservedQuantity

**Stock Levels:**
- Total quantity: 1,704 units across all products
- Reserved: 183 units
- Available: 1,521 units

## 🔄 Reservation Workflows

### Complete Order (Reserve → Confirm)
1. Reserve stock (reservedQuantity increases)
2. Confirm reservation (both quantity and reservedQuantity decrease)

### Cancel Order (Reserve → Release)
1. Reserve stock (reservedQuantity increases)
2. Release reservation (reservedQuantity decreases, stock returned)

## 🔑 Key Features

- **Auto-Creation**: Inventory auto-created with quantity: 0
- **No Authentication**: Internal service, no auth required
- **Virtual Fields**: availableQuantity, isLowStock computed on retrieval
- **Stock Protection**: Prevents negative quantities
- **Available Stock Check**: Uses quantity - reservedQuantity
- **Low Stock Filter**: Query parameter for monitoring
