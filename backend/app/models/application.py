from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Application(Base):
    """Records a user's application to a job, capturing their CV + profile data at apply time."""

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, nullable=False, index=True)
    job_title = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    application_url = Column(String(500), nullable=True)

    status = Column(String(50), default="applied", nullable=False)  # applied, withdrawn
    cv_used = Column(Text, nullable=True)            # CV text snapshot used for this application
    cv_filename = Column(String(255), nullable=True)  # which CV file was used
    profile_snapshot = Column(JSON, default=dict)     # name/email/skills captured at apply time

    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="applications")

    def __repr__(self):
        return f"<Application id={self.id} user_id={self.user_id} job_id={self.job_id}>"
