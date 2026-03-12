from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, MoodLog
from app.schemas import ChatRequest, ChatResponse, ResourceItem, CrisisResourceItem
from app.auth import get_current_user, hash_message
from app.services import gemini_service, crisis_service, resource_service

router = APIRouter(prefix="/api/chat", tags=["Chat"])


from app.services.firestore_service import firestore_db
from app.services.gemini_service import get_ai_response # Assuming get_ai_response is now directly imported
from typing import Dict, Any # Added for current_user type hint


import asyncio

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Optimized Chat Endpoint:
    1. Parallel Crisis Scan and Gemini Start.
    2. Async Firestore Logging.
    3. Cached Resource lookup.
    """
    # ── 1. Parallel Task Execution ──────────────────────────────────────────
    try:
        # We can run the crisis scan and the start of the Gemini call in parallel
        crisis_task = asyncio.to_thread(crisis_service.scan_message, request.message)
        ai_task = get_ai_response(request.message, request.session_id)
        resource_task = firestore_db.get_all_resources() # cached

        # Wait for the primary tasks
        crisis_result, ai_result, all_raw = await asyncio.gather(
            crisis_task, ai_task, resource_task
        )
        
        reply, sentiment_score, stressors = ai_result
    except Exception as exc:
        import traceback
        print(f"❌ Chat Error: {exc}")
        traceback.print_exc()
        raise HTTPException(status_code=502, detail=f"AI or Database error: {str(exc)}")

    # ── 2. Background Firestore Logging ──────────────────────────────────────
    # We create the log but don't strictly NEED to wait for it before replying
    msg_hash = hash_message(request.message)
    asyncio.create_task(
        firestore_db.create_mood_log(
            user_id=current_user["id"],
            session_id=request.session_id,
            sentiment_score=sentiment_score,
            stressors=stressors,
            message_hash=msg_hash
        )
    )

    # ── 3. Resource matching (Fast, locally filtered) ───────────────────────
    lower_stressors = [s.lower() for s in stressors]
    scored = []
    for r in all_raw:
        keywords = [k.lower() for k in (r.get("trigger_keywords") or [])]
        score = sum(1 for k in keywords if any(s == k for s in lower_stressors))
        if score > 0:
            scored.append((score, r))
    
    scored.sort(key=lambda x: x[0], reverse=True)
    top_resources = [s[1] for s in scored[:3]] or all_raw[:3]

    resources = [
        ResourceItem(
            id=r["id"],
            title=r["title"],
            description=r["description"],
            technique_type=r["technique_type"],
            steps=r.get("steps") or [],
            duration_minutes=r.get("duration_minutes") or 5.0,
        )
        for r in top_resources
    ]

    crisis_resources = [CrisisResourceItem(**c) for c in crisis_result["resources"]]

    return ChatResponse(
        reply=reply,
        sentiment_score=sentiment_score,
        stressors=stressors,
        recommended_resources=resources,
        is_crisis=crisis_result["is_crisis"],
        crisis_resources=crisis_resources,
    )


@router.delete("/session/{session_id}")
def end_session(session_id: str, current_user: User = Depends(get_current_user)):
    """Clear in-memory chat history for a session."""
    gemini_service.clear_session(session_id)
    return {"message": "Session cleared."}
