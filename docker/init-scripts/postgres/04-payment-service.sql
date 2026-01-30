-- Payment Service Database Initialization

-- Create payment_service database
CREATE DATABASE IF NOT EXISTS payment_service;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE payment_service TO greenmart;

\c payment_service;

-- Tables will be created automatically by Hibernate/JPA
-- This script just ensures the database exists
