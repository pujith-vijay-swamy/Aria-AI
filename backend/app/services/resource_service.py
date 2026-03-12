"""
Resource Recommender Service — matches stressors to wellness techniques.
"""

from typing import List
from sqlalchemy.orm import Session
from app.models import Resource


def get_recommendations(stressors: List[str], db: Session, limit: int = 3) -> List[Resource]:
    """
    Return Resource records whose trigger_keywords overlap with detected stressors.
    Prioritizes specific matches and ensures a diverse mix if possible.
    """
    if not stressors:
        # Return a diverse set of general wellbeing resources as fallback
        return db.query(Resource).order_by(Resource.id).limit(limit).all()

    lower_stressors = [s.lower() for s in stressors]
    all_resources = db.query(Resource).all()

    def score(resource: Resource) -> float:
        keywords = [k.lower() for k in (resource.trigger_keywords or [])]
        match_count = sum(1 for k in keywords if any(s == k for s in lower_stressors))
        partial_match_count = sum(0.5 for k in keywords if any((s in k or k in s) and s != k for s in lower_stressors))
        return match_count + partial_match_count

    # Group resources by technique type to ensure diversity if we have enough matches
    scored_resources = []
    for r in all_resources:
        s = score(r)
        if s > 0:
            scored_resources.append((s, r))

    if not scored_resources:
        return db.query(Resource).order_by(Resource.id).limit(limit).all()

    # Sort by score descending
    scored_resources.sort(key=lambda x: x[0], reverse=True)

    # Pick top resources, but try to avoid picking 3 of the same type if others are available
    selected: List[Resource] = []
    types_seen = set()
    
    for _, res in scored_resources:
        if len(selected) >= limit:
            break
        if res.technique_type not in types_seen or len(selected) == 0:
            selected.append(res)
            types_seen.add(res.technique_type)
            
    # If we didn't fill the limit because of type diversity, fill with remaining top scored
    if len(selected) < limit:
        for _, res in scored_resources:
            if len(selected) >= limit:
                break
            if res not in selected:
                selected.append(res)

    return selected[:limit]
