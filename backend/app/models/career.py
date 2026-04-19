from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class CareerPath(Base):
    """Seeded career paths (Data Science, DevOps, etc.)"""
    __tablename__ = "career_paths"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    required_skills = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<CareerPath title={self.title}>"


class Internship(Base):
    """Seeded internship listings."""
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    location = Column(String(255), nullable=True)
    duration = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Internship title={self.title} company={self.company}>"


class Roadmap(Base):
    """AI-generated career roadmaps per user."""
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    career_goal = Column(String(255), nullable=False)
    roadmap_data = Column(JSON, nullable=False)   # structured JSON from LLM
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="roadmaps")

    def __repr__(self):
        return f"<Roadmap user_id={self.user_id} goal={self.career_goal}>"
