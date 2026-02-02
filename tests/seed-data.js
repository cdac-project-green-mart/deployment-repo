/**
 * Green Mart - Test Data Seeder
 * 
 * Seeds the databases with test data for integration testing
 * Run after docker-compose up: npm run seed
 */

const axios = require('axios');

// Configuration
const CONFIG = {
    AUTH_URL: process.env.AUTH_URL || 'http://localhost:8082',
    PRODUCT_URL: process.env.PRODUCT_URL || 'http://localhost:8084',
    INVENTORY_URL: process.env.INVENTORY_URL || 'http://localhost:8086',
    ORDER_URL: process.env.ORDER_URL || 'http://localhost:8085',
};

// Seed data
const SEED_DATA = {
    // Test users with proper roles
    users: [
        { name: 'Test Admin', email: 'admin@test.com', password: 'Admin@123456', role: 'ADMIN' },
        { name: 'Test Vendor', email: 'vendor@test.com', password: 'Vendor@123456', role: 'VENDOR' },
        { name: 'Test Vendor 2', email: 'vendor2@test.com', password: 'Vendor@123456', role: 'VENDOR' },
        { name: 'Test Customer', email: 'customer@test.com', password: 'Customer@123456', role: 'CUSTOMER' },
    ],
    // Test products with REQUIRED images and HIGH stock for checkout tests
    products: [
        {
            name: 'Organic Apples',
            description: 'Fresh organic apples from local farms',
            price: 5.99,
            category: 'Fruits',
            stock: 500,
            images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400']
        },
        {
            name: 'Green Tea',
            description: 'Premium green tea leaves from Japan',
            price: 12.99,
            category: 'Beverages',
            stock: 500,
            images: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400']
        },
        {
            name: 'Whole Wheat Bread',
            description: 'Freshly baked whole wheat bread',
            price: 3.49,
            category: 'Bakery',
            stock: 500,
            images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400']
        },
        {
            name: 'Organic Milk',
            description: 'Farm fresh organic whole milk 1L',
            price: 4.99,
            category: 'Dairy',
            stock: 500,
            images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400']
        },
        {
            name: 'Brown Rice',
            description: '1kg premium organic brown rice',
            price: 6.99,
            category: 'Grains',
            stock: 500,
            images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400']
        },
        {
            name: 'Wireless Earbuds',
            description: 'High quality wireless bluetooth earbuds',
            price: 29.99,
            category: 'Electronics',
            stock: 500,
            images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400']
        }
    ]
};

// Utility
function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        error: '\x1b[31m',
        warn: '\x1b[33m',
        reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${type.toUpperCase()}]${colors.reset} ${message}`);
}

// Seeding functions
async function seedUsers() {
    log('Seeding users...', 'info');
    const results = { created: 0, existing: 0 };

    for (const user of SEED_DATA.users) {
        try {
            const res = await axios.post(`${CONFIG.AUTH_URL}/api/auth/register`, user);
            if (res.data.success) {
                log(`  Created user: ${user.email}`, 'success');
                results.created++;
            }
        } catch (error) {
            if (error.response?.status === 409) {
                log(`  User exists: ${user.email}`, 'warn');
                results.existing++;
            } else {
                log(`  Failed: ${user.email} - ${error.message}`, 'error');
            }
        }
    }

    log(`Users: ${results.created} created, ${results.existing} existing`, 'info');
    return results;
}

async function loginVendor() {
    log('Logging in as vendor...', 'info');
    const res = await axios.post(`${CONFIG.AUTH_URL}/api/auth/login`, {
        email: 'vendor@test.com',
        password: 'Vendor@123456'
    });

    if (res.data.success || res.data.token) {
        const userId = res.data.user?.id || res.data.data?.userId || res.data.userId;
        log(`  Vendor logged in successfully (ID: ${userId})`, 'success');
        return {
            token: res.data.token,
            userId: userId
        };
    }
    throw new Error('Vendor login failed');
}

async function seedProducts(vendorAuth) {
    log('Seeding products...', 'info');
    const createdProducts = [];

    for (const product of SEED_DATA.products) {
        try {
            const res = await axios.post(`${CONFIG.PRODUCT_URL}/api/products`, {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                images: product.images  // REQUIRED: at least one image
            }, {
                headers: {
                    'Authorization': `Bearer ${vendorAuth.token}`,
                    'X-User-Id': vendorAuth.userId,
                    'X-User-Role': 'VENDOR'
                }
            });

            if (res.data.success) {
                const productId = res.data.data._id || res.data.data.id;
                createdProducts.push({ ...product, id: productId });
                log(`  Created product: ${product.name} (${productId})`, 'success');
            }
        } catch (error) {
            // Product might already exist
            log(`  Product may exist or failed: ${product.name} - ${error.response?.data?.message || error.message}`, 'warn');
        }
    }

    log(`Products: ${createdProducts.length} created`, 'info');
    return createdProducts;
}

async function seedInventory(products, vendorAuth) {
    log('Seeding inventory...', 'info');
    let seeded = 0;

    for (const product of products) {
        try {
            const res = await axios.put(`${CONFIG.INVENTORY_URL}/api/inventory/${product.id}`, {
                quantity: product.stock,
                lowStockThreshold: 10
            }, {
                headers: { 'X-User-Id': vendorAuth.userId }
            });

            if (res.data.success) {
                log(`  Inventory set: ${product.name} = ${product.stock} units`, 'success');
                seeded++;
            }
        } catch (error) {
            log(`  Failed to set inventory: ${product.name} - ${error.response?.data?.message || error.message}`, 'error');
        }
    }

    log(`Inventory: ${seeded}/${products.length} products stocked`, 'info');
}

async function clearTestCarts() {
    log('Clearing test carts...', 'info');
    try {
        // Clear cart for test customer
        const loginRes = await axios.post(`${CONFIG.AUTH_URL}/api/auth/login`, {
            email: 'customer@test.com',
            password: 'Customer@123456'
        });

        if (loginRes.data.token) {
            const userId = loginRes.data.data?.userId || loginRes.data.userId;
            await axios.delete(`${CONFIG.ORDER_URL}/api/orders/cart`, {
                headers: { 'X-User-Id': userId }
            }).catch(() => { }); // Ignore if no cart
            log('  Cleared customer cart', 'success');
        }
    } catch (error) {
        log('  No cart to clear or customer not created yet', 'warn');
    }
}

// Main seeding function
async function seed() {
    console.log('\n========================================');
    console.log('   GREEN MART - DATABASE SEEDER');
    console.log('========================================\n');

    try {
        // 1. Seed users
        await seedUsers();

        // 2. Login as vendor
        const vendorAuth = await loginVendor();

        // 3. Seed products
        const products = await seedProducts(vendorAuth);

        // 4. Seed inventory for created products
        if (products.length > 0) {
            await seedInventory(products, vendorAuth);
        }

        // 5. Clear test carts
        await clearTestCarts();

        console.log('\n========================================');
        console.log('   SEEDING COMPLETE!');
        console.log('========================================\n');
        console.log('Test credentials:');
        console.log('  Admin:    admin@test.com / Admin@123456');
        console.log('  Vendor:   vendor@test.com / Vendor@123456');
        console.log('  Customer: customer@test.com / Customer@123456\n');

    } catch (error) {
        console.error('\n[ERROR] Seeding failed:', error.message);
        process.exit(1);
    }
}

// Run seeder
seed();
