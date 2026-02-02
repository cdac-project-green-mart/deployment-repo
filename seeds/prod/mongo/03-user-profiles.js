// User Service (Production) - 3 User Profiles
db = db.getSiblingDB('user_service');
const now = new Date();

const USERS = [
    { userId: '00000000-0000-4000-a000-000000000001', name: 'Green Mart Admin', role: 'ADMIN' },
    { userId: '00000000-0000-4000-a000-000000000002', name: 'Organic Farms Vendor', role: 'VENDOR' },
    { userId: '00000000-0000-4000-a000-000000000003', name: 'John Customer', role: 'CUSTOMER' }
];

USERS.forEach(user => {
    if (db.user_profiles.countDocuments({ userId: user.userId }) === 0) {
        db.user_profiles.insertOne({
            userId: user.userId,
            phone: null,
            addresses: [],
            preferences: { newsletter: false, theme: 'light' },
            createdAt: now,
            updatedAt: now
        });
        print(`✅ ${user.role} profile created: ${user.name}`);
    } else {
        print(`ℹ️ ${user.role} profile exists`);
    }
});
