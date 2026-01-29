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
