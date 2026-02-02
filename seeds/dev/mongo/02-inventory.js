// Inventory Service Seed Data (Development)
db = db.getSiblingDB('inventory_service');

const productIds = [
    'prod_001_apple', 'prod_002_tomato', 'prod_003_potatoes', 'prod_004_mango',
    'prod_005_cabbage', 'prod_006_capsicum', 'prod_007_cauliflower', 'prod_008_chili',
    'prod_009_chinese_cabbage', 'prod_010_corn', 'prod_011_eggplant', 'prod_012_lettuce',
    'prod_013_orange', 'prod_014_red_capsicum'
];

db.inventory.deleteMany({ productId: { $in: productIds } });

const now = new Date();
db.inventory.insertMany([
    { productId: 'prod_001_apple', quantity: 150, reservedQuantity: 10, lowStockThreshold: 20, createdAt: now, updatedAt: now },
    { productId: 'prod_002_tomato', quantity: 200, reservedQuantity: 15, lowStockThreshold: 30, createdAt: now, updatedAt: now },
    { productId: 'prod_003_potatoes', quantity: 180, reservedQuantity: 5, lowStockThreshold: 25, createdAt: now, updatedAt: now },
    { productId: 'prod_004_mango', quantity: 100, reservedQuantity: 20, lowStockThreshold: 15, createdAt: now, updatedAt: now },
    { productId: 'prod_005_cabbage', quantity: 80, reservedQuantity: 5, lowStockThreshold: 15, createdAt: now, updatedAt: now },
    { productId: 'prod_006_capsicum', quantity: 120, reservedQuantity: 10, lowStockThreshold: 20, createdAt: now, updatedAt: now },
    { productId: 'prod_007_cauliflower', quantity: 60, reservedQuantity: 8, lowStockThreshold: 10, createdAt: now, updatedAt: now },
    { productId: 'prod_008_chili', quantity: 250, reservedQuantity: 20, lowStockThreshold: 40, createdAt: now, updatedAt: now },
    { productId: 'prod_009_chinese_cabbage', quantity: 45, reservedQuantity: 5, lowStockThreshold: 8, createdAt: now, updatedAt: now },
    { productId: 'prod_010_corn', quantity: 100, reservedQuantity: 12, lowStockThreshold: 18, createdAt: now, updatedAt: now },
    { productId: 'prod_011_eggplant', quantity: 70, reservedQuantity: 6, lowStockThreshold: 12, createdAt: now, updatedAt: now },
    { productId: 'prod_012_lettuce', quantity: 90, reservedQuantity: 10, lowStockThreshold: 15, createdAt: now, updatedAt: now },
    { productId: 'prod_013_orange', quantity: 130, reservedQuantity: 15, lowStockThreshold: 20, createdAt: now, updatedAt: now },
    { productId: 'prod_014_red_capsicum', quantity: 85, reservedQuantity: 8, lowStockThreshold: 12, createdAt: now, updatedAt: now }
]);

print('✅ Inventory seeded: ' + db.inventory.countDocuments());
