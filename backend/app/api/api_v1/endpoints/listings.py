import os
import re

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.models.intrest_request import InterestRequest, InterestStatus

from app.db.session import get_db
from app.models.listing import Listing
from app.models.user import User, UserProfile
from app.schemas.listing import (
    ListingBrowse,
    ListingCreate,
    ListingPublishResponse,
)
from app.services.gemini_service import GeminiService
from app.services.email_service import EmailService


router = APIRouter()

gemini_service = GeminiService()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def _get_current_user(db: Session, token: str) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise credentials_exception
        return user
    except (JWTError, ValueError, TypeError):
        raise credentials_exception


def _normalize_text(value):
    return str(value).strip().lower() if value is not None else ""


def _to_budget_number(value):
    if value is None:
        return None
    try:
        return int(re.sub(r"[^0-9]", "", str(value)))
    except Exception:
        return None


def _build_match_reason(listing: Listing, profile: UserProfile) -> str:
    preferences = profile.preferences or {}
    reasons = []

    if preferences.get("city") and listing.city:
        if _normalize_text(listing.city) == _normalize_text(preferences.get("city")):
            reasons.append("matches your preferred city")

    if preferences.get("area") and listing.area:
        if _normalize_text(listing.area) == _normalize_text(preferences.get("area")):
            reasons.append("matches your preferred locality")

    if preferences.get("propertyType") and listing.property_type:
        if _normalize_text(listing.property_type) == _normalize_text(preferences.get("propertyType")):
            reasons.append("matches your preferred property type")

    if preferences.get("roomType") and listing.room_type:
        if _normalize_text(listing.room_type) == _normalize_text(preferences.get("roomType")):
            reasons.append("matches your room preference")

    if preferences.get("furnishing") and listing.furnishing:
        if _normalize_text(listing.furnishing) == _normalize_text(preferences.get("furnishing")):
            reasons.append("matches your furnishing preference")

    listing_amenities = set(listing.amenities or [])
    pref_amenities = set(preferences.get("amenities") or [])
    overlap = listing_amenities & pref_amenities
    if overlap:
        reasons.append(f"includes your preferred amenities: {', '.join(sorted(overlap))}")

    if preferences.get("budget") and listing.monthly_rent:
        budget = _to_budget_number(preferences.get("budget"))
        rent = _to_budget_number(listing.monthly_rent)
        if budget and rent and rent <= budget:
            reasons.append("fits within your budget")

    if not reasons:
        reasons.append("has a generally compatible setup for your search")

    return "; ".join(reasons[:3])


def _score_listing_against_profile(listing: Listing, profile: UserProfile) -> dict:
    preferences = profile.preferences or {}
    score = 0

    if preferences.get("city") and listing.city:
        if _normalize_text(listing.city) == _normalize_text(preferences.get("city")):
            score += 25

    if preferences.get("area") and listing.area:
        if _normalize_text(listing.area) == _normalize_text(preferences.get("area")):
            score += 15

    if preferences.get("propertyType") and listing.property_type:
        if _normalize_text(listing.property_type) == _normalize_text(preferences.get("propertyType")):
            score += 15

    if preferences.get("roomType") and listing.room_type:
        if _normalize_text(listing.room_type) == _normalize_text(preferences.get("roomType")):
            score += 10

    if preferences.get("furnishing") and listing.furnishing:
        if _normalize_text(listing.furnishing) == _normalize_text(preferences.get("furnishing")):
            score += 10

    listing_amenities = set(listing.amenities or [])
    pref_amenities = set(preferences.get("amenities") or [])
    overlap = len(listing_amenities & pref_amenities)
    score += min(15, overlap * 5)

    budget = _to_budget_number(preferences.get("budget"))
    rent = _to_budget_number(listing.monthly_rent)
    if budget and rent:
        if rent <= budget:
            score += 10
        elif rent <= budget * 1.2:
            score += 5

    return {
        "profile_id": profile.id,
        "full_name": profile.full_name,
        "email": profile.email,
        "score": min(100, score),
        "reason": _build_match_reason(listing, profile),
    }


@router.post("/listings", response_model=ListingPublishResponse)
def create_listing(
    payload: ListingCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):

    current_user = _get_current_user(db, token)

    data = payload.dict()
    listing = Listing(
        created_by=current_user.id,

        listing_type=data.get("listing_type"),
        title=data.get("title"),
        description=data.get("description"),
        property_type=data.get("propertyType"),
        room_type=data.get("roomType"),
        city=(data.get("location") or {}).get("city"),
        area=(data.get("location") or {}).get("area"),
        address=(data.get("location") or {}).get("address"),
        maps_location=(data.get("location") or {}).get("maps_location")
        or (data.get("location") or {}).get("mapsLocation"),
        monthly_rent=(data.get("rent") or {}).get("monthly"),
        security_deposit=(data.get("rent") or {}).get("securityDeposit"),
        maintenance_included=(data.get("rent") or {}).get("maintenanceIncluded"),
        available_from=(data.get("availability") or {}).get("availableFrom"),
        lease_duration=(data.get("availability") or {}).get("leaseDuration"),
        bedrooms=(data.get("roomDetails") or {}).get("bedrooms"),
        bathrooms=(data.get("roomDetails") or {}).get("bathrooms"),
        vacancy=(data.get("roomDetails") or {}).get("vacancy"),
        furnishing=(data.get("roomDetails") or {}).get("furnishing"),
        amenities=data.get("amenities") or [],
        photos=data.get("photos") or [],
        cover_index=data.get("coverIndex") or 0,
        preferred=data.get("preferred") or {},
        tenant_info=data.get("tenantInfo") or {},
    )

    profiles = db.query(UserProfile).all()
    profile_payloads = [
        {
            "id": profile.id,
            "full_name": profile.full_name,
            "email": profile.email,
            "preferences": profile.preferences or {},
        }
        for profile in profiles
    ]

    ai_matches = []
    if gemini_service.is_configured():
        ai_matches = gemini_service.score_matches(
            listing_data={
                "title": listing.title,
                "description": listing.description,
                "city": listing.city,
                "area": listing.area,
                "property_type": listing.property_type,
                "room_type": listing.room_type,
                "monthly_rent": listing.monthly_rent,
                "furnishing": listing.furnishing,
                "amenities": listing.amenities or [],
                "preferred": listing.preferred,
            },
            profiles=profile_payloads,
        )

    fallback_matches = [
        _score_listing_against_profile(listing, profile)
        for profile in profiles
    ]
    fallback_matches = sorted(fallback_matches, key=lambda item: item["score"], reverse=True)

    match_scores = ai_matches or fallback_matches
    listing.match_scores = match_scores

    db.add(listing)
    db.commit()
    db.refresh(listing)
    return {"listing": listing, "match_scores": listing.match_scores}


@router.get("/listings", response_model=list[ListingBrowse])
def list_listings(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    items = db.query(Listing).offset(skip).limit(limit).all()
    return items


@router.post("/listings/match")
def match_listings(payload: dict, db: Session = Depends(get_db)):
    profile_preferences = payload.get("preferences") or {}
    profile = UserProfile(
        id=0,
        full_name="Current Search",
        email=None,
        preferences=profile_preferences,
    )

    listings = db.query(Listing).all()
    match_payloads = []

    if gemini_service.is_configured():
        try:
            for listing in listings:
                listing_data = {
                    "title": listing.title,
                    "description": listing.description,
                    "city": listing.city,
                    "area": listing.area,
                    "property_type": listing.property_type,
                    "room_type": listing.room_type,
                    "monthly_rent": listing.monthly_rent,
                    "furnishing": listing.furnishing,
                    "amenities": listing.amenities or [],
                    "preferred": profile_preferences,
                }

                gemini_matches = gemini_service.score_matches(
                    listing_data=listing_data,
                    profiles=[
                        {
                            "id": 0,
                            "full_name": profile.full_name,
                            "email": profile.email,
                            "preferences": profile_preferences,
                        }
                    ],
                )

                if gemini_matches:
                    gm = gemini_matches[0]
                    match_payloads.append(
                        {
                            "listing": {
                                "id": listing.id,
                                "title": listing.title,
                                "description": listing.description,
                                "city": listing.city,
                                "area": listing.area,
                                "property_type": listing.property_type,
                                "room_type": listing.room_type,
                                "monthly_rent": listing.monthly_rent,
                                "furnishing": listing.furnishing,
                                "amenities": listing.amenities or [],
                                "address": listing.address,
                                "bedrooms": listing.bedrooms,
                                "bathrooms": listing.bathrooms,
                                "vacancy": listing.vacancy,
                                "available_from": listing.available_from,
                                "lease_duration": listing.lease_duration,
                            },
                            "score": int(gm.get("score", 0)),
                            "reason": gm.get("reason")
                            or "AI evaluated this listing as a strong match based on your preferences.",
                        }
                    )
            # If Gemini failed for all listings, fallback below.
        except Exception:
            match_payloads = []

    if not match_payloads:
        for listing in listings:
            score_payload = _score_listing_against_profile(listing, profile)
            match_payloads.append(
                {
                    "listing": {
                        "id": listing.id,
                        "title": listing.title,
                        "description": listing.description,
                        "city": listing.city,
                        "area": listing.area,
                        "property_type": listing.property_type,
                        "room_type": listing.room_type,
                        "monthly_rent": listing.monthly_rent,
                        "furnishing": listing.furnishing,
                        "amenities": listing.amenities or [],
                        "address": listing.address,
                        "bedrooms": listing.bedrooms,
                        "bathrooms": listing.bathrooms,
                        "vacancy": listing.vacancy,
                        "available_from": listing.available_from,
                        "lease_duration": listing.lease_duration,
                    },
                    "score": score_payload["score"],
                    "reason": score_payload["reason"],
                }
            )

    match_payloads.sort(key=lambda item: item["score"], reverse=True)
    return {"matches": match_payloads}


@router.post("/listings/{listing_id}/interest")
def send_interest_email(
    listing_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    current_user = _get_current_user(db, token)

    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # created_by must exist to locate the owner email.
    if not listing.created_by:
        raise HTTPException(
            status_code=400,
            detail=(
                "created_by is NULL for this listing. "
                "Click through: open the listing creation UI again and re-post, "
                "or update the DB so listings.created_by is set to an existing users.id."
            ),
        )


    owner = db.query(User).filter(User.id == listing.created_by).first()
    if not owner or not owner.email:
        raise HTTPException(status_code=400, detail="Owner email not found")


    subject = f"Interest in your listing: {listing.title}"
    body = (
        f"Hi {owner.full_name or 'there'},\n\n"
        f"{current_user.full_name or 'Someone'} is interested in your listing:\n\n"
        f"Title: {listing.title}\n"
        f"Location: {listing.city or ''} {listing.area or ''}\n"
        f"Monthly Rent: {listing.monthly_rent or ''}\n\n"
        f"You can contact the tenant using their email: {current_user.email}\n\n"
        f"— RentBuddy"
    )

    # Save the interest request
    interest = InterestRequest(
        listing_id=listing.id,
        tenant_id=current_user.id,
        owner_id=owner.id,
        status=InterestStatus.PENDING,
    )

    db.add(interest)
    db.commit()
    db.refresh(interest)

    # Generate accept link
    accept_link = f"http://localhost:8000/api/v1/interests/accept/{interest.id}"

    # Email subject
    subject = f"Interest in your listing: {listing.title}"

    # HTML email
    body = f"""
    <h2>New Interest Received</h2>

    <p><strong>{current_user.full_name}</strong> is interested in your listing.</p>

    <p>
    <b>Listing:</b> {listing.title}<br>
    <b>Location:</b> {listing.city or ''} {listing.area or ''}<br>
    <b>Monthly Rent:</b> ₹{listing.monthly_rent or ''}
    </p>

    <p>Click below to accept the request:</p>

    <a href="{accept_link}"
    style="
    display:inline-block;
    padding:12px 20px;
    background:#16a34a;
    color:white;
    text-decoration:none;
    border-radius:6px;
    font-weight:bold;">
    Accept Request
    </a>

    <p>RentBuddy</p>
    """

    try:
        EmailService.send_email(
            to_email=owner.email,
            subject=subject,
            body=body
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send interest email: {str(e)}"
        )

    return {
        "message": "Interest request sent successfully",
        "interest_id": interest.id,
        "status": interest.status
    }