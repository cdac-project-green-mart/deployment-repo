#!/bin/bash
# ===========================================
# Green Mart - Test Runner Script
# ===========================================
# Usage: ./scripts/run-tests.sh
# ===========================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "============================================"
echo "   GREEN MART - TEST RUNNER"
echo "============================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Start services if not running
log_info "Starting Docker services..."
docker compose up -d

# Wait for services to be healthy
log_info "Waiting for services to be healthy (60 seconds)..."
sleep 60

# Check service health
log_info "Checking service health..."
./scripts/health-check.sh || log_warn "Some services may not be fully healthy"

# Install test dependencies if needed
log_info "Checking test dependencies..."
cd tests
if [ ! -d "node_modules" ]; then
    npm install
fi

# Seed test data
log_info "Seeding test data..."
npm run seed || log_warn "Seed may have partially failed"

# Run integration tests
log_info "Running integration tests..."
npm test

# Return to root
cd ..

echo ""
echo "============================================"
echo "   TESTS COMPLETE"
echo "============================================"
