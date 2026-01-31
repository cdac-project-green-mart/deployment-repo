# Product Service Analysis & Testing Guide

## 📋 Service Overview

The **Product Service** manages product catalog in the Green Mart e-commerce platform. It provides endpoints for product CRUD operations, search, filtering, pagination, and category management with role-based access control.

### Architecture
- **Port**: 8084
- **Database**: MongoDB
- **Authentication**: Uses `x-user-id` and `x-user-role` headers (set by auth-service/API Gateway)
- **Service Discovery**: Eureka Client
- **RBAC**: ADMIN and VENDOR roles can create/update/delete products

---

## 🔍 Endpoints Analysis

### 1. **GET** `/api/products`
- **Purpose**: Get all products with pagination, filtering, and search
- **Auth**: Public (no auth required)
- **Query Parameters**:
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20, max: 100)
  - `category` (optional)
  - `minPrice` (optional)
  - `maxPrice` (optional)
  - `search` (optional, text search)
  - `sortBy` (optional, default: createdAt)
  - `sortOrder` (optional, default: desc)
- **Response**: Products array with pagination metadata

### 2. **GET** `/api/products/categories`
- **Purpose**: Get all unique product categories
- **Auth**: Public
- **Response**: Array of category strings

### 3. **GET** `/api/products/:id`
- **Purpose**: Get single product by ID
- **Auth**: Public
- **Params**: `id` (MongoDB ObjectId)
- **Response**: Single product object

### 4. **GET** `/api/products/vendor/me`
- **Purpose**: Get all products created by the authenticated vendor
- **Auth**: Requires `x-user-id` header
- **Response**: Array of vendor's products

### 5. **POST** `/api/products`
- **Purpose**: Create new product
- **Auth**: Requires `x-user-id` and `x-user-role` (ADMIN or VENDOR)
- **Body**: `{ name, description, price, category, images? }`
- **Response**: Created product

### 6. **PUT** `/api/products/:id`
- **Purpose**: Update existing product
- **Auth**: Requires `x-user-id` and `x-user-role` (ADMIN or VENDOR)
- **Authorization**: Vendors can only update their own products, ADMINs can update any
- **Params**: `id` (MongoDB ObjectId)
- **Body**: `{ name?, description?, price?, category?, images? }`
- **Response**: Updated product

### 7. **DELETE** `/api/products/:id`
- **Purpose**: Delete product
- **Auth**: Requires `x-user-id` and `x-user-role` (ADMIN or VENDOR)
- **Authorization**: Vendors can only delete their own products, ADMINs can delete any
- **Params**: `id` (MongoDB ObjectId)
- **Response**: Success message

---

## 📊 MongoDB Schema

```javascript
Product {
  name: String (required, indexed),
  userId: String (required, indexed) // vendor/admin who created it
  description: String (required),
  price: Number (required, min: 0, indexed),
  category: String (required, indexed),
  images: [String] (URLs),
  createdAt: Date,
  updatedAt: Date
}

// Text index on: name, description
// Indexes: name, userId, price, category, createdAt
```

---

## 🗄️ MongoDB Test Data (18 Products)

### Collection: `products`

```json
[
  {
    "name": "Organic Apples",
    "userId": "user_002_vendor",
    "description": "Fresh organic apples from local farms. Crisp, sweet, and perfect for snacking or baking. Rich in fiber and vitamin C.",
    "price": 4.99,
    "category": "Fruits",
    "images": [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb"
    ]
  },
  {
    "name": "Whole Wheat Bread",
    "userId": "user_006_vendor",
    "description": "Freshly baked whole wheat bread. Made with 100% whole grain flour, no preservatives. Perfect for sandwiches and toast.",
    "price": 3.49,
    "category": "Bakery",
    "images": [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff"
    ]
  },
  {
    "name": "Organic Milk",
    "userId": "user_002_vendor",
    "description": "Fresh organic whole milk from grass-fed cows. Rich, creamy, and packed with calcium and vitamin D.",
    "price": 5.99,
    "category": "Dairy",
    "images": [
      "https://images.unsplash.com/photo-1563636619-e9143da7973b"
    ]
  },
  {
    "name": "Free Range Eggs",
    "userId": "user_006_vendor",
    "description": "Farm fresh free-range eggs. Large brown eggs from happy hens. Rich in protein and omega-3 fatty acids.",
    "price": 6.49,
    "category": "Dairy",
    "images": [
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f"
    ]
  },
  {
    "name": "Fresh Salmon Fillet",
    "userId": "user_009_vendor",
    "description": "Wild-caught Atlantic salmon fillet. Rich in omega-3 fatty acids. Perfect for grilling or baking.",
    "price": 18.99,
    "category": "Seafood",
    "images": [
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2"
    ]
  },
  {
    "name": "Organic Spinach",
    "userId": "user_002_vendor",
    "description": "Fresh organic baby spinach. Tender leaves perfect for salads or cooking. Rich in iron and vitamins.",
    "price": 3.99,
    "category": "Vegetables",
    "images": [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb"
    ]
  },
  {
    "name": "Grass-Fed Beef",
    "userId": "user_009_vendor",
    "description": "Premium grass-fed beef steak. Tender, flavorful, and sustainably raised. Perfect for grilling.",
    "price": 24.99,
    "category": "Meat",
    "images": [
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617"
    ]
  },
  {
    "name": "Artisan Cheese Selection",
    "userId": "user_006_vendor",
    "description": "Curated selection of artisan cheeses. Includes cheddar, gouda, and brie. Perfect for cheese boards.",
    "price": 15.99,
    "category": "Dairy",
    "images": [
      "https://images.unsplash.com/photo-1452195100486-9cc805987862"
    ]
  },
  {
    "name": "Organic Tomatoes",
    "userId": "user_002_vendor",
    "description": "Vine-ripened organic tomatoes. Sweet, juicy, and perfect for salads or cooking. Grown without pesticides.",
    "price": 4.49,
    "category": "Vegetables",
    "images": [
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337"
    ]
  },
  {
    "name": "Sourdough Bread",
    "userId": "user_006_vendor",
    "description": "Traditional sourdough bread with crispy crust. Made with natural starter, no commercial yeast.",
    "price": 5.99,
    "category": "Bakery",
    "images": [
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73"
    ]
  },
  {
    "name": "Fresh Strawberries",
    "userId": "user_002_vendor",
    "description": "Sweet, juicy strawberries. Perfect for desserts, smoothies, or eating fresh. Rich in vitamin C.",
    "price": 5.49,
    "category": "Fruits",
    "images": [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6"
    ]
  },
  {
    "name": "Organic Chicken Breast",
    "userId": "user_009_vendor",
    "description": "Organic free-range chicken breast. Lean, tender, and versatile. Perfect for healthy meals.",
    "price": 12.99,
    "category": "Meat",
    "images": [
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791"
    ]
  },
  {
    "name": "Greek Yogurt",
    "userId": "user_006_vendor",
    "description": "Thick and creamy Greek yogurt. High in protein, low in sugar. Perfect for breakfast or snacks.",
    "price": 4.99,
    "category": "Dairy",
    "images": [
      "https://images.unsplash.com/photo-1488477181946-6428a0291777"
    ]
  },
  {
    "name": "Fresh Blueberries",
    "userId": "user_002_vendor",
    "description": "Plump, sweet blueberries. Packed with antioxidants. Great for smoothies, baking, or snacking.",
    "price": 6.99,
    "category": "Fruits",
    "images": [
      "https://images.unsplash.com/photo-1498557850523-fd3d118b962e"
    ]
  },
  {
    "name": "Organic Carrots",
    "userId": "user_002_vendor",
    "description": "Fresh organic carrots. Crunchy, sweet, and perfect for snacking or cooking. Rich in beta-carotene.",
    "price": 2.99,
    "category": "Vegetables",
    "images": [
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37"
    ]
  },
  {
    "name": "Wild Caught Shrimp",
    "userId": "user_009_vendor",
    "description": "Premium wild-caught shrimp. Large, succulent, and perfect for grilling or pasta dishes.",
    "price": 16.99,
    "category": "Seafood",
    "images": [
      "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47"
    ]
  },
  {
    "name": "Croissants",
    "userId": "user_006_vendor",
    "description": "Buttery, flaky French croissants. Freshly baked daily. Perfect for breakfast or brunch.",
    "price": 7.99,
    "category": "Bakery",
    "images": [
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a"
    ]
  },
  {
    "name": "Organic Bananas",
    "userId": "user_002_vendor",
    "description": "Fresh organic bananas. Perfect ripeness for eating or smoothies. Rich in potassium and fiber.",
    "price": 2.49,
    "category": "Fruits",
    "images": [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e"
    ]
  }
]
```

---

## 🧪 Postman Test Cases (23 Total)

### Environment Variables
```json
{
  "base_url": "http://localhost:8084",
  "vendor_user_id": "user_002_vendor",
  "vendor_role": "VENDOR",
  "admin_user_id": "user_003_admin",
  "admin_role": "ADMIN",
  "customer_user_id": "user_001_customer",
  "customer_role": "CUSTOMER",
  "product_id": "",
  "vendor_product_id": ""
}
```

### Test Categories:
- **Health Checks** (2 tests)
- **Public Product Browsing** (7 tests)
- **Product CRUD - Vendor** (6 tests)
- **Product CRUD - Admin** (2 tests)
- **Authorization & Errors** (6 tests)

See full test details in the document above.

---

## 📝 MongoDB Import Commands

### Using Docker:
```bash
docker cp products_seed.json green-mart-mongodb:/tmp/products_seed.json
docker exec green-mart-mongodb mongoimport --uri="mongodb://greenmart:greenmart123@localhost:27017/product_service?authSource=admin" --collection=products --file=/tmp/products_seed.json --jsonArray --drop
```

---

## 🎯 Key Features

1. **Public Access**: Browse, search, filter products without authentication
2. **RBAC**: Only ADMIN/VENDOR can create/update/delete
3. **Ownership**: Vendors can only modify their own products
4. **Admin Privileges**: Admins can modify any product
5. **Pagination**: Efficient data retrieval
6. **Filtering**: Category, price range
7. **Search**: Full-text search on name and description
8. **Validation**: Input validation on all fields
