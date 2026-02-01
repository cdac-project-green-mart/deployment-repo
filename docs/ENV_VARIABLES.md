# Environment Variables Guide

Complete reference for all environment variables used in Green Mart.

---

## Quick Reference

### Required Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | PostgreSQL | Database username |
| `POSTGRES_PASSWORD` | PostgreSQL | Database password |
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB | Root username |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB | Root password |
| `JWT_SECRET` | Auth, Gateway | Token signing secret |

---

## Variable Categories

### 1. Database Configuration

#### PostgreSQL

```bash
POSTGRES_USER=greenmart           # Database username
POSTGRES_PASSWORD=secure_password # Database password  
POSTGRES_DB=greenmart             # Default database
POSTGRES_PORT=5432                # Port (default: 5432)
```

**Used by:** Auth Service, Order Service, Payment Service

**Connection String Pattern:**
```
jdbc:postgresql://postgres:5432/<database_name>
```

#### MongoDB

```bash
MONGO_INITDB_ROOT_USERNAME=greenmart # Root username
MONGO_INITDB_ROOT_PASSWORD=password  # Root password
MONGO_PORT=27017                     # Port (default: 27017)
```

**Used by:** User Service, Product Service, Inventory Service

**Connection String Pattern:**
```
mongodb://<username>:<password>@mongodb:27017/<database>?authSource=admin
```

---

### 2. Security

```bash
# JWT Secret (minimum 64 characters for HS256)
JWT_SECRET=your_super_long_secret_key_minimum_64_characters_for_security

# Generate secure secret:
# openssl rand -base64 64
```

**Used by:** Auth Service (signing), API Gateway (validation)

---

### 3. Service Ports

```bash
API_GATEWAY_PORT=8080      # Main entry point
EUREKA_PORT=8761           # Service discovery dashboard
AUTH_SERVICE_PORT=8082     # Authentication
USER_SERVICE_PORT=8083     # User management
PRODUCT_SERVICE_PORT=8084  # Product catalog
ORDER_SERVICE_PORT=8085    # Orders and cart
INVENTORY_SERVICE_PORT=8086 # Stock management
PAYMENT_SERVICE_PORT=8087  # Payment processing
CHECKOUT_SERVICE_PORT=8088 # Checkout orchestration
```

---

### 4. Service Discovery

```bash
EUREKA_SERVER=http://eureka-server:8761/eureka/
EUREKA_HOST=eureka-server
EUREKA_PORT=8761
```

**Used by:** All microservices for registration and discovery

---

### 5. Inter-Service Communication

```bash
ORDER_SERVICE_URL=http://order-service:8085
INVENTORY_SERVICE_URL=http://inventory-service:8086
PAYMENT_SERVICE_URL=http://payment-service:8087
```

**Used by:** Checkout Service (SAGA orchestrator)

---

## How Services Read Variables

### Spring Boot Services

```yaml
# application.yml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/auth_service}
    username: ${SPRING_DATASOURCE_USERNAME:greenmart}
    password: ${SPRING_DATASOURCE_PASSWORD:greenmart123}

eureka:
  client:
    serviceUrl:
      defaultZone: ${EUREKA_CLIENT_SERVICEURL_DEFAULTZONE:http://localhost:8761/eureka/}
```

### Node.js Services

```javascript
// config/index.js
module.exports = {
  port: process.env.PORT || 8083,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/user_service',
  eureka: {
    host: process.env.EUREKA_HOST || 'localhost',
    port: process.env.EUREKA_PORT || 8761
  }
};
```

---

## Environment-Specific Files

### Development (.env.dev)

```bash
# Weak passwords OK for local dev
POSTGRES_PASSWORD=greenmart123
MONGO_INITDB_ROOT_PASSWORD=greenmart123
JWT_SECRET=development_secret_key_not_for_production

# Enable dev tools
ENABLE_PGADMIN=true
ENABLE_MONGO_EXPRESS=true
LOG_LEVEL=DEBUG
```

### Production (.env.prod)

```bash
# Strong passwords required
POSTGRES_PASSWORD=<generated_strong_password>
MONGO_INITDB_ROOT_PASSWORD=<generated_strong_password>
JWT_SECRET=<generated_64_char_secret>

# Disable dev tools
ENABLE_PGADMIN=false
ENABLE_MONGO_EXPRESS=false
LOG_LEVEL=INFO
```

### Testing (.env.test)

```bash
COMPOSE_PROJECT_NAME=green-mart-test
POSTGRES_PASSWORD=test123
MONGO_INITDB_ROOT_PASSWORD=test123
JWT_SECRET=test_secret_key

# Use different ports to avoid conflicts
API_GATEWAY_PORT=9080
POSTGRES_PORT=5433
MONGO_PORT=27018
```

---

## Docker Compose Variable Usage

```yaml
# docker-compose.prod.yml
services:
  postgres:
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"  # Default fallback
```

The `:-` syntax provides a default if variable is unset.

---

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong passwords** - Minimum 16 characters, random
3. **Rotate secrets** - Change JWT_SECRET periodically
4. **Limit access** - Only expose necessary ports
5. **Use secrets manager** - For production (HashiCorp Vault, AWS Secrets Manager)
