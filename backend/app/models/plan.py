from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PlannedCourse(Base):
    __tablename__ = "planned_courses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, nullable=False)
    title = Column(String(500), nullable=False)
    provider = Column(String(255), nullable=True)
    course_url = Column(Text, nullable=True)
    duration = Column(String(100), nullable=True)
    difficulty_level = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    roadmap = Column(String(255), default="General")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    conversation_id = Column(String(64), nullable=False, index=True, default="default")
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    show_jobs = Column(Boolean, default=False)
    show_courses = Column(Boolean, default=False)
    jobs = Column(Text, nullable=True)  # JSON string
    courses = Column(Text, nullable=True)  # JSON string
    sequence = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
