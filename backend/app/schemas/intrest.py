from pydantic import BaseModel
from enum import Enum


class InterestStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class InterestResponse(BaseModel):
    id: int
    listing_id: int
    tenant_id: int
    owner_id: int
    status: InterestStatus

    class Config:
        from_attributes = True