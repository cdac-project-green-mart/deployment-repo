#!/bin/bash
# ===========================================
# Green Mart - Health Check Script
# ===========================================
# Usage: ./scripts/health-check.sh
# ===========================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# Configuration
GATEWAY_URL="${API_GATEWAY_URL:-http://localhost:8080}"
EUREKA_URL="${EUREKA_URL:-http://localhost:8761}"

echo "============================================"
echo "  Green Mart - Health Check"
echo "============================================"
echo ""

# Check database containers
echo "📦 Checking Containers..."
docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null || docker compose ps

echo ""
echo "🏥 Checking Service Health..."

# Function to check health endpoint
check_health() {
    local name=$1
    local url=$2
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        log_info "$name: OK"
        return 0
    else
        log_error "$name: FAILED (HTTP $response)"
        return 1
    fi
}

# Check each service
FAILED=0

check_health "Eureka Server" "$EUREKA_URL/actuator/health" || ((FAILED++))
check_health "API Gateway" "$GATEWAY_URL/actuator/health" || ((FAILED++))
check_health "Auth Service" "http://localhost:8082/api/auth/health" || ((FAILED++))
check_health "User Service" "http://localhost:8083/actuator/health" || ((FAILED++))
check_health "Product Service" "http://localhost:8084/actuator/health" || ((FAILED++))
check_health "Order Service" "http://localhost:8085/health" || ((FAILED++))
check_health "Inventory Service" "http://localhost:8086/health" || ((FAILED++))
check_health "Payment Service" "http://localhost:8087/actuator/health" || ((FAILED++))
check_health "Checkout Service" "http://localhost:8088/actuator/health" || ((FAILED++))

echo ""
echo "📊 Checking Databases..."

# Check PostgreSQL
if docker exec green-mart-postgres pg_isready -U greenmart &>/dev/null; then
    log_info "PostgreSQL: OK"
else
    log_error "PostgreSQL: FAILED"
    ((FAILED++))
fi

# Check MongoDB
if docker exec green-mart-mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    log_info "MongoDB: OK"
else
    log_error "MongoDB: FAILED"
    ((FAILED++))
fi

echo ""
echo "============================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}$FAILED service(s) failed health check${NC}"
    exit 1
fi
