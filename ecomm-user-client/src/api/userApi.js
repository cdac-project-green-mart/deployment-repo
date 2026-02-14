/**
 * User API – deployment-repo user-service
 * Profile:   GET /api/users/profile, PUT /api/users/profile
 * Addresses: GET /api/users/addresses, POST /api/users/address,
 *            PUT /api/users/address/:id, DELETE /api/users/address/:id
 */
import api from './axios';

// ——————————— Profile ———————————

/** Get the authenticated user's profile (phone, addresses, preferences) */
export const getProfile = async () => {
    const { data } = await api.get('/users/profile');
    return data?.data ?? data;
};

/**
 * Update profile fields (phone, preferences).
 * @param {{ phone?: string, preferences?: { newsletter?: boolean, theme?: string } }} updates
 */
export const updateProfile = async (updates) => {
    const { data } = await api.put('/users/profile', updates);
    return data?.data ?? data;
};

// ——————————— Addresses ———————————

/** Get all saved addresses for the authenticated user */
export const getAddresses = async () => {
    const { data } = await api.get('/users/addresses');
    const payload = data?.data ?? data;
    return Array.isArray(payload) ? payload : [];
};

/**
 * Add a new address.
 * @param {{ street?: string, city?: string, state?: string, zip?: string, country?: string, isDefault?: boolean }} address
 */
export const addAddress = async (address) => {
    const { data } = await api.post('/users/address', address);
    return data?.data ?? data;
};

/**
 * Update an existing address by its MongoDB _id.
 * @param {string} addressId
 * @param {{ street?: string, city?: string, state?: string, zip?: string, country?: string, isDefault?: boolean }} updates
 */
export const updateAddress = async (addressId, updates) => {
    const { data } = await api.put(`/users/address/${addressId}`, updates);
    return data?.data ?? data;
};

/**
 * Delete an address by its MongoDB _id.
 * @param {string} addressId
 */
export const deleteAddress = async (addressId) => {
    const { data } = await api.delete(`/users/address/${addressId}`);
    return data;
};
