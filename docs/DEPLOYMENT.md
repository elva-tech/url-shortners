# ELVA Links Service - Deployment Guide

Targets: **EC2**, **VPS**, **Render** (with reverse proxy)

## 1. Environment variables

Copy `.env.example` to `.env`:

```env
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
BASE_URL=https://links.elvatech.in
SHORT_CODE_LENGTH=6
CORS_ORIGIN=https://links.elvatech.in,https://notify.elvatech.in,http://localhost:5173
```

## 2. Install and run with PM2

```bash
npm install --production
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 3. NGINX reverse proxy + SSL

Use `docs/nginx.example.conf` as a starting point.

- Terminate SSL at NGINX (Let's Encrypt / Certbot)
- Proxy `https://links.elvatech.in` -> `http://127.0.0.1:3000`
- Enable `proxy_set_header X-Forwarded-Proto https`

## 4. Render deployment

**Build command:** `npm install`  
**Start command:** `node server.js`  
**Health check path:** `/`

### Required environment variables (Render Dashboard → Environment)

| Key | Example |
|-----|---------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/links-service` |
| `BASE_URL` | `https://url-shortners-m3xw.onrender.com` (or your custom domain) |
| `CORS_ORIGIN` | `https://links.elvatech.in,https://notify.elvatech.in` |
| `SHORT_CODE_LENGTH` | `6` |

`PORT` is set automatically by Render — do not override it.

### MongoDB Atlas (required for Render)

1. **Database Access** — user with read/write on your database
2. **Network Access** — allow `0.0.0.0/0` (or Render outbound IPs) so Render can connect
3. URI must include a database name, e.g. `...mongodb.net/links-service?retryWrites=true&w=majority`

### If deploy exits with status 1

Check **Logs** after redeploy. You should see either:

- `MONGO_URI : MISSING` → add `MONGO_URI` in Render Environment
- `MongoDB Connection Failed: ...` → fix Atlas network access or URI

Optional: set **Node version** to `20` in Render (or use repo `.node-version`).

### Custom domain

Point `links.elvatech.in` to Render, then set `BASE_URL=https://links.elvatech.in`.

## 5. Frontend (Vercel) + branded domain

**Domain:** `https://links.elvatech.in`  
**Backend (hidden):** `https://url-shortners-m3xw.onrender.com`

Deploy `frontend/` to Vercel. `frontend/vercel.json` proxies:

| Path | Proxied to Render |
|------|-------------------|
| `/api/:path*` | `/api/:path*` |
| `/:shortCode` (6 chars) | `/:shortCode` |

Users only see `links.elvatech.in`. Set on **Render** (backend):

```env
BASE_URL=https://links.elvatech.in
```

Frontend env on Vercel (optional — leave empty for same-origin):

```env
VITE_API_URL=
```

The React app calls `/api/create`; Vercel forwards to Render. Short links like `https://links.elvatech.in/abc123` proxy to the redirect engine without exposing Render in the browser address bar until the final HTTP redirect.

## 6. DLT / SMS flow

See `utils/dltIntegration.js` for notify.elvatech.in -> Fast2SMS -> redirect flow.
