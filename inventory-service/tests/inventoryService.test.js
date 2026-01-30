// Unit tests for InventoryService
jest.mock('../src/models/Inventory');

const inventoryService = require('../src/services/inventoryService');
const Inventory = require('../src/models/Inventory');

describe('InventoryService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getInventory', () => {
        it('should return existing inventory', async () => {
            const mockInventory = {
                productId: 'prod-123',
                quantity: 100,
                reservedQuantity: 10,
                lowStockThreshold: 15
            };

            Inventory.findOne.mockResolvedValue(mockInventory);

            const result = await inventoryService.getInventory('prod-123');

            expect(Inventory.findOne).toHaveBeenCalledWith({ productId: 'prod-123' });
            expect(result).toEqual(mockInventory);
        });

        it('should create inventory if not exists', async () => {
            const mockCreatedInventory = {
                productId: 'prod-new',
                quantity: 0,
                reservedQuantity: 0,
                lowStockThreshold: 10
            };

            Inventory.findOne.mockResolvedValue(null);
            Inventory.create.mockResolvedValue(mockCreatedInventory);

            const result = await inventoryService.getInventory('prod-new');

            expect(Inventory.findOne).toHaveBeenCalledWith({ productId: 'prod-new' });
            expect(Inventory.create).toHaveBeenCalled();
            expect(result.quantity).toBe(0);
        });
    });

    describe('setStock', () => {
        it('should set stock level for existing inventory', async () => {
            const mockInventory = {
                productId: 'prod-123',
                quantity: 50,
                lowStockThreshold: 10,
                save: jest.fn().mockResolvedValue(true)
            };

            Inventory.findOne.mockResolvedValue(mockInventory);

            const result = await inventoryService.setStock('prod-123', 100, 20);

            expect(mockInventory.quantity).toBe(100);
            expect(mockInventory.lowStockThreshold).toBe(20);
            expect(mockInventory.save).toHaveBeenCalled();
        });

        it('should create new inventory if not exists', async () => {
            const mockNewInventory = {
                productId: 'prod-new',
                quantity: 0,
                save: jest.fn().mockResolvedValue(true)
            };

            Inventory.findOne.mockResolvedValue(null);
            Inventory.mockImplementation(() => mockNewInventory);

            const result = await inventoryService.setStock('prod-new', 50, 5);

            expect(mockNewInventory.quantity).toBe(50);
            expect(mockNewInventory.save).toHaveBeenCalled();
        });
    });

    describe('addStock', () => {
        it('should add stock to existing inventory', async () => {
            const mockInventory = {
                productId: 'prod-123',
                quantity: 50,
                save: jest.fn().mockResolvedValue(true)
            };

            Inventory.findOne.mockResolvedValue(mockInventory);

            const result = await inventoryService.addStock('prod-123', 25);

            expect(mockInventory.quantity).toBe(75);
            expect(mockInventory.save).toHaveBeenCalled();
        });

        it('should create new inventory with added stock', async () => {
            const mockNewInventory = {
                productId: 'prod-new',
                quantity: 0,
                save: jest.fn().mockResolvedValue(true)
            };

            Inventory.findOne.mockResolvedValue(null);
            Inventory.mockImplementation(() => mockNewInventory);

            const result = await inventoryService.addStock('prod-new', 30);

            expect(mockNewInventory.quantity).toBe(30);
            expect(mockNewInventory.save).toHaveBeenCalled();
        });
    });

    describe('reduceStock', () => {
        it('should reduce stock when sufficient', async () => {
            const mockInventory = {
                productId: 'prod-123',
                quantity: 100,
                reservedQuantity: 10,
                save: jest.fn().mockResolvedValue(true)
            };

            Inventory.findOne.mockResolvedValue(mockInventory);

            const result = await inventoryService.reduceStock('prod-123', 20);

            expect(mockInventory.quantity).toBe(80);
            expect(mockInventory.save).toHaveBeenCalled();
        });

        it('should throw error when inventory not found', async () => {
            Inventory.findOne.mockResolvedValue(null);

            await expect(inventoryService.reduceStock('prod-unknown', 10))
                .rejects.toThrow('Inventory not found');
        });

        it('should throw error when insufficient stock', async () => {
            const mockInventory = {
                productId: 'prod-123',
                quantity: 20,
                reservedQuantity: 15
            };

            Inventory.findOne.mockResolvedValue(mockInventory);

            await expect(inventoryService.reduceStock('prod-123', 10))
                .rejects.toThrow('Insufficient stock');
        });
    });

    describe('reserveStock', () => {
        it('should reserve stock when available', async () => {
            const mockInventory = {
                productId: 'prod-123',
                quantity: 100,
                reservedQuantity: 10,
                save: jest.fn().mockResolvedValue(true)
            };

            Inventory.findOne.mockResolvedValue(mockInventory);

            const result = await inventoryService.reserveStock('prod-123', 20);

            expect(mockInventory.reservedQuantity).toBe(30);
            expect(mockInventory.save).toHaveBeenCalled();
        });

        it('should throw error when inventory not found', async () => {
            Inventory.findOne.mockResolvedValue(null);

            await expect(inventoryService.reserveStock('prod-unknown', 10))
                .rejects.toThrow('Inventory not found');
        });

        it('should throw error when insufficient available stock', async () => {
            const mockInventory = {
                productId: 'prod-123',
                quantity: 50,
                reservedQuantity: 45
            };

            Inventory.findOne.mockResolvedValue(mockInventory);

            await expect(inventoryService.reserveStock('prod-123', 10))
                .rejects.toThrow('Insufficient stock');
        });
    });

    describe('releaseStock', () => {
        it('should release reserved stock', async () => {
            const mockInventory = {
                productId: 'prod-123',
                quantity: 100,
                reservedQuantity: 30,
                save: jest.fn().mockResolvedValue(true)
            };

            Inventory.findOne.mockResolvedValue(mockInventory);

            const result = await inventoryService.releaseStock('prod-123', 20);

            expect(mockInventory.reservedQuantity).toBe(10);
            expect(mockInventory.save).toHaveBeenCalled();
        });

        it('should not go below zero reserved', async () => {
            const mockInventory = {
                productId: 'prod-123',
                quantity: 100,
                reservedQuantity: 10,
                save: jest.fn().mockResolvedValue(true)
            };

            Inventory.findOne.mockResolvedValue(mockInventory);

            const result = await inventoryService.releaseStock('prod-123', 20);

            expect(mockInventory.reservedQuantity).toBe(0);
        });

        it('should throw error when inventory not found', async () => {
            Inventory.findOne.mockResolvedValue(null);

            await expect(inventoryService.releaseStock('prod-unknown', 10))
                .rejects.toThrow('Inventory not found');
        });
    });

    describe('confirmReservation', () => {
        it('should confirm reservation and reduce stock', async () => {
            const mockInventory = {
                productId: 'prod-123',
                quantity: 100,
                reservedQuantity: 30,
                save: jest.fn().mockResolvedValue(true)
            };

            Inventory.findOne.mockResolvedValue(mockInventory);

            const result = await inventoryService.confirmReservation('prod-123', 20);

            expect(mockInventory.quantity).toBe(80);
            expect(mockInventory.reservedQuantity).toBe(10);
            expect(mockInventory.save).toHaveBeenCalled();
        });

        it('should throw error when inventory not found', async () => {
            Inventory.findOne.mockResolvedValue(null);

            await expect(inventoryService.confirmReservation('prod-unknown', 10))
                .rejects.toThrow('Inventory not found');
        });
    });

    describe('checkAvailability', () => {
        it('should check availability for multiple products', async () => {
            Inventory.findOne
                .mockResolvedValueOnce({ productId: 'prod-1', quantity: 100, reservedQuantity: 10 })
                .mockResolvedValueOnce({ productId: 'prod-2', quantity: 5, reservedQuantity: 0 });

            const items = [
                { productId: 'prod-1', quantity: 50 },
                { productId: 'prod-2', quantity: 10 }
            ];

            const result = await inventoryService.checkAvailability(items);

            expect(result.items).toHaveLength(2);
            expect(result.items[0].sufficient).toBe(true);
            expect(result.items[1].sufficient).toBe(false);
            expect(result.allAvailable).toBe(false);
        });

        it('should return all available when sufficient', async () => {
            Inventory.findOne
                .mockResolvedValueOnce({ productId: 'prod-1', quantity: 100, reservedQuantity: 0 })
                .mockResolvedValueOnce({ productId: 'prod-2', quantity: 50, reservedQuantity: 0 });

            const items = [
                { productId: 'prod-1', quantity: 50 },
                { productId: 'prod-2', quantity: 25 }
            ];

            const result = await inventoryService.checkAvailability(items);

            expect(result.allAvailable).toBe(true);
        });

        it('should handle missing inventory as zero available', async () => {
            Inventory.findOne.mockResolvedValue(null);

            const items = [{ productId: 'prod-missing', quantity: 10 }];

            const result = await inventoryService.checkAvailability(items);

            expect(result.items[0].available).toBe(0);
            expect(result.items[0].sufficient).toBe(false);
        });
    });
});
