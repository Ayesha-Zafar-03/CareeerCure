import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.core.config import settings
from app.core.database import create_tables, init_db_pool
from app.core.rate_limit import limiter
from app.api import auth, cv, roadmap, internships, courses, chatbot, profile, admin, plan

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
    init_db_pool()
    logger.info("Database tables ready")
    yield
    logger.info("Shutting down CareerCure API")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Career Development Platform — FYP",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS — allow configured origins plus any local dev port (e.g. Next.js on 3002)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins,
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
app.include_router(plan.router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Log full error server-side, return a generic message to the client."""
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."},
    )


@app.get("/", tags=["Health"])
def root():
    return {"message": "CareerCure API is running 🚀", "version": settings.APP_VERSION}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
