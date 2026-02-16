const { getChannel } = require('../config/rabbitmq');
const { sendEmail } = require('../services/emailService');
const { getUserEmailsByRole } = require('../services/authServiceClient');

const QUEUE_NAME = 'low-stock-alerts';

async function startLowStockConsumer() {
    try {
        const channel = await getChannel();
        
        if (!channel) {
            return console.error('Cannot start low-stock consumer: channel not available');
        }

        // Assert queue exists
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        await channel.prefetch(1); // Process one message at a time

        console.log(`Low stock consumer started, waiting for messages in ${QUEUE_NAME}...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg) {
                try {
                    const event = JSON.parse(msg.content.toString());
                    console.log('Received low-stock alert:', event);

                    // Fetch admin and vendor emails
                    const [adminEmails, vendorEmails] = await Promise.all([
                        getUserEmailsByRole('ADMIN'),
                        getUserEmailsByRole('VENDOR'),
                    ]);

                    const recipients = [...adminEmails, ...vendorEmails];

                    if (recipients.length > 0) {
                        const subject = `Low Stock Alert - Product ${event.productId}`;
                        const text = `
Low Stock Alert

Product ID: ${event.productId}
Current Quantity: ${event.quantity}
Low Stock Threshold: ${event.lowStockThreshold}
Time: ${event.timestamp}

Please restock this product as soon as possible.

---
Green Mart Notification System
                        `.trim();

                        await sendEmail(recipients, subject, text);
                        console.log(`Low stock alert email sent to ${recipients.length} recipient(s)`);
                    } else {
                        console.warn('No admin or vendor emails found');
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing low-stock alert:', error.message);
                    channel.nack(msg, false, false); // Don't requeue on error
                }
            }
        });
    } catch (error) {
        console.error('Error starting low-stock consumer:', error.message);
    }
}

module.exports = {
    startLowStockConsumer,
};
