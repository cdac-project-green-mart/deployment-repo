// User Service Seed Data (Development)
db = db.getSiblingDB('user_service');

const userIds = [
    '00000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002',
    '00000000-0000-4000-a000-000000000003', '00000000-0000-4000-a000-000000000004',
    '00000000-0000-4000-a000-000000000005', '00000000-0000-4000-a000-000000000006',
    '00000000-0000-4000-a000-000000000007'
];

db.user_profiles.deleteMany({ userId: { $in: userIds } });

const now = new Date();
db.user_profiles.insertMany([
    { userId: '00000000-0000-4000-a000-000000000001', phone: '+91-9876543210', addresses: [{ id: 'addr_1', street: 'Green Mart HQ', city: 'Bangalore', state: 'Karnataka', zip: '560001', country: 'India', isDefault: true }], preferences: { newsletter: true, theme: 'dark' }, createdAt: now, updatedAt: now },
    { userId: '00000000-0000-4000-a000-000000000002', phone: '+91-9876543211', addresses: [{ id: 'addr_2', street: 'Fresh Farms Warehouse', city: 'Pune', state: 'Maharashtra', zip: '411001', country: 'India', isDefault: true }], preferences: { newsletter: true, theme: 'light' }, createdAt: now, updatedAt: now },
    { userId: '00000000-0000-4000-a000-000000000003', phone: '+91-9876543212', addresses: [{ id: 'addr_3', street: 'Green Grocer Store', city: 'Mumbai', state: 'Maharashtra', zip: '400001', country: 'India', isDefault: true }], preferences: { newsletter: false, theme: 'light' }, createdAt: now, updatedAt: now },
    { userId: '00000000-0000-4000-a000-000000000004', phone: '+91-9876543213', addresses: [{ id: 'addr_4', street: 'Organic Delights Farm', city: 'Nashik', state: 'Maharashtra', zip: '422001', country: 'India', isDefault: true }], preferences: { newsletter: true, theme: 'dark' }, createdAt: now, updatedAt: now },
    { userId: '00000000-0000-4000-a000-000000000005', phone: '+1-555-0105', addresses: [{ id: 'addr_5', street: '123 Apple Street', city: 'New York', state: 'NY', zip: '10001', country: 'USA', isDefault: true }], preferences: { newsletter: true, theme: 'dark' }, createdAt: now, updatedAt: now },
    { userId: '00000000-0000-4000-a000-000000000006', phone: '+1-555-0106', addresses: [{ id: 'addr_6', street: '456 Mango Avenue', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA', isDefault: true }], preferences: { newsletter: true, theme: 'light' }, createdAt: now, updatedAt: now },
    { userId: '00000000-0000-4000-a000-000000000007', phone: '+1-555-0107', addresses: [{ id: 'addr_7', street: '789 Chili Lane', city: 'Chicago', state: 'IL', zip: '60601', country: 'USA', isDefault: true }], preferences: { newsletter: false, theme: 'dark' }, createdAt: now, updatedAt: now }
]);

print('✅ User profiles seeded: ' + db.user_profiles.countDocuments());
