const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

// GET /api/inventory - Get all inventory
router.get('/', [
    query('lowStockOnly').optional().isIn(['true', 'false']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest
], inventoryController.getAllInventory);

// POST /api/inventory/check-availability - Check stock for multiple products
router.post('/check-availability', [
    body('items').isArray({ min: 1 }).withMessage('Items array is required'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateRequest
], inventoryController.checkAvailability);

// POST /api/inventory/reserve - Bulk reserve (called by checkout service)
router.post('/reserve', [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateRequest
], inventoryController.bulkReserveStock);

// GET /api/inventory/:productId - Get inventory for product
router.get('/:productId', inventoryController.getInventory);

// PUT /api/inventory/:productId - Set stock level
router.put('/:productId', [
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
    body('lowStockThreshold').optional().isInt({ min: 0 }),
    validateRequest
], inventoryController.setStock);

// POST /api/inventory/:productId/add - Add stock
router.post('/:productId/add', [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateRequest
], inventoryController.addStock);

// POST /api/inventory/:productId/reduce - Reduce stock
router.post('/:productId/reduce', [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateRequest
], inventoryController.reduceStock);

// POST /api/inventory/:productId/reserve - Reserve stock
router.post('/:productId/reserve', [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateRequest
], inventoryController.reserveStock);

// POST /api/inventory/:productId/release - Release reserved stock
router.post('/:productId/release', [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateRequest
], inventoryController.releaseStock);

// POST /api/inventory/:productId/confirm - Confirm reservation
router.post('/:productId/confirm', [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateRequest
], inventoryController.confirmReservation);

module.exports = router;
