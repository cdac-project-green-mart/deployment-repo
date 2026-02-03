const inventoryService = require('../services/inventoryService');

class InventoryController {
    // GET /api/inventory - Get all inventory
    async getAllInventory(req, res, next) {
        try {
            const result = await inventoryService.getAllInventory(req.query);

            res.json({
                success: true,
                data: result.items,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/inventory/:productId - Get inventory for product
    async getInventory(req, res, next) {
        try {
            const inventory = await inventoryService.getInventory(req.params.productId);

            res.json({
                success: true,
                data: inventory
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/inventory/:productId - Set stock level
    async setStock(req, res, next) {
        try {
            const { quantity, lowStockThreshold } = req.body;

            const inventory = await inventoryService.setStock(
                req.params.productId,
                quantity,
                lowStockThreshold
            );

            res.json({
                success: true,
                message: 'Stock updated successfully',
                data: inventory
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/inventory/:productId/add - Add stock
    async addStock(req, res, next) {
        try {
            const { quantity } = req.body;

            const inventory = await inventoryService.addStock(
                req.params.productId,
                quantity
            );

            res.json({
                success: true,
                message: `Added ${quantity} units to stock`,
                data: inventory
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/inventory/:productId/reduce - Reduce stock
    async reduceStock(req, res, next) {
        try {
            const { quantity } = req.body;

            const inventory = await inventoryService.reduceStock(
                req.params.productId,
                quantity
            );

            res.json({
                success: true,
                message: `Reduced ${quantity} units from stock`,
                data: inventory
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/inventory/:productId/reserve - Reserve stock
    async reserveStock(req, res, next) {
        try {
            const { quantity } = req.body;

            const inventory = await inventoryService.reserveStock(
                req.params.productId,
                quantity
            );

            res.json({
                success: true,
                message: `Reserved ${quantity} units`,
                data: inventory
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/inventory/:productId/release - Release reserved stock
    async releaseStock(req, res, next) {
        try {
            const { quantity } = req.body;

            const inventory = await inventoryService.releaseStock(
                req.params.productId,
                quantity
            );

            res.json({
                success: true,
                message: `Released ${quantity} reserved units`,
                data: inventory
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/inventory/:productId/confirm - Confirm reservation
    async confirmReservation(req, res, next) {
        try {
            const { quantity } = req.body;

            const inventory = await inventoryService.confirmReservation(
                req.params.productId,
                quantity
            );

            res.json({
                success: true,
                message: `Confirmed reservation of ${quantity} units`,
                data: inventory
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/inventory/reserve - Bulk reserve (called by checkout service)
    async bulkReserveStock(req, res, next) {
        try {
            const { productId, quantity } = req.body;

            const inventory = await inventoryService.reserveStock(
                productId,
                quantity
            );

            res.json({
                success: true,
                message: `Reserved ${quantity} units for product ${productId}`,
                data: inventory
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/inventory/check-availability - Check stock for multiple products
    async checkAvailability(req, res, next) {
        try {
            const { items } = req.body;

            const result = await inventoryService.checkAvailability(items);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/inventory/confirm - Bulk confirm (called by checkout service after successful payment)
    async bulkConfirmStock(req, res, next) {
        try {
            const { productId, quantity } = req.body;

            const inventory = await inventoryService.confirmReservation(
                productId,
                quantity
            );

            res.json({
                success: true,
                message: `Confirmed ${quantity} units for product ${productId}`,
                data: inventory
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/inventory/release - Bulk release (called by checkout service on failure)
    async bulkReleaseStock(req, res, next) {
        try {
            const { productId, quantity } = req.body;

            const inventory = await inventoryService.releaseStock(
                productId,
                quantity
            );

            res.json({
                success: true,
                message: `Released ${quantity} reserved units for product ${productId}`,
                data: inventory
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/inventory/:productId - Delete inventory for a product
    async deleteInventory(req, res, next) {
        try {
            await inventoryService.deleteInventory(req.params.productId);

            res.json({
                success: true,
                message: 'Inventory deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new InventoryController();
