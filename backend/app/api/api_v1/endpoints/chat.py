from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from app.api.api_v1.endpoints.hello import _get_current_user

from app.models.user import User

from app.db.session import get_db, SessionLocal
from app.models.chat_room import ChatRoom
from app.models.message import Message

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


class ConnectionManager:

    def __init__(self):
        self.active_connections = {}

    async def connect(self, room_id: int, websocket: WebSocket):
        await websocket.accept()

        if room_id not in self.active_connections:
            self.active_connections[room_id] = []

        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: int, websocket: WebSocket):

        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

            if len(self.active_connections[room_id]) == 0:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: int, message: dict):

        if room_id not in self.active_connections:
            return

        for connection in self.active_connections[room_id]:
            await connection.send_json(message)


manager = ConnectionManager()

@router.get("/myrooms")
def get_my_rooms(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):

    current_user = _get_current_user(db, token)

    rooms = db.query(ChatRoom).filter(
        or_(
            ChatRoom.owner_id == current_user.id,
            ChatRoom.tenant_id == current_user.id,
        )
    ).all()

    return rooms


@router.get("/{room_id}/messages")
def get_messages(
    room_id: int,
    db: Session = Depends(get_db),
):

    room = db.query(ChatRoom).filter(
        ChatRoom.id == room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Chat room not found"
        )

    messages = (
        db.query(Message)
        .filter(Message.room_id == room_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return [
        {
            "id": msg.id,
            "sender_id": msg.sender_id,
            "text": msg.text,
            "created_at": msg.created_at,
        }
        for msg in messages
    ]



@router.websocket("/test")
async def websocket_test(websocket: WebSocket):
    print("Reached test websocket")
    await websocket.accept()
    await websocket.send_text("Connected!")
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Echo: {data}")


@router.websocket("/ws/{room_id}")
async def websocket_chat(
    websocket: WebSocket,
    room_id: int,
):
    print("Reached websocket endpoint")

    await manager.connect(room_id, websocket)

    db = SessionLocal()

    try:

        while True:

            print("Waiting for message...")

            data = await websocket.receive_json()
            print("Received:", data)

            token = data["token"]
            text = data["text"]

            print("Authenticating user...")

            current_user = _get_current_user(db, token)
            print("Authenticated User ID:", current_user.id)

            sender_id = current_user.id

            print("Saving message...")

            message = Message(
                room_id=room_id,
                sender_id=sender_id,
                text=text,
            )

            db.add(message)
            db.commit()
            db.refresh(message)

            print("Saved message ID:", message.id)
            print("Current message:", message.text)

            payload = {
                "id": message.id,
                "room_id": room_id,
                "sender_id": sender_id,
                "text": text,
                "created_at": str(message.created_at),
            }

            print("Broadcasting...")

            await manager.broadcast(room_id, payload)

            print("Done!")

    except WebSocketDisconnect:
        print("Client disconnected")
        manager.disconnect(room_id, websocket)

    except Exception as e:
        print("WEBSOCKET ERROR:", e)

    finally:

        db.close()