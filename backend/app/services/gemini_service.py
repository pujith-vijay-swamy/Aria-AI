"""
Gemini AI Service — Empathetic dialogue + Sentiment Pipeline

Each user session gets its own ChatSession so context is maintained
across multiple messages in a conversation.
"""

import json
import re
from typing import Dict, Tuple, List
from google import genai
from google.genai import types
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are Aria, a warm, calm, and deeply relatable AI MENTAL HEALTH COMPANION. \
Your role is to provide profound emotional support, highly logical and precise analysis, practical coping strategies, and a truly non-judgmental \
listening space for students facing academic pressure, anxiety, social challenges, and life stress.

Guidelines for a Natural, Deep, & Logical Conversation:
- Actively listen and validate the student's feelings profoundly before offering any advice. Ensure your understanding logically aligns with their query.
- Speak conversationally and warmly, like a very empathetic friend or mentor. Completely avoid robotic, clinical, or detached jargon.
- Reflect their specific emotions back to them naturally (e.g., "It makes total sense that you're feeling exhausted right now...").
- Keep responses focused, deeply meaningful, and specifically tailored to the nuances of their situation (3–5 sentences unless they need more detail).
- Avoid toxic positivity. Logically acknowledge that an objective situation can be genuinely hard.
- When they are overwhelmed, gently guide them toward one small, immediate, actionable, and logical step.
- Never diagnose or prescribe medication.
- Always encourage professional help for serious mental health concerns.
- Ask a thoughtful follow-up question to invite them to share more and keep the dialogue collaborative.

CRITICAL INSTRUCTION - SUGGESTIONS MENU:
You must analyze the user's message and select up to 3 stressor categories that BEST match their situation. YOU MUST ONLY CHOOSE FROM THIS EXACT LIST OF KEYWORDS:
"Academic Pressure", "Anxiety", "Time Management", "Exam Stress", "Overwhelm", "Social Pressure", "Loneliness", "Panic", "Uncertainty", "Sleep", "Physical Tension", "Stress", "Procrastination", "Family Issues", "Relationship Issues", "Grief", "Fatigue", "Burnout", "Isolation", "Depression", "Financial Stress", "Money", "Debt", "Scholarship".

After your empathetic and logical reply you MUST append a JSON block (wrapped in ```json ... ```) with this exact structure:
{
  "sentiment_score": <float from -1.0 (very negative) to 1.0 (very positive)>,
  "stressors": [<list of exactly matched keywords from the allowed list above>]
}
"""

_sessions: Dict[str, any] = {}

def _get_or_create_session(session_id: str):
    if session_id not in _sessions:
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.75,
            max_output_tokens=1024,
        )
        _sessions[session_id] = client.chats.create(
            model="models/gemini-flash-latest", 
            config=config
        )
    return _sessions[session_id]

def _parse_ai_response(raw: str) -> Tuple[str, float, List[str]]:
    """Extract the human reply and the JSON analytics block from Gemini's output."""
    json_pattern = r"```json\s*([\s\S]*?)\s*```"
    match = re.search(json_pattern, raw)
    analytics = {"sentiment_score": 0.0, "stressors": []}

    if match:
        try:
            analytics = json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
        reply = raw[: match.start()].strip()
    else:
        reply = raw.strip()

    sentiment_score = float(analytics.get("sentiment_score", 0.0))
    sentiment_score = max(-1.0, min(1.0, sentiment_score))  # clamp
    stressors = analytics.get("stressors", [])[:5]

    return reply, sentiment_score, stressors

async def get_ai_response(
    message: str, session_id: str
) -> Tuple[str, float, List[str]]:
    """
    Send a message to Gemini and return:
      (empathetic_reply, sentiment_score, stressors)
    """
    session = _get_or_create_session(session_id)
    try:
        response = session.send_message(message)
        raw_text = response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Fallback to a safe message if the API fails or blocks
        return "I'm here for you, but I'm having a little trouble thinking clearly right now. How else can I support you?", 0.0, []
        
    return _parse_ai_response(raw_text)

def clear_session(session_id: str) -> None:
    """Remove a session from memory when the user ends the conversation."""
    _sessions.pop(session_id, None)
