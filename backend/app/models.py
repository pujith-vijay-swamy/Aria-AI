import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """
    User — identified by Firebase UID. No passwords stored.
    Display name synced from Firebase on first login.
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(128), unique=True, nullable=False, index=True)
    display_name = Column(String(64), nullable=False, default="Friend")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    mood_logs = relationship("MoodLog", back_populates="user", cascade="all, delete-orphan")


class MoodLog(Base):
    """
    Anonymised mood entry — raw chat messages are NEVER stored.
    Only the SHA-256 hash of the message and extracted analytics are persisted.
    """
    __tablename__ = "mood_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String(64), nullable=False, index=True)
    sentiment_score = Column(Float, nullable=False)
    stressors = Column(JSON, default=list)
    message_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="mood_logs")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    technique_type = Column(String(64), nullable=False)
    trigger_keywords = Column(JSON, default=list)
    steps = Column(JSON, default=list)
    duration_minutes = Column(Float, default=5.0)
