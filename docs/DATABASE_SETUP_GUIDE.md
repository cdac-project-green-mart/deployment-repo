# Database Setup Guide - Production VM

This guide provides a comprehensive, step-by-step tutorial for setting up PostgreSQL and MongoDB on a production VM for the Green Mart microservices backend.

---

## Table of Contents

1. [Understanding Docker Volume Persistence](#understanding-docker-volume-persistence)
2. [PostgreSQL Setup](#postgresql-setup)
3. [MongoDB Setup](#mongodb-setup)
4. [Database Initialization Scripts](#database-initialization-scripts)
5. [Backup & Restore](#backup--restore)
6. [Troubleshooting](#troubleshooting)

---

## Understanding Docker Volume Persistence

### Will My Data Persist When I Stop/Remove Containers?

**YES!** Your database schema and data **persist** across container restarts because we use **named Docker volumes**.

```yaml
volumes:
  postgres_data:    # All PostgreSQL data stored here
  mongodb_data:     # All MongoDB data stored here
```

### Data Persistence Matrix

| Command | Containers | Volumes (Data) | Result |
|---------|-----------|---------------|--------|
| `docker compose stop` | Stopped | ✅ Preserved | Data safe, can restart |
| `docker compose down` | Removed | ✅ Preserved | Data safe, containers recreated on `up` |
| `docker compose down -v` | Removed | ❌ **DELETED** | **ALL DATA LOST!** |
| `docker volume rm <name>` | N/A | ❌ **DELETED** | **Specific volume data lost** |

### How to Verify Your Volumes Exist

```bash
# List all Docker volumes
docker volume ls

# Example output:
# DRIVER    VOLUME NAME
# local     green-mart-postgres-data
# local     green-mart-mongodb-data

# Inspect a volume (see where data is stored)
docker volume inspect green-mart-postgres-data
```

### Where is Data Actually Stored?

On Linux, Docker stores volumes at:
```
/var/lib/docker/volumes/<volume-name>/_data
```

**⚠️ Never manually edit files in this directory!** Use Docker commands or database tools.

---

## PostgreSQL Setup

### Step 1: Verify PostgreSQL Container is Running

```bash
# Check container status
docker compose ps postgres

# Expected output:
# NAME                  STATUS
# green-mart-postgres   Up (healthy)
```

### Step 2: Connect to PostgreSQL

```bash
# Method 1: Using docker exec
docker exec -it green-mart-postgres psql -U greenmart -d greenmart

# Method 2: Using psql from host (if installed)
psql -h localhost -p 5432 -U greenmart -d greenmart
```

### Step 3: Verify Databases Exist

The initialization script creates separate databases for each service:

```sql
-- Inside psql, list all databases
\l

-- Expected output:
--     Name          |  Owner
-- ------------------+-----------
--  auth_service     | greenmart
--  inventory_service| greenmart
--  order_service    | greenmart
--  payment_service  | greenmart
--  greenmart        | greenmart
```

### Step 4: Check Tables (Schema)

```sql
-- Connect to a specific database
\c auth_service

-- List all tables
\dt

-- Describe a specific table
\d users
```

### PostgreSQL Service Mapping

| Service | Database | Tables |
|---------|----------|--------|
| Auth Service | `auth_service` | users, roles, tokens |
| Order Service | `order_service` | orders, cart_items |
| Payment Service | `payment_service` | transactions, refunds |
| Inventory Service (if using PG) | `inventory_service` | inventory |

---

## MongoDB Setup

### Step 1: Verify MongoDB Container is Running

```bash
# Check container status
docker compose ps mongodb

# Expected output:
# NAME                 STATUS
# green-mart-mongodb   Up (healthy)
```

### Step 2: Connect to MongoDB

```bash
# Using mongosh inside container
docker exec -it green-mart-mongodb mongosh -u greenmart -p greenmart123 --authenticationDatabase admin

# Or specific database
docker exec -it green-mart-mongodb mongosh -u greenmart -p greenmart123 --authenticationDatabase admin user_service
```

### Step 3: Verify Databases and Collections

```javascript
// List all databases
show dbs

// Expected output:
// admin           0.000GB
// config          0.000GB
// local           0.000GB
// user_service    0.001GB
// product_service 0.001GB
// inventory_service 0.001GB

// Switch to a database
use user_service

// List collections
show collections

// Count documents
db.users.countDocuments()
```

### MongoDB Service Mapping

| Service | Database | Collections |
|---------|----------|-------------|
| User Service | `user_service` | users |
| Product Service | `product_service` | products |
| Inventory Service | `inventory_service` | inventory |

---

## Database Initialization Scripts

### PostgreSQL Init Script

Located at: `docker/init-scripts/postgres/01-init.sql`

```sql
-- Create databases for each service
CREATE DATABASE auth_service;
CREATE DATABASE order_service;
CREATE DATABASE payment_service;
CREATE DATABASE inventory_service;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE auth_service TO greenmart;
GRANT ALL PRIVILEGES ON DATABASE order_service TO greenmart;
GRANT ALL PRIVILEGES ON DATABASE payment_service TO greenmart;
GRANT ALL PRIVILEGES ON DATABASE inventory_service TO greenmart;
```

### MongoDB Init Script

Located at: `docker/init-scripts/mongo/01-init.js`

```javascript
// Switch to admin database
db = db.getSiblingDB('admin');

// Create databases with read/write access
['user_service', 'product_service', 'inventory_service'].forEach(dbName => {
    db = db.getSiblingDB(dbName);
    db.createCollection('_init');  // Creates database
    db._init.drop();  // Remove placeholder
});
```

### When Do Init Scripts Run?

- **Only on first startup** when the data volume is empty
- If you've already started containers once, init scripts won't run again
- To re-run: `docker compose down -v` then `docker compose up -d` (⚠️ loses all data!)

### Force Re-initialization (Development Only)

```bash
# WARNING: This deletes ALL data!
docker compose down -v
docker compose up -d

# Or remove specific volume
docker volume rm green-mart-postgres-data
docker compose up -d postgres
```

---

## Backup & Restore

### PostgreSQL Backup

```bash
# Backup all databases
docker exec green-mart-postgres pg_dumpall -U greenmart > backup_$(date +%Y%m%d).sql

# Backup specific database
docker exec green-mart-postgres pg_dump -U greenmart auth_service > auth_backup.sql

# Automated daily backup script
#!/bin/bash
BACKUP_DIR=/opt/backups/postgres
DATE=$(date +%Y%m%d_%H%M%S)
docker exec green-mart-postgres pg_dumpall -U greenmart > $BACKUP_DIR/full_backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### PostgreSQL Restore

```bash
# Restore from backup
docker exec -i green-mart-postgres psql -U greenmart < backup.sql

# Restore specific database
docker exec -i green-mart-postgres psql -U greenmart -d auth_service < auth_backup.sql
```

### MongoDB Backup

```bash
# Backup all databases
docker exec green-mart-mongodb mongodump -u greenmart -p greenmart123 --authenticationDatabase admin --out /tmp/backup
docker cp green-mart-mongodb:/tmp/backup ./mongodb_backup_$(date +%Y%m%d)

# Backup specific database
docker exec green-mart-mongodb mongodump -u greenmart -p greenmart123 --authenticationDatabase admin --db user_service --out /tmp/backup
```

### MongoDB Restore

```bash
# Copy backup into container
docker cp ./mongodb_backup green-mart-mongodb:/tmp/backup

# Restore
docker exec green-mart-mongodb mongorestore -u greenmart -p greenmart123 --authenticationDatabase admin /tmp/backup
```

### Automated Backup with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/scripts/backup-databases.sh >> /var/log/db-backup.log 2>&1
```

---

## Troubleshooting

### Problem: Container Not Starting

```bash
# Check logs
docker compose logs postgres
docker compose logs mongodb

# Common issues:
# - Port already in use: Change port in .env
# - Permission denied: Check volume permissions
# - Initialization failed: Check init scripts syntax
```

### Problem: Cannot Connect to Database

```bash
# Check container health
docker compose ps

# Test connectivity
docker exec green-mart-postgres pg_isready -U greenmart
docker exec green-mart-mongodb mongosh --eval "db.adminCommand('ping')"

# Check network
docker network inspect green-mart-network
```

### Problem: Data Not Persisting

```bash
# Verify volume exists
docker volume ls | grep green-mart

# Check volume is mounted correctly
docker inspect green-mart-postgres | grep -A 10 Mounts

# Ensure you're NOT using -v flag with down
# WRONG: docker compose down -v (deletes data!)
# RIGHT: docker compose down
```

### Problem: Init Scripts Not Running

Init scripts only run when volume is empty:

```bash
# Check if data already exists
docker volume inspect green-mart-postgres-data

# To force re-initialization (DELETES ALL DATA):
docker compose down -v
docker compose up -d
```

### Problem: "Permission Denied" Errors

```bash
# On Linux, set correct ownership
sudo chown -R 999:999 /var/lib/docker/volumes/green-mart-postgres-data
sudo chown -R 999:999 /var/lib/docker/volumes/green-mart-mongodb-data
```

### Problem: Database Running Slow

```bash
# Check container resource usage
docker stats

# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G  # Increase from 512M
```

---

## Production Checklist

Before deploying to production, ensure:

- [ ] Strong passwords set in `.env` (not default values)
- [ ] Backup strategy configured and tested
- [ ] Database logs monitored
- [ ] Resource limits appropriate for your VM
- [ ] Init scripts verified and idempotent
- [ ] Connection strings use internal Docker network (not localhost)
- [ ] Volumes are on reliable storage (SSD recommended)
- [ ] Firewall blocks external database ports (5432, 27017)

---

## Quick Reference Commands

```bash
# Start databases only
docker compose up -d postgres mongodb

# View database logs
docker compose logs -f postgres mongodb

# Connect to PostgreSQL
docker exec -it green-mart-postgres psql -U greenmart

# Connect to MongoDB
docker exec -it green-mart-mongodb mongosh -u greenmart -p greenmart123 --authenticationDatabase admin

# Backup PostgreSQL
docker exec green-mart-postgres pg_dumpall -U greenmart > backup.sql

# Backup MongoDB
docker exec green-mart-mongodb mongodump -u greenmart -p greenmart123 --authenticationDatabase admin --out /backup

# Check container health
docker compose ps

# Check volume usage
docker system df -v | grep green-mart
```
