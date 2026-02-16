/**
 * E2E test: Publishes a low-stock alert to RabbitMQ.
 * The notification service should consume it and send an email.
 * Run: node test-e2e.js
 */
const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://greenmart:greenmart123@localhost:5672';

async function testLowStockAlert() {
    console.log('=== E2E Notification Test ===\n');

    let connection;
    try {
        // Connect to RabbitMQ
        console.log('Connecting to RabbitMQ...');
        connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Assert queue
        const queue = 'low-stock-alerts';
        await channel.assertQueue(queue, { durable: true });

        // Publish test message
        const message = {
            productId: 'TEST-PRODUCT-001',
            quantity: 2,
            lowStockThreshold: 10,
            timestamp: new Date().toISOString()
        };

        console.log('Publishing test low-stock alert:', JSON.stringify(message, null, 2));
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true,
            contentType: 'application/json'
        });

        console.log('\n✅ Message published to low-stock-alerts queue!');
        console.log('Check the notification service logs and your email inbox.');

        // Brief pause to ensure the message is sent
        await new Promise(resolve => setTimeout(resolve, 1000));
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (connection) await connection.close();
    }
}

testLowStockAlert();
