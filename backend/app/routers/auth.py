from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.models import User
from app.schemas import UserProfileResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the current user's profile (Firebase token already verified)."""
    return UserProfileResponse(
        display_name=current_user.display_name,
        firebase_uid=current_user.firebase_uid,
    )
