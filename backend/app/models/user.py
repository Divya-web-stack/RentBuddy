from sqlalchemy import Column, Integer, String, Enum, JSON, ForeignKey
from app.db.session import Base
import enum


class RoleEnum(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    full_name = Column(String, nullable=False)

    role = Column(
        Enum(RoleEnum),
        nullable=False,
        default=RoleEnum.USER
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    preferences = Column(JSON, nullable=True)

    # Ensure one profile per user (helps our /profiles upsert logic)
    # NOTE: SQLite/Postgres compatible; if you already have rows without user_id,
    # you may need to clean them or re-create listings.

