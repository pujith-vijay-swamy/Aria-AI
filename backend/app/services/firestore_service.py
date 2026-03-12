import firebase_admin
from firebase_admin import firestore
from google.cloud import firestore as cloud_firestore
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import uuid
import asyncio

from app.config import settings

class FirestoreService:
    def __init__(self):
        # Use the asynchronous client with explicit credentials
        self.db = cloud_firestore.AsyncClient.from_service_account_json(
            settings.FIREBASE_SERVICE_ACCOUNT_PATH
        )
        self._resource_cache: List[Dict[str, Any]] = []
        self._cache_expiry: Optional[datetime] = None

    # --- Users ---
    async def get_user_by_uid(self, firebase_uid: str) -> Optional[Dict[str, Any]]:
        users_ref = self.db.collection("users")
        query = users_ref.where("firebase_uid", "==", firebase_uid).limit(1).stream()
        async for doc in query:
            return {"id": doc.id, **doc.to_dict()}
        return None

    async def create_user(self, firebase_uid: str, display_name: str) -> Dict[str, Any]:
        user_id = str(uuid.uuid4())
        user_data = {
            "firebase_uid": firebase_uid,
            "display_name": display_name,
            "created_at": datetime.utcnow()
        }
        await self.db.collection("users").document(user_id).set(user_data)
        return {"id": user_id, **user_data}

    # --- Mood Logs ---
    async def create_mood_log(self, user_id: str, session_id: str, sentiment_score: float, stressors: List[str], message_hash: str) -> Dict[str, Any]:
        log_id = str(uuid.uuid4())
        log_data = {
            "user_id": user_id,
            "session_id": session_id,
            "sentiment_score": sentiment_score,
            "stressors": stressors,
            "message_hash": message_hash,
            "created_at": datetime.utcnow()
        }
        # Fire and forget or await depending on caller needs; usually we await for reliability
        await self.db.collection("mood_logs").document(log_id).set(log_data)
        return {"id": log_id, **log_data}

    async def get_mood_logs_by_user(self, user_id: str, since: datetime) -> List[Dict[str, Any]]:
        logs_ref = self.db.collection("mood_logs")
        query = logs_ref.where("user_id", "==", user_id).where("created_at", ">=", since).order_by("created_at", direction=cloud_firestore.Query.ASCENDING).stream()
        return [{"id": doc.id, **doc.to_dict()} async for doc in query]

    # --- Resources (with caching) ---
    async def get_all_resources(self) -> List[Dict[str, Any]]:
        # Cache for 10 minutes to reduce database hits
        if self._resource_cache and self._cache_expiry and datetime.utcnow() < self._cache_expiry:
            return self._resource_cache
            
        print("🔄 Fetching resources from Firestore (Cache Miss)...")
        resources_ref = self.db.collection("resources")
        results = [{"id": doc.id, **doc.to_dict()} async for doc in resources_ref.stream()]
        
        self._resource_cache = results
        self._cache_expiry = datetime.utcnow() + timedelta(minutes=10)
        return results

    async def seed_resource(self, resource_data: Dict[str, Any]):
        res_id = str(uuid.uuid4())
        await self.db.collection("resources").document(res_id).set(resource_data)

# Singleton instance
firestore_db = FirestoreService()
