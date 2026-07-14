from pydantic import BaseModel, EmailStr
from typing import Optional, Any, Dict
from enum import Enum


class RoleEnum(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    role: RoleEnum

    class Config:
        from_attributes = True   # Pydantic v2
        # orm_mode = True         # Use this instead if using Pydantic v1


class BrowsePreferences(BaseModel):
    city: Optional[str] = None
    area: Optional[str] = None
    propertyType: Optional[str] = None
    roomType: Optional[str] = None
    budget: Optional[str] = None
    moveInDate: Optional[str] = None
    furnishing: Optional[str] = None
    amenities: Optional[list[str]] = []


class UserProfileCreate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    preferences: Optional[Dict[str, Any]] = None