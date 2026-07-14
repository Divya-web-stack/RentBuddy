from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.endpoints import hello, listings
from app.api.api_v1.endpoints import chat
from app.api.api_v1.endpoints import intrests





# Ensure .env is loaded for both email and other services.
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

# Debug: confirm env vars are loaded inside the running backend process.
print("[ENV CHECK] BREVO_API_KEY set:", bool(os.getenv("BREVO_API_KEY")))
print(
    "[ENV CHECK] BREVO_FROM_EMAIL set:",
    bool(os.getenv("BREVO_FROM_EMAIL") or os.getenv("SMTP_FROM_EMAIL")),
)

app = FastAPI(title="RentBuddy API", version="1.0.0")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hello.router, prefix="/api/v1")
app.include_router(listings.router, prefix="/api/v1")
app.include_router(listings.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(intrests.router, prefix="/api/v1")

