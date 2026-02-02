# Development Database Seeding Script
param([switch]$SkipMongo, [switch]$SkipPostgres)

$ErrorActionPreference = "Stop"
Write-Host "`n🌱 Green Mart - Dev Seeding`n" -ForegroundColor Green

# Check containers
$pg = docker ps --filter "name=green-mart-postgres" -q 2>$null
$mongo = docker ps --filter "name=green-mart-mongodb" -q 2>$null

if (-not $pg -and -not $SkipPostgres) { Write-Host "❌ PostgreSQL not running" -ForegroundColor Red; exit 1 }
if (-not $mongo -and -not $SkipMongo) { Write-Host "❌ MongoDB not running" -ForegroundColor Red; exit 1 }

$base = "$PSScriptRoot\..\seeds\dev"

# PostgreSQL
if (-not $SkipPostgres) {
    Write-Host "📦 Seeding PostgreSQL..." -ForegroundColor Cyan
    @("02-auth-seed.sql", "05-order-seed.sql", "06-payment-seed.sql") | ForEach-Object {
        $f = "$base\postgres\$_"
        if (Test-Path $f) {
            Get-Content $f -Raw | docker exec -i green-mart-postgres psql -U greenmart -d greenmart 2>&1 | Out-Null
            Write-Host "   ✅ $_" -ForegroundColor Green
        }
    }
}

# MongoDB
if (-not $SkipMongo) {
    Write-Host "📦 Seeding MongoDB..." -ForegroundColor Cyan
    @("01-products.js", "02-inventory.js", "03-user-profiles.js") | ForEach-Object {
        $f = "$base\mongo\$_"
        if (Test-Path $f) {
            docker cp $f green-mart-mongodb:/tmp/$_ 2>&1 | Out-Null
            docker exec green-mart-mongodb mongosh -u greenmart -p greenmart123 --authenticationDatabase admin --file /tmp/$_ 2>&1 | Out-Null
            Write-Host "   ✅ $_" -ForegroundColor Green
        }
    }
}

Write-Host "`n✨ Done!`n" -ForegroundColor Green
Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "  Admin: admin@greenmart.com / admin123"
Write-Host "  Vendor: vendor@freshfarms.com / vendor123"
Write-Host "  Customer: john@example.com / customer123`n"
