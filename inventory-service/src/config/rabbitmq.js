const amqp = require('amqplib');

let connection = null;
let channel = null;

const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;

async function connect() {
    try {
        if (!connection) {
            connection = await amqp.connect(RABBITMQ_URL);
            console.log('Connected to RabbitMQ');

            connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
                connection = null;
                channel = null;
            });

            connection.on('close', () => {
                console.log('RabbitMQ connection closed, reconnecting...');
                connection = null;
                channel = null;
                setTimeout(connect, 5000); // Reconnect after 5 seconds
            });
        }

        if (!channel) {
            channel = await connection.createChannel();
            console.log('RabbitMQ channel created');
        }

        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error.message);
        connection = null;
        channel = null;
        setTimeout(connect, 5000); // Retry after 5 seconds
        return null;
    }
}

async function getChannel() {
    if (!channel) {
        await connect();
    }
    return channel;
}

async function closeConnection() {
    try {
        if (channel) {
            await channel.close();
            channel = null;
        }
        if (connection) {
            await connection.close();
            connection = null;
        }
        console.log('RabbitMQ connection closed');
    } catch (error) {
        console.error('Error closing RabbitMQ connection:', error.message);
    }
}

module.exports = {
    connect,
    getChannel,
    closeConnection
};
