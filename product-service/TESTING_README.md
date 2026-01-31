# Product Service Testing Resources

This directory contains comprehensive testing resources for the Product Service.

## 📁 Files

- **PRODUCT_SERVICE_ANALYSIS.md** - Complete service analysis with endpoint documentation
- **products_seed.json** - 18 diverse products across 6 categories for MongoDB
- **Product_Service_Postman_Collection.json** - Ready-to-import Postman collection with 23 tests

## 🚀 Quick Start

### 1. Import Test Data to MongoDB

```bash
# Navigate to product-service directory
cd product-service

# Using Docker (recommended)
docker cp products_seed.json green-mart-mongodb:/tmp/products_seed.json
docker exec green-mart-mongodb mongoimport --uri="mongodb://greenmart:greenmart123@localhost:27017/product_service?authSource=admin" --collection=products --file=/tmp/products_seed.json --jsonArray --drop
```

### 2. Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select `Product_Service_Postman_Collection.json`
4. Collection will be imported with all environment variables pre-configured

### 3. Run Tests

The collection includes:
- **2 Health Check tests** - Verify service is running
- **9 Public Browsing tests** - Browse, filter, search products (no auth required)
- **6 Product CRUD tests** - Create, read, update, delete as vendor/admin
- **6 Authorization tests** - RBAC and error scenarios

**Environment Variables** (pre-configured):
- `base_url`: http://localhost:8084
- `vendor_user_id`: user_002_vendor
- `vendor_role`: VENDOR
- `admin_user_id`: user_003_admin
- `admin_role`: ADMIN
- `customer_user_id`: user_001_customer
- `customer_role`: CUSTOMER
- `product_id`: (auto-populated)
- `vendor_product_id`: (auto-populated)

## 📊 Test Coverage

✅ Public product browsing (no auth)  
✅ Pagination (page, limit)  
✅ Category filtering  
✅ Price range filtering  
✅ Text search (name, description)  
✅ Get all categories  
✅ RBAC (ADMIN/VENDOR can create/update/delete)  
✅ Ownership validation (vendors can only modify their own products)  
✅ Admin privileges (admins can modify any product)  
✅ Validation errors  
✅ Authentication errors  

## 📖 Documentation

See **PRODUCT_SERVICE_ANALYSIS.md** for:
- Detailed endpoint documentation
- MongoDB schema
- All test data descriptions
- Expected responses for each test
- Error scenarios

## 🎯 Test Execution Order

1. **Health Checks** - Verify service is up
2. **Public Browsing** - Test public endpoints (no auth)
3. **Product CRUD** - Test create/update/delete with vendor/admin
4. **Authorization Tests** - Test RBAC and error scenarios

The Postman collection automatically captures `product_id` and `vendor_product_id` for use in subsequent tests.

## 🗄️ Test Data

**18 Products across 6 categories:**
- Fruits (5 products)
- Vegetables (3 products)
- Dairy (4 products)
- Meat (2 products)
- Seafood (2 products)
- Bakery (3 products)

**3 Vendors:**
- user_002_vendor (9 products)
- user_006_vendor (6 products)
- user_009_vendor (3 products)

## 🔑 Key Features

- **Public Access**: Browse, search, filter without authentication
- **RBAC**: Only ADMIN/VENDOR can create/update/delete
- **Ownership**: Vendors can only modify their own products
- **Admin Override**: Admins can modify any product
- **Pagination**: Efficient data retrieval
- **Filtering**: Category, price range
- **Search**: Full-text search on name and description
