#!/bin/bash
# Production Database Seeding Script (Ubuntu/Linux)

set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# Confirmation check
if [ "$1" != "--force" ]; then
    echo -e "${RED}⚠️  This will seed PRODUCTION databases.${NC}"
    read -p "Type 'yes' to continue: " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 1
    fi
fi

echo -e "\n${GREEN}🌱 Green Mart - Production Seeding${NC}\n"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE="$SCRIPT_DIR/../seeds/prod"

# PostgreSQL
echo -e "${CYAN}📦 Seeding PostgreSQL...${NC}"
for file in 02-auth-seed.sql 05-order-seed.sql 06-payment-seed.sql; do
    filepath="$BASE/postgres/$file"
    if [ -f "$filepath" ]; then
        cat "$filepath" | docker exec -i green-mart-postgres psql -U greenmart -d greenmart 2>/dev/null
        echo -e "   ${GREEN}✅ $file${NC}"
    fi
done

# MongoDB
echo -e "${CYAN}📦 Seeding MongoDB...${NC}"
for file in 01-products.js 02-inventory.js 03-user-profiles.js; do
    filepath="$BASE/mongo/$file"
    if [ -f "$filepath" ]; then
        docker cp "$filepath" green-mart-mongodb:/tmp/$file 2>/dev/null
        docker exec green-mart-mongodb mongosh -u greenmart -p greenmart123 --authenticationDatabase admin --file /tmp/$file 2>/dev/null
        echo -e "   ${GREEN}✅ $file${NC}"
    fi
done

echo -e "\n${GREEN}✨ Done!${NC}"
echo -e "${RED}⚠️  Remember to change admin password after first login!${NC}\n"
