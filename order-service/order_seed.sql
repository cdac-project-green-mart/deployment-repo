-- Order Service Seed Data for Testing
-- Run this in PostgreSQL after starting the order-service

-- Clear existing test data
DELETE FROM shipping_addresses WHERE order_id IN (
    SELECT id FROM orders WHERE user_id IN ('user_001', 'user_002', 'user_003', 'user_test_orders')
);
DELETE FROM order_items WHERE order_id IN (
    SELECT id FROM orders WHERE user_id IN ('user_001', 'user_002', 'user_003', 'user_test_orders')
);
DELETE FROM orders WHERE user_id IN ('user_001', 'user_002', 'user_003', 'user_test_orders');
DELETE FROM cart_items WHERE cart_id IN (
    SELECT id FROM carts WHERE user_id IN ('user_001', 'user_002', 'user_003', 'user_test_cart')
);
DELETE FROM carts WHERE user_id IN ('user_001', 'user_002', 'user_003', 'user_test_cart');

-- Insert test carts
INSERT INTO carts (id, user_id, total_price, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'user_001', 29.97, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', 'user_002', 67.46, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440003', 'user_003', 0.00, CURRENT_TIMESTAMP);

-- Insert cart items for user_001 (3 items)
INSERT INTO cart_items (id, cart_id, product_id, name, price, quantity) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'prod_001_apples', 'Organic Apples', 4.99, 2),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'prod_002_bread', 'Whole Wheat Bread', 3.49, 1),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'prod_003_milk', 'Organic Milk', 5.99, 2);

-- Insert cart items for user_002 (3 items)
INSERT INTO cart_items (id, cart_id, product_id, name, price, quantity) VALUES
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'prod_005_salmon', 'Fresh Salmon Fillet', 18.99, 2),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'prod_007_beef', 'Grass-Fed Beef', 24.99, 1),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'prod_004_eggs', 'Free Range Eggs', 6.49, 1);

-- Insert test orders (5 orders with different statuses)
INSERT INTO orders (id, user_id, total_amount, status, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'user_001', 45.95, 'DELIVERED', '2026-01-15 10:30:00', '2026-01-20 14:00:00'),
('770e8400-e29b-41d4-a716-446655440002', 'user_001', 89.97, 'SHIPPED', '2026-01-25 15:45:00', '2026-01-28 09:30:00'),
('770e8400-e29b-41d4-a716-446655440003', 'user_002', 150.93, 'CONFIRMED', '2026-01-30 11:20:00', '2026-01-30 14:15:00'),
('770e8400-e29b-41d4-a716-446655440004', 'user_002', 32.47, 'PENDING', '2026-01-31 09:00:00', '2026-01-31 09:00:00'),
('770e8400-e29b-41d4-a716-446655440005', 'user_003', 79.93, 'CANCELLED', '2026-01-20 16:30:00', '2026-01-22 10:00:00');

-- Insert order items
INSERT INTO order_items (id, order_id, product_id, name, price, quantity) VALUES
-- Order 1 items (user_001, DELIVERED)
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'prod_001_apples', 'Organic Apples', 4.99, 3),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'prod_011_strawberries', 'Fresh Strawberries', 5.49, 2),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'prod_013_yogurt', 'Greek Yogurt', 4.99, 4),
-- Order 2 items (user_001, SHIPPED)
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', 'prod_005_salmon', 'Fresh Salmon Fillet', 18.99, 3),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'prod_012_chicken', 'Organic Chicken Breast', 12.99, 2),
-- Order 3 items (user_002, CONFIRMED)
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440003', 'prod_007_beef', 'Grass-Fed Beef', 24.99, 4),
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440003', 'prod_016_shrimp', 'Wild Caught Shrimp', 16.99, 3),
-- Order 4 items (user_002, PENDING)
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440004', 'prod_002_bread', 'Whole Wheat Bread', 3.49, 2),
('880e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440004', 'prod_003_milk', 'Organic Milk', 5.99, 3),
('880e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440004', 'prod_004_eggs', 'Free Range Eggs', 6.49, 1),
-- Order 5 items (user_003, CANCELLED)
('880e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440005', 'prod_008_cheese', 'Artisan Cheese Selection', 15.99, 3),
('880e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440005', 'prod_017_croissants', 'Croissants', 7.99, 4);

-- Insert shipping addresses
INSERT INTO shipping_addresses (id, order_id, street, city, zip, country) VALUES
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '123 Main Street', 'New York', '10001', 'USA'),
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '456 Oak Avenue', 'Los Angeles', '90001', 'USA'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '789 Pine Road', 'Chicago', '60601', 'USA'),
('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '321 Elm Boulevard', 'Houston', '77001', 'USA'),
('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', '654 Maple Lane', 'Phoenix', '85001', 'USA');

-- Verify data
SELECT 'Carts: ' || COUNT(*) FROM carts;
SELECT 'Cart Items: ' || COUNT(*) FROM cart_items;
SELECT 'Orders: ' || COUNT(*) FROM orders;
SELECT 'Order Items: ' || COUNT(*) FROM order_items;
SELECT 'Shipping Addresses: ' || COUNT(*) FROM shipping_addresses;
