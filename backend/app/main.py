import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_tables
from app.api import auth, cv, roadmap, internships, courses, chatbot, profile, admin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("Starting CareerCure API...")
    create_tables()
    logger.info("Database tables ready")
    yield
    logger.info("Shutting down CareerCure API")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Career Development Platform — FYP",
    lifespan=lifespan,
)

# CORS — allow configured origins plus any local dev port (e.g. Next.js on 3002)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(cv.router)
app.include_router(roadmap.router)
app.include_router(internships.router)
app.include_router(courses.router)
app.include_router(chatbot.router)
app.include_router(profile.router)
app.include_router(admin.router)


@app.get("/", tags=["Health"])
def root():
    return {"message": "CareerCure API is running 🚀", "version": settings.APP_VERSION}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
