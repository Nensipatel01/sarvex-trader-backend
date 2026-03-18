# 🚀 Deployment Guide: Sarvex Trader (Railway & Vercel)

Follow these steps to migrate your backend to Railway and deploy your frontend to Vercel for the "Full Ready App" experience.

## 1. Backend (Railway - HIGHLY RECOMMENDED)
Railway is more reliable for Python deployments than Render.

### Steps:
1. **GitHub Link**: Ensure your `backend` folder is pushed to a GitHub repository.
2. **Railway Project**:
   - Go to [Railway.app](https://railway.app/).
   - Click "New Project" > "Deploy from GitHub repo".
   - Select your `sarvex-trader-backend` repository.
3. **Environment Variables**:
   - In the Railway dashboard under **Variables**, add:
     - `PORT`: `8000` (Railway will assign this automatically, but you can set it).
     - `PYTHON_VERSION`: `3.11.8`.
     - `DATABASE_URL`: (Railway will provide this if you add a PostgreSQL plugin to your project).
4. **Networking**: Railway will automatically generate a domain like `sarvex-trader-backend.up.railway.app`. Ensure this matches the `API_URL` in `frontend/src/services/api.js`.
5. **Verify**: Visit your new Railway URL. It should say: **"SARVEX TERMINAL LIVE - RAILWAY DEPLOY 2026-03-16"**.

---

## 2. Frontend (Vercel)
Your frontend is ready with the premium institutional design.

### Steps:
1. **Import Repo**: Go to [Vercel](https://vercel.com/new) and import your repository.
2. **Root Directory**: Select `frontend` as the root directory.
3. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**:
   - Add `VITE_API_URL` with your new Railway backend URL.

---

## 💎 Features Activated:
- **Neural Terminal**: AI Market Analyst Chat + Insights.
- **Institutional Portfolio**: Dynamic equity and risk visualization.
- **Market command**: Surveillance mode with technical indicators.

**Just push the latest code to GitHub and link to Railway/Vercel to go live!**
