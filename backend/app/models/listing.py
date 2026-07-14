from sqlalchemy import Column, Integer, String, Enum, Float, JSON, ForeignKey, Date
from app.db.session import Base
import enum

class ListingTypeEnum(str, enum.Enum):
    TENANT = "TENANT"
    OWNER = "OWNER"
    ADMIN = "ADMIN"

class Listing(Base):
    __tablename__ = 'listings'
    id = Column(Integer, primary_key=True, index=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    listing_type = Column(Enum(ListingTypeEnum), nullable=False, default=ListingTypeEnum.OWNER)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    monthly_rent = Column(String, nullable=True)
    security_deposit = Column(String, nullable=True)
    maintenance_included = Column(String, nullable=True)

    city = Column(String, nullable=True)
    area = Column(String, nullable=True)
    address = Column(String, nullable=True)
    maps_location = Column(String, nullable=True)

    available_from = Column(String, nullable=True)
    lease_duration = Column(String, nullable=True)

    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    vacancy = Column(Integer, nullable=True)
    furnishing = Column(String, nullable=True)

    property_type = Column(String, nullable=True)
    room_type = Column(String, nullable=True)

    amenities = Column(JSON, nullable=True)
    photos = Column(JSON, nullable=True)
    cover_index = Column(Integer, nullable=True)

    preferred = Column(JSON, nullable=True)
    tenant_info = Column(JSON, nullable=True)
    match_scores = Column(JSON, nullable=True)
