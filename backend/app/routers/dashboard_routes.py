from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Profile,Activity
from ..auth import get_current_user
router=APIRouter()
def calc(p):
    fin=90 if p.monthly_income>0 and p.monthly_expense/p.monthly_income<=.5 else 75 if p.monthly_income>0 and p.monthly_expense/p.monthly_income<=.7 else 55 if p.monthly_income>0 and p.monthly_expense/p.monthly_income<=.9 else 30
    study=95 if p.study_hours>=5 and p.assignments_pending<=1 else 80 if p.study_hours>=3 and p.assignments_pending<=3 else 45 if p.study_hours<2 or p.assignments_pending>=5 else 70
    habit=95 if p.sleep_hours>=7 and p.exercise_days>=3 and p.screen_hours<=7 else 45 if (p.sleep_hours and p.sleep_hours<6) or p.screen_hours>10 else 65
    risk=max(0,min(100,round(100-(fin+study+habit)/3))); alerts=[]
    if fin<60: alerts.append('Expenses are high compared with income.')
    if p.assignments_pending>=4: alerts.append('Several study tasks are pending.')
    if p.sleep_hours and p.sleep_hours<6: alerts.append('Sleep duration is below the recommended target.')
    if p.screen_hours>10: alerts.append('Screen time is elevated.')
    if not alerts: alerts.append('No major risk indicators detected.')
    return risk,'Low' if risk<30 else 'Moderate' if risk<60 else 'High',alerts,fin,study,habit
@router.get('')
def dashboard(user=Depends(get_current_user),db:Session=Depends(get_db)):
    p=db.query(Profile).filter(Profile.user_id==user.id).first(); recent=db.query(Activity).filter(Activity.user_id==user.id).order_by(Activity.created_at.desc()).limit(6).all()
    r,l,a,f,s,h=calc(p)
    return {'user':{'id':user.id,'full_name':user.full_name,'email':user.email,'created_at':user.created_at},'profile':p,'risk_score':r,'risk_level':l,'alerts':a,'financial_health':f,'study_health':s,'habit_health':h,'recent_activity':recent}
