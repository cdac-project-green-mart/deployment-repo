const userService = require('../services/userService');

class UserController {
    // GET /api/users/profile
    async getProfile(req, res, next) {
        try {
            const userId = req.headers['x-user-id'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User ID not provided'
                });
            }

            const profile = await userService.getProfile(userId);

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/users/profile
    async updateProfile(req, res, next) {
        try {
            const userId = req.headers['x-user-id'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User ID not provided'
                });
            }

            const profile = await userService.updateProfile(userId, req.body);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/users/address
    async addAddress(req, res, next) {
        try {
            const userId = req.headers['x-user-id'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User ID not provided'
                });
            }

            const address = await userService.addAddress(userId, req.body);

            res.status(201).json({
                success: true,
                message: 'Address added successfully',
                data: address
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/users/addresses
    async getAddresses(req, res, next) {
        try {
            const userId = req.headers['x-user-id'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User ID not provided'
                });
            }

            const addresses = await userService.getAddresses(userId);

            res.json({
                success: true,
                data: addresses
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/users/address/:id
    async updateAddress(req, res, next) {
        try {
            const userId = req.headers['x-user-id'];
            const addressId = req.params.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User ID not provided'
                });
            }

            const address = await userService.updateAddress(userId, addressId, req.body);

            res.json({
                success: true,
                message: 'Address updated successfully',
                data: address
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/users/address/:id
    async deleteAddress(req, res, next) {
        try {
            const userId = req.headers['x-user-id'];
            const addressId = req.params.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User ID not provided'
                });
            }

            const result = await userService.deleteAddress(userId, addressId);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
