from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resource, User
from fastapi import APIRouter
from typing import List

from app.schemas import ResourceItem
from app.services.firestore_service import firestore_db

router = APIRouter(prefix="/api/resources", tags=["Resources"])


@router.get("", response_model=List[ResourceItem])
async def get_all_resources():
    """Return all available wellness techniques (Firestore)."""
    raw = await firestore_db.get_all_resources()
    return [
        ResourceItem(
            id=r["id"],
            title=r["title"],
            description=r["description"],
            technique_type=r["technique_type"],
            steps=r.get("steps") or [],
            duration_minutes=r.get("duration_minutes") or 5.0,
        )
        for r in resources
    ]
