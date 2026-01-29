// MongoDB initialization script for User and Product services

// Switch to admin database and authenticate
db = db.getSiblingDB('admin');

// Create User Service database
db = db.getSiblingDB('user_service');

// Create collections with schema validation
db.createCollection('user_profiles', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'createdAt', 'updatedAt'],
            properties: {
                userId: {
                    bsonType: 'string',
                    description: 'Reference to auth service user'
                },
                phone: {
                    bsonType: ['string', 'null'],
                    description: 'Contact number'
                },
                addresses: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object',
                        properties: {
                            id: { bsonType: 'string' },
                            street: { bsonType: ['string', 'null'] },
                            city: { bsonType: ['string', 'null'] },
                            state: { bsonType: ['string', 'null'] },
                            zip: { bsonType: ['string', 'null'] },
                            country: { bsonType: ['string', 'null'] },
                            isDefault: { bsonType: 'bool' }
                        }
                    }
                },
                preferences: {
                    bsonType: 'object',
                    properties: {
                        newsletter: { bsonType: 'bool' },
                        theme: { bsonType: 'string' }
                    }
                },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
            }
        }
    }
});

// Create indexes for user_profiles
db.user_profiles.createIndex({ userId: 1 }, { unique: true });

// Create Product Service database
db = db.getSiblingDB('product_service');

// Create products collection with schema validation
db.createCollection('products', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'description', 'price', 'category', 'userId', 'createdAt', 'updatedAt'],
            properties: {
                name: {
                    bsonType: 'string',
                    description: 'Product name'
                },
                userId: {
                    bsonType: 'string',
                    description: 'Reference to auth service user (vendor/admin)'
                },
                description: {
                    bsonType: 'string',
                    description: 'Product description'
                },
                price: {
                    bsonType: ['double', 'int', 'decimal'],
                    minimum: 0,
                    description: 'Product price'
                },
                category: {
                    bsonType: 'string',
                    description: 'Product category'
                },
                images: {
                    bsonType: 'array',
                    items: { bsonType: 'string' },
                    description: 'Array of image URLs'
                },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
            }
        }
    }
});

// Create indexes for products
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ createdAt: -1 });
db.products.createIndex({ userId: 1 });
db.products.createIndex({ name: 'text', description: 'text' });

print('MongoDB initialization completed successfully!');
