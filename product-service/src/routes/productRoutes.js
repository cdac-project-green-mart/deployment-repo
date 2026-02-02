const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');
const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

// Configure multer for memory storage (files in buffer for S3 upload)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        cb(null, allowed.includes(file.mimetype));
    }
});

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
    param('id').notEmpty().withMessage('Product ID is required'),
    validateRequest
], productController.getProductById);

// POST /api/products - Create product with images (Admin/Vendor only)
// Supports both: multipart/form-data with file uploads OR JSON with image URLs
// At least one image is REQUIRED
const conditionalUpload = (req, res, next) => {
    // If Content-Type is JSON, skip multer
    if (req.is('application/json')) {
        return next();
    }
    // Otherwise use multer for multipart/form-data
    upload.array('images', 5)(req, res, next);
};

router.post('/', conditionalUpload, [
    body('name').notEmpty().withMessage('Product name is required').trim(),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required').trim(),
    // Images validated in controller (can be files or URLs)
    validateRequest
], productController.createProduct);

// PUT /api/products/:id - Update product with optional image update (Admin/Vendor only)
// Supports both: multipart/form-data with file uploads OR JSON with image URLs
router.put('/:id', conditionalUpload, [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('name').optional().notEmpty().trim(),
    body('description').optional().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().notEmpty().trim(),
    // Images can be updated via files or URLs array
    validateRequest
], productController.updateProduct);

// DELETE /api/products/:id - Delete product (Admin/Vendor only)
router.delete('/:id', [
    param('id').isMongoId().withMessage('Invalid product ID'),
    validateRequest
], productController.deleteProduct);

module.exports = router;
