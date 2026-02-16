const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8082';

/**
 * Fetch user emails by role from auth-service
 * @param {string} role - User role (ADMIN, VENDOR, CUSTOMER)
 * @returns {Promise<string[]>} - Array of email addresses
 */
async function getUserEmailsByRole(role) {
    try {
        const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/users/by-role`, {
            params: { role },
        });
        
        // Extract emails from the response
        const emails = response.data.map(user => user.email);
        return emails;
    } catch (error) {
        console.error(`Error fetching ${role} emails from auth-service:`, error.message);
        return [];
    }
}

/**
 * Fetch user email by userId from auth-service
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} - User email or null
 */
async function getUserEmailById(userId) {
    try {
        const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/users/${userId}/email`);
        return response.data.email;
    } catch (error) {
        console.error(`Error fetching email for userId ${userId}:`, error.message);
        return null;
    }
}

module.exports = {
    getUserEmailsByRole,
    getUserEmailById,
};
