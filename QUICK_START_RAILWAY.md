# Quick Start: Railway Monorepo Deployment

## TL;DR - Keep Your Monorepo!

✅ You **DO NOT** need to split your repo  
✅ Deploy both services from **ONE** GitHub repository  
✅ Railway handles monorepos perfectly  

## 3-Minute Setup

### 1️⃣ Push to GitHub (if not already done)
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2️⃣ Deploy Backend Service
1. Railway Dashboard → New Service → GitHub Repo → "Dexmate"
2. Settings → Set **Root Directory**: `backend`
3. Variables → Add:
   ```
   JWT_SECRET=<openssl rand -base64 32>
   DATABASE_URL=file:./dev.db
   PORT=3001
   NODE_ENV=production
   ```
4. Settings → Volumes → Add volume at `/app`
5. Settings → Networking → Generate Domain → Copy URL

### 3️⃣ Deploy Frontend Service
1. Same Railway Project → New Service → GitHub Repo → "Dexmate" *(same repo!)*
2. Settings → Set **Root Directory**: `frontend`
3. Variables → Add:
   ```
   VITE_API_URL=https://<your-backend-url>/api
   ```
4. Settings → Networking → Generate Domain

### 4️⃣ Done! 🎉
- Backend: `https://your-backend.railway.app/api/health`
- Frontend: `https://your-frontend.railway.app`

## Your Workflow (After Setup)

```bash
# Make changes in backend/ or frontend/
git add .
git commit -m "New feature"
git push

# Railway automatically redeploys affected services
# No extra steps needed!
```

## File Structure (What You Have)

```
Dexmate/                    ← One GitHub repo
├── backend/                ← Railway Service #1
│   ├── Dockerfile         ← Builds this
│   ├── railway.toml       ← Config
│   └── src/
├── frontend/               ← Railway Service #2  
│   ├── Dockerfile         ← Builds this
│   ├── railway.toml       ← Config
│   └── src/
└── README.md              ← Shared docs
```

## Critical Settings Checklist

### Backend Service
- [ ] Root Directory: `backend`
- [ ] JWT_SECRET variable set
- [ ] Volume added at `/app`
- [ ] Public domain generated

### Frontend Service  
- [ ] Root Directory: `frontend`
- [ ] VITE_API_URL points to backend (with `/api`)
- [ ] Public domain generated

### Both Services
- [ ] Same GitHub repository
- [ ] Auto-deploy enabled (default)
- [ ] Using DOCKERFILE builder

## Troubleshooting

**Build fails?**
→ Check Root Directory is set correctly

**Frontend can't connect?**
→ Verify VITE_API_URL includes `/api` at end

**Database resets?**
→ Add Volume to backend at `/app`

**Still stuck?**
→ Check `RAILWAY_FIX.md` for detailed guide

## Need Help?

- 📖 Full Guide: `RAILWAY_FIX.md`
- 🏗️ Architecture: `MONOREPO_ARCHITECTURE.md`
- 📝 Deployment: `DEPLOYMENT.md`

Happy deploying! 🚀
