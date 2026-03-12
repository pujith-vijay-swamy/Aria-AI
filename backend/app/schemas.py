from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserProfileResponse(BaseModel):
    display_name: str
    firebase_uid: str


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str = Field(..., description="Client-generated UUID for the conversation session")


class ResourceItem(BaseModel):
    id: UUID
    title: str
    description: str
    technique_type: str
    steps: List[str]
    duration_minutes: float


class CrisisResourceItem(BaseModel):
    name: str
    number: Optional[str] = None
    description: str
    url: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    sentiment_score: float
    stressors: List[str]
    recommended_resources: List[ResourceItem]
    is_crisis: bool
    crisis_resources: List[CrisisResourceItem]


# ── Dashboard ─────────────────────────────────────────────────────────────────

class MoodDataPoint(BaseModel):
    date: str
    avg_score: float
    entry_count: int


class StressorCount(BaseModel):
    stressor: str
    count: int


class DashboardMoodResponse(BaseModel):
    data: List[MoodDataPoint]
    overall_average: float
    days_tracked: int


class DashboardStressorsResponse(BaseModel):
    data: List[StressorCount]
    total_entries: int
