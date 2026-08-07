# CareerCure — AI-Powered Career Development Platform

CareerCure is a full-stack, AI-powered career guidance platform built as a Final Year Project. It helps users analyze their CVs, get personalized career roadmaps, discover matching internships and courses, and chat with an AI career counselor — all powered by modern LLM and vector-search technologies.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Branch](https://img.shields.io/badge/branch-deployment--ready-blue)

---

## ✨ Features

- **AI CV Analysis** — Upload a CV (PDF) and get instant AI-powered feedback: skills extracted, gaps identified, and tailored improvements.
- **Career Roadmap** — Personalized step-by-step learning paths for 20+ tech careers, built from your skills and career goal.
- **Internship Matching** — Semantic internship matching based on your CV, ranked by how well each opportunity fits your profile.
- **Course Recommendations** — Curated course suggestions from Udemy, Coursera, and edX to fill your skill gaps.
- **AI Career Counselor** — Real-time chat with an AI counselor powered by Groq LLaMA3 + Retrieval-Augmented Generation (RAG).
- **Admin Portal** — Dedicated dashboard for user management, platform stats, courses, and internships.
- **Auth & Security** — Email/password with OTP verification, password reset, and Google OAuth login. JWT-secured, rate-limited API.
- **Scalable Performance** — N+1 query fixes, database indexes, optimized frontend bundles, and lazy-loaded Three.js backgrounds.

## 🧰 Tech Stack

| Layer     | Technologies |
|-----------|--------------|
| Frontend  | Next.js 16 (App Router), React 18, Tailwind CSS, TypeScript, lucide-react |
| Admin     | Next.js 16 (separate portal), React 18, Tailwind CSS |
| Backend   | FastAPI, SQLAlchemy 2.0, Pydantic, Uvicorn |
| AI / LLM  | Groq (Llama 3.1), sentence-transformers embeddings |
| Vector DB | ChromaDB (semantic search / RAG) |
| Database  | PostgreSQL (local, Docker, Supabase, or Neon) |
| Auth      | JWT (python-jose), passlib/bcrypt, Authlib (Google OAuth) |
| Emails    | Gmail SMTP (OTP & password reset) |
| Extras    | PyMuPDF (CV parsing), ReportLab (PDF generation), slowapi (rate limiting) |

## 📁 Repository Structure

```
CareerCure/
├── frontend/                 # User-facing Next.js app (port 3000)
│   ├── app/                  # App Router pages (login, dashboard, cv, roadmap, ...)
│   ├── components/           # Shared UI components
│   ├── lib/                  # API client and utilities
│   └── .env.example
├── admin/                    # Admin portal Next.js app (port 3001)
│   ├── app/                  # Admin dashboard pages
│   └── .env.example
├── backend/                  # FastAPI backend (port 8000)
│   ├── app/
│   │   ├── api/              # Routers (auth, cv, roadmap, internships, courses, chatbot, profile, admin, plan)
│   │   ├── chatbot/          # AI career counselor service (RAG)
│   │   ├── core/             # Config, database, security, rate limiting
│   │   ├── models/           # SQLAlchemy models
│   │   ├── services/         # CV, email, OAuth, recommendations, scheduler
│   │   └── vector/           # ChromaDB + embedding services
│   ├── api/index.py          # Vercel serverless entrypoint
│   ├── tests/                # pytest suite
│   ├── Dockerfile            # HuggingFace Spaces / Docker image
│   └── .env.example
├── database/
│   └── dump.sql              # PostgreSQL schema dump
├── deployment/
│   └── docker/               # docker-compose + Dockerfile for full stack
├── docs/                     # Deployment, admin portal, and sprint docs
└── frontend.rar              # Archived copy of the frontend
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+ and Node.js 18+
- PostgreSQL (or a hosted option like Supabase/Neon)
- A [Groq API key](https://console.groq.com) (free tier)

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows  |  source venv/bin/activate (macOS/Linux)
pip install -r requirements.txt
copy .env.example .env         # Windows | cp .env.example .env (macOS/Linux)
```

Edit `.env` with your database URL, `SECRET_KEY`, and `GROQ_API_KEY`, then run:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs are available at `http://localhost:8000/docs`.

> Seeding scripts are included (`seed_50_jobs_final.py`, `seed_real_data.py`, `create_admin.py`) to populate jobs, courses, and an admin user.

### 2. Frontend (User portal)

```bash
cd frontend
npm install
copy .env.example .env.local   # Windows | cp .env.example .env.local (macOS/Linux)
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`, then:

```bash
npm run dev
```

Open `http://localhost:3000`.

### 3. Admin portal

```bash
cd admin
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3001`. Default admin credentials: `admin@careercure.com` / `admin123` (create via `backend/create_admin.py`).

## 🧪 Testing

Backend tests use pytest:

```bash
cd backend
pytest
```

The suite covers auth, login, CV, roadmap, internships, career coach, chatbot, profile, and health endpoints.

## 📦 Docker (Full stack)

```bash
docker-compose -f deployment/docker/docker-compose.yml up --build
```

This brings up PostgreSQL, the FastAPI backend, and the Next.js frontend together.

## ☁️ Deployment

The repo is organized as a deploy-ready monorepo; each sub-project deploys independently.

| Component | Platform | Notes |
|-----------|----------|-------|
| `frontend/` | Vercel | Import as a Next.js project; set `NEXT_PUBLIC_API_URL` |
| `admin/`   | Vercel | Import as a Next.js project; set `NEXT_PUBLIC_API_URL` |
| `backend/` | HuggingFace Spaces (Docker) | Add `DATABASE_URL`, `SECRET_KEY`, `GROQ_API_KEY`, and OAuth/email secrets as repo secrets |

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for step-by-step instructions, including free PostgreSQL setup and Google OAuth redirect URIs.

## 📚 Documentation

- [`docs/DEPLOY.md`](docs/DEPLOY.md) — deployment guide
- [`docs/ADMIN_PORTAL_READY.md`](docs/ADMIN_PORTAL_READY.md) — admin portal setup
- [`docs/dual_portal_setup.md`](docs/dual_portal_setup.md) — running both portals locally
- [`docs/sprints/`](docs/sprints/) — sprint reports

## 📄 License

MIT
