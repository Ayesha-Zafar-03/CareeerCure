# Sprint 2 — Roadmap, Chatbot & Deployment

**Duration:** Week 3-4  
**Focus:** Career roadmap generator, AI chatbot with RAG, Docker deployment, final polish

---

## Sprint Goals

1. ✅ Build career roadmap generator with AI
2. ✅ Implement AI chatbot with RAG pipeline
3. ✅ Create chatbot UI (page + floating widget)
4. ✅ Docker containerization
5. ✅ Final UI polish & testing
6. ✅ Complete documentation

---

## Completed Tasks

### Week 3 — Career Roadmap Generator

- [x] Career paths seeded (20+ tech careers)
- [x] Roadmap generation API endpoint
- [x] LLM prompt engineering for structured JSON output
- [x] Roadmap storage in PostgreSQL
- [x] Roadmap UI with phases, objectives, resources, milestones
- [x] Past roadmaps listing
- [x] Dashboard quick actions
- [x] Profile page

### Week 4 — AI Chatbot, Polish & Deployment

- [x] Career FAQ knowledge base (15+ FAQs)
- [x] FAQ embeddings in ChromaDB
- [x] RAG pipeline (retrieve context → send to LLM)
- [x] Chatbot API endpoint
- [x] Full-page chat interface
- [x] Floating chat widget component
- [x] Conversation history management
- [x] Docker Dockerfile for backend
- [x] docker-compose.yml (PostgreSQL + Backend + Frontend)
- [x] Environment variable configuration
- [x] README with setup instructions
- [x] Sprint documentation
- [x] Final testing & bug fixes

---

## Technical Achievements

### AI & RAG
- Groq LLaMA3 for roadmap generation
- Structured JSON output from LLM
- RAG pipeline with ChromaDB
- FAQ embeddings for context retrieval
- Conversation history in chatbot

### Deployment
- Multi-stage Docker setup
- PostgreSQL container with health checks
- Volume persistence for DB & ChromaDB
- Environment-based configuration
- One-command deployment

### UI/UX
- Floating chat widget on all pages
- Real-time message streaming UI
- Loading states & error handling
- Responsive design across all pages
- Consistent design system

---

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| LLM hallucinating resource URLs | Instructed LLM to use "well-known" resources |
| Chat widget state management | Used React context for global state |
| Docker volume permissions | Configured proper volume mounts |
| Frontend API URL in Docker | Used environment variables |
| ChromaDB persistence in Docker | Mounted volume for `chroma_data` |

---

## Sprint Metrics

- **User Stories Completed:** 10/10
- **Total Backend Endpoints:** 12
- **Total Frontend Pages:** 8
- **Docker Services:** 3 (DB, Backend, Frontend)
- **Total Lines of Code:** ~5000+

---

## Demo Flow

1. **Register** → Create account
2. **Dashboard** → See quick actions
3. **Upload CV** → Get AI analysis + job matches
4. **Generate Roadmap** → Personalised learning path
5. **Browse Internships** → See all opportunities + matches
6. **Chat with AI** → Ask career questions
7. **Floating Widget** → Quick access to chatbot

---

## Sprint Review Notes

**What went well:**
- All features completed on time
- Docker deployment works smoothly
- RAG pipeline is effective
- UI is polished and professional
- Team collaboration was excellent

**What to improve:**
- Add automated tests
- Implement CI/CD pipeline
- Add email notifications
- Create admin dashboard

---

## Final Deliverables

- ✅ Fully functional web application
- ✅ Docker deployment setup
- ✅ Complete documentation (README, Sprint docs)
- ✅ Seeded database with real data
- ✅ Responsive UI across devices
- ✅ API documentation (FastAPI /docs)

---

## Future Enhancements

- GitHub Actions CI/CD
- Unit & integration tests
- Email verification
- Password reset flow
- Interview preparation module
- Resume builder
- Job application tracker
- Analytics dashboard

---

**Sprint 2 Status:** ✅ **COMPLETED**

**Project Status:** 🎉 **READY FOR DEMO & SUBMISSION**
