# Railway Deployment Fix Guide

## Current Error

"Error creating build plan with Railpack" - This happens because Railway couldn't detect how to build the monorepo.

## ✅ Keeping Your Monorepo

**Good news!** You can keep your monorepo structure. Railway fully supports monorepos - you just deploy each service (backend/frontend) as **separate Railway services** from the **same GitHub repository**.

### How It Works:
- ✅ **One GitHub repo** (Anselwang99/Dexmate) 
- ✅ **Two Railway services** in the same Railway project
- ✅ Each service points to the same repo but different root directories
- ✅ Both auto-deploy when you push to GitHub

This is actually the **recommended approach** for monorepos on Railway!

## Why This Approach Keeps Your Monorepo Intact

### ✅ Advantages:
1. **Single Git Repository** - All code stays in one place
2. **Shared Version Control** - One commit updates both services
3. **Atomic Deploys** - Push once, both services redeploy
4. **Easier Collaboration** - Team works in one repo
5. **Consistent Dependencies** - Shared package management
6. **Simple Local Dev** - Clone once, work on everything

### How Railway Handles It:
```
Your GitHub Repo (Dexmate)
├── backend/          ← Railway Service 1 (Root: backend/)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── frontend/         ← Railway Service 2 (Root: frontend/)
    ├── Dockerfile
    ├── package.json
    └── src/
```

Both services pull from the **same repository** but build from **different root directories**.

### What Happens on Git Push:
1. You push to GitHub
2. Railway detects the change
3. **Both services** automatically redeploy
4. Each builds from its respective directory
5. Both go live together 🚀

## Solution: Deploy Each Service Separately (Same Repo)

### Step 1: Delete Current Failed Deployment

1. In Railway dashboard, click on "Dexmate" project
2. Delete the current service that failed
3. Or create a new project if needed

### Step 2: Deploy Backend Service

1. **Create New Service**
    - Click "New Service" in Railway dashboard
    - Select "GitHub Repo"
    - Choose "Anselwang99/Dexmate"
2. **Configure Backend**

    - Click on the new service
    - Go to "Settings" tab
    - Scroll to "Source"
    - Set **Root Directory** to: `backend`
    - Set **Build Command**: (leave empty, Dockerfile handles it)
    - Set **Start Command**: (leave empty, Dockerfile handles it)

3. **Add Environment Variables**

    - Go to "Variables" tab
    - Click "New Variable" and add these:

    ```
    JWT_SECRET=<generate-random-secret>
    DATABASE_URL=file:./dev.db
    PORT=3001
    NODE_ENV=production
    ```

    Generate JWT_SECRET by running in your terminal:

    ```bash
    openssl rand -base64 32
    ```

4. **Add Volume for Database Persistence**

    - Go to "Settings" tab → "Volumes"
    - Click "Add Volume"
    - Mount Path: `/app`
    - Click "Add"

5. **Generate Public Domain**

    - Go to "Settings" tab → "Networking"
    - Click "Generate Domain"
    - Copy the URL (you'll need it for frontend)

6. **Deploy**
    - Railway should auto-deploy
    - Watch the logs in "Deployments" tab
    - Wait for "Build successful" message

### Step 3: Deploy Frontend Service

1. **Add Another Service (Same Repo!)**

    - In the **same Railway project**, click "+ New"
    - Select "GitHub Repo"
    - Choose "Anselwang99/Dexmate" **again** (same repository)
    - ⭐ This is the magic: same repo, different root directory!

2. **Configure Frontend**

    - Click on the new service
    - Rename it to "frontend" (Settings → General → Name)
    - Go to "Settings" tab
    - Set **Root Directory** to: `frontend`

3. **Add Environment Variables**

    - Go to "Variables" tab
    - Add:

    ```
    VITE_API_URL=<your-backend-railway-url>/api
    ```

    Example: `https://dexmate-backend-production.up.railway.app/api`

    ⚠️ **Important**: Include `/api` at the end!

4. **Generate Public Domain**

    - Go to "Settings" tab → "Networking"
    - Click "Generate Domain"
    - This will be your public frontend URL

5. **Deploy**
    - Railway auto-deploys
    - Watch deployment logs

### Step 4: Verify Deployment

1. **Test Backend**

    - Visit: `https://your-backend-url.railway.app/api/health`
    - Should return: `{"status":"ok","message":"Server is running"}`

2. **Test Frontend**
    - Visit: `https://your-frontend-url.railway.app`
    - Try registering a new user
    - Create a robot
    - Test all features

## Common Issues & Solutions

### Issue 1: Backend Fails to Start

**Error**: "Cannot find module '@prisma/client'"
**Solution**:

-   The updated Dockerfile now installs all dependencies first
-   Runs `prisma generate`
-   Then removes dev dependencies
-   Redeploy should fix this

### Issue 2: Frontend Can't Connect to Backend

**Error**: Network errors or "Failed to fetch"
**Solution**:

-   Check `VITE_API_URL` in frontend variables
-   Make sure it includes `/api` at the end
-   Verify backend URL is correct
-   Check backend is actually running

### Issue 3: Database Resets on Redeploy

**Solution**:

-   Make sure you added a Volume to backend
-   Mount path must be `/app`
-   This persists the SQLite database

### Issue 4: CORS Errors

**Solution**:

-   Backend already has CORS enabled for all origins
-   If still having issues, update backend CORS to allow specific frontend domain

## Alternative: Use Nixpacks (Simpler Build)

If Docker builds are slow, you can use Nixpacks instead:

1. **For Backend**:

    - Delete `railway.toml`
    - Railway will auto-detect Node.js
    - Set Start Command: `npm start`
    - Set Build Command: `npm install && npx prisma generate`

2. **For Frontend**:
    - Delete `railway.toml`
    - Railway auto-detects Vite
    - Set Build Command: `npm run build`
    - Set Start Command: `npx serve dist -p $PORT`

## Quick Commands Reference

```bash
# Generate JWT Secret
openssl rand -base64 32

# Test backend health (replace URL)
curl https://your-backend.railway.app/api/health

# View Railway logs
railway logs

# Force redeploy
git commit --allow-empty -m "Trigger redeploy"
git push
```

## Expected Deployment Times

-   Backend: 2-3 minutes (Docker build)
-   Frontend: 3-4 minutes (Docker build with nginx)
-   Total: 5-7 minutes for both services

## Monorepo Workflow After Setup

Once deployed, your workflow stays simple:

```bash
# Make changes to either backend or frontend
git add .
git commit -m "Update features"
git push origin main

# Railway automatically:
# 1. Detects which services changed
# 2. Rebuilds affected services
# 3. Deploys updates
```

**Pro tip:** Railway is smart enough to only rebuild services that changed!

## What I Fixed

1. ✅ Added `railway.toml` to both services to use Docker builds
2. ✅ Updated backend Dockerfile to run migrations automatically
3. ✅ Backend Dockerfile now properly installs Prisma
4. ✅ Both services configured for Docker deployment
5. ✅ Health check configured for backend

## Next Steps After Successful Deployment

1. **Update README** with live URLs
2. **Test all functionality** on production
3. **Monitor usage** in Railway dashboard
4. **Set up custom domain** (optional)
5. **Configure alerts** for downtime (paid tier)

## Support

If you're still having issues:

1. Check Railway deployment logs (Deployments tab)
2. Verify all environment variables are set correctly
3. Ensure Root Directory is set for both services
4. Check that both services are running (not crashed)

Good luck! 🚀
