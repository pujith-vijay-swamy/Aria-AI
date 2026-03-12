"""
Database seed — inserts default wellness resources on first startup.
"""

from sqlalchemy.orm import Session
from app.models import Resource


SEED_RESOURCES = [
    {
        "title": "Box Breathing",
        "description": "A powerful stress-relief technique used to calm the nervous system and regain focus.",
        "technique_type": "breathing",
        "trigger_keywords": ["Academic Pressure", "Anxiety", "Time Management", "Exam Stress", "Overwhelm"],
        "steps": [
            "Find a comfortable seated position.",
            "Inhale slowly through your nose for 4 counts.",
            "Hold your breath for 4 counts.",
            "Exhale slowly through your mouth for 4 counts.",
            "Hold empty for 4 counts.",
            "Repeat 4 times."
        ],
        "duration_minutes": 5.0,
    },
    {
        "title": "5-4-3-2-1 Grounding",
        "description": "An anxiety-reducing technique that anchors you to the present moment using your five senses.",
        "technique_type": "grounding",
        "trigger_keywords": ["Social Pressure", "Loneliness", "Anxiety", "Panic", "Uncertainty", "Depression", "Isolation"],
        "steps": [
            "Notice 5 things you can SEE.",
            "Notice 4 things you can TOUCH.",
            "Notice 3 things you can HEAR.",
            "Notice 2 things you can SMELL.",
            "Notice 1 thing you can TASTE."
        ],
        "duration_minutes": 5.0,
    },
    {
        "title": "Pomodoro Technique",
        "description": "A time management method that breaks work into focused 25-minute intervals.",
        "technique_type": "productivity",
        "trigger_keywords": ["Time Management", "Academic Pressure", "Procrastination", "Overwhelm", "Exam Stress", "Burnout"],
        "steps": [
            "Choose one task to focus on.",
            "Set a timer for 25 minutes.",
            "Work with full focus until the timer rings.",
            "Take a 5-minute break.",
            "Repeat."
        ],
        "duration_minutes": 25.0,
    },
    {
        "title": "Grief Processing Journal",
        "description": "Specific prompts to help process loss and navigate the stages of grief.",
        "technique_type": "journaling",
        "trigger_keywords": ["Grief", "Loss", "Loneliness", "Relationship Issues"],
        "steps": [
            "Find a quiet, safe space.",
            "Prompt: 'What is one thing I wish I could say to them right now?'",
            "Prompt: 'What is a memory that brings me comfort?'",
            "Prompt: 'What does my grief feel like in my body today?'",
            "Allow yourself to feel whatever comes up without judgment."
        ],
        "duration_minutes": 15.0,
    },
    {
        "title": "Burnout Recovery Protocol",
        "description": "A structured approach to restoring energy when feeling emotionally and physically depleted.",
        "technique_type": "lifestyle",
        "trigger_keywords": ["Burnout", "Fatigue", "Academic Pressure", "Overwhelm", "Financial Stress"],
        "steps": [
            "Identify one non-essential responsibility to drop this week.",
            "Schedule 2 hours of 'nothing time' (no screens, no tasks).",
            "Prioritize 8 hours of sleep for 3 nights in a row.",
            "Practice saying 'no' to one new request today.",
            "Spend 15 minutes in nature or looking at greenery."
        ],
        "duration_minutes": 120.0,
    },
    {
        "title": "Social Boundary Setting",
        "description": "An exercise to help you establish healthy limits in your relationships and reduce social pressure.",
        "technique_type": "social",
        "trigger_keywords": ["Social Pressure", "Relationship Issues", "Anxiety", "Family Issues"],
        "steps": [
            "Identify a recurring situation that makes you feel drained.",
            "Draft a polite but firm 'no' or limit (e.g., 'I can't join this time, I need to rest').",
            "Practice saying it out loud to yourself.",
            "Remember: boundaries are an act of self-care, not rejection.",
            "Implement the limit the next time the situation arises."
        ],
        "duration_minutes": 10.0,
    },
    {
        "title": "Progressive Muscle Relaxation",
        "description": "Systematically tense and relax muscle groups to release physical stress.",
        "technique_type": "relaxation",
        "trigger_keywords": ["Physical Tension", "Stress", "Anxiety", "Sleep", "Fatigue"],
        "steps": [
            "Close your eyes and focus on your feet.",
            "Tense the muscles for 5 seconds, then release.",
            "Notice the sensation of relaxation.",
            "Move up to your legs, torso, arms, and face.",
            "Take three deep breaths."
        ],
        "duration_minutes": 10.0,
    },
    {
        "title": "Exam Prep Strategy",
        "description": "A logical approach to tackling heavy workloads without falling into panic.",
        "technique_type": "academic",
        "trigger_keywords": ["Exam Stress", "Academic Pressure", "Uncertainty", "Overwhelm"],
        "steps": [
            "Break your syllabus into 5–10 small, manageable chunks.",
            "Rank them from 'Most Fear' to 'Least Fear'.",
            "Dedicate 45 minutes to the hardest chunk first.",
            "Use active recall (test yourself) rather than just re-reading.",
            "End each session by writing down what you'll tackle tomorrow."
        ],
        "duration_minutes": 45.0,
    },
    {
        "title": "Financial Anxiety Mapping",
        "description": "Break down money-related stress into actionable, controlled steps.",
        "technique_type": "planning",
        "trigger_keywords": ["Financial Stress", "Money", "Debt", "Scholarship", "Uncertainty"],
        "steps": [
            "Write down the three biggest financial worries.",
            "Identify what is within your control (e.g., spending $10 less on coffee).",
            "Research one university support resource or scholarship.",
            "Draft a message to a financial advisor or family member if help is needed.",
            "Take one small action from your map today."
        ],
        "duration_minutes": 30.0,
    },
]


def seed_resources(db: Session) -> None:
    """Insert seed resources only if the table is empty."""
    if db.query(Resource).count() == 0:
        for data in SEED_RESOURCES:
            db.add(Resource(**data))
        db.commit()
