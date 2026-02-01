# Green Mart - Test Runner Script (Windows)
# Usage: .\scripts\run-tests.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   GREEN MART - TEST RUNNER" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "[ERROR] Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Start services
Write-Host "`n[INFO] Starting Docker services..." -ForegroundColor Green
docker compose up -d

# Wait for services to be healthy
Write-Host "[INFO] Waiting for services to be healthy (60 seconds)..." -ForegroundColor Green
Start-Sleep -Seconds 60

# Check service health
Write-Host "[INFO] Checking service health..." -ForegroundColor Green
& "$PSScriptRoot\health-check.sh" 2>$null

# Navigate to tests directory
Push-Location tests

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing test dependencies..." -ForegroundColor Green
    npm install
}

# Seed test data
Write-Host "[INFO] Seeding test data..." -ForegroundColor Green
npm run seed

# Run tests
Write-Host "`n[INFO] Running integration tests..." -ForegroundColor Green
npm test

# Return to root
Pop-Location

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   TESTS COMPLETE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
