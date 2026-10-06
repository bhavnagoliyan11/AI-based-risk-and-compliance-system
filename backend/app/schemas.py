from datetime import datetime
from pydantic import BaseModel,EmailStr,Field,ConfigDict
class RegisterRequest(BaseModel):
    full_name:str=Field(min_length=2,max_length=120); email:EmailStr; password:str=Field(min_length=6,max_length=100)
class LoginRequest(BaseModel): email:EmailStr; password:str
class UserOut(BaseModel):
    model_config=ConfigDict(from_attributes=True); id:int; full_name:str; email:EmailStr; created_at:datetime
class ProfileUpdate(BaseModel):
    age:int|None=Field(default=None,ge=1,le=120); occupation:str|None=None
    monthly_income:float=Field(default=0,ge=0); monthly_expense:float=Field(default=0,ge=0); savings_goal:float=Field(default=0,ge=0)
    study_hours:float=Field(default=0,ge=0,le=24); assignments_pending:int=Field(default=0,ge=0)
    sleep_hours:float=Field(default=0,ge=0,le=24); exercise_days:int=Field(default=0,ge=0,le=7); screen_hours:float=Field(default=0,ge=0,le=24)
class ProfileOut(ProfileUpdate):
    model_config=ConfigDict(from_attributes=True); id:int; user_id:int; updated_at:datetime
class ActivityCreate(BaseModel): action:str=Field(min_length=1,max_length=120); category:str=Field(default='general',max_length=50); details:str|None=None
class ActivityOut(BaseModel):
    model_config=ConfigDict(from_attributes=True); id:int; action:str; category:str; details:str|None; created_at:datetime
class DashboardOut(BaseModel):
    user:UserOut; profile:ProfileOut; risk_score:int; risk_level:str; alerts:list[str]; financial_health:int; study_health:int; habit_health:int; recent_activity:list[ActivityOut]

class ForecastInput(BaseModel):
    income:float=Field(default=0,ge=0); rent:float=Field(default=0,ge=0); shopping:float=Field(default=0,ge=0); food:float=Field(default=0,ge=0); healthcare:float=Field(default=0,ge=0); taxes:float=Field(default=0,ge=0); installment:float=Field(default=0,ge=0); transport:float=Field(default=0,ge=0); education:float=Field(default=0,ge=0); entertainment:float=Field(default=0,ge=0); other:float=Field(default=0,ge=0); savings:float=Field(default=0,ge=0); study_hours:float=Field(default=0,ge=0,le=24); work_hours:float=Field(default=0,ge=0,le=24); screen_hours:float=Field(default=0,ge=0,le=24); sleep_hours:float=Field(default=0,ge=0,le=24); exercise_days:int=Field(default=0,ge=0,le=7); tasks_completed:int=Field(default=0,ge=0); productivity_score:float=Field(default=0,ge=0,le=100); energy_level:int=Field(default=0,ge=0,le=100); mood:str=Field(default='Neutral',pattern='^(Happy|Calm|Neutral|Stressed|Sad|Anxious)$')
class SimulationInput(ForecastInput): pass
