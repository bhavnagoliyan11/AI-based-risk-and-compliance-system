from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User,Profile,Activity
from ..schemas import RegisterRequest,LoginRequest,UserOut
from ..auth import hash_password,verify_password,create_token,get_current_user
router=APIRouter()
@router.post('/register',status_code=201)
def register(data:RegisterRequest,db:Session=Depends(get_db)):
    email=data.email.lower().strip()
    if db.query(User).filter(User.email==email).first(): raise HTTPException(409,'An account with this email already exists')
    user=User(full_name=data.full_name.strip(),email=email,password_hash=hash_password(data.password)); db.add(user); db.flush()
    db.add(Profile(user_id=user.id)); db.add(Activity(user_id=user.id,action='Account created',category='authentication',details='New RiskIntel profile created')); db.commit(); db.refresh(user)
    return {'message':'Account created successfully','access_token':create_token(user.id),'token_type':'bearer','user':UserOut.model_validate(user)}
@router.post('/login')
def login(data:LoginRequest,db:Session=Depends(get_db)):
    user=db.query(User).filter(User.email==data.email.lower().strip()).first()
    if not user or not verify_password(data.password,user.password_hash): raise HTTPException(401,'Invalid email or password')
    db.add(Activity(user_id=user.id,action='User logged in',category='authentication',details='Successful login')); db.commit()
    return {'message':'Login successful','access_token':create_token(user.id),'token_type':'bearer','user':UserOut.model_validate(user)}
@router.get('/me',response_model=UserOut)
def me(user=Depends(get_current_user)): return user
