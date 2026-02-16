const { getChannel } = require('../config/rabbitmq');

const QUEUE_NAME = 'low-stock-alerts';

async function publishLowStockAlert(productId, quantity, lowStockThreshold) {
    try {
        const channel = await getChannel();
        
        if (!channel) {
            console.error('RabbitMQ channel not available');
            return false;
        }

        // Ensure queue exists
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        const message = {
            productId,
            quantity,
            lowStockThreshold,
            timestamp: new Date().toISOString()
        };

        const sent = channel.sendToQueue(
            QUEUE_NAME,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );

        if (sent) {
            console.log(`Published low-stock alert for product ${productId}`);
        } else {
            console.warn('Queue buffer full, message not sent');
        }

        return sent;
    } catch (error) {
        console.error('Error publishing low-stock alert:', error.message);
        return false;
    }
}

module.exports = {
    publishLowStockAlert
};
