// Product Service (Production)
db = db.getSiblingDB('product_service');
const CDN = 'https://green-mart-product-storage.sfo3.cdn.digitaloceanspaces.com/products';
const ADMIN = '00000000-0000-4000-a000-000000000001';
const now = new Date();

if (db.products.countDocuments() === 0) {
    db.products.insertMany([
        { _id: 'prod_001_apple', name: 'Organic Apple', userId: ADMIN, description: 'Fresh organic apples.', price: 2.99, category: 'Fruits', images: [`${CDN}/apple.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_002_tomato', name: 'Fresh Tomato', userId: ADMIN, description: 'Vine-ripened tomatoes.', price: 1.49, category: 'Vegetables', images: [`${CDN}/tomato.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_003_potatoes', name: 'Organic Potatoes', userId: ADMIN, description: 'Fresh organic potatoes.', price: 4.99, category: 'Vegetables', images: [`${CDN}/potatoes.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_004_mango', name: 'Fresh Mango', userId: ADMIN, description: 'Sweet juicy mangoes.', price: 3.99, category: 'Fruits', images: [`${CDN}/mango.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_005_cabbage', name: 'Fresh Cabbage', userId: ADMIN, description: 'Crisp green cabbage.', price: 2.99, category: 'Vegetables', images: [`${CDN}/cabbage.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_006_capsicum', name: 'Green Capsicum', userId: ADMIN, description: 'Fresh bell peppers.', price: 2.49, category: 'Vegetables', images: [`${CDN}/capsicum.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_007_cauliflower', name: 'Fresh Cauliflower', userId: ADMIN, description: 'Organic cauliflower.', price: 3.99, category: 'Vegetables', images: [`${CDN}/cauliflower.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_008_chili', name: 'Red Chili', userId: ADMIN, description: 'Fresh red chilies.', price: 0.99, category: 'Vegetables', images: [`${CDN}/chili.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_009_chinese_cabbage', name: 'Chinese Cabbage', userId: ADMIN, description: 'Fresh napa cabbage.', price: 3.49, category: 'Vegetables', images: [`${CDN}/chinese-cabbage.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_010_corn', name: 'Sweet Corn', userId: ADMIN, description: 'Fresh sweet corn.', price: 1.99, category: 'Vegetables', images: [`${CDN}/corn.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_011_eggplant', name: 'Fresh Eggplant', userId: ADMIN, description: 'Organic eggplant.', price: 2.99, category: 'Vegetables', images: [`${CDN}/eggplant.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_012_lettuce', name: 'Fresh Lettuce', userId: ADMIN, description: 'Crisp lettuce.', price: 1.99, category: 'Vegetables', images: [`${CDN}/lettuce.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_013_orange', name: 'Fresh Orange', userId: ADMIN, description: 'Juicy oranges.', price: 3.49, category: 'Fruits', images: [`${CDN}/orange.jpg`], createdAt: now, updatedAt: now },
        { _id: 'prod_014_red_capsicum', name: 'Red Capsicum', userId: ADMIN, description: 'Sweet red peppers.', price: 3.49, category: 'Vegetables', images: [`${CDN}/red-capsicum.jpg`], createdAt: now, updatedAt: now }
    ]);
    print('✅ Products seeded');
} else { print('ℹ️ Products exist, skipping'); }
