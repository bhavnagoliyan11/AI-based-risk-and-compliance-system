from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Activity
from ..schemas import ActivityCreate,ActivityOut
from ..auth import get_current_user
router=APIRouter()
@router.get('',response_model=list[ActivityOut])
def get_activity(user=Depends(get_current_user),db:Session=Depends(get_db)):
    return db.query(Activity).filter(Activity.user_id==user.id).order_by(Activity.created_at.desc()).limit(100).all()
@router.post('',response_model=ActivityOut)
def create_activity(data:ActivityCreate,user=Depends(get_current_user),db:Session=Depends(get_db)):
    item=Activity(user_id=user.id,action=data.action,category=data.category,details=data.details); db.add(item); db.commit(); db.refresh(item); return item
