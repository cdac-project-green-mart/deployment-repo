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

const axios = require('axios');

// Configuration - update for your environment
const CONFIG = {
    GATEWAY_URL: process.env.GATEWAY_URL || 'http://localhost:8080',
    AUTH_URL: process.env.AUTH_URL || 'http://localhost:8082',
    PRODUCT_URL: process.env.PRODUCT_URL || 'http://localhost:8084',
    INVENTORY_URL: process.env.INVENTORY_URL || 'http://localhost:8086',

    // ==================== IMAGE SOURCE OPTIONS ====================
    // Choose ONE of these options for product images:

    // OPTION 1: Use your own DO Spaces CDN (RECOMMENDED for production)
    // First upload images to your bucket, then set this to your CDN URL:
    // DO_CDN_BASE: 'https://your-bucket.sgp1.cdn.digitaloceanspaces.com/products',

    // OPTION 2: Use Unsplash URLs directly (simpler, but depends on third-party)
    USE_UNSPLASH: true,  // Set to false if using DO_CDN_BASE

    // Your DO Spaces CDN base URL (uncomment and set when ready)
    // DO_CDN_BASE: 'https://greenmart-images.sgp1.cdn.digitaloceanspaces.com/products',
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
// Image URLs - uses Unsplash by default, or your DO CDN if configured
const getImageUrl = (filename, unsplashId) => {
    if (CONFIG.DO_CDN_BASE) {
        return `${CONFIG.DO_CDN_BASE}/${filename}`;
    }
    return `https://images.unsplash.com/photo-${unsplashId}?w=800`;
};

const PRODUCTS = [
    // Fruits & Vegetables
    {
        name: 'Organic Red Apples',
        description: 'Fresh organic red apples from local farms. Sweet and crispy, perfect for snacking or baking.',
        price: 4.99,
        category: 'Fruits',
        stock: 200,
        images: [getImageUrl('apples.jpg', '1560806887-1e4cd0b6cbd6')]
    },
    {
        name: 'Fresh Bananas',
        description: 'Ripe yellow bananas, rich in potassium and perfect for smoothies or as a healthy snack.',
        price: 2.49,
        category: 'Fruits',
        stock: 300,
        images: [getImageUrl('bananas.jpg', '1571771894821-ce9b6c11b08e')]
    },
    {
        name: 'Organic Spinach',
        description: 'Fresh organic spinach leaves, packed with iron and vitamins. Great for salads and cooking.',
        price: 3.99,
        category: 'Vegetables',
        stock: 150,
        images: [getImageUrl('spinach.jpg', '1576045057995-568f588f82fb')]
    },
    {
        name: 'Cherry Tomatoes',
        description: 'Sweet and juicy cherry tomatoes, perfect for salads, pasta, or snacking.',
        price: 5.49,
        category: 'Vegetables',
        stock: 180,
        images: [getImageUrl('tomatoes.jpg', '1546470427-227c7883a694')]
    },
    // Dairy
    {
        name: 'Organic Whole Milk',
        description: 'Farm-fresh organic whole milk, 1 gallon. Pasteurized and homogenized.',
        price: 6.99,
        category: 'Dairy',
        stock: 100,
        images: [getImageUrl('milk.jpg', '1563636619-e9143da7973b')]
    },
    {
        name: 'Greek Yogurt',
        description: 'Creamy Greek yogurt, high in protein. Plain flavor, perfect with fruits and honey.',
        price: 4.49,
        category: 'Dairy',
        stock: 120,
        images: [getImageUrl('yogurt.jpg', '1571212515416-d5a0a18f9d1f')]
    },
    {
        name: 'Free Range Eggs',
        description: 'Farm fresh free-range eggs, dozen. From happy, pasture-raised hens.',
        price: 5.99,
        category: 'Dairy',
        stock: 200,
        images: [getImageUrl('eggs.jpg', '1518569656558-1f25e69d93d7')]
    },
    // Bakery
    {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread. No preservatives, made with organic flour.',
        price: 4.29,
        category: 'Bakery',
        stock: 80,
        images: [getImageUrl('bread.jpg', '1509440159596-0249088772ff')]
    },
    {
        name: 'Sourdough Loaf',
        description: 'Artisan sourdough bread with a crispy crust and tangy flavor. Naturally leavened.',
        price: 5.99,
        category: 'Bakery',
        stock: 60,
        images: [getImageUrl('sourdough.jpg', '1585478259715-876ace1d7f39')]
    },
    // Beverages
    {
        name: 'Premium Green Tea',
        description: 'Organic Japanese green tea leaves. 50 tea bags. Rich in antioxidants.',
        price: 12.99,
        category: 'Beverages',
        stock: 100,
        images: [getImageUrl('green-tea.jpg', '1564890369478-c89ca6d9cde9')]
    },
    {
        name: 'Cold Pressed Orange Juice',
        description: 'Fresh cold-pressed orange juice, 1L. No added sugar, 100% pure.',
        price: 7.49,
        category: 'Beverages',
        stock: 90,
        images: [getImageUrl('orange-juice.jpg', '1621506289937-a8e4df240d0b')]
    },
    // Grains & Pantry
    {
        name: 'Organic Brown Rice',
        description: 'Premium organic brown rice, 2kg bag. Whole grain, high in fiber.',
        price: 8.99,
        category: 'Grains',
        stock: 150,
        images: [getImageUrl('brown-rice.jpg', '1586201375761-83865001e31c')]
    },
    {
        name: 'Organic Quinoa',
        description: 'Tri-color organic quinoa, 500g. Complete protein, gluten-free.',
        price: 9.99,
        category: 'Grains',
        stock: 100,
        images: [getImageUrl('quinoa.jpg', '1612358405627-9a56a3b2f6e6')]
    },
    {
        name: 'Extra Virgin Olive Oil',
        description: 'Premium extra virgin olive oil, 500ml. Cold-pressed from Italian olives.',
        price: 14.99,
        category: 'Pantry',
        stock: 80,
        images: [getImageUrl('olive-oil.jpg', '1474979266404-7eaacbcd87c5')]
    },
    {
        name: 'Raw Honey',
        description: 'Pure raw honey, 500g. Unprocessed and unfiltered from local beekeepers.',
        price: 11.99,
        category: 'Pantry',
        stock: 70,
        images: [getImageUrl('honey.jpg', '1558642452-9d2a7deb7f62')]
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
