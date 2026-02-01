# Testing Guide

Complete guide for running tests in the Green Mart backend.

---

## Quick Start

```bash
# Run all integration tests (services must be running)
cd tests && npm test
```

---

## Prerequisites

1. **Docker & Docker Compose** installed
2. **Node.js 18+** installed  
3. All services running via Docker Compose

---

## Running Tests

### 1. Start All Services

```bash
# Start everything
docker compose up -d

# Wait for services to be healthy (about 60 seconds)
docker compose ps
```

### 2. Seed Test Data (Optional)

```bash
cd tests
npm run seed
```

This creates:
- Test users (admin, vendor, customer)
- Sample products
- Inventory stock

### 3. Run Integration Tests

```bash
cd tests
npm test
```

Expected output:
```
✔ Passed: 33
✗ Failed: 0
```

---

## Single Command (Full Test Run)

### Windows (PowerShell)

```powershell
# Start services, wait, and run tests
docker compose up -d; Start-Sleep -Seconds 60; cd tests; npm test; cd ..
```

### Linux/Mac

```bash
# Start services, wait, and run tests
docker compose up -d && sleep 60 && cd tests && npm test && cd ..
```

### With Seed Data

```bash
docker compose up -d && sleep 60 && cd tests && npm run seed && npm test && cd ..
```

---

## Test Categories

| Category | Tests | Description |
|----------|-------|-------------|
| Health Checks | 7 | Verify all services are running |
| Authentication | 3 | Register, login, token validation |
| Products | 4 | CRUD operations |
| Inventory | 4 | Stock management |
| Cart | 4 | Add, update, remove items |
| Checkout | 2 | SAGA flow verification |
| Orders | 3 | Order retrieval and verification |
| Payments | 2 | Transaction verification |
| Gateway | 4 | API routing tests |

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Start services
        run: docker compose up -d
        
      - name: Wait for services
        run: sleep 90
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install test dependencies
        run: cd tests && npm install
        
      - name: Seed test data
        run: cd tests && npm run seed
        
      - name: Run tests
        run: cd tests && npm test
        
      - name: Cleanup
        if: always()
        run: docker compose down
```

---

## Troubleshooting

### Services not healthy
```bash
# Check container logs
docker compose logs <service-name>

# Restart specific service
docker compose restart <service-name>
```

### Tests timing out
```bash
# Increase wait time before running tests
sleep 120  # Wait 2 minutes
```

### Database issues
```bash
# Reset databases (WARNING: deletes data)
docker compose down -v
docker compose up -d
```

---

## Test Environment Variables

Set these in your environment or `.env` file:

```bash
GATEWAY_URL=http://localhost:8080
AUTH_URL=http://localhost:8082
PRODUCT_URL=http://localhost:8084
ORDER_URL=http://localhost:8085
INVENTORY_URL=http://localhost:8086
PAYMENT_URL=http://localhost:8087
CHECKOUT_URL=http://localhost:8088
```
