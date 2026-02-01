/**
 * User Service Integration Tests
 * 
 * Uses Jest + Supertest for HTTP testing
 * Tests actual endpoints against real MongoDB (via Docker)
 * 
 * Prerequisites:
 * - MongoDB container running
 * - Run: npm test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Import your Express app

// Test configuration
const TEST_MONGO_URI = process.env.TEST_MONGODB_URI || 'mongodb://greenmart:greenmart123@localhost:27017/user_service_test?authSource=admin';

describe('User Service Integration Tests', () => {
    let server;
    let testUserId;

    // Setup before all tests
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(TEST_MONGO_URI);
        
        // Start server on random port
        server = app.listen(0);
    });

    // Cleanup after all tests
    afterAll(async () => {
        // Clean up test data
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        server.close();
    });

    // Clear collections before each test
    beforeEach(async () => {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
    });

    describe('Health Check', () => {
        it('should return 200 OK for health endpoint', async () => {
            const response = await request(server)
                .get('/actuator/health')
                .expect(200);

            expect(response.body.status).toBe('UP');
        });
    });

    describe('User CRUD Operations', () => {
        const testUser = {
            name: 'Test User',
            email: 'test@example.com',
            authId: 'auth-id-123',
            role: 'CUSTOMER'
        };

        it('should create a new user', async () => {
            const response = await request(server)
                .post('/api/users')
                .send(testUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe(testUser.email);
            expect(response.body.data.name).toBe(testUser.name);
            
            testUserId = response.body.data._id;
        });

        it('should get user by ID', async () => {
            // Create user first
            const createResponse = await request(server)
                .post('/api/users')
                .send(testUser);
            
            const userId = createResponse.body.data._id;

            // Get user
            const response = await request(server)
                .get(`/api/users/${userId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe(testUser.email);
        });

        it('should update user profile', async () => {
            // Create user first
            const createResponse = await request(server)
                .post('/api/users')
                .send(testUser);
            
            const userId = createResponse.body.data._id;

            // Update user
            const response = await request(server)
                .put(`/api/users/${userId}`)
                .send({ name: 'Updated Name' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Name');
        });

        it('should return 404 for non-existent user', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            
            const response = await request(server)
                .get(`/api/users/${fakeId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should delete user', async () => {
            // Create user first
            const createResponse = await request(server)
                .post('/api/users')
                .send(testUser);
            
            const userId = createResponse.body.data._id;

            // Delete user
            await request(server)
                .delete(`/api/users/${userId}`)
                .expect(200);

            // Verify deleted
            await request(server)
                .get(`/api/users/${userId}`)
                .expect(404);
        });
    });

    describe('User Address Management', () => {
        const testUser = {
            name: 'Test User',
            email: 'address-test@example.com',
            authId: 'auth-id-456',
            role: 'CUSTOMER'
        };

        const testAddress = {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'USA',
            isDefault: true
        };

        it('should add address to user', async () => {
            // Create user
            const createResponse = await request(server)
                .post('/api/users')
                .send(testUser);
            
            const userId = createResponse.body.data._id;

            // Add address
            const response = await request(server)
                .post(`/api/users/${userId}/addresses`)
                .send(testAddress)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.addresses).toHaveLength(1);
            expect(response.body.data.addresses[0].street).toBe(testAddress.street);
        });

        it('should get user addresses', async () => {
            // Create user and add address
            const createResponse = await request(server)
                .post('/api/users')
                .send(testUser);
            
            const userId = createResponse.body.data._id;

            await request(server)
                .post(`/api/users/${userId}/addresses`)
                .send(testAddress);

            // Get addresses
            const response = await request(server)
                .get(`/api/users/${userId}/addresses`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
        });
    });

    describe('Input Validation', () => {
        it('should reject user creation with invalid email', async () => {
            const invalidUser = {
                name: 'Test User',
                email: 'invalid-email',
                authId: 'auth-id-789',
                role: 'CUSTOMER'
            };

            const response = await request(server)
                .post('/api/users')
                .send(invalidUser)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should reject user creation without required fields', async () => {
            const incompleteUser = {
                name: 'Test User'
                // Missing email and other required fields
            };

            const response = await request(server)
                .post('/api/users')
                .send(incompleteUser)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
