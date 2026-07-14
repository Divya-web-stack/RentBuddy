import hashlib
import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import get_db, Base, engine
from app.models.user import User, UserProfile
from app.models.listing import Listing
from app.schemas.user import UserProfileCreate, UserCreate
from app.models.intrest_request import InterestRequest   
from app.models.chat_room import ChatRoom           

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))


def _create_access_token(*, user_id: int, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "email": email, "exp": expire}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def _get_current_user(db: Session, token: str) -> User:

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = int(payload.get("sub"))

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            raise Exception()

        return user

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

def initialize_db() -> None:
    try:
        from app.models.user import User, UserProfile
        from app.models.listing import Listing
        from app.models.intrest_request import InterestRequest
        from app.models.chat_room import ChatRoom
        from app.models.message import Message

        Base.metadata.create_all(bind=engine)

    except SQLAlchemyError as exc:
        print(f"Database initialization skipped: {exc}")

initialize_db()


@router.get("/hello")
def read_hello():
    return {"message": "Welcome to Rent & Flatmate Finder API"}


@router.post("/register", status_code=201)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    normalized_email = str(payload.email).lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hashlib.sha256(payload.password.encode("utf-8")).hexdigest()
    user = User(
        email=normalized_email,
        hashed_password=hashed_password,
        full_name=payload.full_name,
    )
    db.add(user)
    db.flush()

    profile = UserProfile(
        user_id=user.id,
        full_name=payload.full_name,
        email=normalized_email,
        preferences={},
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    db.refresh(profile)

    token = _create_access_token(user_id=user.id, email=user.email)

    return {
        "message": "User registered successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
        },
        "profile": {
            "id": profile.id,
            "email": profile.email,
            "full_name": profile.full_name,
            "preferences": profile.preferences,
        },
    }


@router.post("/login")
def login_user(payload: UserCreate, db: Session = Depends(get_db)):
    normalized_email = str(payload.email).lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    hashed_password = hashlib.sha256(payload.password.encode("utf-8")).hexdigest()
    if hashed_password != user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _create_access_token(user_id=user.id, email=user.email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
        },
    }


@router.get("/me")
def read_me(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    user = _get_current_user(db, token)
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
        }
    }


@router.post("/profiles", status_code=201)
def create_or_update_profile(
    payload: UserProfileCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Save tenant preferences for the currently authenticated user."""
    user = _get_current_user(db, token)

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

    if profile is None:
        profile = UserProfile(
            user_id=user.id,
            full_name=payload.full_name or user.full_name,
            email=user.email,
            preferences=payload.preferences or {},
        )
        db.add(profile)
    else:
        # keep existing fields if payload doesn't provide them
        profile.full_name = payload.full_name or profile.full_name or user.full_name
        profile.preferences = payload.preferences or profile.preferences

    db.commit()
    db.refresh(profile)
    return {
        "message": "Profile saved successfully",
        "profile": {
            "id": profile.id,
            "full_name": profile.full_name,
            "email": profile.email,
            "preferences": profile.preferences,
        }
    }






