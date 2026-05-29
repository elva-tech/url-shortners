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

- Build command: `npm install`
- Start command: `npm run start:prod`
- Set all environment variables in Render dashboard
- Use custom domain `links.elvatech.in`

## 5. Frontend (Vercel)

Deploy `frontend/` separately with:

```env
VITE_API_URL=https://links.elvatech.in
```

## 6. DLT / SMS flow

See `utils/dltIntegration.js` for notify.elvatech.in -> Fast2SMS -> redirect flow.
