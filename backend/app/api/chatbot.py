from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user
from app.models.user import User
from app.chatbot.chat_service import chat

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])


class Message(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list = []


class ChatResponse(BaseModel):
    reply: str


@router.post("/message", response_model=ChatResponse)
def send_message(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """Send a message to the AI career counselor chatbot."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history = [
        {"role": m["role"], "content": m["content"]} if isinstance(m, dict)
        else {"role": m.role, "content": m.content}
        for m in req.history
    ]

    try:
        reply = chat(req.message, history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")

    return {"reply": reply}
