const UserProfile = require('../models/UserProfile');

class UserService {
    // Get profile by userId (from JWT)
    async getProfile(userId) {
        let profile = await UserProfile.findOne({ userId });

        // Create profile if doesn't exist
        if (!profile) {
            profile = await UserProfile.create({ userId });
        }

        return profile;
    }

    // Update profile
    async updateProfile(userId, updateData) {
        const { phone, preferences } = updateData;

        let profile = await UserProfile.findOne({ userId });

        if (!profile) {
            profile = new UserProfile({ userId });
        }

        if (phone !== undefined) profile.phone = phone;
        if (preferences) {
            profile.preferences = { ...profile.preferences.toObject(), ...preferences };
        }

        await profile.save();
        return profile;
    }

    // Add address
    async addAddress(userId, addressData) {
        let profile = await UserProfile.findOne({ userId });

        if (!profile) {
            profile = new UserProfile({ userId });
        }

        // If new address is default, unset other defaults
        if (addressData.isDefault) {
            profile.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        profile.addresses.push(addressData);
        await profile.save();

        return profile.addresses[profile.addresses.length - 1];
    }

    // Get all addresses
    async getAddresses(userId) {
        const profile = await UserProfile.findOne({ userId });
        return profile ? profile.addresses : [];
    }

    // Update address
    async updateAddress(userId, addressId, addressData) {
        const profile = await UserProfile.findOne({ userId });

        if (!profile) {
            throw new Error('Profile not found');
        }

        const address = profile.addresses.id(addressId);

        if (!address) {
            throw new Error('Address not found');
        }

        // If updating to default, unset other defaults
        if (addressData.isDefault) {
            profile.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        Object.assign(address, addressData);
        await profile.save();

        return address;
    }

    // Delete address
    async deleteAddress(userId, addressId) {
        const profile = await UserProfile.findOne({ userId });

        if (!profile) {
            throw new Error('Profile not found');
        }

        const address = profile.addresses.id(addressId);

        if (!address) {
            throw new Error('Address not found');
        }

        address.deleteOne();
        await profile.save();

        return { message: 'Address deleted successfully' };
    }
}

module.exports = new UserService();
