from datetime import datetime,timezone
from sqlalchemy import String,Integer,Float,DateTime,ForeignKey,Text
from sqlalchemy.orm import Mapped,mapped_column,relationship
from .database import Base
def utcnow(): return datetime.now(timezone.utc)
class User(Base):
    __tablename__='users'
    id:Mapped[int]=mapped_column(Integer,primary_key=True,index=True)
    full_name:Mapped[str]=mapped_column(String(120))
    email:Mapped[str]=mapped_column(String(255),unique=True,index=True)
    password_hash:Mapped[str]=mapped_column(String(500))
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow)
    profile:Mapped['Profile']=relationship(back_populates='user',uselist=False,cascade='all, delete-orphan')
    activities:Mapped[list['Activity']]=relationship(back_populates='user',cascade='all, delete-orphan')
class Profile(Base):
    __tablename__='profiles'
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    user_id:Mapped[int]=mapped_column(ForeignKey('users.id'),unique=True,index=True)
    age:Mapped[int|None]=mapped_column(Integer,nullable=True)
    occupation:Mapped[str|None]=mapped_column(String(120),nullable=True)
    monthly_income:Mapped[float]=mapped_column(Float,default=0)
    monthly_expense:Mapped[float]=mapped_column(Float,default=0)
    savings_goal:Mapped[float]=mapped_column(Float,default=0)
    study_hours:Mapped[float]=mapped_column(Float,default=0)
    assignments_pending:Mapped[int]=mapped_column(Integer,default=0)
    sleep_hours:Mapped[float]=mapped_column(Float,default=0)
    exercise_days:Mapped[int]=mapped_column(Integer,default=0)
    screen_hours:Mapped[float]=mapped_column(Float,default=0)
    updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow,onupdate=utcnow)
    user:Mapped['User']=relationship(back_populates='profile')
class Activity(Base):
    __tablename__='activities'
    id:Mapped[int]=mapped_column(Integer,primary_key=True,index=True)
    user_id:Mapped[int]=mapped_column(ForeignKey('users.id'),index=True)
    action:Mapped[str]=mapped_column(String(120))
    category:Mapped[str]=mapped_column(String(50),default='system')
    details:Mapped[str|None]=mapped_column(Text,nullable=True)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow)
    user:Mapped['User']=relationship(back_populates='activities')

class ForecastSnapshot(Base):
    __tablename__='forecast_snapshots'
    id:Mapped[int]=mapped_column(Integer,primary_key=True,index=True)
    user_id:Mapped[int]=mapped_column(ForeignKey('users.id'),index=True)
    income:Mapped[float]=mapped_column(Float,default=0)
    rent:Mapped[float]=mapped_column(Float,default=0)
    shopping:Mapped[float]=mapped_column(Float,default=0)
    food:Mapped[float]=mapped_column(Float,default=0)
    healthcare:Mapped[float]=mapped_column(Float,default=0)
    taxes:Mapped[float]=mapped_column(Float,default=0)
    installment:Mapped[float]=mapped_column(Float,default=0)
    transport:Mapped[float]=mapped_column(Float,default=0)
    education:Mapped[float]=mapped_column(Float,default=0)
    entertainment:Mapped[float]=mapped_column(Float,default=0)
    other:Mapped[float]=mapped_column(Float,default=0)
    savings:Mapped[float]=mapped_column(Float,default=0)
    study_hours:Mapped[float]=mapped_column(Float,default=0)
    work_hours:Mapped[float]=mapped_column(Float,default=0)
    screen_hours:Mapped[float]=mapped_column(Float,default=0)
    sleep_hours:Mapped[float]=mapped_column(Float,default=0)
    exercise_days:Mapped[int]=mapped_column(Integer,default=0)
    tasks_completed:Mapped[int]=mapped_column(Integer,default=0)
    productivity_score:Mapped[float]=mapped_column(Float,default=0)
    energy_level:Mapped[int]=mapped_column(Integer,default=0)
    mood:Mapped[str]=mapped_column(String(30),default='Neutral')
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow)
