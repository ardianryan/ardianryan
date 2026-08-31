# Cloudflare Workers & Pages Deployment Guide

This guide provides step-by-step instructions for deploying the **Ardian Ryan Portfolio** web application on **Cloudflare Workers (with Workers Assets)** and **Cloudflare Pages**.

---

## 🌟 Architecture Overview

This portfolio is built with **TanStack Start**, **React 19**, **Vite**, and **TypeScript**, engineered to run seamlessly on the Cloudflare global edge network with:
- **Server-Side Rendering (SSR):** Powered by `./dist/server/server.js` with `nodejs_compat`.
- **Static Assets:** Cached and served with sub-millisecond latency via `./dist/client` through Cloudflare Workers Assets.
- **Dynamic Database Layer:** Connects to PostgreSQL, MySQL, Supabase, or Appwrite.
- **Media Storage:** Cloudflare R2 Object Storage with automatic WebP compression.
- **Security:** Cloudflare Turnstile bot verification and timing-safe password validation for `/ctrl-desk`.

---

## 📋 Prerequisites

Before deploying, ensure you have:
1. **Node.js**: v20.x or v22.x+ installed.
2. **Cloudflare Account**: [Sign up here](https://dash.cloudflare.com/sign-up) if you don't have one.
3. **Domain (Optional)**: If you want to attach your own custom domain (e.g., `ardianryan.com`).

---

## ⚙️ Step 1: Configure Environment Variables

Create or update your local `.env` file in the project root:

```ini
# =========================================================================
# 1. DATABASE CONFIGURATION
# =========================================================================
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://user:password@your-postgres-host:5432/portfolio_db

# =========================================================================
# 2. ADMIN AUTHENTICATION
# =========================================================================
ADMIN_PASSWORD=YourStrongPasswordHere!

# =========================================================================
# 3. CLOUDFLARE R2 OBJECT STORAGE (Auto-WebP CDN)
# =========================================================================
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_BUCKET_NAME=static-cdn-r2
R2_FOLDER_PATH=portofolio
R2_PUBLIC_URL=https://static.ardianryan.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_REGION=auto
R2_USE_PATH_STYLE_ENDPOINT=true

# =========================================================================
# 4. CLOUDFLARE TURNSTILE (Bot Protection)
# =========================================================================
TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
```

> 🔒 **Security Notice:** The `.env` file is automatically ignored by `.gitignore`. Sensitive keys are never committed to your Git repository.

---

## 🚀 Option A: Deploy to Cloudflare Workers (Recommended)

Cloudflare Workers with **Workers Assets** is the native, high-performance edge deployment target for this application.

### 1. Authenticate with Cloudflare

Log in to your Cloudflare account via the Wrangler CLI:

```bash
npm run cf:login
```

Verify that you are logged in:

```bash
npm run cf:whoami
```

### 2. Synchronize Secrets to Cloudflare

Push all active variables from your `.env` securely to Cloudflare Workers Secrets without exposing them in Git:

```bash
npm run cf:secrets
```

### 3. Verify Build & Dry Run (Optional)

Test the build and validate the Worker configuration without deploying:

```bash
npm run deploy:dry-run
```

### 4. Deploy to Production

Deploy the application live to Cloudflare Workers:

```bash
npm run deploy
```

Once finished, Wrangler will output your live URL (e.g., `https://ardianryan-portfolio.<your-subdomain>.workers.dev`).

### 5. Attach a Custom Domain (e.g., `ardianryan.com`)

1. Open the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Compute (Workers & Pages)** > Select **`ardianryan-portfolio`**.
3. Go to **Settings** > **Domains & Routes** > Click **Add Custom Domain**.
4. Enter `ardianryan.com` (or `www.ardianryan.com`) and click **Add Custom Domain**.
5. Cloudflare will automatically provision SSL/TLS certificates and route traffic to your Worker.

---

## 🌐 Option B: Deploy to Cloudflare Pages (Git-Integrated)

If you prefer continuous deployment triggered automatically by `git push`:

### 1. Push your repository to GitHub / GitLab

```bash
git add .
git commit -m "feat: complete portfolio setup"
git push origin main
```

### 2. Create a new Cloudflare Pages project

1. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository.

### 3. Configure Build Settings

| Setting | Value |
|---|---|
| **Framework preset** | `None` / `Custom` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist/client` |
| **Node.js Version** | `22` (Set Environment variable `NODE_VERSION=22`) |

### 4. Add Environment Variables in Pages Dashboard

Under **Settings** > **Environment variables**, add:
* `DATABASE_PROVIDER`
* `DATABASE_URL`
* `ADMIN_PASSWORD`
* `R2_ENDPOINT`
* `R2_BUCKET_NAME`
* `R2_FOLDER_PATH`
* `R2_PUBLIC_URL`
* `R2_ACCESS_KEY_ID`
* `R2_SECRET_ACCESS_KEY`
* `TURNSTILE_SITE_KEY`
* `TURNSTILE_SECRET_KEY`

5. Click **Save and Deploy**.

---

## 🛠️ Handy CLI Commands

| Command | Action |
|---|---|
| `npm run dev` | Start local development server on `http://localhost:3000` |
| `npm run db:reset` | Reset and freshly re-seed the PostgreSQL / local database |
| `npm run cf:secrets` | Safely push all `.env` credentials to Cloudflare Secrets |
| `npm run deploy:dry-run` | Test and validate production build without deploying |
| `npm run deploy` | Build and deploy directly to Cloudflare Workers |
| `npm run deploy:staging` | Deploy to staging environment |
| `npm run cf:whoami` | Check authenticated Cloudflare user and account ID |

---

## ❓ Troubleshooting & FAQs

### 1. Database Connection Timeout on Edge
* **Cause:** Connecting directly to a raw PostgreSQL instance without connection pooling from serverless edge runtimes can cause cold-start latency or socket exhaustion.
* **Solution:** Connect via **Cloudflare Hyperdrive** or use a serverless-ready connection pooler like **Neon Postgres**, **Supabase Pooler (port 6543)**, or **AWS RDS Proxy**.

### 2. 404 on Static Assets or Favicon
* **Solution:** Confirm that `wrangler.jsonc` has `assets.directory` set to `./dist/client` and that `npm run build` completed before running `wrangler deploy`.

### 3. Authentication Fails in `/ctrl-desk`
* **Solution:** Run `npm run cf:secrets` to ensure `ADMIN_PASSWORD` and `TURNSTILE_SECRET_KEY` are synchronized to Cloudflare Workers.

---

## 📄 License & Maintainer
* **Author:** Ardian Ryan (`me@ardianryan.com`)
* **Repository:** [github.com/ardianryan](https://github.com/ardianryan)
