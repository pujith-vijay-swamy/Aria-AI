import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import MoodLog

db = SessionLocal()
logs = db.query(MoodLog).all()
deleted_count = 0
for log in logs:
    if log.stressors and "Suicidal Ideation" in log.stressors:
        db.delete(log)
        deleted_count += 1

db.commit()
print(f"Deleted {deleted_count} logs with 'Suicidal Ideation'")
