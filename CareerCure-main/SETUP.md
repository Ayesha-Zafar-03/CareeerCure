# CareerCure — Setup Guide

Complete step-by-step guide to get CareerCure running locally or with Docker.

---

## 🎯 Prerequisites

Before you begin, ensure you have:

- **Python 3.11+** installed
- **Node.js 20+** and npm installed
- **PostgreSQL 16** (or use Docker)
- **Git** for version control
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))

---

## 🚀 Option 1: Docker Setup (Recommended)

The fastest way to get everything running.

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/CareerCure.git
cd CareerCure-main
```

### Step 2: Configure Environment

```bash
cd deployment/docker
cp ../../backend/.env.example .env
```

Edit `.env` and add your Groq API key:

```env
GROQ_API_KEY=your-groq-api-key-here
SECRET_KEY=your-random-secret-key-here
```

### Step 3: Start Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- FastAPI backend
- Next.js frontend

### Step 4: Seed the Database

```bash
docker exec careercure_backend python app/seed.py
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Stop Services

```bash
docker-compose down
```

---

## 💻 Option 2: Local Development Setup

For development with hot-reload.

### Backend Setup

#### 1. Navigate to Backend

```bash
cd CareerCure-main/backend
```

#### 2. Create Virtual Environment

```bash
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

#### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
DATABASE_URL=postgresql://careercure:careercure@localhost:5432/careercure
SECRET_KEY=your-random-secret-key-change-this
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama3-8b-8192
CHROMA_PERSIST_DIR=./chroma_data
EMBEDDING_MODEL=all-MiniLM-L6-v2
ALLOWED_ORIGINS=["http://localhost:3000"]
```

#### 5. Set Up PostgreSQL Database

Create the database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE careercure;
CREATE USER careercure WITH PASSWORD 'careercure';
GRANT ALL PRIVILEGES ON DATABASE careercure TO careercure;
\q
```

#### 6. Create Tables

```bash
python -c "from app.core.database import create_tables; create_tables()"
```

#### 7. Seed Data

```bash
python app/seed.py
```

This will populate:
- 20+ career paths
- 30+ internships
- 15+ career FAQs

#### 8. Run Backend Server

```bash
uvicorn app.main:app --reload
```

Backend runs at **http://localhost:8000**

---

### Frontend Setup

#### 1. Navigate to Frontend

```bash
cd CareerCure-main/frontend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 4. Run Development Server

```bash
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## 🧪 Testing the Application

### 1. Register a New Account

- Go to http://localhost:3000
- Click "Get Started Free"
- Fill in your details
- You'll be redirected to the dashboard

### 2. Upload Your CV

- Go to "CV Analysis"
- Upload a PDF CV (max 5MB)
- Wait for AI analysis
- View extracted skills, gaps, and job matches

### 3. Generate a Career Roadmap

- Go to "Roadmap"
- Enter your career goal (e.g., "Data Scientist")
- Click "Generate Roadmap"
- View your personalised learning path

### 4. Browse Internships

- Go to "Internships"
- View all available internships
- Switch to "My Matches" tab for personalised recommendations

### 5. Chat with AI Counselor

- Go to "Chat" or use the floating widget
- Ask career-related questions
- Get instant AI-powered guidance

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'app'`

**Solution:** Make sure you're in the `backend/` directory and the virtual environment is activated.

---

**Problem:** `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution:** Ensure PostgreSQL is running and the `DATABASE_URL` in `.env` is correct.

---

**Problem:** `groq.APIError: Invalid API key`

**Solution:** Get a valid API key from [console.groq.com](https://console.groq.com) and update `.env`.

---

### Frontend Issues

**Problem:** `Error: Cannot find module 'next'`

**Solution:** Run `npm install` in the `frontend/` directory.

---

**Problem:** API calls failing with CORS errors

**Solution:** Ensure backend `ALLOWED_ORIGINS` in `.env` includes `http://localhost:3000`.

---

**Problem:** `Module not found: Can't resolve '@/context/AuthContext'`

**Solution:** Check that `tsconfig.json` has the correct path mapping for `@/*`.

---

### Docker Issues

**Problem:** `docker-compose: command not found`

**Solution:** Install Docker Desktop which includes docker-compose.

---

**Problem:** Port 5432 already in use

**Solution:** Stop your local PostgreSQL or change the port in `docker-compose.yml`.

---

## 📚 Additional Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Next.js Docs**: https://nextjs.org/docs
- **Groq API**: https://console.groq.com/docs
- **ChromaDB**: https://docs.trychroma.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 🆘 Getting Help

If you encounter issues:

1. Check the logs:
   - Backend: Terminal where `uvicorn` is running
   - Frontend: Terminal where `npm run dev` is running
   - Docker: `docker-compose logs -f`

2. Verify environment variables are set correctly

3. Ensure all dependencies are installed

4. Check that PostgreSQL is running and accessible

---

## ✅ Verification Checklist

- [ ] Backend running at http://localhost:8000
- [ ] Frontend running at http://localhost:3000
- [ ] Can access API docs at http://localhost:8000/docs
- [ ] PostgreSQL database created and tables exist
- [ ] Seed data loaded (check internships list)
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Can upload a CV and see analysis
- [ ] Can generate a roadmap
- [ ] Can chat with AI counselor

---

**You're all set! 🎉**

Start building your career with CareerCure!
