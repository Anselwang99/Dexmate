# Dexmate - Robot Management System

A full-stack web application for managing robots with user authentication, group management, and permission-based access control.

## 🔗 Demo Link

-   https://dexmate-demo.up.railway.app/login

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
-   🎨 **Modern UI** with Tailwind CSS and fully responsive mobile design
-   📱 **Mobile-friendly** with hamburger menu and optimized layouts
-   🔐 **Secure** password hashing and JWT authentication
-   🗑️ **Group deletion** - Admins can delete groups with cascade cleanup
-   🧪 **Comprehensive test coverage** - 34 tests across authentication, robots, groups, and permissions

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

**Test Coverage: 34 Passing Tests**

### Authentication Tests (9 tests)

**Registration (`POST /api/auth/register`)**

-   ✅ Successfully register new user with valid data
-   ✅ Return JWT token and user object (excluding password)
-   ✅ Reject registration with missing fields
-   ✅ Reject duplicate email addresses
-   ✅ Validate email format

**Login (`POST /api/auth/login`)**

-   ✅ Successfully login with correct credentials
-   ✅ Return JWT token and user object
-   ✅ Reject incorrect password
-   ✅ Reject non-existent email
-   ✅ Reject login with missing fields

### Robot Management Tests (11 tests)

**Create Robot (`POST /api/robots`)**

-   ✅ Create robot with valid data (name, serialNumber, model, ownerType)
-   ✅ Verify robot is owned by authenticated user
-   ✅ Reject creation without authentication
-   ✅ Reject creation with missing required fields
-   ✅ Reject duplicate serial numbers

**List Robots (`GET /api/robots`)**

-   ✅ Retrieve all robots owned by or accessible to user
-   ✅ Reject requests without authentication

**Get Robot Details (`GET /api/robots/:serialNumber`)**

-   ✅ Retrieve specific robot by serial number
-   ✅ Return 404 for non-existent robots
-   ✅ Reject requests without authentication

**Delete Robot (`DELETE /api/robots/:serialNumber`)**

-   ✅ Successfully delete owned robot
-   ✅ Verify robot is removed from database
-   ✅ Return 404 for non-existent robots

### Group Management Tests (8 tests)

**Create Group (`POST /api/groups`)**

-   ✅ Create group with name and description
-   ✅ Creator automatically becomes admin
-   ✅ Reject creation without authentication
-   ✅ Reject creation with missing name

**List Groups (`GET /api/groups`)**

-   ✅ Retrieve all groups user is a member of
-   ✅ Reject requests without authentication

**Add Member (`POST /api/groups/:id/members`)**

-   ✅ Admin can add members with specified role
-   ✅ Reject member addition by non-admin users
-   ✅ Reject duplicate member additions

**Remove Member (`DELETE /api/groups/:id/members/:userId`)**

-   ✅ Admin can remove members from group
-   ✅ Permissions are automatically cleaned up on removal
-   ✅ Reject member removal by non-admin users

### Permission Management Tests (6 tests)

**Grant Permission (`POST /api/robots/:serialNumber/permissions`)**

-   ✅ Owner can grant USAGE permission to users
-   ✅ Owner can grant ADMIN permission to users
-   ✅ Update permission level if already exists (upsert)
-   ✅ Reject permission grant by non-owners

**Revoke Permission (`DELETE /api/robots/:serialNumber/permissions/:userId`)**

-   ✅ Owner can revoke user permissions
-   ✅ Admin users can revoke their own permissions
-   ✅ Verify permission removal from database

### Test Infrastructure

-   **Framework**: Jest + Supertest
-   **Coverage**: All critical API endpoints
-   **Database**: Isolated test data with cleanup
-   **Authentication**: JWT token testing
-   **Error Handling**: Validation and authorization checks

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

The deployed application includes seed data for testing:

**Admin Account:**

-   Email: `admin@demo.com`
-   Password: `admin123`
-   Role: Group Admin (can manage group members, assign robots, grant permissions)

**Regular User Account:**

-   Email: `user@demo.com`
-   Password: `user123`
-   Role: Group Member (can access assigned robots and save settings)

**To seed the database locally:**

```bash
cd backend
npm run seed
```

**Note:** On Railway deployment, you can either:

1. Register a new account directly on the deployed app
2. Seed the database using Railway CLI:
    ```bash
    railway run npm run seed
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
-   `PATCH /api/groups/:id/members/:userId/role` - Update member role
-   `DELETE /api/groups/:id` - Delete group (admin only)

### Settings

-   `GET /api/settings/:serialNumber` - Get user settings for robot
-   `PUT /api/settings/:serialNumber` - Update settings

## 🏗️ Architecture Decisions

### Technology Choices

#### Frontend Stack

-   **React 18**: Modern UI library with hooks for state management and excellent ecosystem
-   **Vite**: Lightning-fast build tool with hot module replacement (HMR) for better developer experience
-   **Tailwind CSS**: Utility-first CSS framework for rapid UI development and consistent design
-   **React Router v6**: Declarative routing with improved API and better bundle size
-   **Axios**: Promise-based HTTP client with interceptors for token management

**Why?** React with Vite provides the best developer experience with instant feedback during development. Tailwind CSS eliminates the need for custom CSS files and ensures consistent styling across the application.

#### Backend Stack

-   **Node.js + Express 5**: Lightweight, fast, and excellent for RESTful APIs
-   **Prisma ORM 6.18**: Type-safe database client with excellent TypeScript support and migrations
-   **SQLite**: Zero-configuration database perfect for development and demos
-   **JWT**: Stateless authentication that scales well
-   **bcryptjs**: Industry-standard password hashing

**Why?** Express provides simplicity and flexibility. Prisma offers type safety and makes database operations straightforward. SQLite requires no setup and is perfect for this scale, but the schema can easily migrate to PostgreSQL for production.

### Design Decisions & Trade-offs

#### 1. **SQLite vs PostgreSQL**

**Decision:** Use SQLite for development/demo, design schema for easy PostgreSQL migration

**Trade-offs:**

-   ✅ **Pros**: Zero configuration, portable (single file), perfect for demos
-   ❌ **Cons**: Limited concurrent writes, no advanced features
-   **Migration Path**: Prisma schema works with PostgreSQL with minimal changes

#### 2. **Monorepo vs Separate Repositories**

**Decision:** Keep frontend and backend in the same repository

**Trade-offs:**

-   ✅ **Pros**: Single source of truth, easier dependency management, simpler deployment
-   ❌ **Cons**: Larger repository size, shared dependencies
-   **Rationale**: For a tightly-coupled application like this, the benefits of keeping everything together outweigh the drawbacks

#### 3. **Explicit Permission Model**

**Decision:** No automatic permissions - all access must be explicitly granted

**Trade-offs:**

-   ✅ **Pros**: More secure, clear audit trail, prevents accidental data exposure
-   ❌ **Cons**: More setup required, group admins must explicitly assign robots
-   **Rationale**: Security-first approach. While it requires more initial setup, it prevents scenarios where adding a user to a group automatically grants access to sensitive robots

#### 4. **SessionStorage vs LocalStorage**

**Decision:** Use sessionStorage for authentication tokens

**Trade-offs:**

-   ✅ **Pros**: Better security (tokens cleared on tab close), allows multiple accounts in different tabs
-   ❌ **Cons**: Users must re-login after closing browser
-   **Rationale**: Security and multi-account testing outweigh the convenience of persistent sessions

#### 5. **JWT vs Session-based Auth**

**Decision:** Use JWT tokens

**Trade-offs:**

-   ✅ **Pros**: Stateless, scales horizontally, works across domains
-   ❌ **Cons**: Can't invalidate tokens server-side without additional infrastructure
-   **Rationale**: Simpler architecture, better for microservices if we scale, no session store needed

#### 6. **Docker + nginx for Frontend**

**Decision:** Use multi-stage Docker builds with nginx for production

**Trade-offs:**

-   ✅ **Pros**: Consistent deployments, optimized production builds, fast serving
-   ❌ **Cons**: More complex than serving directly from Node
-   **Rationale**: nginx is production-grade and handles static files better than Node.js

#### 7. **Mobile-First Responsive Design**

**Decision:** Implement hamburger menu and responsive layouts

**Trade-offs:**

-   ✅ **Pros**: Works on all devices, better UX, modern design patterns
-   ❌ **Cons**: More CSS complexity
-   **Rationale**: Modern web apps must be mobile-friendly; this is a requirement, not optional

### Key Features & Implementation Choices

#### Permission System

-   **Choice**: Two-tier permission model (USAGE vs ADMIN)
-   **Rationale**: Balances simplicity with flexibility. USAGE allows basic access, ADMIN allows permission management

#### Group Ownership

-   **Choice**: Robots can be owned by either User or Group (not both)
-   **Rationale**: Simplifies ownership logic and prevents ambiguous scenarios

#### Settings Storage

-   **Choice**: JSON field in database for user settings
-   **Rationale**: Flexible schema without needing migrations for new settings. Easy to add features without database changes

#### Serial Number Generation

-   **Choice**: Client-side UUID generation with timestamp
-   **Rationale**: Ensures uniqueness and provides user-friendly format (SN-timestamp-random)

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

## 👨‍💻 Author

**Ansel Wang**

-   GitHub: [@Anselwang99](https://github.com/Anselwang99)
