"""
Firebase Auth — verifies Firebase ID tokens sent from the frontend.
No passwords or JWT secrets stored on our server.
"""

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import hashlib

from app.config import settings
from app.database import get_db
from app.models import User

# Initialise Firebase Admin SDK once at import time
_firebase_initialized = False


def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    try:
        if settings.FIREBASE_SERVICE_ACCOUNT_PATH:
            cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
        else:
            # Uses GOOGLE_APPLICATION_CREDENTIALS env var or service account JSON
            firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
        _firebase_initialized = True
    except Exception as e:
        print(f"⚠️  Firebase init warning: {e}")


def hash_message(message: str) -> str:
    """SHA-256 of the raw user message for audit purposes (one-way)."""
    return hashlib.sha256(message.encode()).hexdigest()


bearer_scheme = HTTPBearer()


from app.services.firestore_service import firestore_db

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> Dict[str, Any]:
    """
    Verify the Firebase ID token sent as Bearer and return (or auto-create) the User document.
    """
    token = credentials.credentials
    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    uid = decoded["uid"]
    display_name = decoded.get("name") or decoded.get("email", "Friend").split("@")[0]

    # Auto-create user profile on first login (Async Firestore version)
    user = await firestore_db.get_user_by_uid(uid)
    if not user:
        user = await firestore_db.create_user(uid, display_name)

    return user
