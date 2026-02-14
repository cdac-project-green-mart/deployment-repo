# Frontend Docker Deployment Guide

## Quick Reference

| Command | Purpose |
|---------|---------|
| `docker build -t greenmart-frontend .` | Build the image |
| `docker run -d -p 3000:80 greenmart-frontend` | Run standalone |
| `docker compose up frontend` | Run via compose |

---

## Prerequisites
- Docker Desktop installed and running
- Node.js 20+ (for local dev only)

## Project Files

| File | Role |
|------|------|
| `Dockerfile` | Multi-stage build: Node 20 → Nginx Alpine |
| `nginx.conf` | SPA routing + API reverse proxy |
| `.dockerignore` | Excludes `node_modules`, `.git`, etc. |

## Build

```bash
cd web-frontend/ecomm-user-client
docker build -t greenmart-frontend .
```

Build takes ~50s first time, ~8s on subsequent builds (layer caching).  
Final image size: **~114MB**.

## Run Standalone (Local Testing)

To test with the **production API gateway**:

1. Edit `nginx.conf` line 21:
   ```nginx
   set $gateway http://68.183.86.246:8080;
   ```

2. Rebuild and run:
   ```bash
   docker build -t greenmart-frontend .
   docker run -d --name greenmart-test -p 3000:80 greenmart-frontend
   ```

3. Open **http://localhost:3000** in your browser.

4. Cleanup when done:
   ```bash
   docker rm -f greenmart-test
   ```

> **Remember:** Revert `nginx.conf` back to `http://api-gateway:8080` before committing.

## Run via Docker Compose

In your deployment repo's `docker-compose.yml`, add:

```yaml
frontend:
  build:
    context: ../web-frontend/ecomm-user-client   # adjust path
    dockerfile: Dockerfile
  ports:
    - "3000:80"
  depends_on:
    - api-gateway
  restart: unless-stopped
```

The `nginx.conf` default (`http://api-gateway:8080`) resolves via Docker's internal DNS — no changes needed.

## How It Works

```
Browser → :3000 → Nginx Container
                    ├── /          → serves index.html (SPA)
                    ├── /api/*     → proxy to API Gateway :8080
                    └── *.js|css   → cached 30 days
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Container exits immediately | Run `docker logs greenmart-test` — usually an nginx.conf syntax error |
| 502 Bad Gateway on `/api` | API gateway not reachable — check the `$gateway` URL in nginx.conf |
| Blank page | Check browser console — likely an API CORS issue |
| SPA routes return 404 | Verify `try_files $uri $uri/ /index.html` is in nginx.conf |
