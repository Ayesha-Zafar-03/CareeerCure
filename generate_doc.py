from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.style import WD_STYLE_TYPE
import os

doc = Document()

# ── Styles ──
style = doc.styles['Normal']
font = style.font
font.name = 'Calibri'
font.size = Pt(11)

# ── Helper functions ──
def add_heading_styled(text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = RGBColor(0x1A, 0x3C, 0x6E)
    return h

def add_bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    if bold_prefix:
        run = p.add_run(bold_prefix)
        run.bold = True
        p.add_run(text)
    else:
        p.add_run(text)
    return p

def add_table(headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Light Grid Accent 1'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        for p in hdr_cells[i].paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.bold = True
    for row_data in rows:
        row_cells = table.add_row().cells
        for i, val in enumerate(row_data):
            row_cells[i].text = str(val)
    doc.add_paragraph()

# ══════════════════════════════════════════════════════════════
# TITLE PAGE
# ══════════════════════════════════════════════════════════════
for _ in range(6):
    doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('CAREERCURE')
run.bold = True
run.font.size = Pt(36)
run.font.color.rgb = RGBColor(0x1A, 0x3C, 0x6E)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('AI-Powered Career Development Platform')
run.font.size = Pt(18)
run.font.color.rgb = RGBColor(0x4A, 0x6F, 0xA5)

doc.add_paragraph()
doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('Final Year Project (FYP) Documentation')
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('Presented By:')
run.font.size = Pt(12)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('Ayesha\nHira\nEman')
run.font.size = Pt(14)
run.bold = True

for _ in range(4):
    doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('2026')
run.font.size = Pt(14)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════
# TABLE OF CONTENTS (manual)
# ══════════════════════════════════════════════════════════════
add_heading_styled('Table of Contents', level=1)
toc_items = [
    '1. Project Abstract',
    '2. Introduction & Problem Statement',
    '3. Objectives & Scope',
    '4. System Architecture',
    '5. Technology Stack',
    '6. Database Schema',
    '7. API Endpoints Overview',
    '8. Features & Implementation Details',
    '9. Work Division (Ayesha, Hira, Eman)',
    '10. Testing Strategy',
    '11. Deployment Pipeline',
    '12. Sprint Breakdown',
    '13. Challenges & Solutions',
    '14. Future Enhancements',
    '15. Conclusion'
]
for item in toc_items:
    p = doc.add_paragraph(item)
    p.paragraph_format.space_after = Pt(2)
    p.runs[0].font.size = Pt(12)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════
# 1. ABSTRACT
# ══════════════════════════════════════════════════════════════
add_heading_styled('1. Project Abstract', level=1)
doc.add_paragraph(
    'CareerCure is an AI-powered career development platform designed to assist students and fresh graduates '
    'in navigating their career journey. The platform leverages cutting-edge artificial intelligence, including '
    'Groq LLaMA 3.1 LLM and semantic vector search via ChromaDB, to provide personalised career guidance. '
    'Key features include AI-driven CV analysis with skill extraction and gap identification, semantic job and '
    'internship matching, personalised career roadmap generation, intelligent course recommendations, and an '
    'interactive AI career counselor chatbot with Retrieval-Augmented Generation (RAG). The system uses a '
    'three-tier architecture with a FastAPI Python backend, PostgreSQL database, ChromaDB vector store, and '
    'a Next.js frontend. Deployment is containerized via Docker and hosted on HuggingFace Spaces and Vercel.'
)

# ══════════════════════════════════════════════════════════════
# 2. INTRODUCTION
# ══════════════════════════════════════════════════════════════
add_heading_styled('2. Introduction & Problem Statement', level=1)
doc.add_paragraph(
    'Students and fresh graduates face significant challenges when entering the job market. Many lack clarity '
    'about which career paths align with their skills, struggle to create ATS-optimised CVs, and find it '
    'difficult to identify suitable internships and courses. Traditional career counseling is expensive, '
    'time-consuming, and not easily accessible.\n\n'
    'CareerCure addresses these problems by providing an all-in-one platform that uses AI to:'
)
bullets = [
    'Analyse CVs and provide actionable feedback',
    'Match users with suitable internships using semantic search',
    'Generate personalised career roadmaps',
    'Recommend relevant courses from top providers',
    'Answer career-related questions via an intelligent chatbot'
]
for b in bullets:
    add_bullet(b)

# ══════════════════════════════════════════════════════════════
# 3. OBJECTIVES & SCOPE
# ══════════════════════════════════════════════════════════════
add_heading_styled('3. Objectives & Scope', level=1)
doc.add_paragraph('Primary Objectives:')
objectives = [
    'Develop an AI-powered CV analysis engine that extracts skills, identifies gaps, and provides ATS scoring',
    'Implement semantic job/internship matching using vector embeddings and cosine similarity',
    'Create a personalised career roadmap generator using LLM technology',
    'Build an intelligent career counselor chatbot with RAG capabilities',
    'Provide course recommendations from platforms like Udemy, Coursera, and edX',
    'Develop a comprehensive admin portal for platform management',
    'Containerise the application for easy deployment'
]
for o in objectives:
    add_bullet(o)

doc.add_paragraph()
doc.add_paragraph('Scope:')
scope_items = [
    'Web-based platform accessible via modern browsers',
    'Support for students and fresh graduates (0-3 years experience)',
    'Focus on tech industry careers initially',
    'Free-to-use model with no credit card required',
    'Scalable architecture supporting future enhancements'
]
for s in scope_items:
    add_bullet(s)

# ══════════════════════════════════════════════════════════════
# 4. SYSTEM ARCHITECTURE
# ══════════════════════════════════════════════════════════════
add_heading_styled('4. System Architecture', level=1)
doc.add_paragraph(
    'CareerCure follows a modern three-tier web architecture with clear separation of concerns:'
)

add_heading_styled('4.1 Presentation Layer (Frontend)', level=2)
doc.add_paragraph(
    'Two separate Next.js 16 applications using the App Router:'
)
fe_bullets = [
    'User Dashboard (port 3000): Main interface for all career features including CV analysis, roadmaps, '
    'chatbot, courses, and internships',
    'Admin Portal (port 3001): Administrative interface for user management, system monitoring, '
    'and data management'
]
for b in fe_bullets:
    add_bullet(b)

add_heading_styled('4.2 Application Layer (Backend API)', level=2)
doc.add_paragraph(
    'FastAPI Python application (port 8000) serving as the central API gateway. '
    'Handles all business logic, authentication, AI integration, and data orchestration. '
    'Exposes 40+ RESTful endpoints across 12 routers.'
)

add_heading_styled('4.3 Data Layer', level=2)
doc.add_paragraph('Two database systems work in tandem:')
data_items = [
    'PostgreSQL 16: Primary relational database for users, profiles, internships, courses, '
    'roadmaps, chat messages, and OTPs. SQLAlchemy ORM for type-safe queries.',
    'ChromaDB: Vector database for semantic search. Stores embeddings of CVs, internships, '
    'courses, and FAQ content. Enables cosine similarity-based matching.'
]
for d in data_items:
    add_bullet(d)

add_heading_styled('Architecture Diagram', level=2)
doc.add_paragraph(
    '┌─────────────────────────────────────────────────────┐\n'
    '│  Frontend (Next.js 16)                              │\n'
    '│  ├─ User Dashboard \u2192 localhost:3000                 │\n'
    '│  └─ Admin Portal   \u2192 localhost:3001                 │\n'
    '├─────────────────────────────────────────────────────┤\n'
    '│  Backend API (FastAPI / Python) \u2192 port 8000         │\n'
    '├─────────────────────────────────────────────────────┤\n'
    '│  PostgreSQL (database) + ChromaDB (vector store)    │\n'
    '└─────────────────────────────────────────────────────┘'
)

# ══════════════════════════════════════════════════════════════
# 5. TECHNOLOGY STACK
# ══════════════════════════════════════════════════════════════
add_heading_styled('5. Technology Stack', level=1)

add_heading_styled('5.1 Backend Technologies', level=2)
add_table(
    ['Technology', 'Version', 'Purpose'],
    [
        ['FastAPI', '0.111.0', 'Python REST API framework'],
        ['Python', '3.11', 'Primary programming language'],
        ['SQLAlchemy', '2.0.30', 'ORM for PostgreSQL'],
        ['PostgreSQL', '16', 'Primary relational database'],
        ['ChromaDB', '0.5.0', 'Vector database for semantic search'],
        ['Groq LLaMA 3.1', '8B Instant', 'LLM for AI features'],
        ['Sentence-Transformers', '3.0.1', 'Text embeddings (all-MiniLM-L6-v2)'],
        ['PyMuPDF', '1.24.5', 'PDF text extraction'],
        ['python-jose', '3.3.0', 'JWT token creation/validation'],
        ['passlib + bcrypt', '4.0.1', 'Password hashing'],
        ['Authlib', '1.3.1', 'OAuth (Google, LinkedIn)'],
        ['slowapi', '0.1.9', 'Rate limiting'],
        ['httpx', '0.27.0', 'Async HTTP client'],
        ['reportlab', '4.0.7', 'PDF generation for CV downloads'],
        ['pytest', '8.2.0', 'Testing framework'],
        ['uvicorn', '0.29.0', 'ASGI server'],
    ]
)

add_heading_styled('5.2 Frontend Technologies', level=2)
add_table(
    ['Technology', 'Version', 'Purpose'],
    [
        ['Next.js', '16.2.4', 'React framework with App Router'],
        ['React', '18.3.1', 'UI library'],
        ['TypeScript', '5.4.5', 'Type safety'],
        ['Tailwind CSS', '3.4.4', 'Utility-first CSS framework'],
        ['Axios', '1.15.0', 'HTTP client with interceptors'],
        ['Lucide React', '0.395.0', 'Icon library'],
        ['Vanta.js + Three.js', '0.185.1', 'Animated 3D backgrounds'],
    ]
)

add_heading_styled('5.3 DevOps & Deployment', level=2)
add_table(
    ['Technology', 'Purpose'],
    [
        ['Docker / Docker Compose', 'Containerisation (3 services)'],
        ['GitHub Actions', 'CI/CD pipeline'],
        ['HuggingFace Spaces', 'Backend deployment'],
        ['Vercel', 'Frontend deployment (both portals)'],
        ['Supabase / Neon', 'Free tier PostgreSQL hosting'],
        ['Git', 'Version control'],
    ]
)

# ══════════════════════════════════════════════════════════════
# 6. DATABASE SCHEMA
# ══════════════════════════════════════════════════════════════
add_heading_styled('6. Database Schema', level=1)
doc.add_paragraph('The database consists of 9 tables:')

tables_desc = [
    ('users', 'User accounts with JWT auth, OAuth support, admin roles, email verification'),
    ('profiles', 'User profiles with skills (JSON), education, career goal, CV text & analysis'),
    ('internships', 'Internship/job listings with required skills, location, salary, remote options'),
    ('courses', 'Course listings with provider, difficulty, price, rating, skills gained'),
    ('career_paths', 'Predefined career paths with required skills (20 tech roles)'),
    ('roadmaps', 'AI-generated personalised roadmaps with structured JSON data'),
    ('chat_messages', 'Chat history with conversation grouping, job/course display flags'),
    ('planned_courses', 'User learning plans linking courses to roadmaps'),
    ('otps', '6-digit OTP storage for email verification, password reset, admin login'),
]
for name, desc in tables_desc:
    add_bullet(f'{name}: {desc}')

doc.add_paragraph()
add_heading_styled('Key Relationships', level=2)
rels = [
    'User 1:1 Profile (user_id FK in profiles)',
    'User 1:N Roadmaps (user_id FK in roadmaps)',
    'User 1:N ChatMessages (user_id FK in chat_messages)',
    'User 1:N PlannedCourses (user_id FK in planned_courses)',
]
for r in rels:
    add_bullet(r)

# ══════════════════════════════════════════════════════════════
# 7. API ENDPOINTS
# ══════════════════════════════════════════════════════════════
add_heading_styled('7. API Endpoints Overview', level=1)
doc.add_paragraph('The backend exposes 40+ endpoints across 12 routers:')

add_heading_styled('7.1 Authentication (/api/auth)', level=2)
add_table(
    ['Endpoint', 'Method', 'Description'],
    [
        ['/register', 'POST', 'Register with email OTP verification'],
        ['/verify-email', 'POST', 'Verify OTP and activate account'],
        ['/resend-otp', 'POST', 'Resend verification OTP'],
        ['/login', 'POST', 'Login with password (admin gets 2FA OTP)'],
        ['/login/verify-otp', 'POST', 'Admin second-factor verification'],
        ['/refresh', 'POST', 'Refresh JWT token'],
        ['/forgot-password', 'POST', 'Send password reset OTP'],
        ['/reset-password', 'POST', 'Reset password with OTP'],
        ['/change-password', 'POST', 'Change password (authenticated)'],
        ['/me', 'GET', 'Get current user info'],
        ['/google', 'GET', 'Google OAuth redirect'],
        ['/linkedin', 'GET', 'LinkedIn OAuth redirect'],
        ['/oauth/status', 'GET', 'Check OAuth configuration'],
    ]
)

add_heading_styled('7.2 CV Management (/api/cv)', level=2)
add_table(
    ['Endpoint', 'Method', 'Description'],
    [
        ['/upload', 'POST', 'Upload PDF CV, extract text, AI analysis, job matching'],
        ['/analysis', 'GET', 'Get last CV analysis results'],
        ['/generate', 'POST', 'Generate CV from form fields with ATS scoring'],
        ['/rebuild', 'POST', 'Optimise CV for better ATS score'],
        ['/download-pdf', 'GET', 'Download CV as formatted PDF'],
        ['/preview', 'GET', 'Preview saved CV text'],
    ]
)

add_heading_styled('7.3 Career Roadmap (/api/roadmap)', level=2)
add_table(
    ['Endpoint', 'Method', 'Description'],
    [
        ['/generate', 'POST', 'Generate personalised AI career roadmap'],
        ['/list', 'GET', 'List all user roadmaps'],
        ['/{id}', 'GET', 'Get specific roadmap details'],
    ]
)

add_heading_styled('7.4 Internships (/api/internships)', level=2)
add_table(
    ['Endpoint', 'Method', 'Description'],
    [
        ['/list', 'GET', 'List all internships (paginated)'],
        ['/matches', 'GET', 'Personalised semantic matches'],
        ['/{id}', 'GET', 'Get internship details'],
    ]
)

add_heading_styled('7.5 Courses (/api/courses)', level=2)
add_table(
    ['Endpoint', 'Method', 'Description'],
    [
        ['/list', 'GET', 'List courses with filters'],
        ['/matches', 'GET', 'Personalised course recommendations'],
        ['/categories', 'GET', 'Get distinct categories'],
        ['/providers', 'GET', 'Get distinct providers'],
        ['/{id}', 'GET', 'Get course details'],
    ]
)

add_heading_styled('7.6 AI Chatbot (/api/chat)', level=2)
add_table(
    ['Endpoint', 'Method', 'Description'],
    [
        ['/message', 'POST', 'Send message to AI career counselor'],
        ['/conversations', 'GET', 'List user conversations'],
        ['/history', 'GET', 'Get conversation history'],
        ['/history', 'DELETE', 'Clear chat history'],
    ]
)

add_heading_styled('7.7 Profile (/api/profile)', level=2)
add_table(
    ['Endpoint', 'Method', 'Description'],
    [
        ['/me', 'GET', 'Get user profile'],
        ['/me', 'PUT', 'Update user profile'],
    ]
)

add_heading_styled('7.8 Plan (/api/plan)', level=2)
add_table(
    ['Endpoint', 'Method', 'Description'],
    [
        ['/list', 'GET', 'List planned courses'],
        ['/add', 'POST', 'Add course to learning plan'],
        ['/remove/{course_id}', 'DELETE', 'Remove from plan'],
    ]
)

add_heading_styled('7.9 Admin (/api/admin)', level=2)
add_table(
    ['Endpoint', 'Method', 'Description'],
    [
        ['/stats', 'GET', 'Dashboard statistics'],
        ['/users', 'GET', 'List users (paginated, searchable)'],
        ['/users/{id}', 'GET', 'Get user by ID'],
        ['/users/{id}', 'PUT', 'Update user properties'],
        ['/users/{id}', 'DELETE', 'Delete/deactivate user'],
        ['/system/info', 'GET', 'System health information'],
        ['/sync-data', 'POST', 'Sync jobs/courses from external APIs'],
        ['/jobs', 'GET', 'Admin job listing'],
        ['/courses', 'GET', 'Admin course listing'],
        ['/jobs/{id}', 'GET/PUT/DELETE', 'Job CRUD'],
        ['/courses/{id}', 'GET/PUT/DELETE', 'Course CRUD'],
        ['/db/stats', 'GET', 'Database statistics'],
    ]
)

# ══════════════════════════════════════════════════════════════
# 8. FEATURES & IMPLEMENTATION
# ══════════════════════════════════════════════════════════════
add_heading_styled('8. Features & Implementation Details', level=1)

add_heading_styled('8.1 User Authentication & Security', level=2)
doc.add_paragraph(
    'The authentication system implements a multi-layered security approach:'
)
auth_features = [
    'JWT-based authentication with 24-hour token expiry',
    'Two-step registration: Register \u2192 Email OTP \u2192 Verify \u2192 Activate',
    'Password reset flow via email OTP (Forgot Password \u2192 OTP \u2192 Reset)',
    'Admin two-factor authentication: Password + Email OTP',
    'Google OAuth and LinkedIn OAuth integration via Authlib',
    'Rate limiting on all auth endpoints (slowapi)',
    'Password hashing using bcrypt via passlib',
    'CORS protection with configurable allowed origins',
    'Leak-proof forgot password (always returns 200)'
]
for f in auth_features:
    add_bullet(f)

add_heading_styled('8.2 AI CV Analysis Engine', level=2)
doc.add_paragraph(
    'The CV analysis module is one of the core features, combining multiple technologies:'
)
cv_features = [
    'PDF upload with 5MB size limit and format validation',
    'Text extraction using PyMuPDF (fitz) library',
    'AI analysis via Groq LLaMA 3.1 API: extracts skills, identifies gaps, '
    'lists strengths, and provides actionable recommendations',
    'ATS (Applicant Tracking System) score calculation (0-100) based on '
    'contact info completeness, skills presence, experience, and qualifications',
    'CV rebuild/optimisation feature that restructures CV for better ATS parsing, '
    'adds relevant keywords, standardizes section headers',
    'Professional PDF download using reportlab',
    'Skills extracted from CV are automatically merged into user profile'
]
for f in cv_features:
    add_bullet(f)

add_heading_styled('8.3 Semantic Job & Internship Matching', level=2)
doc.add_paragraph(
    'CareerCure uses vector embeddings and cosine similarity for intelligent matching:'
)
job_features = [
    'Text embeddings generated via Sentence-Transformers (all-MiniLM-L6-v2)',
    'Embeddings stored in ChromaDB vector database with cosine distance metric',
    'User profile (career goal + skills + education + CV text) combined into a single '
    'query for holistic matching',
    'Semantic search across internship embeddings returns ranked results by similarity score',
    'Fallback to standard SQL query when ChromaDB is unavailable',
    '25+ seeded internships covering Data Science, Backend, Frontend, ML, DevOps, '
    'Cybersecurity, Mobile, UI/UX, and more',
    'Company links include real application URLs (Rozee.pk, LinkedIn, company sites)'
]
for f in job_features:
    add_bullet(f)

add_heading_styled('8.4 Course Recommendations', level=2)
course_features = [
    '15+ seeded courses from Udemy, Coursera, edX, Frontend Masters, Pluralsight, Educative',
    'Categorized by Programming, Web Development, Data Science, AI/ML, Cloud, DevOps, Security, Mobile, Design',
    'Filterable by category, difficulty level (Beginner/Intermediate/Advanced), provider, and price',
    'Semantic matching via ChromaDB vector search (same pipeline as jobs)',
    'Courses linked to real URLs for direct enrollment',
    '"Add to Plan" feature lets users build personalised learning paths'
]
for f in course_features:
    add_bullet(f)

add_heading_styled('8.5 AI Career Roadmap Generator', level=2)
doc.add_paragraph(
    'Career roadmaps are dynamically generated using Groq LLaMA 3.1:'
)
roadmap_features = [
    'Personalized prompt construction using user\'s career goal and current skills',
    'LLM returns structured JSON with phases, objectives, resources, and milestones',
    'Prompt engineered for consistent JSON output with real, well-known resources',
    'Roadmaps stored in PostgreSQL as JSON for future reference',
    'Users can view all their generated roadmaps with history',
    'Resources include real platforms (Coursera, Udemy, LeetCode, GitHub, etc.)'
]
for f in roadmap_features:
    add_bullet(f)

add_heading_styled('8.6 AI Career Counselor Chatbot with RAG', level=2)
doc.add_paragraph(
    'The chatbot is the most complex feature, combining multiple AI technologies:'
)
chat_features = [
    'Groq LLaMA 3.1-8B Instant model for fast, responsive conversations',
    'Intent detection system: identifies if user is asking about jobs, courses, or general career advice',
    'RAG (Retrieval-Augmented Generation): user messages are embedded, similar FAQs retrieved from ChromaDB, '
    'and injected into LLM context for grounded responses',
    'User profile context injection: chatbot is aware of user\'s name, skills, career goal, education, '
    'and experience for personalised advice',
    'Automatic job/course display: when intent detects job or learning queries, real data from the '
    'database is fetched and displayed alongside AI response',
    'Conversation management: multiple conversations with auto-generated titles from first user message',
    'Message persistence in PostgreSQL for history across sessions',
    'Floating chat widget component available on all pages of the application',
    'Fallback mock data when database is unavailable (graceful degradation)'
]
for f in chat_features:
    add_bullet(f)

add_heading_styled('8.7 External Data Sync', level=2)
doc.add_paragraph(
    'Admin users can sync real-world job data from multiple external APIs:'
)
sync_features = [
    'LinkedIn Jobs API (RapidAPI): Fetch active job listings with title, company, location',
    'Indeed API (RapidAPI): Fetch jobs by company or general search',
    'JSearch API (RapidAPI): Comprehensive search with salary data',
    'Adzuna API: Free tier job data with salary ranges',
    'Udemy/Coursera/edX: Curated course collection with hand-picked popular courses',
    'Deduplication by title + company to avoid duplicates',
    'Automatic re-indexing into ChromaDB for semantic search',
    'Admin dashboard button for one-click data refresh'
]
for f in sync_features:
    add_bullet(f)

add_heading_styled('8.8 Admin Portal', level=2)
admin_features = [
    'Dashboard with real-time statistics: total users, active/verified/admin users, jobs, courses',
    'User management: paginated list with search, activate/deactivate, promote to admin',
    'Self-protection: admin cannot remove their own admin status',
    'System health monitoring: database connection, OAuth configuration status, content counts',
    'Job and course CRUD: full create, read, update, delete operations',
    'External data sync trigger button',
    'Role-based access control on all admin endpoints'
]
for f in admin_features:
    add_bullet(f)

# ══════════════════════════════════════════════════════════════
# 9. WORK DIVISION
# ══════════════════════════════════════════════════════════════
add_heading_styled('9. Work Division', level=1)

add_heading_styled('Ayesha \u2014 Backend Development & Database', level=2)
doc.add_paragraph(
    'Ayesha was responsible for the entire backend development, database design, and API implementation:'
)
ayesha_work = [
    'FastAPI application setup and project structure',
    'Database schema design: all 9 tables (users, profiles, internships, courses, career_paths, '
    'roadmaps, chat_messages, planned_courses, otps)',
    'Authentication system: JWT token generation/validation, password hashing, '
    'email OTP flow (register, verify, forgot/reset password)',
    'Admin 2FA implementation (password + email OTP verification)',
    'All API endpoint implementation across 12 routers (~40+ endpoints)',
    'Admin API endpoints: stats dashboard, user management, system info, CRUD operations',
    'Profile management API',
    'Learning plan API (add/remove/list planned courses)',
    'SQLAlchemy ORM models and relationships',
    'Database connection pooling, table creation, seed scripts',
    'External data service: LinkedIn, Indeed, JSearch, Adzuna API integration',
    'CV upload and generation endpoints with PDF handling',
    'Email service integration via Gmail SMTP',
    'Python test scripts for API validation',
    'Performance optimisation: N+1 query fix, batch fetching, connection pooling',
    'Rate limiting configuration on sensitive endpoints',
    'CORS configuration for dual-portal access'
]
for w in ayesha_work:
    add_bullet(w)

add_heading_styled('Hira \u2014 Frontend Development & UI/UX', level=2)
doc.add_paragraph(
    'Hira led the frontend development including both the user dashboard and admin portal:'
)
hira_work = [
    'Next.js 16 App Router setup for both User Dashboard (port 3000) and Admin Portal (port 3001)',
    'TypeScript type definitions and interfaces',
    'Tailwind CSS configuration and custom design system',
    'Landing page with Vanta.js animated 3D background (Three.js integration)',
    'Authentication UI: Login, Register, Forgot Password, Reset Password pages with form validation',
    'Auth context provider with JWT token management and localStorage persistence',
    'Protected route components for authenticated pages',
    'Dashboard page with quick actions, stats, and navigation',
    'CV Analysis page: upload with drag-and-drop, analysis results display, '
    'skill extraction visualisation, gap identification',
    'Roadmap page: interactive roadmap display with phases, milestones, and resources',
    'Chatbot page with full-page chat interface and real-time messaging',
    'Floating chat widget component available on all pages',
    'Internships listing page with search and personalised matches',
    'Courses listing page with category/difficulty/price filters',
    'Course cards with add-to-plan functionality',
    'Admin Dashboard: statistics overview, system health monitoring',
    'Admin User Management: paginated table with search, activate/deactivate, promote to admin',
    'Admin System Info page: database status, OAuth configuration display',
    'Responsive design ensuring mobile compatibility across all pages',
    'Error boundaries, loading states, and empty state handling',
    'Navigation bar with role-based menu items',
    'Lucide React icons integration for consistent visual language',
    'Axios HTTP client setup with interceptors for token handling and error responses'
]
for w in hira_work:
    add_bullet(w)

add_heading_styled('Eman \u2014 AI/ML Integration, Deployment & Testing', level=2)
doc.add_paragraph(
    'Eman handled the AI/ML components, deployment infrastructure, testing, and documentation:'
)
eman_work = [
    'Groq LLaMA 3.1 API integration for all AI features',
    'CV Analysis AI: prompt engineering for skill extraction, gap analysis, recommendations',
    'Career Roadmap Generator: prompt design for structured JSON output with phases, '
    'objectives, resources, and milestones',
    'Chatbot system prompt design and RAG pipeline implementation',
    'Intent detection algorithm for identifying job vs course vs general queries',
    'User context injection: building profile-aware prompts for personalised responses',
    'Sentence-Transformers (all-MiniLM-L6-v2) embedding model setup and lazy-loading',
    'ChromaDB vector database setup: persistent client, collection management, '
    'cosine similarity search implementation',
    'Embedding generation for CVs, internships, courses, and FAQ content',
    'Semantic search: query embedding \u2192 vector search \u2192 result enrichment pipeline',
    'CV rebuild/optimisation: AI-powered ATS improvement with JSON parsing',
    'FAQ knowledge base creation and embedding for RAG context retrieval',
    'Docker configuration: Dockerfile for backend, docker-compose.yml for 3 services '
    '(PostgreSQL, Backend, Frontend)',
    'Deployment setup: HuggingFace Spaces backend deployment, Vercel frontend deployment',
    'Environment configuration (.env, Docker env vars, deployment secrets)',
    'GitHub Actions CI/CD pipeline: lint, test, build, Docker build check',
    'pytest configuration and test scripts (test_auth.py, test_live_apis.py, '
    'test_admin_api.py, test_admin_sync.py, test_db.py)',
    'Documentation: Sprint 1 & 2 documentation, deployment guide, '
    'admin portal README, dual portal setup guide',
    'Seed data creation: 20 career paths, 25+ internships, 15+ courses',
    'Add indexes migration for query performance',
    'Vercel configuration: vercel.json, .npmrc for legacy peer deps',
    'Git repository management and commit history'
]
for w in eman_work:
    add_bullet(w)

# ══════════════════════════════════════════════════════════════
# 10. TESTING STRATEGY
# ══════════════════════════════════════════════════════════════
add_heading_styled('10. Testing Strategy', level=1)

add_heading_styled('10.1 Testing Framework & Tools', level=2)
doc.add_paragraph('pytest is used as the primary testing framework with the following configuration:')
test_tools = [
    'pytest with verbose output and short traceback mode',
    'pytest.ini configured for test discovery in tests/ directory',
    'GitHub Actions CI runs tests automatically on push/PR',
    'flake8 for Python linting (max-line-length 120)'
]
for t in test_tools:
    add_bullet(t)

add_heading_styled('10.2 Test Categories', level=2)
add_table(
    ['Test File', 'Description'],
    [
        ['test_auth.py', 'Registration flow, OTP resend, login verification'],
        ['test_live_apis.py', 'LinkedIn and Indeed API integration testing'],
        ['test_admin_api.py', 'Admin endpoint validation and permissions'],
        ['test_admin_sync.py', 'External data sync functionality'],
        ['test_db.py', 'Database connectivity and basic queries'],
        ['test_login.py', 'Login endpoint behaviour with various scenarios'],
        ['test_different_email.py', 'Email-specific authentication tests'],
    ]
)

add_heading_styled('10.3 CI/CD Pipeline (GitHub Actions)', level=2)
doc.add_paragraph('The CI pipeline defined in .github/workflows/ci.yml includes three jobs:')

add_heading_styled('Job 1: Backend \u2014 Lint & Test', level=3)
ci_backend = [
    'Runs on ubuntu-latest with PostgreSQL 16 service container',
    'Python 3.11 setup with pip caching',
    'Lint with flake8 (max-line-length=120)',
    'Run pytest with environment variables for test DB',
    'Fallback: continues even if no tests found yet'
]
for c in ci_backend:
    add_bullet(c)

add_heading_styled('Job 2: Frontend \u2014 Lint & Build', level=3)
ci_frontend = [
    'Node.js 20 with npm caching',
    'npm install and lint',
    'Next.js production build verification'
]
for c in ci_frontend:
    add_bullet(c)

add_heading_styled('Job 3: Docker Build Check', level=3)
ci_docker = [
    'Depends on backend and frontend jobs passing',
    'Builds backend Docker image to verify Dockerfile correctness',
    'Verifies image was created successfully'
]
for c in ci_docker:
    add_bullet(c)

# ══════════════════════════════════════════════════════════════
# 11. DEPLOYMENT
# ══════════════════════════════════════════════════════════════
add_heading_styled('11. Deployment Pipeline', level=1)

add_heading_styled('11.1 Local Development', level=2)
doc.add_paragraph('For local development, all services can be started via Docker Compose:')
doc.add_paragraph(
    'docker-compose -f deployment/docker/docker-compose.yml up\n\n'
    'This starts three containers:\n'
    '1. PostgreSQL 16 database (port 5432)\n'
    '2. FastAPI backend (port 8000)\n'
    '3. Next.js frontend (port 3000)'
)

add_heading_styled('11.2 Production Deployment', level=2)

add_heading_styled('Backend \u2014 HuggingFace Spaces', level=3)
deploy_backend = [
    'Docker-based space deployed on HuggingFace',
    'Free PostgreSQL via Supabase or Neon',
    'Environment variables configured in Space settings (SECRET_KEY, GROQ_API_KEY, '
    'DATABASE_URL, GMAIL credentials, OAuth client IDs)',
    'Auto-builds on git push to connected repository'
]
for d in deploy_backend:
    add_bullet(d)

add_heading_styled('Frontend \u2014 Vercel', level=3)
deploy_frontend = [
    'Frontend directory imported as a Next.js project',
    'Admin portal imported as a separate Next.js project',
    'NEXT_PUBLIC_API_URL set to HuggingFace Spaces URL',
    'Automatic deployments on git push'
]
for d in deploy_frontend:
    add_bullet(d)

# ══════════════════════════════════════════════════════════════
# 12. SPRINT BREAKDOWN
# ══════════════════════════════════════════════════════════════
add_heading_styled('12. Sprint Breakdown', level=1)

add_heading_styled('Sprint 1: Foundation & CV Analysis (Weeks 1-2)', level=2)
doc.add_paragraph('Focus: Project setup, authentication, CV upload & AI analysis, job matching')
add_table(
    ['Category', 'Completed Items'],
    [
        ['Project Setup', 'GitHub repo, FastAPI app, PostgreSQL, SQLAlchemy models'],
        ['Authentication', 'JWT auth, register/login, auth context, protected routes'],
        ['CV Analysis', 'PDF upload, PyMuPDF extraction, Groq AI analysis, skill extraction'],
        ['Job Matching', 'ChromaDB setup, embeddings, semantic search, 30+ internships seeded'],
        ['Frontend', 'Next.js setup, Tailwind, login/register pages, CV upload UI, analysis results'],
        ['Metrics', '8/8 user stories, 6 endpoints, 5 pages, 5 tables'],
    ]
)

add_heading_styled('Sprint 2: Roadmap, Chatbot & Deployment (Weeks 3-4)', level=2)
doc.add_paragraph('Focus: Career roadmap generator, AI chatbot with RAG, Docker, final polish')
add_table(
    ['Category', 'Completed Items'],
    [
        ['Career Roadmap', '20 career paths seeded, Groq prompt engineering, structured JSON output'],
        ['AI Chatbot', 'Groq integration, RAG pipeline, intent detection, profile context, '
         'auto job/course display, conversation management'],
        ['UI/UX', 'Roadmap viewer, full-page chat, floating widget, dashboard quick actions, profile page'],
        ['Deployment', 'Dockerfile, docker-compose.yml, HuggingFace Spaces, Vercel setup'],
        ['Admin Portal', 'Dashboard stats, user management, system info, CRUD operations'],
        ['Documentation', 'README, Sprint docs, deployment guide, admin portal guide'],
        ['Metrics', '10/10 user stories, 12 endpoints, 8 pages, 3 Docker services, ~5000+ LOC'],
    ]
)

# ══════════════════════════════════════════════════════════════
# 13. CHALLENGES & SOLUTIONS
# ══════════════════════════════════════════════════════════════
add_heading_styled('13. Challenges & Solutions', level=1)

add_table(
    ['Challenge', 'Solution'],
    [
        ['PDF text extraction quality', 'Used PyMuPDF for reliable text extraction from various PDF formats'],
        ['LLM returning non-JSON output', 'Added markdown fence stripping and robust JSON parsing with fallbacks'],
        ['ChromaDB persistence', 'Configured CHROMA_PERSIST_DIR with Docker volume mounts'],
        ['Token expiry handling', 'Implemented Axios 401 interceptor for automatic token refresh'],
        ['File upload size limits', 'Set 5MB limit with comprehensive validation'],
        ['LLM hallucinating resource URLs', 'Instructed LLM to use only well-known, verifiable resources'],
        ['Chat widget state management', 'Used React context for global chat state across pages'],
        ['Docker volume permissions', 'Configured proper volume mounts with user permissions'],
        ['CORS issues with dual portals', 'Extended allowed origins to include ports 3000 and 3001'],
        ['N+1 query problem', 'Implemented batch fetching and subquery optimization'],
        ['LLM returning empty/filtered content', 'Guard clause with fallback response message'],
        ['Admin self-protection', 'Validation preventing admin from removing own admin status'],
    ]
)

# ══════════════════════════════════════════════════════════════
# 14. FUTURE ENHANCEMENTS
# ══════════════════════════════════════════════════════════════
add_heading_styled('14. Future Enhancements', level=1)
future_items = [
    'Unit & integration testing coverage (currently manual test scripts)',
    'Interview preparation module with AI mock interviews',
    'Advanced resume builder with multiple templates',
    'Job application tracker with status management',
    'Analytics dashboard with user behaviour insights',
    'Real-time notification system (email, in-app)',
    'Social features: peer mentorship, career groups',
    'Mobile application (React Native or Flutter)',
    'Multi-language support',
    'Employer portal for direct job posting',
    'Integration with more job portals (LinkedIn Jobs API, Glassdoor, Indeed)',
    'WebSocket-based real-time chat updates'
]
for f in future_items:
    add_bullet(f)

# ══════════════════════════════════════════════════════════════
# 15. CONCLUSION
# ══════════════════════════════════════════════════════════════
add_heading_styled('15. Conclusion', level=1)
doc.add_paragraph(
    'CareerCure successfully demonstrates how modern AI technologies can be leveraged to create a comprehensive '
    'career development platform. By combining Groq LLaMA 3.1 for natural language understanding, ChromaDB for '
    'semantic search, and a robust FastAPI+Next.js architecture, the platform delivers:\n\n'
    '- Accurate CV analysis with actionable improvement suggestions\n'
    '- Intelligent job matching that considers the user\'s complete profile\n'
    '- Personalised career roadmaps with real, structured learning paths\n'
    '- An interactive AI career counselor that provides context-aware guidance\n'
    '- Course recommendations tailored to individual skill gaps\n\n'
    'The dual-portal architecture (User Dashboard + Admin Portal) ensures a clear separation between user-facing '
    'features and administrative functions. The Docker-based deployment and CI/CD pipeline make the application '
    'production-ready and easily deployable.\n\n'
    'The project was completed in two sprints over four weeks, with all planned features implemented and tested. '
    'The platform is ready for demonstration and serves as a solid foundation for future enhancements.'
)

doc.add_paragraph()
doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('--- END OF DOCUMENT ---')
run.bold = True
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(0x1A, 0x3C, 0x6E)

# ── Save ──
output_path = os.path.join(os.path.dirname(__file__), 'CareerCure_FYP_Documentation.docx')
doc.save(output_path)
print(f'Document saved to: {output_path}')
