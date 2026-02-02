# VM Deployment Guide (Root User)

Step-by-step guide to deploy Green Mart on a Linux VM as **root user**.

---

## Prerequisites

- Ubuntu 22.04 LTS (or 20.04 / Oracle Linux for ARM)
- Minimum 4GB RAM (8GB recommended)
- 20GB disk space
- Root SSH access
- Open ports: 22 (SSH), 8080 (API Gateway), 8761 (Eureka - optional)

---

## Step 1: Initial Server Setup (as root)

### 1.1 Update System

```bash
apt update && apt upgrade -y
```

### 1.2 Configure Firewall

```bash
# Enable UFW firewall
ufw enable

# Allow SSH
ufw allow 22/tcp

# Allow API Gateway
ufw allow 8080/tcp

# Allow HTTPS (optional)
ufw allow 443/tcp

# Check status
ufw status
```

---

## Step 2: Install Docker

### 2.1 Install Docker Engine

```bash
# Install prerequisites
apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 2.2 Install Node.js (for seeding)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version
npm --version
```

---

## Step 3: Clone Repository

```bash
# Create application directory
mkdir -p /opt/greenmart
cd /opt/greenmart

# Clone repository
git clone https://github.com/YOUR_USERNAME/green-mart-backend.git .

# Or if using SSH
git clone git@github.com:YOUR_USERNAME/green-mart-backend.git .
```

---

## Step 4: Configure Environment Variables

### 4.1 Create Production Environment File

```bash
# Copy template
cp .env.prod .env

# Edit with production values
nano .env
```

### 4.2 Generate Secure Values

```bash
# Generate JWT secret (IMPORTANT!)
openssl rand -base64 64

# Generate database passwords
openssl rand -base64 24
```

### 4.3 Required .env Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL password | `MySecurePass123!` |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB password | `MySecurePass456!` |
| `JWT_SECRET` | JWT signing key (64+ chars) | `<output from openssl>` |
| `DO_SPACES_KEY` | DigitalOcean Spaces key | Your DO key |
| `DO_SPACES_SECRET` | DigitalOcean Spaces secret | Your DO secret |
| `DO_SPACES_BUCKET` | Bucket name | `greenmart-images` |

**Example .env (minimum required):**

```bash
# Databases
POSTGRES_PASSWORD=YourSuperSecurePostgresPass!2024
MONGO_INITDB_ROOT_PASSWORD=YourSuperSecureMongoPass!2024

# JWT (generate fresh!)
JWT_SECRET=YOUR_64_CHAR_JWT_SECRET_HERE_GENERATED_VIA_OPENSSL

# DigitalOcean Spaces (for image uploads)
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACES_REGION=sgp1
DO_SPACES_BUCKET=greenmart-images
DO_SPACES_KEY=your_do_spaces_key
DO_SPACES_SECRET=your_do_spaces_secret
DO_SPACES_CDN_ENDPOINT=https://greenmart-images.sgp1.cdn.digitaloceanspaces.com

# Environment
NODE_ENV=production
```

---

## Step 5: Build and Start Services

### 5.1 Build Docker Images

```bash
cd /opt/greenmart

# Build all images (takes 10-20 minutes first time)
docker compose build

# Or build without cache
docker compose build --no-cache
```

### 5.2 Start All Services

```bash
# Start in detached mode
docker compose up -d

# Watch logs (Ctrl+C to exit)
docker compose logs -f
```

### 5.3 Verify Services are Running

```bash
# Check container status
docker compose ps

# Expected: All services should show "Up (healthy)"
```

Wait for all services to be healthy (2-3 minutes).

---

## Step 6: Seed Production Database

### 6.1 Install Dependencies

```bash
cd /opt/greenmart/tests
npm install
```

### 6.2 Run Production Seeder

```bash
# Run production seed script
node ../scripts/prod-seed.js
```

This creates:
- **3 Users**: Admin, Vendor, Customer
- **15 Products**: With real images and descriptions
- **Inventory**: All products stocked

### 6.3 Production Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@greenmart.com` | `Admin@GreenMart2024` |
| Vendor | `vendor@organicfarms.com` | `Vendor@Organic2024` |
| Customer | `customer@example.com` | `Customer@Shop2024` |

---

## Step 7: Verify Deployment

### 7.1 Check Health Endpoints

```bash
# API Gateway
curl http://localhost:8080/actuator/health

# Auth Service
curl http://localhost:8082/api/auth/health

# Product Service
curl http://localhost:8084/health
```

### 7.2 Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@greenmart.com","password":"Admin@GreenMart2024"}'
```

### 7.3 Test Products API

```bash
curl http://localhost:8080/api/products | jq
```

---

## Common Operations

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f auth-service

# Last 100 lines
docker compose logs --tail 100 api-gateway
```

### Restart Services

```bash
# Restart single service
docker compose restart auth-service

# Restart all
docker compose restart
```

### Stop Services

```bash
# Stop without removing containers
docker compose stop

# Stop and remove containers (data preserved)
docker compose down

# DANGER: Remove everything including data
docker compose down -v
```

### Update to Latest Code

```bash
cd /opt/greenmart

# Pull latest
git pull origin main

# Rebuild and restart
docker compose build
docker compose up -d
```

---

## Production Folder Structure

```
/opt/greenmart/
├── .env                      # Production secrets (NEVER COMMIT)
├── .env.prod                 # Template
├── docker-compose.yml        # Docker orchestration
├── scripts/
│   ├── deploy.sh             # Deployment script
│   ├── prod-seed.js          # Production seeder
│   └── health-check.sh       # Health checker
├── [service-directories]/
├── tests/
│   └── seed-data.js          # Test seeder
└── docs/
```

---

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker compose logs <service-name>

# Check ports
netstat -tlnp | grep 8080

# Check Docker daemon
systemctl status docker
```

### Database Issues

```bash
# PostgreSQL
docker exec green-mart-postgres pg_isready -U greenmart

# MongoDB
docker exec green-mart-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Out of Memory

```bash
# Check usage
docker stats

# Add swap
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## Security Checklist

- [ ] Changed all default passwords in `.env`
- [ ] Generated strong JWT secret (64+ characters)
- [ ] Firewall blocks database ports (5432, 27017)
- [ ] SSH key authentication (password disabled)
- [ ] Regular system updates scheduled
- [ ] Database backups configured
- [ ] Monitoring/alerting set up

---

## Quick Reference Commands

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View running containers
docker compose ps

# View logs
docker compose logs -f

# Rebuild single service
docker compose build <service-name>
docker compose up -d <service-name>

# Run production seeder
node /opt/greenmart/scripts/prod-seed.js
```


---

## Step 1: Initial Server Setup

### 1.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Create Application User (Optional but Recommended)

```bash
# Create user for running the application
sudo useradd -m -s /bin/bash greenmart
sudo usermod -aG sudo greenmart

# Switch to the new user
sudo su - greenmart
```

### 1.3 Configure Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow API Gateway
sudo ufw allow 8080/tcp

# Allow HTTPS (when configured)
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## Step 2: Install Docker

### 2.1 Install Docker Engine

```bash
# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

### 2.2 Configure Docker for Non-root User

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply changes (or log out and back in)
newgrp docker

# Verify installation
docker --version
docker run hello-world
```

### 2.3 Install Docker Compose

```bash
# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify installation
docker compose version
```

---

## Step 3: Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/greenmart
sudo chown $USER:$USER /opt/greenmart
cd /opt/greenmart

# Clone repository (replace with your repo URL)
git clone https://github.com/your-username/green-mart-backend.git .

# Or download from release
# wget https://github.com/your-username/green-mart-backend/archive/main.zip
# unzip main.zip
```

---

## Step 4: Configure Environment Variables

### 4.1 Create Production Environment File

```bash
# Copy production template
cp .env.prod .env

# Edit with your values
nano .env
```

### 4.2 Generate Secure Values

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate database passwords
openssl rand -base64 24
```

### 4.3 Required Configuration

```bash
# Edit .env with these values:
POSTGRES_PASSWORD=<your-secure-password>
MONGO_INITDB_ROOT_PASSWORD=<your-secure-password>
JWT_SECRET=<your-generated-jwt-secret>
```

---

## Step 5: Build and Start Services

### 5.1 Build Docker Images

```bash
# Build all images (this takes 5-15 minutes first time)
docker compose -f docker-compose.prod.yml build

# Or build without cache if having issues
docker compose -f docker-compose.prod.yml build --no-cache
```

### 5.2 Start All Services

```bash
# Start in detached mode
docker compose -f docker-compose.prod.yml up -d

# Watch startup logs
docker compose -f docker-compose.prod.yml logs -f
```

### 5.3 Verify Services are Running

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Expected output: All services should show "Up (healthy)"
# NAME                  STATUS
# green-mart-postgres   Up (healthy)
# green-mart-mongodb    Up (healthy)
# green-mart-eureka     Up (healthy)
# green-mart-gateway    Up (healthy)
# green-mart-auth       Up (healthy)
# ... (all services)
```

---

## Step 6: Verify Deployment

### 6.1 Check Health Endpoints

```bash
# API Gateway
curl http://localhost:8080/actuator/health

# Auth Service
curl http://localhost:8082/api/auth/health

# Eureka Dashboard (browser)
# http://<your-vm-ip>:8761
```

### 6.2 Test API

```bash
# Register a test user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test@123456","role":"CUSTOMER"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123456"}'
```

---

## Common Operations

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f auth-service

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail 100 api-gateway
```

### Restart Services

```bash
# Restart single service
docker compose -f docker-compose.prod.yml restart auth-service

# Restart all services
docker compose -f docker-compose.prod.yml restart
```

### Stop Services

```bash
# Stop without removing containers
docker compose -f docker-compose.prod.yml stop

# Stop and remove containers (data preserved)
docker compose -f docker-compose.prod.yml down

# DANGER: Stop and remove all data
docker compose -f docker-compose.prod.yml down -v
```

### Update Services

```bash
# Pull latest code
git pull origin main

# Rebuild changed images
docker compose -f docker-compose.prod.yml build

# Rolling restart (zero downtime for independent services)
docker compose -f docker-compose.prod.yml up -d --no-deps auth-service
docker compose -f docker-compose.prod.yml up -d --no-deps user-service
# ... repeat for each service

# Or restart all (brief downtime)
docker compose -f docker-compose.prod.yml up -d
```

---

## Production Folder Structure

```
/opt/greenmart/
├── .env                      # Production environment (DO NOT COMMIT)
├── .env.example              # Template
├── docker-compose.prod.yml   # Production compose
├── docker/
│   └── init-scripts/         # Database init scripts
├── [service-directories]/
├── docs/
├── scripts/
│   ├── deploy.sh
│   ├── health-check.sh
│   └── backup.sh
└── backups/                  # Database backups
```

---

## Troubleshooting

### Services Not Starting

```bash
# Check container logs
docker compose -f docker-compose.prod.yml logs <service-name>

# Check if ports are in use
sudo netstat -tlnp | grep 8080

# Check Docker daemon
sudo systemctl status docker
```

### Database Connection Issues

```bash
# Check database containers
docker compose -f docker-compose.prod.yml ps postgres mongodb

# Test connection
docker exec green-mart-postgres pg_isready -U greenmart
docker exec green-mart-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Increase swap (if needed)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Security Checklist

- [ ] Changed all default passwords in .env
- [ ] Generated strong JWT secret (64+ characters)
- [ ] Firewall blocks database ports from internet
- [ ] SSH key authentication enabled (password disabled)
- [ ] Regular system updates scheduled
- [ ] Backup strategy implemented and tested
- [ ] Monitoring/alerting configured
