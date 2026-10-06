import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Profile, Activity
from ..schemas import ProfileOut, ProfileUpdate
from ..auth import get_current_user

router = APIRouter()

TRACKED_FIELDS = [
    "age", "occupation", "monthly_income", "monthly_expense", "savings_goal",
    "study_hours", "assignments_pending", "sleep_hours", "exercise_days", "screen_hours"
]

@router.get("", response_model=ProfileOut)
def get_profile(user=Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("", response_model=ProfileOut)
def update_profile(
    data: ProfileUpdate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    payload = data.model_dump()
    changes = []

    for key in TRACKED_FIELDS:
        old_value = getattr(profile, key)
        new_value = payload.get(key)
        if old_value != new_value:
            changes.append({"field": key, "old": old_value, "new": new_value})
            setattr(profile, key, new_value)

    if changes:
        db.add(Activity(
            user_id=user.id,
            action="Profile updated",
            category="profile",
            details=json.dumps(changes)
        ))
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile
