from pydantic import BaseModel
from typing import Optional, List, Any
from enum import Enum

class ListingTypeEnum(str, Enum):
    TENANT = "TENANT"
    OWNER = "OWNER"
    ADMIN = "ADMIN"

class Location(BaseModel):
    city: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    maps_location: Optional[str] = None

class RentInfo(BaseModel):
    monthly: Optional[str] = None
    securityDeposit: Optional[str] = None
    maintenanceIncluded: Optional[bool] = None

class RoomDetails(BaseModel):
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    vacancy: Optional[int] = None
    furnishing: Optional[str] = None

class ListingCreate(BaseModel):
    listing_type: ListingTypeEnum
    title: str
    description: Optional[str] = None
    propertyType: Optional[str] = None
    roomType: Optional[str] = None
    location: Optional[Location] = None
    rent: Optional[RentInfo] = None
    availability: Optional[dict] = None
    roomDetails: Optional[RoomDetails] = None
    amenities: Optional[List[str]] = []
    preferred: Optional[dict] = None
    tenantInfo: Optional[dict] = None
    photos: Optional[List[Any]] = []
    coverIndex: Optional[int] = None

class ListingRead(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    listing_type: ListingTypeEnum

    class Config:
        from_attributes = True


class ListingPublishResponse(BaseModel):
    listing: ListingRead
    match_scores: Optional[List[dict]] = []


class ListingBrowse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    listing_type: ListingTypeEnum
    property_type: Optional[str] = None
    room_type: Optional[str] = None
    location: Optional[Location] = None
    rent: Optional[RentInfo] = None
    availability: Optional[dict] = None
    roomDetails: Optional[RoomDetails] = None
    amenities: Optional[List[str]] = []
    preferred: Optional[dict] = None
    tenantInfo: Optional[dict] = None
    photos: Optional[List[Any]] = []
    coverIndex: Optional[int] = None

    class Config:
        from_attributes = True
