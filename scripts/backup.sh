#!/bin/bash
# ===========================================
# Green Mart - Backup Script
# ===========================================
# Usage: ./scripts/backup.sh
# ===========================================

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }

# Create backup directory
mkdir -p "$BACKUP_DIR"

log_info "Starting backup..."

# Backup PostgreSQL
log_info "Backing up PostgreSQL..."
docker exec green-mart-postgres pg_dumpall -U greenmart > "$BACKUP_DIR/postgres_$DATE.sql"
gzip "$BACKUP_DIR/postgres_$DATE.sql"
log_info "PostgreSQL backup: $BACKUP_DIR/postgres_$DATE.sql.gz"

# Backup MongoDB
log_info "Backing up MongoDB..."
docker exec green-mart-mongodb mongodump \
    -u greenmart \
    -p "${MONGO_INITDB_ROOT_PASSWORD:-greenmart123}" \
    --authenticationDatabase admin \
    --out /tmp/backup_$DATE

docker cp green-mart-mongodb:/tmp/backup_$DATE "$BACKUP_DIR/mongodb_$DATE"
tar -czf "$BACKUP_DIR/mongodb_$DATE.tar.gz" -C "$BACKUP_DIR" "mongodb_$DATE"
rm -rf "$BACKUP_DIR/mongodb_$DATE"
docker exec green-mart-mongodb rm -rf /tmp/backup_$DATE
log_info "MongoDB backup: $BACKUP_DIR/mongodb_$DATE.tar.gz"

# Cleanup old backups
log_info "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

log_info "Backup completed!"
ls -lh "$BACKUP_DIR"
