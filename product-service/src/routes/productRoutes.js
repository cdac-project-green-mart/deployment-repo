const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

// GET /api/products - Get all products (public)
router.get('/', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category').optional().isString(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('search').optional().isString(),
    validateRequest
], productController.getProducts);

// GET /api/products/categories - Get all categories (public)
router.get('/categories', productController.getCategories);

// GET /api/products/vendor/me - Get vendor's own products
router.get('/vendor/me', productController.getMyProducts);

// GET /api/products/:id - Get single product (public)
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid product ID'),
    validateRequest
], productController.getProductById);

// POST /api/products - Create product (Admin/Vendor only)
router.post('/', [
    body('name').notEmpty().withMessage('Product name is required').trim(),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required').trim(),
    body('images').optional().isArray(),
    body('images.*').optional().isURL().withMessage('Images must be valid URLs'),
    validateRequest
], productController.createProduct);

// PUT /api/products/:id - Update product (Admin/Vendor only)
router.put('/:id', [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('name').optional().notEmpty().trim(),
    body('description').optional().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().notEmpty().trim(),
    body('images').optional().isArray(),
    validateRequest
], productController.updateProduct);

// DELETE /api/products/:id - Delete product (Admin/Vendor only)
router.delete('/:id', [
    param('id').isMongoId().withMessage('Invalid product ID'),
    validateRequest
], productController.deleteProduct);

module.exports = router;
