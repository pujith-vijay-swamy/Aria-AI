"""
Crisis Service — Safety-first keyword scanner.

Runs BEFORE the AI model to ensure immediate response to at-risk messages.
"""

from typing import TypedDict, List

RED_FLAG_KEYWORDS = [
    "suicide", "suicidal", "kill myself", "end my life", "want to die",
    "better off dead", "self-harm", "self harm", "cut myself", "hurt myself",
    "overdose", "no reason to live", "can't go on", "cannot go on",
    "give up on life", "not worth living", "hopeless", "ending it all",
]

CRISIS_RESOURCES = [
    {
        "name": "iCall (India)",
        "number": "9152987821",
        "description": "Psychosocial support helpline by TISS. Mon–Sat 8am–10pm.",
        "url": "https://icallhelpline.org",
    },
    {
        "name": "Vandrevala Foundation",
        "number": "1860-2662-345",
        "description": "24/7 free mental health helpline across India.",
        "url": "https://www.vandrevalafoundation.com",
    },
    {
        "name": "Snehi",
        "number": "044-24640050",
        "description": "Emotional support & suicide prevention helpline.",
        "url": None,
    },
    {
        "name": "iMind (NIMHANS)",
        "number": "080-46110007",
        "description": "Mental health helpline by NIMHANS Bangalore.",
        "url": None,
    },
    {
        "name": "International Association for Suicide Prevention",
        "number": None,
        "description": "Directory of crisis centres worldwide.",
        "url": "https://www.iasp.info/resources/Crisis_Centres/",
    },
]


class CrisisScanResult(TypedDict):
    is_crisis: bool
    resources: List[dict]


def scan_message(text: str) -> CrisisScanResult:
    """
    Check if the message contains any red-flag keywords.
    Returns immediately so the frontend can show crisis resources
    without waiting for AI inference.
    """
    lower_text = text.lower()
    triggered = any(kw in lower_text for kw in RED_FLAG_KEYWORDS)
    return {
        "is_crisis": triggered,
        "resources": CRISIS_RESOURCES if triggered else [],
    }
