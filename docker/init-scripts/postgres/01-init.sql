-- Create databases for each service
CREATE DATABASE auth_service;
CREATE DATABASE inventory_service;
CREATE DATABASE order_service;
CREATE DATABASE payment_service;

-- Grant all privileges to the greenmart user
GRANT ALL PRIVILEGES ON DATABASE auth_service TO greenmart;
GRANT ALL PRIVILEGES ON DATABASE inventory_service TO greenmart;
GRANT ALL PRIVILEGES ON DATABASE order_service TO greenmart;
GRANT ALL PRIVILEGES ON DATABASE payment_service TO greenmart;

-- Auth Service Schema
\c auth_service;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'vendor')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Inventory Service Schema
\c inventory_service;

CREATE TABLE IF NOT EXISTS inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(255) NOT NULL UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 10,
    last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventories_product_id ON inventories(product_id);
CREATE INDEX idx_inventories_low_stock ON inventories(quantity, low_stock_threshold);

-- Order Service Schema
\c order_service;

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    total_price DECIMAL(10, 2) DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carts_user_id ON carts(user_id);

-- Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    quantity INTEGER DEFAULT 1
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    quantity INTEGER NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Shipping Addresses table
CREATE TABLE IF NOT EXISTS shipping_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    street VARCHAR(255),
    city VARCHAR(100),
    zip VARCHAR(20),
    country VARCHAR(100)
);

CREATE INDEX idx_shipping_addresses_order_id ON shipping_addresses(order_id);

-- Payment Service Schema
\c payment_service;

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed')),
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    provider_transaction_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_provider_id ON transactions(provider_transaction_id);
