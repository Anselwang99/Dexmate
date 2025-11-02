# Monorepo Architecture on Railway

## Your Setup (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                        │
│                    github.com/Anselwang99/Dexmate               │
│                                                                  │
│  ├── backend/                                                   │
│  │   ├── Dockerfile                                            │
│  │   ├── railway.toml                                          │
│  │   ├── package.json                                          │
│  │   └── src/                                                  │
│  │                                                             │
│  ├── frontend/                                                 │
│  │   ├── Dockerfile                                           │
│  │   ├── railway.toml                                         │
│  │   ├── package.json                                         │
│  │   └── src/                                                 │
│  │                                                            │
│  ├── docker-compose.yml (for local dev)                       │
│  ├── README.md                                                │
│  └── .env.example                                             │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ Railway watches for changes
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Railway Project                           │
│                                                                  │
│  ┌────────────────────────┐  ┌───────────────────────┐         │
│  │  Backend Service       │  │  Frontend Service      │         │
│  │                        │  │                        │         │
│  │  Repo: Dexmate        │  │  Repo: Dexmate         │         │
│  │  Root: backend/       │  │  Root: frontend/       │         │
│  │  Builder: Docker      │  │  Builder: Docker       │         │
│  │                        │  │                        │         │
│  │  ENV:                 │  │  ENV:                  │         │
│  │  - JWT_SECRET         │  │  - VITE_API_URL        │         │
│  │  - DATABASE_URL       │  │                        │         │
│  │  - PORT=3001          │  │                        │         │
│  │                        │  │                        │         │
│  │  Volume: /app         │  │  No volume needed      │         │
│  │  (persists DB)        │  │                        │         │
│  │                        │  │                        │         │
│  │  URL: backend.railway │  │  URL: frontend.railway │         │
│  └────────────────────────┘  └───────────────────────┘         │
│            │                            │                        │
└────────────┼────────────────────────────┼────────────────────────┘
             │                            │
             ▼                            ▼
    https://dexmate-backend      https://dexmate-frontend
    .up.railway.app              .up.railway.app
    
    API Endpoints:               React SPA
    - /api/auth                  Connects to backend
    - /api/robots                via VITE_API_URL
    - /api/groups
    - /api/settings
```

## Deployment Flow

```
┌──────────────┐
│  Developer   │
│  Local Dev   │
└──────┬───────┘
       │
       │ git add .
       │ git commit -m "Add feature"
       │ git push origin main
       │
       ▼
┌─────────────────┐
│     GitHub      │
│   (Webhook)     │
└────────┬────────┘
         │
         │ Triggers Railway
         │
         ▼
┌──────────────────────────────────────┐
│          Railway Platform            │
│                                      │
│  1. Clone repo from GitHub          │
│  2. Detect changes                  │
│  3. Build affected services:        │
│                                      │
│     Backend:                        │
│     - cd backend/                   │
│     - docker build -f Dockerfile    │
│     - npm install                   │
│     - prisma generate               │
│     - prisma migrate deploy         │
│     - npm start                     │
│                                      │
│     Frontend:                       │
│     - cd frontend/                  │
│     - docker build -f Dockerfile    │
│     - npm install                   │
│     - npm run build                 │
│     - nginx serves dist/            │
│                                      │
│  4. Deploy to production URLs       │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Live Production │
│                  │
│  ✅ Backend API  │
│  ✅ Frontend UI  │
└──────────────────┘
```

## Local Development vs Production

### Local Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev        # Runs on localhost:3001

# Terminal 2 - Frontend  
cd frontend
npm run dev        # Runs on localhost:5173
                  # Connects to localhost:3001
```

### Production (Railway)
```
Backend:  https://dexmate-backend-production.up.railway.app
Frontend: https://dexmate-frontend-production.up.railway.app
          (connects to backend Railway URL)
```

## Key Configuration Points

### 1. Backend Service Settings
```yaml
Root Directory: backend
Builder: DOCKERFILE
Dockerfile Path: Dockerfile
Environment Variables:
  - JWT_SECRET=<random-secret>
  - DATABASE_URL=file:./dev.db
  - PORT=3001
  - NODE_ENV=production
Volume:
  - Mount Path: /app
```

### 2. Frontend Service Settings
```yaml
Root Directory: frontend
Builder: DOCKERFILE
Dockerfile Path: Dockerfile
Environment Variables:
  - VITE_API_URL=https://<backend-url>.railway.app/api
```

### 3. How They Connect
```
User Browser
    │
    ▼
Frontend (nginx)
    │
    │ VITE_API_URL
    ▼
Backend (Express + Prisma)
    │
    ▼
SQLite Database (persisted in volume)
```

## Benefits of This Architecture

✅ **Single Repository**
- One `git clone`
- One place for all code
- Easy to find everything

✅ **Shared Version Control**
- Backend + Frontend changes in same commit
- Atomic updates
- Clear history

✅ **Automatic Deployments**
- Push to GitHub once
- Railway deploys both services
- No manual triggers needed

✅ **Environment Isolation**
- Each service has its own resources
- Independent scaling
- Separate logs and metrics

✅ **Easy Rollbacks**
- Git revert works for both
- Railway keeps deployment history
- One click to rollback

## Common Misconceptions

❌ **"I need separate repos for Railway"**
✅ **Reality:** Railway loves monorepos! Just use different root directories.

❌ **"Railway.yaml should define both services"**
✅ **Reality:** Railway uses dashboard config or railway.toml per service.

❌ **"I need to deploy manually"**
✅ **Reality:** Railway auto-deploys on every git push.

❌ **"Monorepos are slower to deploy"**
✅ **Reality:** Railway only rebuilds changed services!

## Summary

Your current structure is **perfect** for Railway:
- Keep your monorepo structure
- Deploy backend and frontend as separate Railway services
- Both pull from the same GitHub repository
- Each builds from its own directory
- Auto-deploy on every push

This is **exactly** how professional teams deploy monorepos! 🚀
