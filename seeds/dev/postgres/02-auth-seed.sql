-- Auth Service Seed Data (Development)
\c auth_service;

-- Clear existing seed data
DELETE FROM users WHERE email IN (
    'admin@greenmart.com', 'vendor@freshfarms.com', 'vendor@greengrocer.com',
    'vendor@organicdelights.com', 'john@example.com', 'jane@example.com', 'bob@example.com'
);

-- Insert seed users (Password: admin123, vendor123, customer123 - bcrypt hashed)
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES
('00000000-0000-4000-a000-000000000001', 'Admin User', 'admin@greenmart.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PYzG6HTGH1h0K.DyGq', 'ADMIN', NOW(), NOW()),
('00000000-0000-4000-a000-000000000002', 'Fresh Farms', 'vendor@freshfarms.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.PaXvH.pXxPpLK5pqEJB0ZKuP4UwPqG', 'VENDOR', NOW(), NOW()),
('00000000-0000-4000-a000-000000000003', 'Green Grocer', 'vendor@greengrocer.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.PaXvH.pXxPpLK5pqEJB0ZKuP4UwPqG', 'VENDOR', NOW(), NOW()),
('00000000-0000-4000-a000-000000000004', 'Organic Delights', 'vendor@organicdelights.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.PaXvH.pXxPpLK5pqEJB0ZKuP4UwPqG', 'VENDOR', NOW(), NOW()),
('00000000-0000-4000-a000-000000000005', 'John Doe', 'john@example.com', '$2a$10$Dg.53NJ6zBKgPj5hD6xL8O8l0wYwL4UKKxzJ7K2hZPu7j1XY8h0HC', 'CUSTOMER', NOW(), NOW()),
('00000000-0000-4000-a000-000000000006', 'Jane Smith', 'jane@example.com', '$2a$10$Dg.53NJ6zBKgPj5hD6xL8O8l0wYwL4UKKxzJ7K2hZPu7j1XY8h0HC', 'CUSTOMER', NOW(), NOW()),
('00000000-0000-4000-a000-000000000007', 'Bob Wilson', 'bob@example.com', '$2a$10$Dg.53NJ6zBKgPj5hD6xL8O8l0wYwL4UKKxzJ7K2hZPu7j1XY8h0HC', 'CUSTOMER', NOW(), NOW());

SELECT id, name, email, role FROM users ORDER BY role, name;
