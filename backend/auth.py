# auth.py

from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from config import settings
import models
from database import get_db

# --- THREE SEPARATE SCHEMES FOR EACH LOGIN ROUTE ---
oauth2_scheme_candidate = OAuth2PasswordBearer(tokenUrl="/candidates/login")
oauth2_scheme_hr = OAuth2PasswordBearer(tokenUrl="/hr/login")
oauth2_scheme_admin = OAuth2PasswordBearer(tokenUrl="/api/admin/login")


SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def create_access_token(data: dict):
    """
    Generates a new JWT access token.
    The 'data' dict MUST include "sub" (user_id) and "role" (e.g., "candidate").
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme_candidate), db: Session = Depends(get_db)):
    """
    A FastAPI dependency to get the current authenticated CANDIDATE.
    This will be used to protect candidate-only routes.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # --- FIX: Changed type hint to allow None ---
        user_id: str | None = payload.get("sub")
        role: str | None = payload.get("role")
        
        if user_id is None or role != "candidate":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # We can safely cast to int here because the check above passed
    user = db.query(models.Candidates).filter(models.Candidates.candid == int(user_id)).first()
    
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended."
        )
        
    return user



def get_current_hr(token: str = Depends(oauth2_scheme_hr), db: Session = Depends(get_db)):
    """
    A FastAPI dependency to get the current authenticated HR user.
    This will be used to protect HR-only routes.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate HR credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        
        user_id: str | None = payload.get("sub")
        role: str | None = payload.get("role")
        
        if user_id is None or role != "hr":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.Hr).filter(models.Hr.hr_id == int(user_id)).first()
    
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your HR account has been suspended by an admin."
        )
        
    return user


def get_current_admin(token: str = Depends(oauth2_scheme_admin), db: Session = Depends(get_db)):
    """
    A FastAPI dependency to get the current authenticated ADMIN.
    This will be used to protect Admin-only routes.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate Admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        
        admin_id: str | None = payload.get("sub")
        role: str | None = payload.get("role")
        
        if admin_id is None or role != "admin":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    admin = db.query(models.Admin).filter(models.Admin.adminid == int(admin_id)).first()
    
    if admin is None:
        raise credentials_exception
        
    return admin