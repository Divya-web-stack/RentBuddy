from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime
from sqlalchemy.sql import func
from app.db.session import Base
import enum

class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    id = Column(Integer, primary_key=True)

    listing_id = Column(Integer, ForeignKey("listings.id"))

    owner_id = Column(Integer, ForeignKey("users.id"))

    tenant_id = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime(timezone=True), server_default=func.now())