#!/bin/bash
# ===========================================
# Green Mart - Deployment Script
# ===========================================
# Usage: ./scripts/deploy.sh
# ===========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_DIR="/opt/greenmart"

# Check if running from correct directory
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "docker-compose.prod.yml not found. Run from project root."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    log_error ".env file not found. Copy .env.prod to .env and configure."
    exit 1
fi

log_info "Starting Green Mart deployment..."

# Step 1: Pull latest code (if git repo)
if [ -d ".git" ]; then
    log_info "Pulling latest code..."
    git pull origin main
fi

# Step 2: Build images
log_info "Building Docker images..."
docker compose -f $COMPOSE_FILE build

# Step 3: Stop existing containers gracefully
log_info "Stopping existing containers..."
docker compose -f $COMPOSE_FILE down --timeout 30

# Step 4: Start new containers
log_info "Starting containers..."
docker compose -f $COMPOSE_FILE up -d

# Step 5: Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 30

# Step 6: Health check
log_info "Running health checks..."
./scripts/health-check.sh

log_info "Deployment completed successfully!"
