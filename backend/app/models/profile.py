from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    bio = Column(Text, nullable=True)
    skills = Column(JSON, default=list)          # ["Python", "SQL", ...]
    education = Column(String(255), nullable=True)
    experience_years = Column(Integer, default=0)
    career_goal = Column(String(255), nullable=True)
    cv_text = Column(Text, nullable=True)        # extracted raw text from last CV
    cv_filename = Column(String(255), nullable=True)
    cv_analysis = Column(JSON, nullable=True)    # last AI analysis result
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<Profile user_id={self.user_id}>"
