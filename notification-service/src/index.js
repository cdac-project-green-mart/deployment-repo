require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const eurekaClient = require('./config/eureka');
const rabbitmqClient = require('./config/rabbitmq');
const errorHandler = require('./middleware/errorHandler');

// Import consumers
const { startLowStockConsumer } = require('./consumers/lowStockConsumer');
const { startOrderStatusConsumer } = require('./consumers/orderStatusConsumer');

const app = express();
const PORT = process.env.PORT || 8089;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check endpoints
app.get('/actuator/health', (req, res) => {
    res.json({ status: 'UP' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'Notification Service is running' });
});

// Error handler
app.use(errorHandler);

// Start server and services
async function startServices() {
    try {
        // Connect to RabbitMQ
        await rabbitmqClient.connect();
        console.log('RabbitMQ connection established');

        // Start consumers
        await startLowStockConsumer();
        await startOrderStatusConsumer();
        console.log('RabbitMQ consumers started');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Notification Service running on port ${PORT}`);

            // Register with Eureka
            if (process.env.NODE_ENV !== 'test') {
                eurekaClient.start((error) => {
                    if (error) {
                        console.log('Eureka registration failed:', error.message);
                    } else {
                        console.log('Registered with Eureka');
                    }
                });
            }
        });
    } catch (error) {
        console.error('Failed to start services:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    eurekaClient.stop();
    await rabbitmqClient.closeConnection();
    process.exit(0);
});

// Start the services
startServices();

module.exports = app;
