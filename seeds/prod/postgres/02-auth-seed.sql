-- Auth Service Seed Data (Production) - 3 Users: Admin, Vendor, Customer
\c auth_service;

-- Admin User
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) 
SELECT '00000000-0000-4000-a000-000000000001', 'Green Mart Admin', 'admin@greenmart.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOeJPcP5bXfQEPqYKy5H5LzBY5l5EhKpG', 'ADMIN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@greenmart.com');

-- Vendor User
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) 
SELECT '00000000-0000-4000-a000-000000000002', 'Organic Farms Vendor', 'vendor@organicfarms.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOeJPcP5bXfQEPqYKy5H5LzBY5l5EhKpG', 'VENDOR', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'vendor@organicfarms.com');

-- Customer User
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) 
SELECT '00000000-0000-4000-a000-000000000003', 'John Customer', 'customer@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOeJPcP5bXfQEPqYKy5H5LzBY5l5EhKpG', 'CUSTOMER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'customer@example.com');

-- Production Credentials:
-- Admin:    admin@greenmart.com     / Admin@GreenMart2024
-- Vendor:   vendor@organicfarms.com / Vendor@Organic2024
-- Customer: customer@example.com    / Customer@Shop2024
-- (password_hash above is placeholder - actual passwords handled by auth-service registration)
