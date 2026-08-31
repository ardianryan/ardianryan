# 🐳 Docker & GHCR Deployment Guide

This repository includes a multi-stage `Dockerfile`, `docker-compose.yml`, and an automated GitHub Actions CI/CD workflow that publishes multi-architecture container images (`linux/amd64` and `linux/arm64`) to **GitHub Container Registry (GHCR)**.

---

## 📦 Container Registry Information

* **Registry:** GitHub Container Registry (`ghcr.io`)
* **Image Name:** `ghcr.io/ardianryan/ardianryan:latest`
* **Port:** `3000` (Node.js 22 Alpine SSR Server)

---

## 🚀 Option 1: Quick Run with Docker CLI

Run the container on any VPS, cloud instance, or server with one command:

```bash
# 1. Pull latest image from GHCR
docker pull ghcr.io/ardianryan/ardianryan:latest

# 2. Run container with .env configuration
docker run -d \
  --name ardianryan-portfolio \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  ghcr.io/ardianryan/ardianryan:latest
```

---

## ⚡ Option 2: Run with Docker Compose

1. Clone or download `docker-compose.yml` and your `.env` file to your server directory:
```yaml
services:
  portfolio:
    image: ghcr.io/ardianryan/ardianryan:latest
    container_name: ardianryan-portfolio
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOST=0.0.0.0
```

2. Start the container:
```bash
docker compose up -d
```

3. View live logs:
```bash
docker compose logs -f
```

4. Update to the latest image anytime:
```bash
docker compose pull && docker compose up -d
```

---

## 🖥️ Option 3: Deploy on aaPanel / Rinjani Linux Panel

1. Go to **aaPanel** > **Docker** menu.
2. Under **Compose Templates**, click **Add Template**:
   - Paste the contents of `docker-compose.yml`.
   - Add your `.env` environment variables.
3. Click **Deploy**.
4. Go to **Website** > **Proxy** (or Add Node Project) to point domain `ardianryan.com` to `http://127.0.0.1:3000` with SSL!

---

## 🛠️ Local Docker Build

If you want to build and test the Docker image locally on your machine:

```bash
# Build image locally
docker build -t ardianryan-portfolio .

# Run local container
docker run -p 3000:3000 --env-file .env ardianryan-portfolio
```
