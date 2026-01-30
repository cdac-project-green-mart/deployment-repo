-- Order Service Database Initialization

-- Create order_service database
CREATE DATABASE IF NOT EXISTS order_service;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE order_service TO greenmart;

\c order_service;

-- Tables will be created automatically by Hibernate/JPA
-- This script just ensures the database exists
