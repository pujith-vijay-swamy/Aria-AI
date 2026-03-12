from collections import Counter
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User, MoodLog
from app.schemas import DashboardMoodResponse, DashboardStressorsResponse, MoodDataPoint, StressorCount
from app.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


from app.services.firestore_service import firestore_db
from typing import Dict, Any

@router.get("/mood-trends", response_model=DashboardMoodResponse)
async def mood_trends(
    days: int = Query(default=7, ge=1, le=90),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    logs = await firestore_db.get_mood_logs_by_user(current_user["id"], since)
# ... lines 28-38 unchanged ...
# ... lines 39-55 unchanged ...

@router.get("/stressors", response_model=DashboardStressorsResponse)
async def stressor_distribution(
    days: int = Query(default=30, ge=1, le=90),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    logs = await firestore_db.get_mood_logs_by_user(current_user["id"], since)

    counter: Counter = Counter()
    for log in logs:
        for stressor in (log.get("stressors") or []):
            counter[stressor] += 1

    data = [
        StressorCount(stressor=stressor, count=count)
        for stressor, count in counter.most_common()
    ]

    return DashboardStressorsResponse(data=data, total_entries=len(logs))
