require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const eurekaClient = require('./config/eureka');
const inventoryRoutes = require('./routes/inventoryRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/actuator/health', (req, res) => {
    res.json({ status: 'UP' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'Inventory Service is running' });
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`Inventory Service running on port ${PORT}`);

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
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', () => {
    eurekaClient.stop();
    mongoose.connection.close();
    process.exit(0);
});

module.exports = app;
