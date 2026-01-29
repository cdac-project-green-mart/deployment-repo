const productService = require('../services/productService');

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

    // POST /api/products - Create new product (Admin/Vendor only)
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

            const product = await productService.createProduct(userId, req.body);

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/products/:id - Update product (Admin/Vendor only)
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

            const product = await productService.updateProduct(
                req.params.id,
                userId,
                userRole.toUpperCase(),
                req.body
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
