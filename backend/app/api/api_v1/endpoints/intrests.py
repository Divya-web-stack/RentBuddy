from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.intrest_request import InterestRequest, InterestStatus
from app.models.chat_room import ChatRoom

router = APIRouter(prefix="/interests", tags=["Interests"])


@router.get("/accept/{interest_id}")
def accept_interest(
    interest_id: int,
    db: Session = Depends(get_db)
):
    # Find interest request
    interest = (
        db.query(InterestRequest)
        .filter(InterestRequest.id == interest_id)
        .first()
    )

    if not interest:
        raise HTTPException(status_code=404, detail="Interest request not found")

    if interest.status == InterestStatus.ACCEPTED:
        raise HTTPException(status_code=400, detail="Request already accepted")

    # Update status
    interest.status = InterestStatus.ACCEPTED

    # Check if chat room already exists
    room = (
        db.query(ChatRoom)
        .filter(
            ChatRoom.listing_id == interest.listing_id,
            ChatRoom.owner_id == interest.owner_id,
            ChatRoom.tenant_id == interest.tenant_id,
        )
        .first()
    )

    # Create chat room if needed
    if not room:
        room = ChatRoom(
            listing_id=interest.listing_id,
            owner_id=interest.owner_id,
            tenant_id=interest.tenant_id,
        )
        db.add(room)
        db.flush()   # gives room.id before commit

    db.commit()
    db.refresh(room)

    # Redirect owner to frontend chat page
    return RedirectResponse(
        url=f"http://localhost:3000/chat/{room.id}",
        status_code=302
    )