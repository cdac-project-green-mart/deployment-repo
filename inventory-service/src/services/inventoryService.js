const Inventory = require('../models/Inventory');
const { publishLowStockAlert } = require('./messagePublisher');

class InventoryService {
    // Get inventory for a product
    async getInventory(productId) {
        let inventory = await Inventory.findOne({ productId });

        if (!inventory) {
            // Create default inventory if not exists
            inventory = await Inventory.create({
                productId,
                quantity: 0,
                lowStockThreshold: parseInt(process.env.LOW_STOCK_THRESHOLD) || 10
            });
        }

        return inventory;
    }

    // Get all inventory items with optional low stock filter
    async getAllInventory(query) {
        const { lowStockOnly, page = 1, limit = 50 } = query;

        const filter = {};

        if (lowStockOnly === 'true') {
            filter.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [items, total] = await Promise.all([
            Inventory.find(filter).skip(skip).limit(parseInt(limit)).sort({ updatedAt: -1 }),
            Inventory.countDocuments(filter)
        ]);

        return {
            items,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    // Set stock level (absolute)
    async setStock(productId, quantity, lowStockThreshold) {
        let inventory = await Inventory.findOne({ productId });

        if (!inventory) {
            inventory = new Inventory({ productId });
        }

        inventory.quantity = quantity;
        if (lowStockThreshold !== undefined) {
            inventory.lowStockThreshold = lowStockThreshold;
        }

        await inventory.save();

        // Check and publish low-stock alert
        await this.checkAndPublishLowStock(inventory);

        return inventory;
    }

    // Add stock (increment)
    async addStock(productId, quantity) {
        let inventory = await Inventory.findOne({ productId });

        if (!inventory) {
            inventory = new Inventory({ productId, quantity: 0 });
        }

        inventory.quantity += quantity;
        await inventory.save();

        // Check and publish low-stock alert
        await this.checkAndPublishLowStock(inventory);

        return inventory;
    }

    // Reduce stock (decrement)
    async reduceStock(productId, quantity) {
        const inventory = await Inventory.findOne({ productId });

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        const available = inventory.quantity - inventory.reservedQuantity;

        if (available < quantity) {
            throw new Error(`Insufficient stock. Available: ${available}, Requested: ${quantity}`);
        }

        inventory.quantity -= quantity;
        await inventory.save();

        // Check and publish low-stock alert
        await this.checkAndPublishLowStock(inventory);

        return inventory;
    }

    // Reserve stock for an order
    async reserveStock(productId, quantity) {
        const inventory = await Inventory.findOne({ productId });

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        const available = inventory.quantity - inventory.reservedQuantity;

        if (available < quantity) {
            throw new Error(`Insufficient stock. Available: ${available}, Requested: ${quantity}`);
        }

        inventory.reservedQuantity += quantity;
        await inventory.save();

        return inventory;
    }

    // Release reserved stock (cancel reservation)
    async releaseStock(productId, quantity) {
        const inventory = await Inventory.findOne({ productId });

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);
        await inventory.save();

        return inventory;
    }

    // Confirm reserved stock (convert reservation to actual reduction)
    async confirmReservation(productId, quantity) {
        const inventory = await Inventory.findOne({ productId });

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);
        inventory.quantity = Math.max(0, inventory.quantity - quantity);
        await inventory.save();

        // Check and publish low-stock alert
        await this.checkAndPublishLowStock(inventory);

        return inventory;
    }

    // Check stock availability for multiple products
    async checkAvailability(items) {
        const results = await Promise.all(
            items.map(async (item) => {
                const inventory = await Inventory.findOne({ productId: item.productId });
                const available = inventory
                    ? inventory.quantity - inventory.reservedQuantity
                    : 0;

                return {
                    productId: item.productId,
                    requested: item.quantity,
                    available,
                    sufficient: available >= item.quantity
                };
            })
        );

        return {
            items: results,
            allAvailable: results.every(r => r.sufficient)
        };
    }

    // Delete inventory for a product (called when product is deleted)
    async deleteInventory(productId) {
        const result = await Inventory.deleteOne({ productId });
        return result.deletedCount > 0;
    }

    // Helper method to check and publish low-stock alerts
    async checkAndPublishLowStock(inventory) {
        try {
            // Check if stock is low using the virtual `isLowStock` property
            if (inventory.quantity <= inventory.lowStockThreshold) {
                await publishLowStockAlert(
                    inventory.productId,
                    inventory.quantity,
                    inventory.lowStockThreshold
                );
            }
        } catch (error) {
            // Log error but don't fail the operation
            console.error('Failed to publish low-stock alert:', error.message);
        }
    }
}

module.exports = new InventoryService();
