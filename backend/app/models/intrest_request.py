from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class InterestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class InterestRequest(Base):
    __tablename__ = "interest_requests"

    id = Column(Integer, primary_key=True)

    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)

    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    status = Column(
        Enum(InterestStatus),
        default=InterestStatus.PENDING,
        nullable=False,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())