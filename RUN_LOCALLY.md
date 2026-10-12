# How to Run Fraylon Academy LMS Locally

## Prerequisites

- Docker Desktop (for PostgreSQL and Qdrant)
- Node.js (v18 or higher)
- npm or yarn

## Step 1: Start Database Services

Start PostgreSQL and Qdrant using Docker:

```powershell
docker start fraylon-postgres
docker start qdrant
```

If containers don't exist, create them:

```powershell
# PostgreSQL
docker run -d --name fraylon-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fraylon_lms -p 5432:5432 postgres:15

# Qdrant (vector database for AI Mentor)
docker run -d -p 6333:6333 --name qdrant qdrant/qdrant
```

## Step 2: Configure Environment Variables

The backend requires a `.env` file in the `backend/` directory. Ensure the following are configured:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fraylon_lms"

# AI Mentor Services
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY=""
OPENAI_API_KEY="your_openai_key_here"  # Optional: AI Mentor will use demo fallback if missing
LYZR_API_KEY=""  # Optional
LYZR_WORKFLOW_ID=""  # Optional
OMI_API_KEY=""  # Optional

# OAuth (configure if using OAuth login)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""

# JWT
JWT_SECRET="your_jwt_secret_here"

# SMTP (for email notifications)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
```

**Note:** The AI Mentor feature will work in demo mode without OpenAI API keys. Real embeddings require valid OpenAI credits.

## Step 3: Install Dependencies

```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Step 4: Run Database Migrations

```powershell
cd backend
npx prisma migrate deploy
```

## Step 5: Start Development Servers

**Option A: Using start.bat (Windows)**
```powershell
start.bat
```

**Option B: Manual Start**

Terminal 1 - Backend:
```powershell
cd backend
npm run dev
```

Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

## Step 6: Access the Application

- **Frontend:** http://localhost:5173/LMS
- **Backend API:** http://localhost:3001
- **AI Mentor Health:** http://localhost:3001/api/ai-mentor/health

## Step 7: Create a Test User

Register a new account through the frontend at http://localhost:5173/LMS/register

Or use the API:
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/auth/register" -ContentType "application/json" -Body '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

## Step 8: Test AI Mentor (Demo Mode)

The AI Mentor will automatically use demo fallback if OpenAI credits are exhausted:

1. Log in to the application
2. Navigate to the AI Mentor page
3. The search and indexing will work with demo content

## Troubleshooting

**Port 3001 already in use:**
```powershell
netstat -ano | findstr :3001
taskkill /F /PID <PID>
```

**Port 5173 already in use:**
```powershell
netstat -ano | findstr :5173
taskkill /F /PID <PID>
```

**Database connection issues:**
- Ensure PostgreSQL container is running: `docker ps`
- Check DATABASE_URL in backend/.env
- Verify PostgreSQL is accessible on port 5432

**Qdrant connection issues:**
- Ensure Qdrant container is running: `docker ps`
- Check Qdrant is accessible on port 6333
- Verify QDRANT_URL in backend/.env

## Production Build

To build for production:

```powershell
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

Production files will be in:
- Backend: `backend/dist/`
- Frontend: `frontend/dist/`
