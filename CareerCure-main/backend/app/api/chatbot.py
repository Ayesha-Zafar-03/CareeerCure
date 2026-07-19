import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.chatbot.chat_service import chat, build_user_context
from app.models.plan import ChatMessage
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

logger = logging.getLogger(__name__)


class Message(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list = []
    conversation_id: Optional[str] = None


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
        response = ChatResponse(
            reply=result["reply"],
            show_jobs=result.get("show_jobs", False),
            show_courses=result.get("show_courses", False), 
            jobs=result.get("jobs", []),
            courses=result.get("courses", [])
        )

        # Persist the user message and assistant reply to the database
        conv_id = req.conversation_id or "default"
        try:
            last_seq = (
                db.query(ChatMessage)
                .filter(ChatMessage.user_id == current_user.id, ChatMessage.conversation_id == conv_id)
                .count()
            )
            db.add(ChatMessage(
                user_id=current_user.id,
                conversation_id=conv_id,
                role="user",
                content=req.message,
                sequence=last_seq,
            ))
            db.add(ChatMessage(
                user_id=current_user.id,
                conversation_id=conv_id,
                role="assistant",
                content=response.reply,
                show_jobs=response.show_jobs,
                show_courses=response.show_courses,
                jobs=json.dumps(response.jobs) if response.jobs else None,
                courses=json.dumps(response.courses) if response.courses else None,
                sequence=last_seq + 1,
            ))
            db.commit()
        except Exception as e:
            logger.warning("Could not persist chat messages: %s", e)

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")


@router.get("/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all conversations for the current user with a friendly title.

    The title is derived from the first user message in each conversation so the
    UI can show a readable name instead of the raw conversation id.
    """
    rows = (
        db.query(ChatMessage.conversation_id, func.count(ChatMessage.id))
        .filter(ChatMessage.user_id == current_user.id)
        .group_by(ChatMessage.conversation_id)
        .all()
    )

    conversations = []
    for conv_id, count in rows:
        first_user = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.user_id == current_user.id,
                ChatMessage.conversation_id == conv_id,
                ChatMessage.role == "user",
            )
            .order_by(ChatMessage.sequence.asc(), ChatMessage.created_at.asc())
            .first()
        )
        last_msg = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.user_id == current_user.id,
                ChatMessage.conversation_id == conv_id,
            )
            .order_by(ChatMessage.sequence.desc(), ChatMessage.created_at.desc())
            .first()
        )
        raw_title = (first_user.content if first_user else conv_id) or conv_id
        title = raw_title.strip().split("\n")[0][:60] or "New conversation"
        conversations.append({
            "conversation_id": conv_id,
            "message_count": count,
            "title": title,
            "updated_at": last_msg.created_at.isoformat() if last_msg and last_msg.created_at else None,
        })

    return {"conversations": conversations}


@router.get("/history")
def get_history(
    conversation_id: str = "default",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the persisted chat history for a conversation."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id, ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.sequence.asc(), ChatMessage.created_at.asc())
        .all()
    )
    return {"conversation_id": conversation_id, "messages": [
        {
            "role": m.role,
            "content": m.content,
            "show_jobs": m.show_jobs,
            "show_courses": m.show_courses,
            "jobs": json.loads(m.jobs) if m.jobs else [],
            "courses": json.loads(m.courses) if m.courses else [],
        }
        for m in messages
    ]}


@router.delete("/history")
def clear_history(
    conversation_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Clear chat history. If conversation_id given, clear only that conversation."""
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    if conversation_id:
        query = query.filter(ChatMessage.conversation_id == conversation_id)
    query.delete()
    db.commit()
    return {"message": "Chat history cleared"}
