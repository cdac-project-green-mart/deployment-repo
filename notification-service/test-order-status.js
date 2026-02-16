/**
 * E2E test for order-status-changes queue.
 * Run: node test-order-status.js
 */
const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://greenmart:greenmart123@localhost:5672';

async function testOrderStatusChange() {
    console.log('=== E2E Order Status Notification Test ===\n');

    let connection;
    try {
        console.log('Connecting to RabbitMQ...');
        connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        const queue = 'order-status-changes';
        await channel.assertQueue(queue, { durable: true });

        // Use the userId of the registered admin (brahmankar.sid@gmail.com)
        const message = {
            orderId: '550e8400-e29b-41d4-a716-446655440000',
            userId: '70c2bbea-a5bd-4909-ac1e-e070184dda68',
            status: 'SHIPPED',
            timestamp: new Date().toISOString()
        };

        console.log('Publishing order status change:', JSON.stringify(message, null, 2));
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true,
            contentType: 'application/json'
        });

        console.log('\n✅ Message published to order-status-changes queue!');
        console.log('Check notification service logs and brahmankar.sid@gmail.com inbox.');

        await new Promise(resolve => setTimeout(resolve, 1000));
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (connection) await connection.close();
    }
}

testOrderStatusChange();
