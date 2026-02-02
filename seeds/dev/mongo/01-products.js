// Product Service Seed Data (Development)
// CDN: https://green-mart-product-storage.sfo3.cdn.digitaloceanspaces.com/products/

db = db.getSiblingDB('product_service');

const CDN = 'https://green-mart-product-storage.sfo3.cdn.digitaloceanspaces.com/products';
const V1 = '00000000-0000-4000-a000-000000000002'; // Fresh Farms
const V2 = '00000000-0000-4000-a000-000000000003'; // Green Grocer
const V3 = '00000000-0000-4000-a000-000000000004'; // Organic Delights
const now = new Date();

db.products.deleteMany({ _id: /^prod_/ });

db.products.insertMany([
    { _id: 'prod_001_apple', name: 'Organic Apple', userId: V1, description: 'Fresh organic apples. Crisp, sweet, perfect for snacking.', price: 2.99, category: 'Fruits', images: [`${CDN}/apple.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_002_tomato', name: 'Fresh Tomato', userId: V1, description: 'Vine-ripened tomatoes. Sweet, juicy, perfect for salads.', price: 1.49, category: 'Vegetables', images: [`${CDN}/tomato.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_003_potatoes', name: 'Organic Potatoes', userId: V1, description: 'Fresh organic potatoes. Perfect for roasting or mashing.', price: 4.99, category: 'Vegetables', images: [`${CDN}/potatoes.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_004_mango', name: 'Fresh Mango', userId: V2, description: 'Sweet juicy mangoes. Perfect for smoothies.', price: 3.99, category: 'Fruits', images: [`${CDN}/mango.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_005_cabbage', name: 'Fresh Cabbage', userId: V2, description: 'Crisp green cabbage. Perfect for coleslaw.', price: 2.99, category: 'Vegetables', images: [`${CDN}/cabbage.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_006_capsicum', name: 'Green Capsicum', userId: V2, description: 'Fresh green bell peppers. Crunchy and flavorful.', price: 2.49, category: 'Vegetables', images: [`${CDN}/capsicum.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_007_cauliflower', name: 'Fresh Cauliflower', userId: V3, description: 'Organic cauliflower. Great for roasting or steaming.', price: 3.99, category: 'Vegetables', images: [`${CDN}/cauliflower.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_008_chili', name: 'Red Chili', userId: V3, description: 'Fresh red chilies. Add spice to any dish.', price: 0.99, category: 'Vegetables', images: [`${CDN}/chili.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_009_chinese_cabbage', name: 'Chinese Cabbage', userId: V3, description: 'Fresh napa cabbage. Perfect for stir-fries.', price: 3.49, category: 'Vegetables', images: [`${CDN}/chinese-cabbage.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_010_corn', name: 'Sweet Corn', userId: V1, description: 'Fresh sweet corn. Perfect for grilling.', price: 1.99, category: 'Vegetables', images: [`${CDN}/corn.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_011_eggplant', name: 'Fresh Eggplant', userId: V2, description: 'Organic eggplant. Rich, meaty texture.', price: 2.99, category: 'Vegetables', images: [`${CDN}/eggplant.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_012_lettuce', name: 'Fresh Lettuce', userId: V3, description: 'Crisp iceberg lettuce. Perfect for salads.', price: 1.99, category: 'Vegetables', images: [`${CDN}/lettuce.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_013_orange', name: 'Fresh Orange', userId: V1, description: 'Juicy navel oranges. Sweet and tangy.', price: 3.49, category: 'Fruits', images: [`${CDN}/orange.jpg`], createdAt: now, updatedAt: now },
    { _id: 'prod_014_red_capsicum', name: 'Red Capsicum', userId: V2, description: 'Sweet red bell peppers. Perfect for roasting.', price: 3.49, category: 'Vegetables', images: [`${CDN}/red-capsicum.jpg`], createdAt: now, updatedAt: now }
]);

print('✅ Products seeded: ' + db.products.countDocuments());
