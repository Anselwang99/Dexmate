# Dexmate - Robot Management System

A full-stack web application for managing robots with user authentication, group management, and permission-based access control.

## 🚀 Features

### Flow 1: Personal Robot Management

-   User registration and authentication with JWT
-   Create and manage personal robots
-   Unique serial number validation
-   Full CRUD operations for robots

### Flow 2: Group Robot Management

-   Create groups with admin/member roles
-   Assign robots to group members
-   Permission-based access (USAGE/ADMIN levels)
-   Group admins can manage all group-owned robots
-   Remove members with automatic permission cleanup

### Flow 3: Advanced Permission System

-   Explicit permission assignment (no automatic access)
-   Grant/revoke robot permissions
-   User-specific robot settings
-   Owner and permission display
-   Self-service permission management

### Bonus Features ✨

-   🐳 **Docker support** with docker-compose orchestration
-   ✅ **Unit tests** with 34 passing tests across all critical endpoints
-   💬 **Error handling** with user-friendly messages and loading states
-   🎨 **Modern UI** with Tailwind CSS and responsive design
-   🔄 **Cross-tab authentication** sync with localStorage events
-   🔐 **Secure** password hashing and JWT authentication

## 🛠️ Tech Stack

### Frontend

-   **React 18** - UI library
-   **Vite** - Build tool and dev server
-   **React Router v6** - Client-side routing
-   **Tailwind CSS** - Utility-first styling
-   **Axios** - HTTP client

### Backend

-   **Node.js** - Runtime environment
-   **Express 5** - Web framework
-   **Prisma ORM 6.18** - Database toolkit
-   **SQLite** - Database (easily swappable)
-   **JWT** - Authentication tokens
-   **bcryptjs** - Password hashing

### DevOps

-   **Docker** - Containerization
-   **docker-compose** - Multi-container orchestration
-   **nginx** - Frontend web server
-   **Jest + Supertest** - Testing framework

## 📋 Prerequisites

-   **Node.js** 18+ and npm
-   **Docker** and docker-compose (for containerized deployment)
-   **Git** for version control

## 🏃 Quick Start

### Local Development

1. **Clone the repository**

    ```bash
    git clone https://github.com/Anselwang99/Dexmate.git
    cd Dexmate
    ```

2. **Set up environment variables**

    ```bash
    cp .env.example backend/.env
    # Edit backend/.env and set JWT_SECRET
    ```

3. **Install dependencies and start backend**

    ```bash
    cd backend
    npm install
    npx prisma generate
    npx prisma migrate deploy
    npm run dev
    ```

    Backend runs on http://localhost:3001

4. **Install dependencies and start frontend** (in new terminal)
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Frontend runs on http://localhost:5173

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

Access the app at http://localhost

## 🧪 Running Tests

```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
```

**Test Coverage:**

-   ✅ 34 tests passing
-   ✅ Authentication (register, login, validation)
-   ✅ Robot management (CRUD, permissions)
-   ✅ Group management (create, members, roles)
-   ✅ Permission system (grant, revoke, update)

## 📁 Project Structure

```
Dexmate/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth middleware
│   │   ├── config/           # Database config
│   │   └── utils/            # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # DB migrations
│   ├── __tests__/            # Unit tests
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   └── services/         # API client
│   ├── Dockerfile
│   └── nginx.conf            # nginx config
├── docker-compose.yml
├── DEPLOYMENT.md             # Railway deployment guide
└── README.md
```

## 🚢 Deployment

### Deploy to Railway

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Railway deployment instructions.

**Quick Railway Deploy:**

1. Push code to GitHub
2. Create new Railway project from GitHub repo
3. Configure environment variables (see DEPLOYMENT.md)
4. Railway auto-deploys on every push

### Environment Variables

**Backend (.env)**

```env
JWT_SECRET=your-super-secret-key
DATABASE_URL=file:./dev.db
PORT=3001
NODE_ENV=production
```

**Frontend**

```env
VITE_API_URL=https://your-backend-url.railway.app
```

## 🎮 Demo Accounts

After deployment, register with:

-   Email: demo@example.com
-   Password: demo123

Or seed database:

```bash
npm run seed
```

## 🔑 Key API Endpoints

### Authentication

-   `POST /api/auth/register` - Register new user
-   `POST /api/auth/login` - Login
-   `GET /api/auth/me` - Get current user

### Robots

-   `GET /api/robots` - List user's robots
-   `POST /api/robots` - Create robot
-   `GET /api/robots/:serialNumber` - Get robot details
-   `DELETE /api/robots/:serialNumber` - Delete robot
-   `POST /api/robots/:serialNumber/permissions` - Grant permission
-   `DELETE /api/robots/:serialNumber/permissions/:userId` - Revoke permission

### Groups

-   `GET /api/groups` - List user's groups
-   `POST /api/groups` - Create group
-   `POST /api/groups/:id/members` - Add member
-   `DELETE /api/groups/:id/members/:userId` - Remove member

### Settings

-   `GET /api/settings/:serialNumber` - Get user settings for robot
-   `PUT /api/settings/:serialNumber` - Update settings

## 🏗️ Architecture Decisions

### Why SQLite?

-   Simple setup for development
-   Zero configuration
-   Easy to migrate to PostgreSQL for production
-   Perfect for demo/portfolio projects

### Why Monorepo?

-   Simpler deployment with docker-compose
-   Single source of truth
-   Easier local development
-   Better for tightly-coupled frontend/backend

### Why Explicit Permissions?

-   More secure (no automatic access)
-   Clear audit trail
-   Flexible permission model
-   Prevents accidental data exposure

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Ansel Wang**

-   GitHub: [@Anselwang99](https://github.com/Anselwang99)

## 🙏 Acknowledgments

-   Built as part of a full-stack engineering assessment
-   Implements all required flows plus bonus features
-   Production-ready with Docker, tests, and deployment guides
