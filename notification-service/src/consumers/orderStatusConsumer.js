const { getChannel } = require('../config/rabbitmq');
const { sendEmail } = require('../services/emailService');
const { getUserEmailById } = require('../services/authServiceClient');

const QUEUE_NAME = 'order-status-changes';

async function startOrderStatusConsumer() {
    try {
        const channel = await getChannel();
        
        if (!channel) {
            return console.error('Cannot start order-status consumer: channel not available');
        }

        // Assert queue exists
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        await channel.prefetch(1); // Process one message at a time

        console.log(`Order status consumer started, waiting for messages in ${QUEUE_NAME}...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg) {
                try {
                    const event = JSON.parse(msg.content.toString());
                    console.log('Received order status change:', event);

                    // Fetch customer email
                    const customerEmail = await getUserEmailById(event.userId);

                    if (customerEmail) {
                        const subject = `Order Update - ${event.status}`;
                        const text = `
Order Status Update

Order ID: ${event.orderId}
New Status: ${event.status}
Updated At: ${event.timestamp}

Your order status has been updated. You can track your order in your account dashboard.

Thank you for shopping with Green Mart!

---
Green Mart Notification System
                        `.trim();

                        await sendEmail(customerEmail, subject, text);
                        console.log(`Order status email sent to ${customerEmail}`);
                    } else {
                        console.warn(`No email found for userId: ${event.userId}`);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing order status change:', error.message);
                    channel.nack(msg, false, false); // Don't requeue on error
                }
            }
        });
    } catch (error) {
        console.error('Error starting order-status consumer:', error.message);
    }
}

module.exports = {
    startOrderStatusConsumer,
};
