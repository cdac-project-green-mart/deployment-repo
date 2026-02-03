const Product = require('../models/Product');

class ProductService {
    // Get all products with pagination and filters
    async getProducts(query) {
        const {
            page = 1,
            limit = 20,
            category,
            minPrice,
            maxPrice,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = query;

        const filter = {};

        // Category filter
        if (category) {
            filter.category = category;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Text search
        if (search) {
            filter.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Product.countDocuments(filter)
        ]);

        return {
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    // Get single product by ID
    async getProductById(productId) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    // Create new product
    async createProduct(userId, productData) {
        const product = new Product({
            ...productData,
            userId
        });
        await product.save();
        return product;
    }

    // Update product
    async updateProduct(productId, userId, userRole, updateData) {
        const product = await Product.findById(productId);

        if (!product) {
            throw new Error('Product not found');
        }

        // Check ownership (vendors can only update their own products)
        if (userRole !== 'ADMIN' && product.userId !== userId) {
            throw new Error('Unauthorized to update this product');
        }

        // Update allowed fields
        const allowedUpdates = ['name', 'description', 'price', 'category', 'images'];
        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                product[field] = updateData[field];
            }
        });

        await product.save();
        return product;
    }

    // Delete product
    async deleteProduct(productId, userId, userRole) {
        const product = await Product.findById(productId);

        if (!product) {
            throw new Error('Product not found');
        }

        // Check ownership (vendors can only delete their own products)
        if (userRole !== 'ADMIN' && product.userId !== userId) {
            throw new Error('Unauthorized to delete this product');
        }

        await product.deleteOne();

        // Clean up inventory data
        try {
            const axios = require('axios');
            const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:8086';
            await axios.delete(`${inventoryUrl}/api/inventory/${productId}`);
            console.log(`Inventory deleted for product ${productId}`);
        } catch (error) {
            // Log but don't fail - inventory cleanup is best effort
            console.warn(`Failed to delete inventory for product ${productId}:`, error.message);
        }

        return { message: 'Product deleted successfully' };
    }

    // Get products by vendor
    async getProductsByVendor(userId) {
        return Product.find({ userId }).sort({ createdAt: -1 });
    }

    // Get all categories
    async getCategories() {
        return Product.distinct('category');
    }
}

module.exports = new ProductService();
