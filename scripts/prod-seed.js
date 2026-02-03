#!/usr/bin/env node
/**
 * GREEN MART - Production Database Seeder
 * 
 * Seeds the production database with:
 * - 3 Users: 1 Admin, 1 Vendor, 1 Customer
 * - Product catalog with images
 * - Inventory for all products
 * 
 * Usage: node prod-seed.js
 * 
 * Run AFTER all services are healthy:
 *   docker compose -f docker-compose.prod.yml up -d
 *   sleep 120  # Wait for services
 *   node scripts/prod-seed.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const axios = require('axios');

// Configuration - update for your environment
const CONFIG = {
    GATEWAY_URL: process.env.GATEWAY_URL || 'http://localhost:8080',
    AUTH_URL: process.env.AUTH_URL || 'http://localhost:8082',
    PRODUCT_URL: process.env.PRODUCT_URL || 'http://localhost:8084',
    INVENTORY_URL: process.env.INVENTORY_URL || 'http://localhost:8086',

    // DigitalOcean Spaces CDN base URL for product images
    DO_CDN_BASE: 'https://green-mart-product-storage.sfo3.cdn.digitaloceanspaces.com/products',
};

// ==================== PRODUCTION USERS ====================
const USERS = [
    {
        name: 'Green Mart Admin',
        email: 'admin@greenmart.com',
        password: 'Admin@GreenMart2024',
        role: 'ADMIN'
    },
    {
        name: 'Organic Farms Vendor',
        email: 'vendor@organicfarms.com',
        password: 'Vendor@Organic2024',
        role: 'VENDOR'
    },
    {
        name: 'John Customer',
        email: 'customer@example.com',
        password: 'Customer@Shop2024',
        role: 'CUSTOMER'
    }
];

// ==================== PRODUCT CATALOG ====================
// Image URL helper - uses DO Spaces CDN
const getImageUrl = (filename) => `${CONFIG.DO_CDN_BASE}/${filename}`;

const PRODUCTS = [
    // Fruits
    {
        name: 'Organic Red Apples',
        description: 'Fresh organic red apples from local farms. Sweet and crispy, perfect for snacking or baking.',
        price: 4.99,
        category: 'Fruits',
        stock: 200,
        images: [getImageUrl('apple.jpg')]
    },
    {
        name: 'Fresh Mangoes',
        description: 'Sweet and juicy tropical mangoes, rich in vitamins A and C. Perfect for smoothies or desserts.',
        price: 6.99,
        category: 'Fruits',
        stock: 150,
        images: [getImageUrl('mango.jpg')]
    },
    {
        name: 'Fresh Oranges',
        description: 'Juicy oranges packed with vitamin C. Great for fresh juice or healthy snacking.',
        price: 3.99,
        category: 'Fruits',
        stock: 250,
        images: [getImageUrl('orange.jpg')]
    },
    // Vegetables
    {
        name: 'Fresh Tomatoes',
        description: 'Ripe red tomatoes, perfect for salads, sauces, and sandwiches. Locally grown.',
        price: 3.49,
        category: 'Vegetables',
        stock: 180,
        images: [getImageUrl('tomato.jpg')]
    },
    {
        name: 'Green Cabbage',
        description: 'Fresh green cabbage, crispy and nutritious. Great for coleslaw, stir-fry, or soups.',
        price: 2.49,
        category: 'Vegetables',
        stock: 120,
        images: [getImageUrl('cabbage.jpg')]
    },
    {
        name: 'Green Capsicum',
        description: 'Fresh green bell peppers with a mild, sweet flavor. Perfect for salads and stir-fries.',
        price: 3.99,
        category: 'Vegetables',
        stock: 150,
        images: [getImageUrl('capsicum.jpg')]
    },
    {
        name: 'Red Capsicum',
        description: 'Sweet red bell peppers, rich in vitamins. Great for grilling, roasting, or raw in salads.',
        price: 4.49,
        category: 'Vegetables',
        stock: 140,
        images: [getImageUrl('red-capsicum.jpg')]
    },
    {
        name: 'Fresh Cauliflower',
        description: 'Farm-fresh cauliflower, versatile and nutritious. Perfect for roasting or cauliflower rice.',
        price: 3.99,
        category: 'Vegetables',
        stock: 100,
        images: [getImageUrl('cauliflower.jpg')]
    },
    {
        name: 'Fresh Eggplant',
        description: 'Purple eggplant perfect for grilling, baking, or making baba ganoush.',
        price: 2.99,
        category: 'Vegetables',
        stock: 130,
        images: [getImageUrl('eggplant.jpg')]
    },
    {
        name: 'Fresh Lettuce',
        description: 'Crisp and fresh lettuce leaves, perfect for salads, sandwiches, and wraps.',
        price: 2.49,
        category: 'Vegetables',
        stock: 100,
        images: [getImageUrl('lettuce.jpg')]
    },
    {
        name: 'Fresh Potatoes',
        description: 'Farm-fresh potatoes, versatile for baking, frying, mashing, or roasting.',
        price: 1.99,
        category: 'Vegetables',
        stock: 300,
        images: [getImageUrl('potatoes.jpg')]
    },
    {
        name: 'Sweet Corn',
        description: 'Fresh sweet corn on the cob. Perfect for grilling, boiling, or adding to salads.',
        price: 0.99,
        category: 'Vegetables',
        stock: 200,
        images: [getImageUrl('corn.jpg')]
    },
    {
        name: 'Chinese Cabbage',
        description: 'Fresh napa cabbage, perfect for Asian stir-fries, kimchi, and salads.',
        price: 3.49,
        category: 'Vegetables',
        stock: 90,
        images: [getImageUrl('chinese-cabbage.jpg')]
    },
    {
        name: 'Fresh Green Chili',
        description: 'Spicy green chilies to add heat to your dishes. Fresh and locally sourced.',
        price: 1.99,
        category: 'Vegetables',
        stock: 150,
        images: [getImageUrl('chili.jpg')]
    }
];

// ==================== UTILITY FUNCTIONS ====================

const log = (msg, type = 'info') => {
    const prefix = {
        info: '\x1b[36m[INFO]\x1b[0m',
        success: '\x1b[32m[SUCCESS]\x1b[0m',
        warn: '\x1b[33m[WARN]\x1b[0m',
        error: '\x1b[31m[ERROR]\x1b[0m'
    };
    console.log(`${prefix[type]} ${msg}`);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== SEEDING FUNCTIONS ====================

async function seedUsers() {
    log('Seeding production users...');
    const createdUsers = [];

    for (const user of USERS) {
        try {
            const res = await axios.post(`${CONFIG.AUTH_URL}/api/auth/register`, user);
            if (res.data.success) {
                createdUsers.push({ ...user, id: res.data.data?.id });
                log(`  Created: ${user.email} (${user.role})`, 'success');
            }
        } catch (error) {
            if (error.response?.status === 409 || error.response?.data?.message?.includes('exists')) {
                log(`  Exists: ${user.email}`, 'warn');
            } else {
                log(`  Failed: ${user.email} - ${error.message}`, 'error');
            }
        }
    }

    return createdUsers;
}

async function loginVendor() {
    log('Logging in as vendor...');
    const vendor = USERS.find(u => u.role === 'VENDOR');

    const res = await axios.post(`${CONFIG.AUTH_URL}/api/auth/login`, {
        email: vendor.email,
        password: vendor.password
    });

    if (res.data.success) {
        const userId = res.data.user?.id || res.data.data?.id;
        log(`  Vendor authenticated (ID: ${userId})`, 'success');
        return { token: res.data.token, userId };
    }
    throw new Error('Vendor login failed');
}

async function seedProducts(vendorAuth) {
    log('Seeding product catalog...');
    const createdProducts = [];

    for (const product of PRODUCTS) {
        try {
            const res = await axios.post(`${CONFIG.PRODUCT_URL}/api/products`, {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                images: product.images
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
                log(`  Created: ${product.name}`, 'success');
            }
        } catch (error) {
            if (error.response?.data?.message?.includes('exists')) {
                log(`  Exists: ${product.name}`, 'warn');
            } else {
                log(`  Failed: ${product.name} - ${error.message}`, 'error');
            }
        }
        await delay(100); // Rate limiting
    }

    return createdProducts;
}

async function seedInventory(products) {
    log('Setting up inventory...');

    for (const product of products) {
        if (!product.id) continue;

        try {
            await axios.put(`${CONFIG.INVENTORY_URL}/api/inventory/${product.id}`, {
                quantity: product.stock,
                lowStockThreshold: 20
            });
            log(`  Stocked: ${product.name} = ${product.stock} units`, 'success');
        } catch (error) {
            log(`  Failed: ${product.name} - ${error.message}`, 'error');
        }
    }
}

// ==================== MAIN ====================

async function main() {
    console.log('\n' + '='.repeat(50));
    console.log('   GREEN MART - PRODUCTION DATABASE SEEDER');
    console.log('='.repeat(50) + '\n');

    try {
        // Wait a bit for services to be ready
        log('Waiting for services to be ready...');
        await delay(3000);

        // Step 1: Create users
        await seedUsers();

        // Step 2: Login as vendor
        const vendorAuth = await loginVendor();

        // Step 3: Create products
        const products = await seedProducts(vendorAuth);

        // Step 4: Set inventory
        await seedInventory(products);

        console.log('\n' + '='.repeat(50));
        console.log('   PRODUCTION SEEDING COMPLETE!');
        console.log('='.repeat(50));
        console.log('\n📧 PRODUCTION CREDENTIALS:');
        console.log('─'.repeat(50));
        console.log('Admin:    admin@greenmart.com    / Admin@GreenMart2024');
        console.log('Vendor:   vendor@organicfarms.com / Vendor@Organic2024');
        console.log('Customer: customer@example.com   / Customer@Shop2024');
        console.log('─'.repeat(50) + '\n');

    } catch (error) {
        log(`Seeding failed: ${error.message}`, 'error');
        process.exit(1);
    }
}

main();
