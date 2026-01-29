const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

// GET /api/users/profile - Get current user's profile
router.get('/profile', userController.getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', [
    body('phone').optional().isString(),
    body('preferences.newsletter').optional().isBoolean(),
    body('preferences.theme').optional().isString(),
    validateRequest
], userController.updateProfile);

// POST /api/users/address - Add new address
router.post('/address', [
    body('street').optional().isString(),
    body('city').optional().isString(),
    body('state').optional().isString(),
    body('zip').optional().isString(),
    body('country').optional().isString(),
    body('isDefault').optional().isBoolean(),
    validateRequest
], userController.addAddress);

// GET /api/users/addresses - Get all addresses
router.get('/addresses', userController.getAddresses);

// PUT /api/users/address/:id - Update address
router.put('/address/:id', [
    param('id').isMongoId().withMessage('Invalid address ID'),
    body('street').optional().isString(),
    body('city').optional().isString(),
    body('state').optional().isString(),
    body('zip').optional().isString(),
    body('country').optional().isString(),
    body('isDefault').optional().isBoolean(),
    validateRequest
], userController.updateAddress);

// DELETE /api/users/address/:id - Delete address
router.delete('/address/:id', [
    param('id').isMongoId().withMessage('Invalid address ID'),
    validateRequest
], userController.deleteAddress);

module.exports = router;
