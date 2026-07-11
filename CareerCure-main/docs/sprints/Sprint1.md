# Sprint 1 — Foundation & CV Analysis

**Duration:** Week 1-2  
**Focus:** Project setup, authentication, CV upload & AI analysis, job matching

---

## Sprint Goals

1. ✅ Set up project structure (backend + frontend)
2. ✅ Implement user authentication (JWT)
3. ✅ Build CV upload & AI analysis feature
4. ✅ Implement semantic job matching with ChromaDB
5. ✅ Create responsive UI pages

---

## Completed Tasks

### Week 1 — Foundation & Authentication

- [x] GitHub repository created
- [x] Backend FastAPI app initialized
- [x] PostgreSQL database setup
- [x] SQLAlchemy models (User, Profile, Career, Internship, Roadmap)
- [x] JWT authentication endpoints (`/register`, `/login`)
- [x] Frontend Next.js app initialized
- [x] Tailwind CSS configured
- [x] Auth context & protected routes
- [x] Login & Register pages

### Week 2 — CV Analysis & Job Matching

- [x] CV upload endpoint (PDF only, max 5MB)
- [x] PDF text extraction using PyMuPDF
- [x] AI CV analysis with Groq LLaMA3
  - Skill extraction
  - Gap identification
  - Strengths & recommendations
- [x] ChromaDB setup & integration
- [x] HuggingFace embeddings (`all-MiniLM-L6-v2`)
- [x] CV embedding & storage in ChromaDB
- [x] Internship data seeded (30+ internships)
- [x] Internship embeddings generated
- [x] Semantic similarity search (cosine distance)
- [x] CV upload UI with drag-and-drop
- [x] Analysis results page with skills, gaps, matches
- [x] Internships listing page

---

## Technical Achievements

### Backend
- FastAPI app with CORS middleware
- PostgreSQL with SQLAlchemy ORM
- JWT token-based authentication
- Groq LLaMA3 integration for CV analysis
- ChromaDB for vector storage
- Sentence-transformers for embeddings
- Seed script for initial data

### Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Auth context with localStorage
- Protected routes
- Responsive design
- Axios API client with interceptors

---

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| PDF text extraction quality | Used PyMuPDF for reliable extraction |
| LLM returning non-JSON | Added markdown fence stripping logic |
| ChromaDB persistence | Configured `CHROMA_PERSIST_DIR` |
| Token expiry handling | Implemented 401 interceptor in Axios |
| File upload size limits | Set 5MB limit with validation |

---

## Sprint Metrics

- **User Stories Completed:** 8/8
- **Backend Endpoints:** 6
- **Frontend Pages:** 5
- **Database Tables:** 5
- **Seeded Data:** 30 internships, 20 career paths

---

## Demo Screenshots

*(Add screenshots here for FYP submission)*

1. Login page
2. Dashboard
3. CV upload
4. Analysis results
5. Internship matches

---

## Sprint Review Notes

**What went well:**
- Team collaboration was smooth
- Groq API is incredibly fast
- ChromaDB integration was straightforward
- UI is clean and responsive

**What to improve:**
- Add loading states for better UX
- Implement error boundaries
- Add unit tests

---

## Next Sprint Preview

Sprint 2 will focus on:
- Career roadmap generator
- AI chatbot with RAG
- Docker deployment
- CI/CD pipeline
- Final polish & documentation

---

**Sprint 1 Status:** ✅ **COMPLETED**
