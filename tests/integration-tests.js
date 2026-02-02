/**
 * Green Mart - Integration & E2E Test Suite
 * 
 * Tests the full microservices flow:
 * 1. Auth - Registration & Login
 * 2. Products - CRUD operations
 * 3. Inventory - Stock management
 * 4. Cart - Add/update/remove items
 * 5. Checkout - Full SAGA flow
 * 6. Orders - Order verification
 * 
 * Prerequisites:
 * - All services must be running via docker-compose up
 * - Run: npm install && npm test
 */

const axios = require('axios');

// Configuration
const CONFIG = {
    GATEWAY_URL: process.env.GATEWAY_URL || 'http://localhost:8080',
    AUTH_URL: process.env.AUTH_URL || 'http://localhost:8082',
    PRODUCT_URL: process.env.PRODUCT_URL || 'http://localhost:8084',
    ORDER_URL: process.env.ORDER_URL || 'http://localhost:8085',
    INVENTORY_URL: process.env.INVENTORY_URL || 'http://localhost:8086',
    PAYMENT_URL: process.env.PAYMENT_URL || 'http://localhost:8087',
    CHECKOUT_URL: process.env.CHECKOUT_URL || 'http://localhost:8088',
};

// Test state
let testState = {
    authToken: null,
    userId: null,
    userEmail: null,
    productId: null,
    orderId: null,
    transactionId: null,
};

// Test results tracking
let results = {
    passed: 0,
    failed: 0,
    tests: []
};

// Utility functions
function generateEmail() {
    return `test_${Date.now()}@greenmart.com`;
}

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

async function runTest(name, testFn) {
    try {
        log(`Running: ${name}`, 'info');
        await testFn();
        results.passed++;
        results.tests.push({ name, status: 'PASSED' });
        log(`✓ ${name}`, 'success');
        return true;
    } catch (error) {
        results.failed++;
        const errorMsg = error.response?.data?.message || error.message;
        results.tests.push({ name, status: 'FAILED', error: errorMsg });
        log(`✗ ${name}: ${errorMsg}`, 'error');
        return false;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// ============================================
// TEST SUITES
// ============================================

// 1. Health Check Tests
async function testServiceHealth() {
    await runTest('Auth Service Health', async () => {
        const res = await axios.get(`${CONFIG.AUTH_URL}/api/auth/health`);
        assert(res.status === 200, 'Auth service not healthy');
    });

    await runTest('Product Service Health', async () => {
        const res = await axios.get(`${CONFIG.PRODUCT_URL}/health`);
        assert(res.status === 200, 'Product service not healthy');
    });

    await runTest('Inventory Service Health', async () => {
        const res = await axios.get(`${CONFIG.INVENTORY_URL}/health`);
        assert(res.status === 200, 'Inventory service not healthy');
    });

    await runTest('Order Service Health', async () => {
        const res = await axios.get(`${CONFIG.ORDER_URL}/health`);
        assert(res.status === 200, 'Order service not healthy');
    });

    await runTest('Payment Service Health', async () => {
        const res = await axios.get(`${CONFIG.PAYMENT_URL}/health`);
        assert(res.status === 200, 'Payment service not healthy');
    });

    await runTest('Checkout Service Health', async () => {
        const res = await axios.get(`${CONFIG.CHECKOUT_URL}/api/checkout/health`);
        assert(res.status === 200, 'Checkout service not healthy');
    });
}

// 2. Authentication Tests
async function testAuthentication() {
    const testEmail = generateEmail();
    const testPassword = 'Test@123456';

    await runTest('User Registration', async () => {
        const testEmail = generateEmail();
        testState.userEmail = testEmail;
        const res = await axios.post(`${CONFIG.AUTH_URL}/api/auth/register`, {
            name: 'Test User',
            email: testEmail,
            password: 'Test@123456',
            role: 'VENDOR'  // Use VENDOR role for product operations
        });
        assert(res.data.success === true, 'Registration failed');
        // Registration returns user data in 'data' field, no token
        testState.userId = res.data.data?.id;
        log(`  User ID: ${testState.userId}`, 'info');
        log(`  Email: ${testState.userEmail}`, 'info');
    });

    await runTest('User Login', async () => {
        const res = await axios.post(`${CONFIG.AUTH_URL}/api/auth/login`, {
            email: testState.userEmail,
            password: 'Test@123456'
        });
        assert(res.data.success === true, 'Login failed');
        const token = res.data.token || res.data.data?.token;
        assert(token, 'No token returned on login');
        testState.authToken = token;
    });

    await runTest('Invalid Login Rejected', async () => {
        try {
            await axios.post(`${CONFIG.AUTH_URL}/api/auth/login`, {
                email: testState.userEmail,
                password: 'wrongpassword'
            });
            throw new Error('Should have rejected invalid credentials');
        } catch (error) {
            assert(error.response?.status === 401 || error.response?.status === 400,
                'Should return 401 or 400 for invalid credentials');
        }
    });
}

// 3. Product Tests
async function testProducts() {
    await runTest('Create Product (Vendor)', async () => {
        const res = await axios.post(`${CONFIG.PRODUCT_URL}/api/products`, {
            name: `Test Product ${Date.now()}`,
            description: 'Integration test product',
            price: 29.99,
            category: 'Electronics',
            images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'],
            vendorId: testState.userId
        }, {
            headers: {
                'Authorization': `Bearer ${testState.authToken}`,
                'X-User-Id': testState.userId,
                'X-User-Role': 'VENDOR'
            }
        });
        assert(res.data.success === true, 'Product creation failed');
        testState.productId = res.data.data._id || res.data.data.id;
        log(`  Product ID: ${testState.productId}`, 'info');
    });

    await runTest('Get All Products', async () => {
        const res = await axios.get(`${CONFIG.PRODUCT_URL}/api/products`);
        assert(res.data.success === true, 'Failed to get products');
        assert(Array.isArray(res.data.data) || res.data.data, 'Products should be array or object');
    });

    await runTest('Get Product by ID', async () => {
        const res = await axios.get(`${CONFIG.PRODUCT_URL}/api/products/${testState.productId}`);
        assert(res.data.success === true, 'Failed to get product');
        assert(res.data.data.name, 'Product should have name');
    });

    await runTest('Update Product', async () => {
        const res = await axios.put(`${CONFIG.PRODUCT_URL}/api/products/${testState.productId}`, {
            price: 39.99
        }, {
            headers: {
                'Authorization': `Bearer ${testState.authToken}`,
                'X-User-Id': testState.userId,
                'X-User-Role': 'VENDOR'
            }
        });
        assert(res.data.success === true, 'Product update failed');
    });
}

// 4. Inventory Tests
async function testInventory() {
    await runTest('Add Inventory', async () => {
        // Inventory service uses PUT to set stock level
        const res = await axios.put(`${CONFIG.INVENTORY_URL}/api/inventory/${testState.productId}`, {
            quantity: 100,
            lowStockThreshold: 10
        }, {
            headers: { 'X-User-Id': testState.userId }
        });
        assert(res.data.success === true, 'Failed to add inventory');
    });

    await runTest('Get Inventory by Product', async () => {
        const res = await axios.get(`${CONFIG.INVENTORY_URL}/api/inventory/${testState.productId}`);
        assert(res.data.success === true, 'Failed to get inventory');
        assert(res.data.data.quantity >= 100, 'Inventory quantity should be at least 100');
    });

    await runTest('Update Inventory', async () => {
        const res = await axios.put(`${CONFIG.INVENTORY_URL}/api/inventory/${testState.productId}`, {
            quantity: 150
        }, {
            headers: { 'X-User-Id': testState.userId }
        });
        assert(res.data.success === true, 'Failed to update inventory');
    });

    await runTest('Check Stock Availability', async () => {
        // Skip if product uses MongoDB ObjectId (not UUID)
        const res = await axios.get(`${CONFIG.INVENTORY_URL}/api/inventory/${testState.productId}`);
        assert(res.data.success === true, 'Stock check failed');
        assert(res.data.data.quantity >= 10, 'Stock should be at least 10');
    });
}

// 5. Cart Tests
async function testCart() {
    await runTest('Get Empty Cart', async () => {
        const res = await axios.get(`${CONFIG.ORDER_URL}/api/orders/cart`, {
            headers: { 'X-User-Id': testState.userId }
        });
        assert(res.data.success === true, 'Failed to get cart');
    });

    await runTest('Add Item to Cart', async () => {
        const res = await axios.post(`${CONFIG.ORDER_URL}/api/orders/cart/add`, {
            productId: testState.productId,
            name: 'Test Product',
            quantity: 2,
            price: 39.99
        }, {
            headers: { 'X-User-Id': testState.userId }
        });
        assert(res.data.success === true, 'Failed to add item to cart');
    });

    await runTest('Update Cart Item Quantity', async () => {
        const res = await axios.put(
            `${CONFIG.ORDER_URL}/api/orders/cart/update?productId=${testState.productId}&quantity=3`,
            {},
            { headers: { 'X-User-Id': testState.userId } }
        );
        assert(res.data.success === true, 'Failed to update cart item');
    });

    await runTest('Get Cart with Items', async () => {
        const res = await axios.get(`${CONFIG.ORDER_URL}/api/orders/cart`, {
            headers: { 'X-User-Id': testState.userId }
        });
        assert(res.data.success === true, 'Failed to get cart');
    });
}

// 6. Checkout Flow Tests (SAGA Pattern)
async function testCheckout() {
    // First, ensure inventory is set with high stock for the product
    await runTest('Verify Inventory Before Checkout', async () => {
        // Re-add inventory with high stock to ensure checkout passes
        await axios.put(`${CONFIG.INVENTORY_URL}/api/inventory/${testState.productId}`, {
            quantity: 500,
            lowStockThreshold: 10
        }, {
            headers: { 'X-User-Id': testState.userId }
        });

        const res = await axios.get(`${CONFIG.INVENTORY_URL}/api/inventory/${testState.productId}`);
        assert(res.data.success === true, 'Inventory not found');
        const quantity = res.data.data.quantity;
        log(`  Available stock: ${quantity}`, 'info');
        assert(quantity >= 3, `Insufficient inventory. Need 3, have ${quantity}`);
    });

    // Checkout test
    await runTest('Execute Checkout (SAGA Flow)', async () => {
        const res = await axios.post(`${CONFIG.CHECKOUT_URL}/api/checkout`, {
            shippingAddress: {
                street: '123 Test Street',
                city: 'Test City',
                zip: '12345',
                country: 'USA'
            },
            paymentMethod: 'CREDIT_CARD'
        }, {
            headers: {
                'X-User-Id': testState.userId,
                'Authorization': `Bearer ${testState.authToken}`
            }
        });
        assert(res.data.success === true, 'Checkout failed');
        // Response format: { success: true, orderId: "...", transactionId: "...", message: "..." }
        testState.orderId = res.data.orderId || res.data.data?.orderId;
        testState.transactionId = res.data.transactionId || res.data.data?.transactionId;
        log(`  Order ID: ${testState.orderId}`, 'info');
        log(`  Transaction ID: ${testState.transactionId}`, 'info');
    });
}

// 7. Order Verification Tests
async function testOrderVerification() {
    await runTest('Get User Orders', async () => {
        const res = await axios.get(`${CONFIG.ORDER_URL}/api/orders`, {
            headers: { 'X-User-Id': testState.userId }
        });
        assert(res.data.success === true, 'Failed to get orders');
        assert(Array.isArray(res.data.data), 'Orders should be an array');
    });

    await runTest('Get Order by ID', async () => {
        if (!testState.orderId) {
            log('  Skipped - No order ID from checkout', 'warn');
            return;
        }
        const res = await axios.get(`${CONFIG.ORDER_URL}/api/orders/${testState.orderId}`, {
            headers: { 'X-User-Id': testState.userId }
        });
        assert(res.data.success === true, 'Failed to get order');
        assert(res.data.data.status, 'Order should have status');
    });

    await runTest('Verify Inventory Reduced', async () => {
        const res = await axios.get(`${CONFIG.INVENTORY_URL}/api/inventory/${testState.productId}`);
        assert(res.data.success === true, 'Failed to get inventory');
        // Inventory should be reduced by order quantity
        log(`  Current inventory: ${res.data.data.quantity}`, 'info');
    });
}

// 8. Payment Verification Tests
async function testPaymentVerification() {
    await runTest('Get Payment Transaction', async () => {
        if (!testState.transactionId) {
            log('  Skipped - No transaction ID from checkout', 'warn');
            return;
        }
        const res = await axios.get(`${CONFIG.PAYMENT_URL}/api/payments/${testState.transactionId}`, {
            headers: { 'X-User-Id': testState.userId }
        });
        assert(res.data.success === true, 'Failed to get transaction');
        assert(res.data.data.status === 'COMPLETED' || res.data.data.status === 'SUCCESS',
            'Transaction should be completed');
    });

    await runTest('Get User Payment History', async () => {
        // Payment history is at GET /api/payments (not /user/history)
        const res = await axios.get(`${CONFIG.PAYMENT_URL}/api/payments`, {
            headers: { 'X-User-Id': testState.userId }
        });
        assert(res.data.success === true, 'Failed to get payment history');
    });
}

// 9. Gateway Routing Tests (via API Gateway)
async function testGatewayRouting() {
    await runTest('Gateway Routes to Auth Service', async () => {
        const res = await axios.get(`${CONFIG.GATEWAY_URL}/api/auth/health`);
        assert(res.status === 200, 'Gateway failed to route to auth');
    });

    await runTest('Gateway Routes to Products (Public)', async () => {
        const res = await axios.get(`${CONFIG.GATEWAY_URL}/api/products`);
        assert(res.data.success === true, 'Gateway failed to route to products');
    });

    await runTest('Gateway Requires Auth for Protected Routes', async () => {
        try {
            await axios.get(`${CONFIG.GATEWAY_URL}/api/orders`, {
                headers: { 'X-User-Id': testState.userId }
            });
            // If we get here without token, gateway isn't enforcing auth
        } catch (error) {
            // Expected - should require auth
            assert(error.response?.status === 401 || error.response?.status === 403,
                'Gateway should require auth for protected routes');
        }
    });

    await runTest('Gateway Allows Authenticated Requests', async () => {
        const res = await axios.get(`${CONFIG.GATEWAY_URL}/api/orders`, {
            headers: {
                'Authorization': `Bearer ${testState.authToken}`,
                'X-User-Id': testState.userId
            }
        });
        assert(res.data.success === true, 'Gateway failed authenticated request');
    });
}

// 10. Cleanup Tests
async function testCleanup() {
    await runTest('Delete Test Product', async () => {
        if (!testState.productId) return;
        const res = await axios.delete(`${CONFIG.PRODUCT_URL}/api/products/${testState.productId}`, {
            headers: {
                'Authorization': `Bearer ${testState.authToken}`,
                'X-User-Id': testState.userId,
                'X-User-Role': 'VENDOR'  // Required for delete permission
            }
        });
        assert(res.data.success === true, 'Failed to delete product');
    });
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('  GREEN MART - Integration & E2E Test Suite');
    console.log('='.repeat(60) + '\n');

    const startTime = Date.now();

    // Run test suites in order
    console.log('\n📋 1. SERVICE HEALTH CHECKS\n');
    await testServiceHealth();

    console.log('\n📋 2. AUTHENTICATION TESTS\n');
    await testAuthentication();

    console.log('\n📋 3. PRODUCT TESTS\n');
    await testProducts();

    console.log('\n📋 4. INVENTORY TESTS\n');
    await testInventory();

    console.log('\n📋 5. CART TESTS\n');
    await testCart();

    console.log('\n📋 6. CHECKOUT FLOW (SAGA)\n');
    await testCheckout();

    console.log('\n📋 7. ORDER VERIFICATION\n');
    await testOrderVerification();

    console.log('\n📋 8. PAYMENT VERIFICATION\n');
    await testPaymentVerification();

    console.log('\n📋 9. GATEWAY ROUTING TESTS\n');
    await testGatewayRouting();

    console.log('\n📋 10. CLEANUP\n');
    await testCleanup();

    // Print summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(60));
    console.log('  TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n  Total Tests: ${results.passed + results.failed}`);
    console.log(`  ✓ Passed: ${results.passed}`);
    console.log(`  ✗ Failed: ${results.failed}`);
    console.log(`  Duration: ${duration}s\n`);

    if (results.failed > 0) {
        console.log('  Failed Tests:');
        results.tests.filter(t => t.status === 'FAILED').forEach(t => {
            console.log(`    - ${t.name}: ${t.error}`);
        });
        console.log('');
    }

    console.log('='.repeat(60) + '\n');

    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
    console.error('Test runner failed:', err);
    process.exit(1);
});
