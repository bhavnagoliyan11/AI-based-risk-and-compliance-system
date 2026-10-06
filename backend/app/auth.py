import os
import base64
import hashlib
import hmac
import secrets
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from .database import get_db
from .models import User

load_dotenv()
SECRET = os.getenv("JWT_SECRET", "riskintel-demo-secret-change-me-32-bytes-long")
ALGORITHM = "HS256"
ITERATIONS = 310_000
bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return f"pbkdf2_sha256${ITERATIONS}${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"

def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, iterations, salt_b64, digest_b64 = stored.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(salt_b64.encode())
        expected = base64.urlsafe_b64decode(digest_b64.encode())
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(iterations))
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False

def create_token(uid: int):
    return jwt.encode({"sub": str(uid), "exp": datetime.now(timezone.utc) + timedelta(hours=8)}, SECRET, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db=Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        uid = int(jwt.decode(credentials.credentials, SECRET, algorithms=[ALGORITHM]).get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.get(User, uid)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
