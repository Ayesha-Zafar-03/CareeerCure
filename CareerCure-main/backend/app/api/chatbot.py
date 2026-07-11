import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.chatbot.chat_service import chat, build_user_context
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

logger = logging.getLogger(__name__)


class Message(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list = []


class ChatResponse(BaseModel):
    reply: str
    show_jobs: bool = False
    show_courses: bool = False
    jobs: List[Dict[str, Any]] = []
    courses: List[Dict[str, Any]] = []


@router.post("/message", response_model=ChatResponse)
def send_message(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message to the AI career counselor chatbot."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history = [
        {"role": m["role"], "content": m["content"]} if isinstance(m, dict)
        else {"role": m.role, "content": m.content}
        for m in req.history
    ]

    # Personalise using the authenticated user's profile
    profile = None
    try:
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    except Exception as e:
        logger.warning("Could not load user profile for chat context: %s", e)
    user_context = build_user_context(current_user, profile)

    try:
        result = chat(req.message, history, user_context=user_context, user_profile=profile, db=db)
        return ChatResponse(
            reply=result["reply"],
            show_jobs=result.get("show_jobs", False),
            show_courses=result.get("show_courses", False), 
            jobs=result.get("jobs", []),
            courses=result.get("courses", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
