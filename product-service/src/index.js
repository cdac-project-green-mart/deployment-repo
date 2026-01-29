require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const eurekaClient = require('./config/eureka');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8084;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Health check
app.get('/actuator/health', (req, res) => {
    res.json({ status: 'UP' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'Product Service is running' });
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`Product Service running on port ${PORT}`);

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
