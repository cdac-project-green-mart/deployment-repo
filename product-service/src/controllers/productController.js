const productService = require('../services/productService');
const imageService = require('../services/imageService');

class ProductController {
    // GET /api/products - Get all products with pagination
    async getProducts(req, res, next) {
        try {
            const result = await productService.getProducts(req.query);

            res.json({
                success: true,
                data: result.products,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/products/categories - Get all categories
    async getCategories(req, res, next) {
        try {
            const categories = await productService.getCategories();

            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/products/:id - Get single product
    async getProductById(req, res, next) {
        try {
            const product = await productService.getProductById(req.params.id);

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/products - Create new product with images (REQUIRED)
    async createProduct(req, res, next) {
        try {
            const userId = req.headers['x-user-id'];
            const userRole = req.headers['x-user-role'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User ID not provided'
                });
            }

            // Check if user is admin or vendor
            if (!userRole || !['ADMIN', 'VENDOR'].includes(userRole.toUpperCase())) {
                return res.status(403).json({
                    success: false,
                    message: 'Only admins and vendors can create products'
                });
            }

            // Handle images: either from file uploads or from JSON body
            let imageUrls = [];
            if (req.files && req.files.length > 0) {
                // Files uploaded via multipart/form-data
                imageUrls = await imageService.uploadImages(req.files);
            } else if (req.body.images && Array.isArray(req.body.images)) {
                // Image URLs provided in JSON body
                imageUrls = req.body.images;
            } else if (typeof req.body.images === 'string') {
                // Single image URL as string
                imageUrls = [req.body.images];
            }

            // REQUIRE at least one image
            if (imageUrls.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one product image is required'
                });
            }

            // Create product with image URLs
            const productData = {
                ...req.body,
                images: imageUrls
            };

            const product = await productService.createProduct(userId, productData);

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/products/:id - Update product with optional images (Admin/Vendor only)
    async updateProduct(req, res, next) {
        try {
            const userId = req.headers['x-user-id'];
            const userRole = req.headers['x-user-role'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User ID not provided'
                });
            }

            if (!userRole || !['ADMIN', 'VENDOR'].includes(userRole.toUpperCase())) {
                return res.status(403).json({
                    success: false,
                    message: 'Only admins and vendors can update products'
                });
            }

            // Handle image updates: either from file uploads or from JSON body
            let updateData = { ...req.body };

            if (req.files && req.files.length > 0) {
                // Files uploaded via multipart/form-data - upload and use new URLs
                const imageUrls = await imageService.uploadImages(req.files);
                updateData.images = imageUrls;
            } else if (req.body.images && Array.isArray(req.body.images)) {
                // Image URLs provided in JSON body
                updateData.images = req.body.images;
            } else if (typeof req.body.images === 'string') {
                // Single image URL as string
                updateData.images = [req.body.images];
            }
            // If no images provided, don't update images field (keep existing)

            const product = await productService.updateProduct(
                req.params.id,
                userId,
                userRole.toUpperCase(),
                updateData
            );

            res.json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/products/:id - Delete product (Admin/Vendor only)
    async deleteProduct(req, res, next) {
        try {
            const userId = req.headers['x-user-id'];
            const userRole = req.headers['x-user-role'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User ID not provided'
                });
            }

            if (!userRole || !['ADMIN', 'VENDOR'].includes(userRole.toUpperCase())) {
                return res.status(403).json({
                    success: false,
                    message: 'Only admins and vendors can delete products'
                });
            }

            const result = await productService.deleteProduct(
                req.params.id,
                userId,
                userRole.toUpperCase()
            );

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/products/vendor/me - Get vendor's products
    async getMyProducts(req, res, next) {
        try {
            const userId = req.headers['x-user-id'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User ID not provided'
                });
            }

            const products = await productService.getProductsByVendor(userId);

            res.json({
                success: true,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
