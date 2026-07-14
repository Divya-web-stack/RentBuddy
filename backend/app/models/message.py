from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from app.db.session import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    room_id = Column(
        Integer,
        ForeignKey("chat_rooms.id"),
        nullable=False,
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    text = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )