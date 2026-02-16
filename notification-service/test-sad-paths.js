/**
 * Sad-path E2E tests for the notification service.
 * Tests: invalid userId, malformed JSON, missing fields.
 * Run: node test-sad-paths.js
 */
const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://greenmart:greenmart123@localhost:5672';

async function runSadPathTests() {
    console.log('=== Sad Path E2E Tests ===\n');

    let connection;
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue('low-stock-alerts', { durable: true });
        await channel.assertQueue('order-status-changes', { durable: true });

        // --- Test 1: Order status with non-existent userId ---
        console.log('TEST 1: Order status change with non-existent userId');
        const test1 = {
            orderId: '550e8400-e29b-41d4-a716-446655440001',
            userId: '00000000-0000-0000-0000-000000000000',
            status: 'DELIVERED',
            timestamp: new Date().toISOString()
        };
        channel.sendToQueue('order-status-changes', Buffer.from(JSON.stringify(test1)), {
            persistent: true, contentType: 'application/json'
        });
        console.log('  → Published. Expected: "No email found for userId" warning, message acked.\n');

        await sleep(2000);

        // --- Test 2: Malformed JSON payload ---
        console.log('TEST 2: Malformed JSON on low-stock-alerts queue');
        channel.sendToQueue('low-stock-alerts', Buffer.from('this is not JSON {{{'), {
            persistent: true, contentType: 'application/json'
        });
        console.log('  → Published. Expected: JSON parse error, message nacked (not requeued).\n');

        await sleep(2000);

        // --- Test 3: Missing required fields ---
        console.log('TEST 3: Low stock alert with missing fields');
        const test3 = {
            // Missing productId, quantity, lowStockThreshold
            timestamp: new Date().toISOString()
        };
        channel.sendToQueue('low-stock-alerts', Buffer.from(JSON.stringify(test3)), {
            persistent: true, contentType: 'application/json'
        });
        console.log('  → Published. Expected: email sent with "undefined" values (graceful degradation).\n');

        await sleep(2000);

        // --- Test 4: Order status with empty payload ---
        console.log('TEST 4: Order status change with empty object');
        channel.sendToQueue('order-status-changes', Buffer.from(JSON.stringify({})), {
            persistent: true, contentType: 'application/json'
        });
        console.log('  → Published. Expected: "No email found for userId: undefined" warning.\n');

        await sleep(2000);

        console.log('✅ All sad path messages published!');
        console.log('Check: docker logs green-mart-notification --tail 40\n');

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (connection) await connection.close();
    }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

runSadPathTests();
