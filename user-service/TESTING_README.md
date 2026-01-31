# User Service Testing Resources

This directory contains comprehensive testing resources for the User Service.

## 📁 Files

- **USER_SERVICE_ANALYSIS.md** - Complete service analysis with endpoint documentation
- **user_profiles_seed.json** - 15 diverse test user profiles for MongoDB
- **User_Service_Postman_Collection.json** - Ready-to-import Postman collection with 19 tests

## 🚀 Quick Start

### 1. Import Test Data to MongoDB

```bash
# Navigate to user-service directory
cd user-service

# Import using mongoimport
mongoimport --uri="mongodb://localhost:27017/greenmart" --collection=userprofiles --file=user_profiles_seed.json --jsonArray --drop
```

### 2. Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select `User_Service_Postman_Collection.json`
4. Collection will be imported with all environment variables pre-configured

### 3. Run Tests

The collection includes:
- **2 Health Check tests** - Verify service is running
- **6 Profile Management tests** - CRUD operations on user profiles
- **11 Address Management tests** - Complete address lifecycle testing

**Environment Variables** (pre-configured):
- `base_url`: http://localhost:8083
- `user_id_001`: user_001_customer
- `user_id_002`: user_002_vendor
- `user_id_007`: user_007_customer
- `address_id`: (auto-populated during tests)

## 📊 Test Coverage

✅ Profile auto-creation  
✅ Profile updates (phone, preferences)  
✅ Address CRUD operations  
✅ Default address management  
✅ Validation errors  
✅ Authentication errors  
✅ Edge cases (empty lists, invalid IDs)

## 📖 Documentation

See **USER_SERVICE_ANALYSIS.md** for:
- Detailed endpoint documentation
- MongoDB schema
- All test data descriptions
- Expected responses for each test
- Error scenarios

## 🎯 Test Execution Order

1. Run Health Checks first
2. Test Profile Management
3. Test Address Management (includes auto-capture of address IDs)

The Postman collection automatically captures the `address_id` from the "Add Address - Default" test for use in subsequent update/delete tests.
