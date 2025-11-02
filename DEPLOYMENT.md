# Railway Deployment Guide for Dexmate

This guide will help you deploy the Dexmate robot management system to Railway.

## Prerequisites

1. [Railway Account](https://railway.app/) (free tier available)
2. [Railway CLI](https://docs.railway.app/develop/cli) installed (optional but recommended)
3. Git repository pushed to GitHub

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (Recommended for First Deploy)

1. **Create a New Project on Railway**

    - Go to [Railway Dashboard](https://railway.app/dashboard)
    - Click "New Project"
    - Select "Deploy from GitHub repo"
    - Authorize Railway to access your GitHub account
    - Select your `Dexmate` repository

2. **Configure Backend Service**

    - Railway will auto-detect the backend Dockerfile
    - Click on the backend service
    - Go to "Variables" tab and add:
        ```
        JWT_SECRET=<generate-a-random-secret-key>
        DATABASE_URL=file:./dev.db
        PORT=3001
        NODE_ENV=production
        ```
    - Generate JWT_SECRET: Use a random string generator or run:
        ```bash
        openssl rand -base64 32
        ```
    - Go to "Settings" → Set root directory to `backend`
    - Click "Deploy"

3. **Configure Frontend Service**

    - Add a new service to the project
    - Select "Deploy from GitHub repo" → Same repository
    - Go to "Settings" → Set root directory to `frontend`
    - Go to "Variables" tab and add:
        ```
        VITE_API_URL=<your-backend-railway-url>
        ```
    - Get backend URL from backend service settings → "Networking" → "Public Domain"
    - Click "Deploy"

4. **Enable Public Networking**

    - For both services, go to "Settings" → "Networking"
    - Click "Generate Domain" to get a public URL
    - Note: Backend URL needed for frontend `VITE_API_URL`

5. **Database Persistence (Important!)**
    - Go to backend service → "Volumes"
    - Click "New Volume"
    - Mount path: `/app` (this persists the SQLite database)
    - Click "Add Volume"

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Link to your project
railway link

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up

# Set environment variables
railway variables set JWT_SECRET=<your-secret>
railway variables set DATABASE_URL=file:./dev.db
```

## Environment Variables Reference

### Backend Service

| Variable       | Description               | Example                                      |
| -------------- | ------------------------- | -------------------------------------------- |
| `JWT_SECRET`   | Secret key for JWT tokens | `your-super-secret-key-change-in-production` |
| `DATABASE_URL` | SQLite database path      | `file:./dev.db`                              |
| `PORT`         | Server port               | `3001`                                       |
| `NODE_ENV`     | Environment               | `production`                                 |

### Frontend Service

| Variable       | Description     | Example                            |
| -------------- | --------------- | ---------------------------------- |
| `VITE_API_URL` | Backend API URL | `https://your-backend.railway.app` |

## Post-Deployment Steps

1. **Run Database Migrations**

    - Go to backend service → "Deployments"
    - Click on latest deployment → "View Logs"
    - Verify migration ran successfully (Prisma migrate deploy)

2. **Seed the Database (Optional)**

    - You can create an initial admin user via the registration endpoint
    - Or run seed script via Railway CLI:
        ```bash
        railway run npm run seed
        ```

3. **Test the Deployment**
    - Visit your frontend URL
    - Try registering a new user
    - Create a robot
    - Test all functionality

## Custom Domain (Optional)

1. Go to frontend service → "Settings" → "Networking"
2. Click "Custom Domain"
3. Add your domain and follow DNS configuration instructions

## Monitoring and Logs

-   **View Logs**: Each service has a "Deployments" tab with real-time logs
-   **Metrics**: Railway provides CPU, memory, and network usage metrics
-   **Health Checks**: Backend has `/api/health` endpoint for monitoring

## Troubleshooting

### Backend won't start

-   Check that `DATABASE_URL` is set correctly
-   Verify JWT_SECRET is set
-   Check deployment logs for Prisma migration errors

### Frontend can't connect to backend

-   Verify `VITE_API_URL` points to correct backend URL
-   Check CORS settings in backend (should allow your frontend domain)
-   Ensure backend service is running

### Database resets on deployment

-   Add a Volume to backend service mounted at `/app`
-   This persists the SQLite database between deployments

### CORS errors

-   Backend already has CORS enabled for all origins in `src/index.js`
-   If needed, update to specific domains in production

## Cost Considerations

**Railway Free Tier Includes:**

-   $5 of usage per month
-   500 hours of usage
-   Up to 8GB RAM
-   Up to 8 vCPUs

**This project should stay within free tier for:**

-   Development/testing
-   Small-scale personal use
-   Portfolio demonstrations

For production use, monitor usage and upgrade as needed.

## Continuous Deployment

Railway automatically deploys on every push to your main branch:

1. Make changes locally
2. Commit and push to GitHub
3. Railway detects changes and redeploys automatically
4. Check deployment status in Railway dashboard

## Database Backups

For production, consider:

1. Regular SQLite file backups using Railway Volumes
2. Or migrate to PostgreSQL (Railway offers managed PostgreSQL)
3. Export data regularly via API endpoints

## Scaling (If Needed)

Railway supports:

-   Vertical scaling (increase RAM/CPU per service)
-   Horizontal scaling (multiple instances with load balancing)
-   Database migration to PostgreSQL for better concurrency

## Support

-   [Railway Documentation](https://docs.railway.app/)
-   [Railway Discord Community](https://discord.gg/railway)
-   [Railway Status Page](https://status.railway.app/)

## Next Steps

After successful deployment:

1. Update README.md with your live URL
2. Test all functionality on production
3. Set up monitoring alerts (if using paid tier)
4. Configure custom domain (optional)
5. Share your deployed app! 🚀
