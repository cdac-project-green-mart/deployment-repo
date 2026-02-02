# Database Seeds

## Structure
```
seeds/
├── dev/           # Development test data
│   ├── mongo/     # MongoDB seeds (products, inventory, user-profiles)
│   └── postgres/  # PostgreSQL seeds (auth, orders, payments)
├── prod/          # Production minimal data
└── shared/ids.json # ID reference for consistency
```

## CDN URL
```
https://green-mart-product-storage.sfo3.cdn.digitaloceanspaces.com/products/<image>.jpg
```

## Test Credentials (Dev)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@greenmart.com | admin123 |
| Vendor | vendor@freshfarms.com | vendor123 |
| Customer | john@example.com | customer123 |

## Production Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@greenmart.com | Admin@GreenMart2024 |
| Vendor | vendor@organicfarms.com | Vendor@Organic2024 |
| Customer | customer@example.com | Customer@Shop2024 |

## Run Seeds
```bash
# MongoDB
docker exec -i green-mart-mongodb mongosh -u greenmart -p greenmart123 --authenticationDatabase admin < seeds/dev/mongo/01-products.js

# PostgreSQL  
docker exec -i green-mart-postgres psql -U greenmart < seeds/dev/postgres/02-auth-seed.sql
```
