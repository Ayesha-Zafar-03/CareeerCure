# CareerCure 🚀

**AI-Powered Career Development Platform for Students & Fresh Graduates**

CareerCure is a full-stack Final Year Project that helps students navigate their career journey with four intelligent AI-powered features:

1. **CV Analysis** — Upload your CV, get AI feedback, extract skills, identify gaps
2. **Internship Matching** — Semantic job matching using ChromaDB embeddings
3. **Career Roadmap Generator** — Personalised learning paths powered by Groq LLaMA3
4. **AI Career Counselor** — Real-time chatbot with RAG knowledge base

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 + TypeScript + Tailwind CSS | Modern, responsive UI |
| **Backend** | FastAPI (Python) | High-performance REST APIs |
| **Database** | PostgreSQL | Relational data storage |
| **Vector DB** | ChromaDB | Embeddings for semantic search |
| **AI/LLM** | Groq (LLaMA3-8B) | Ultra-fast AI inference |
| **Embeddings** | HuggingFace `all-MiniLM-L6-v2` | Sentence embeddings |
| **Auth** | JWT + bcrypt | Secure authentication |
| **DevOps** | Docker + Docker Compose | Containerised deployment |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 20+**
- **PostgreSQL 16** (or use Docker)
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CareerCure.git
cd CareerCure-main
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your GROQ_API_KEY and DATABASE_URL

# Create database tables
python -c "from app.core.database import create_tables; create_tables()"

# Seed data (career paths, internships, FAQs)
python app/seed.py

# Run the server
uvicorn app.main:app --reload
```

Backend will run at **http://localhost:8000**

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
cp .env.local.example .env.local

# Run development server
npm run dev
```

Frontend will run at **http://localhost:3000**

---

## 🐳 Docker Deployment (Recommended)

```bash
cd deployment/docker

# Create .env file with your Groq API key
echo "GROQ_API_KEY=your-key-here" > .env

# Start all services
docker-compose up -d

# Seed the database (run once)
docker exec careercure_backend python app/seed.py
```

Services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login

### CV Analysis
- `POST /api/cv/upload` — Upload PDF CV
- `GET /api/cv/analysis` — Get last analysis

### Career Roadmap
- `POST /api/roadmap/generate` — Generate roadmap
- `GET /api/roadmap/list` — List user roadmaps
- `GET /api/roadmap/{id}` — Get specific roadmap

### Internships
- `GET /api/internships/list` — List all internships
- `GET /api/internships/matches` — Get personalised matches
- `GET /api/internships/{id}` — Get internship details

### AI Chatbot
- `POST /api/chat/message` — Send message to AI counselor

### Profile
- `GET /api/profile/me` — Get current user profile
- `PUT /api/profile/me` — Update profile

Full API documentation: **http://localhost:8000/docs**

---

## 🧪 Testing

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run lint
```

---

## 📁 Project Structure

```
CareerCure-main/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── chatbot/      # AI chatbot service
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── services/     # Business logic
│   │   ├── vector/       # ChromaDB & embeddings
│   │   ├── main.py       # FastAPI app
│   │   └── seed.py       # Database seeding
│   └── requirements.txt
├── frontend/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── context/          # Auth context
│   ├── lib/              # API client
│   └── package.json
├── deployment/
│   └── docker/
│       ├── Dockerfile
│       └── docker-compose.yml
└── docs/
    └── sprints/          # Sprint documentation
```

---

## 🎯 Features

### ✅ Implemented

- [x] User authentication (JWT)
- [x] CV upload & AI analysis (Groq LLaMA3)
- [x] Skill extraction & gap analysis
- [x] Semantic internship matching (ChromaDB)
- [x] Career roadmap generation
- [x] AI chatbot with RAG
- [x] Responsive UI (Tailwind CSS)
- [x] Docker deployment
- [x] Seeded data (20+ careers, 30+ internships, 15+ FAQs)

### 🔮 Future Enhancements

- [ ] GitHub Actions CI/CD
- [ ] Unit & integration tests
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Interview prep module

---

## 👥 Team

- **Ayesha Zafar** — Backend Lead + AI Integration
- **Eman** — Frontend Lead + UI/UX
- **Hira Jawaid** — Database + DevOps + Documentation

---

## 📄 License

This is a Final Year Project (FYP) for educational purposes.

---

## 🙏 Acknowledgments

- **Groq** for ultra-fast LLM inference
- **HuggingFace** for open-source embeddings
- **ChromaDB** for vector search
- **FastAPI** & **Next.js** communities

---

**Built with ❤️ by the CareerCure Team**
