# TradersLAB - Full Stack Trading Calls Application

## Overview
TradersLAB is a full-stack web application for managing trading calls with user authentication and role-based access control.

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite + Ant Design + React Query + React Router
- **Backend:** Fastify + TypeScript + Prisma ORM + SQLite + JWT Authentication
- **Database:** SQLite (development), can be migrated to PostgreSQL for production

## Project Structure
```
traderslab-full/
├── backend/           # Fastify API server
│   ├── prisma/        # Database schema and migrations
│   ├── src/
│   │   ├── lib/       # Environment and utilities
│   │   ├── plugins/   # Fastify plugins (auth)
│   │   └── routes/    # API route handlers
│   └── package.json
└── frontend/          # React frontend application
    ├── src/
    │   ├── components/ # Reusable React components
    │   ├── lib/        # API client configuration
    │   ├── pages/      # Page components
    │   └── store/      # State management
    └── package.json
```

## Recent Changes (2025-11-23)

### Replit Environment Setup
1. **Backend Configuration:**
   - Changed port from 3333 to 3000 (Replit allowed port)
   - Configured backend to use `0.0.0.0` as host (required for Replit proxy access)
   - Set up environment variables (PORT, JWT_SECRET, DATABASE_URL)
   - Fixed binary permissions for Prisma and tsx
   - Successfully initialized database with migrations and seed data

2. **Frontend Configuration:**
   - Changed port from 5173 to 5000 (required for Replit webview)
   - Configured Vite to bind to `0.0.0.0` for Replit proxy support
   - Set up HMR (Hot Module Reload) for WebSocket tunneling
   - Configured API URL to use Replit domain with backend port

3. **Workflows:**
   - **Frontend Workflow:** Runs Vite dev server on port 5000 with webview output
   - **Backend Workflow:** Runs Fastify API on port 3000 with console output

4. **Deployment:**
   - Configured as VM deployment (maintains server state)
   - Build step includes: backend deps + Prisma + frontend build
   - Run step launches both backend and frontend preview

## Environment Variables

### Development
- `PORT=3000` - Backend API port
- `JWT_SECRET=replit-dev-secret-change-in-production` - JWT signing secret
- `DATABASE_URL=file:./dev.db` - SQLite database path
- `VITE_API_URL=https://{REPLIT_DOMAIN}:3000` - Frontend API endpoint

### Production (Important Security Notes)

**⚠️ WARNING: Current setup is for DEVELOPMENT ONLY**

Before deploying to production, you MUST:
1. **Generate a secure JWT_SECRET** - Current value is a development placeholder
2. **Migrate to PostgreSQL** - SQLite is not recommended for production
3. **Update VITE_API_URL** - Point to production backend domain
4. **Set up proper secret management** - Use Replit Secrets or environment variables
5. **Review and harden CORS settings** - Current setting allows all origins
6. **Enable HTTPS** - Ensure secure communication in production
7. **Add rate limiting** - Protect against abuse
8. **Set up monitoring and logging** - Track errors and performance

Production environment variables should be set via Replit's deployment configuration.

## Default User Credentials
After seeding the database:
- **Email:** admin@traderslab.local
- **Password:** admin1234
- **Role:** ADMIN

## Features
- User authentication with JWT tokens
- Role-based access control (ADMIN/VIEWER)
- Trading call management (CRUD operations)
- Call status tracking (AGUARDANDO/ATIVO/FINALIZADO/CANCELADO)
- User management (admin only)
- Responsive UI with Ant Design components

## Development Commands

### Backend
```bash
cd traderslab-full/backend
npm install              # Install dependencies
npm run prisma:generate  # Generate Prisma client
npm run seed            # Seed database with test data
npm run dev             # Start development server
```

### Frontend
```bash
cd traderslab-full/frontend
npm install             # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
```

## Database Schema

### User Model
- Authentication and user profile
- Roles: ADMIN (full access) or VIEWER (read-only)
- One-to-many relationship with Calls

### Call Model
- Trading call information (asset, operation, entry, stop, targets)
- Status tracking through lifecycle
- Links to author (User)
- Timestamps for creation and updates

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Calls
- `GET /calls` - List all calls
- `POST /calls` - Create new call (authenticated)
- `PUT /calls/:id` - Update call (authenticated)
- `DELETE /calls/:id` - Delete call (admin only)

### Users
- `GET /users` - List all users (admin only)
- Additional user management endpoints

## Verification Tests (Completed 2025-11-23)

### Backend API Tests
```bash
# Health check - PASSED
curl http://localhost:3000/health
# Response: {"ok":true}

# Login authentication - PASSED
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@traderslab.local","password":"admin1234"}'
# Response: {"accessToken":"eyJ...", "user":{...}}
```

### Frontend Tests
- Login page loads successfully ✓
- Frontend accessible via Replit webview on port 5000 ✓
- React application renders correctly ✓

## Notes
- The application is fully functional in the Replit environment
- Backend binds to 0.0.0.0 to allow Replit proxy access from frontend
- Frontend is accessible through Replit's webview proxy on port 5000
- Database is seeded with sample admin user for testing
- All dependencies have been installed and configured
- Both workflows are running successfully
- API endpoints verified and working correctly

## Architecture Decisions
1. **Port Configuration:** Changed from original 3333 to 3000 to comply with Replit's allowed ports
2. **Host Binding:** Both backend and frontend use 0.0.0.0 to enable Replit proxy access
3. **SQLite Database:** Using SQLite for development; can migrate to PostgreSQL for production scaling
4. **JWT Authentication:** Secure token-based authentication with role-based access control
5. **Monorepo Structure:** Separate backend/frontend folders for clear separation of concerns
