// Inventory Service (Production)
db = db.getSiblingDB('inventory_service');
const now = new Date();
const products = ['prod_001_apple', 'prod_002_tomato', 'prod_003_potatoes', 'prod_004_mango', 'prod_005_cabbage', 'prod_006_capsicum', 'prod_007_cauliflower', 'prod_008_chili', 'prod_009_chinese_cabbage', 'prod_010_corn', 'prod_011_eggplant', 'prod_012_lettuce', 'prod_013_orange', 'prod_014_red_capsicum'];

if (db.inventory.countDocuments() === 0) {
    products.forEach(p => db.inventory.insertOne({ productId: p, quantity: 100, reservedQuantity: 0, lowStockThreshold: 20, createdAt: now, updatedAt: now }));
    print('✅ Inventory seeded');
} else { print('ℹ️ Inventory exists, skipping'); }
