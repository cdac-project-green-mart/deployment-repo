# User Service Analysis & Testing Guide

## 📋 Service Overview

The **User Service** manages user profiles and addresses in the Green Mart e-commerce platform. It provides endpoints for profile management and address CRUD operations.

### Architecture
- **Port**: 8083
- **Database**: MongoDB
- **Authentication**: Uses `x-user-id` header (set by auth-service/API Gateway)
- **Service Discovery**: Eureka Client

---

## 🔍 Endpoints Analysis

### 1. **GET** `/api/users/profile`
- **Purpose**: Retrieve current user's profile
- **Auth**: Requires `x-user-id` header
- **Response**: User profile with phone, addresses, and preferences

### 2. **PUT** `/api/users/profile`
- **Purpose**: Update user profile (phone, preferences)
- **Auth**: Requires `x-user-id` header
- **Body**: `{ phone?, preferences? }`

### 3. **POST** `/api/users/address`
- **Purpose**: Add new address to user profile
- **Auth**: Requires `x-user-id` header
- **Body**: `{ street?, city?, state?, zip?, country?, isDefault? }`

### 4. **GET** `/api/users/addresses`
- **Purpose**: Get all addresses for current user
- **Auth**: Requires `x-user-id` header
- **Response**: Array of addresses

### 5. **PUT** `/api/users/address/:id`
- **Purpose**: Update specific address
- **Auth**: Requires `x-user-id` header
- **Params**: `id` (MongoDB ObjectId)
- **Body**: `{ street?, city?, state?, zip?, country?, isDefault? }`

### 6. **DELETE** `/api/users/address/:id`
- **Purpose**: Delete specific address
- **Auth**: Requires `x-user-id` header
- **Params**: `id` (MongoDB ObjectId)

---

## 📊 MongoDB Schema

```javascript
UserProfile {
  userId: String (unique, required),
  phone: String (nullable),
  addresses: [
    {
      _id: ObjectId,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      isDefault: Boolean
    }
  ],
  preferences: {
    newsletter: Boolean (default: true),
    theme: String (default: 'light')
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🗄️ MongoDB Test Data (15+ Documents)

### Collection: `userprofiles`

```json
[
  {
    "userId": "user_001_customer",
    "phone": "+1-555-0101",
    "addresses": [
      {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "USA",
        "isDefault": true
      },
      {
        "street": "456 Park Avenue",
        "city": "New York",
        "state": "NY",
        "zip": "10022",
        "country": "USA",
        "isDefault": false
      }
    ],
    "preferences": {
      "newsletter": true,
      "theme": "dark"
    }
  },
  {
    "userId": "user_002_vendor",
    "phone": "+1-555-0202",
    "addresses": [
      {
        "street": "789 Business Blvd",
        "city": "Los Angeles",
        "state": "CA",
        "zip": "90001",
        "country": "USA",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": false,
      "theme": "light"
    }
  },
  {
    "userId": "user_003_admin",
    "phone": "+1-555-0303",
    "addresses": [
      {
        "street": "321 Admin Lane",
        "city": "Chicago",
        "state": "IL",
        "zip": "60601",
        "country": "USA",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": true,
      "theme": "dark"
    }
  },
  {
    "userId": "user_004_customer",
    "phone": "+44-20-7946-0958",
    "addresses": [
      {
        "street": "10 Downing Street",
        "city": "London",
        "state": "England",
        "zip": "SW1A 2AA",
        "country": "UK",
        "isDefault": true
      },
      {
        "street": "221B Baker Street",
        "city": "London",
        "state": "England",
        "zip": "NW1 6XE",
        "country": "UK",
        "isDefault": false
      },
      {
        "street": "Platform 9 3/4, King's Cross",
        "city": "London",
        "state": "England",
        "zip": "N1 9AP",
        "country": "UK",
        "isDefault": false
      }
    ],
    "preferences": {
      "newsletter": true,
      "theme": "light"
    }
  },
  {
    "userId": "user_005_customer",
    "phone": "+91-22-1234-5678",
    "addresses": [
      {
        "street": "MG Road, Connaught Place",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zip": "400001",
        "country": "India",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": false,
      "theme": "dark"
    }
  },
  {
    "userId": "user_006_vendor",
    "phone": "+1-555-0606",
    "addresses": [
      {
        "street": "555 Tech Drive",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94102",
        "country": "USA",
        "isDefault": true
      },
      {
        "street": "777 Innovation Way",
        "city": "Palo Alto",
        "state": "CA",
        "zip": "94301",
        "country": "USA",
        "isDefault": false
      }
    ],
    "preferences": {
      "newsletter": true,
      "theme": "light"
    }
  },
  {
    "userId": "user_007_customer",
    "phone": null,
    "addresses": [],
    "preferences": {
      "newsletter": true,
      "theme": "light"
    }
  },
  {
    "userId": "user_008_customer",
    "phone": "+61-2-9876-5432",
    "addresses": [
      {
        "street": "42 Wallaby Way",
        "city": "Sydney",
        "state": "NSW",
        "zip": "2000",
        "country": "Australia",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": false,
      "theme": "dark"
    }
  },
  {
    "userId": "user_009_vendor",
    "phone": "+49-30-1234-5678",
    "addresses": [
      {
        "street": "Unter den Linden 77",
        "city": "Berlin",
        "state": "Berlin",
        "zip": "10117",
        "country": "Germany",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": true,
      "theme": "light"
    }
  },
  {
    "userId": "user_010_customer",
    "phone": "+33-1-4567-8901",
    "addresses": [
      {
        "street": "Champs-Élysées 100",
        "city": "Paris",
        "state": "Île-de-France",
        "zip": "75008",
        "country": "France",
        "isDefault": false
      },
      {
        "street": "Rue de Rivoli 50",
        "city": "Paris",
        "state": "Île-de-France",
        "zip": "75001",
        "country": "France",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": true,
      "theme": "dark"
    }
  },
  {
    "userId": "user_011_customer",
    "phone": "+81-3-1234-5678",
    "addresses": [
      {
        "street": "1-1-1 Shibuya",
        "city": "Tokyo",
        "state": "Tokyo",
        "zip": "150-0002",
        "country": "Japan",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": false,
      "theme": "light"
    }
  },
  {
    "userId": "user_012_vendor",
    "phone": "+1-555-1212",
    "addresses": [
      {
        "street": "1600 Pennsylvania Avenue NW",
        "city": "Washington",
        "state": "DC",
        "zip": "20500",
        "country": "USA",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": true,
      "theme": "dark"
    }
  },
  {
    "userId": "user_013_customer",
    "phone": "+55-11-9876-5432",
    "addresses": [
      {
        "street": "Avenida Paulista 1000",
        "city": "São Paulo",
        "state": "SP",
        "zip": "01310-100",
        "country": "Brazil",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": true,
      "theme": "light"
    }
  },
  {
    "userId": "user_014_customer",
    "phone": "+86-10-1234-5678",
    "addresses": [
      {
        "street": "Wangfujing Street 138",
        "city": "Beijing",
        "state": "Beijing",
        "zip": "100006",
        "country": "China",
        "isDefault": true
      },
      {
        "street": "Nanjing Road 200",
        "city": "Shanghai",
        "state": "Shanghai",
        "zip": "200001",
        "country": "China",
        "isDefault": false
      }
    ],
    "preferences": {
      "newsletter": false,
      "theme": "dark"
    }
  },
  {
    "userId": "user_015_vendor",
    "phone": "+1-555-1515",
    "addresses": [
      {
        "street": "1 Infinite Loop",
        "city": "Cupertino",
        "state": "CA",
        "zip": "95014",
        "country": "USA",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": true,
      "theme": "dark"
    }
  }
]
```

---

## 🧪 Postman Collection - Complete Test Data

### Environment Variables
```json
{
  "base_url": "http://localhost:8083",
  "user_id_001": "user_001_customer",
  "user_id_002": "user_002_vendor",
  "user_id_007": "user_007_customer",
  "address_id": ""
}
```

---

### Test 1: Get Profile - Existing User
```
GET {{base_url}}/api/users/profile
Headers:
  x-user-id: {{user_id_001}}
  Content-Type: application/json

Expected Response (200):
{
  "success": true,
  "data": {
    "userId": "user_001_customer",
    "phone": "+1-555-0101",
    "addresses": [...],
    "preferences": {
      "newsletter": true,
      "theme": "dark"
    }
  }
}
```

---

### Test 2: Get Profile - New User (Auto-Create)
```
GET {{base_url}}/api/users/profile
Headers:
  x-user-id: user_999_new
  Content-Type: application/json

Expected Response (200):
{
  "success": true,
  "data": {
    "userId": "user_999_new",
    "phone": null,
    "addresses": [],
    "preferences": {
      "newsletter": true,
      "theme": "light"
    }
  }
}
```

---

### Test 3: Get Profile - Missing User ID
```
GET {{base_url}}/api/users/profile
Headers:
  Content-Type: application/json

Expected Response (401):
{
  "success": false,
  "message": "User ID not provided"
}
```

---

### Test 4: Update Profile - Phone Only
```
PUT {{base_url}}/api/users/profile
Headers:
  x-user-id: {{user_id_001}}
  Content-Type: application/json

Body:
{
  "phone": "+1-555-9999"
}

Expected Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "user_001_customer",
    "phone": "+1-555-9999",
    ...
  }
}
```

---

### Test 5: Update Profile - Preferences Only
```
PUT {{base_url}}/api/users/profile
Headers:
  x-user-id: {{user_id_002}}
  Content-Type: application/json

Body:
{
  "preferences": {
    "newsletter": true,
    "theme": "dark"
  }
}

Expected Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "user_002_vendor",
    "preferences": {
      "newsletter": true,
      "theme": "dark"
    },
    ...
  }
}
```

---

### Test 6: Update Profile - Both Phone and Preferences
```
PUT {{base_url}}/api/users/profile
Headers:
  x-user-id: {{user_id_007}}
  Content-Type: application/json

Body:
{
  "phone": "+1-555-7777",
  "preferences": {
    "newsletter": false,
    "theme": "dark"
  }
}

Expected Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "user_007_customer",
    "phone": "+1-555-7777",
    "preferences": {
      "newsletter": false,
      "theme": "dark"
    }
  }
}
```

---

### Test 7: Add Address - Default Address
```
POST {{base_url}}/api/users/address
Headers:
  x-user-id: {{user_id_007}}
  Content-Type: application/json

Body:
{
  "street": "100 Test Street",
  "city": "Test City",
  "state": "TC",
  "zip": "12345",
  "country": "USA",
  "isDefault": true
}

Expected Response (201):
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "_id": "...",
    "street": "100 Test Street",
    "city": "Test City",
    "state": "TC",
    "zip": "12345",
    "country": "USA",
    "isDefault": true
  }
}

Action: Save the "_id" from response to {{address_id}}
```

---

### Test 8: Add Address - Non-Default
```
POST {{base_url}}/api/users/address
Headers:
  x-user-id: {{user_id_001}}
  Content-Type: application/json

Body:
{
  "street": "999 Secondary Ave",
  "city": "Boston",
  "state": "MA",
  "zip": "02101",
  "country": "USA",
  "isDefault": false
}

Expected Response (201):
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "_id": "...",
    "street": "999 Secondary Ave",
    "city": "Boston",
    "state": "MA",
    "zip": "02101",
    "country": "USA",
    "isDefault": false
  }
}
```

---

### Test 9: Add Address - Minimal Data
```
POST {{base_url}}/api/users/address
Headers:
  x-user-id: {{user_id_002}}
  Content-Type: application/json

Body:
{
  "city": "Miami",
  "country": "USA"
}

Expected Response (201):
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "_id": "...",
    "street": null,
    "city": "Miami",
    "state": null,
    "zip": null,
    "country": "USA",
    "isDefault": false
  }
}
```

---

### Test 10: Get All Addresses
```
GET {{base_url}}/api/users/addresses
Headers:
  x-user-id: {{user_id_001}}
  Content-Type: application/json

Expected Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "USA",
      "isDefault": true
    },
    {
      "_id": "...",
      "street": "456 Park Avenue",
      "city": "New York",
      "state": "NY",
      "zip": "10022",
      "country": "USA",
      "isDefault": false
    }
  ]
}
```

---

### Test 11: Get Addresses - Empty List
```
GET {{base_url}}/api/users/addresses
Headers:
  x-user-id: user_empty_addresses
  Content-Type: application/json

Expected Response (200):
{
  "success": true,
  "data": []
}
```

---

### Test 12: Update Address - Change to Default
```
PUT {{base_url}}/api/users/address/{{address_id}}
Headers:
  x-user-id: {{user_id_007}}
  Content-Type: application/json

Body:
{
  "street": "100 Updated Test Street",
  "city": "Updated City",
  "isDefault": true
}

Expected Response (200):
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "_id": "{{address_id}}",
    "street": "100 Updated Test Street",
    "city": "Updated City",
    "state": "TC",
    "zip": "12345",
    "country": "USA",
    "isDefault": true
  }
}
```

---

### Test 13: Update Address - Invalid Address ID
```
PUT {{base_url}}/api/users/address/invalid_id_123
Headers:
  x-user-id: {{user_id_001}}
  Content-Type: application/json

Body:
{
  "city": "New City"
}

Expected Response (400):
{
  "success": false,
  "errors": [
    {
      "msg": "Invalid address ID",
      "param": "id",
      "location": "params"
    }
  ]
}
```

---

### Test 14: Update Address - Not Found
```
PUT {{base_url}}/api/users/address/507f1f77bcf86cd799439011
Headers:
  x-user-id: {{user_id_001}}
  Content-Type: application/json

Body:
{
  "city": "New City"
}

Expected Response (500):
{
  "success": false,
  "message": "Address not found"
}
```

---

### Test 15: Delete Address - Success
```
DELETE {{base_url}}/api/users/address/{{address_id}}
Headers:
  x-user-id: {{user_id_007}}
  Content-Type: application/json

Expected Response (200):
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

### Test 16: Delete Address - Invalid ID
```
DELETE {{base_url}}/api/users/address/invalid_id
Headers:
  x-user-id: {{user_id_001}}
  Content-Type: application/json

Expected Response (400):
{
  "success": false,
  "errors": [
    {
      "msg": "Invalid address ID",
      "param": "id",
      "location": "params"
    }
  ]
}
```

---

### Test 17: Delete Address - Not Found
```
DELETE {{base_url}}/api/users/address/507f1f77bcf86cd799439011
Headers:
  x-user-id: {{user_id_001}}
  Content-Type: application/json

Expected Response (500):
{
  "success": false,
  "message": "Address not found"
}
```

---

### Test 18: Health Check
```
GET {{base_url}}/health
Headers:
  Content-Type: application/json

Expected Response (200):
{
  "status": "User Service is running"
}
```

---

### Test 19: Actuator Health Check
```
GET {{base_url}}/actuator/health
Headers:
  Content-Type: application/json

Expected Response (200):
{
  "status": "UP"
}
```

---

## 📝 MongoDB Import Commands

### Option 1: Using mongoimport (JSON Array)
Save the test data to `user_profiles_seed.json` and run:
```bash
mongoimport --uri="mongodb://localhost:27017/greenmart" --collection=userprofiles --file=user_profiles_seed.json --jsonArray --drop
```

### Option 2: Using MongoDB Shell
```javascript
use greenmart

db.userprofiles.insertMany([
  // Paste the JSON array here
])
```

### Option 3: Using Node.js Script
Create `seed-users.js`:
```javascript
const mongoose = require('mongoose');
const UserProfile = require('./src/models/UserProfile');

const seedData = [ /* paste JSON array */ ];

mongoose.connect('mongodb://localhost:27017/greenmart')
  .then(async () => {
    await UserProfile.deleteMany({});
    await UserProfile.insertMany(seedData);
    console.log('Seeded successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
```

Run: `node seed-users.js`

---

## 🎯 Testing Workflow

### Sequential Test Flow
1. **Test 18-19**: Verify service is running
2. **Test 1**: Get existing profile
3. **Test 2**: Auto-create new profile
4. **Test 3**: Test authentication (missing header)
5. **Test 4-6**: Update profile variations
6. **Test 7-9**: Add addresses
7. **Test 10-11**: Retrieve addresses
8. **Test 12-14**: Update addresses
9. **Test 15-17**: Delete addresses

### Edge Cases Covered
- ✅ Auto-creation of profiles
- ✅ Missing authentication headers
- ✅ Invalid MongoDB ObjectIds
- ✅ Non-existent addresses
- ✅ Default address management
- ✅ Empty address lists
- ✅ Partial updates
- ✅ Validation errors

---

## 🔧 Key Features Tested

1. **Profile Auto-Creation**: Service creates profile if doesn't exist
2. **Default Address Logic**: Only one address can be default at a time
3. **Flexible Updates**: All fields are optional
4. **Validation**: MongoDB ObjectId validation for address operations
5. **Error Handling**: Proper error messages and status codes

---

## 📌 Notes

- All endpoints require `x-user-id` header (typically set by API Gateway after JWT validation)
- The service auto-creates profiles on first access
- Setting an address as default automatically unsets other defaults
- Address IDs are MongoDB ObjectIds generated automatically
- Phone numbers can be null
- Addresses array can be empty
