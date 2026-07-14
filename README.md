# RentBuddy

## Overview
RentBuddy is an AI-powered tenant/owner rental matching platform that helps tenants discover suitable rental properties and assists owners in finding compatible tenants. The application combines AI compatibility scoring, real-time chat, and automated email notifications to streamline the rental process.

---

# Screenshots

## Home Page

<p align="center">
  <img src="screenshots/home-page.png" alt="RentBuddy Home Page" width="900"/>
</p>

The landing page allows users to browse rental listings or list their own property with a clean and intuitive interface.

---

## Email Notification

<p align="center">
  <img src="screenshots/email-notification.png" alt="Interest Request Email" width="900"/>
</p>

When a tenant expresses interest in a listing, the owner automatically receives an email notification with the listing details and an **Accept Request** button to initiate communication.

---

## Features

### AI Compatibility Scoring

- AI evaluates tenant and listing compatibility.
- Generates compatibility score and explanation.
- Includes fallback behavior when the LLM is unavailable.

### Real-Time Chat

- WebSocket-based messaging.
- Persistent chat history.
- Instant message delivery.
- Secure chat rooms between owners and tenants.

### Email Notifications

- Automatic interest request emails.
- Owner notification workflow.
- Accept request directly from email.
- Backend integration using Brevo SMTP/API.

---

## Architecture

### Frontend

- React
- Material UI
- React Router
- Axios

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL / SQLite
- WebSockets
- JWT Authentication

---

## Project Structure

```
RentBuddy
│
├── backend
│   ├── app
│   ├── models
│   ├── services
│   └── api
│
├── frontend
│   ├── src
│   ├── pages
│   ├── components
│   └── styles
│
├── screenshots
│   ├── home-page.png
│   └── email-notification.png
│
└── README.md
```

---

## Setup Guide

### 1. Clone Repository

```bash
git clone <repository-url>
cd RentBuddy
```

### 2. Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Run backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 3. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## Environment Variables

Copy `.env.example` into `.env`.

```env
JWT_SECRET_KEY=dev-secret-change-me
JWT_ALGORITHM=HS256

DATABASE_URL=sqlite:///./test.db

GEMINI_API_KEY=your_api_key

BREVO_API_KEY=your_api_key
BREVO_FROM_EMAIL=your_email
```

---

## API Documentation

Base URL

```
http://localhost:8000/api/v1
```

### Get Chat Messages

```
GET /chat/{roomId}/messages
```

### WebSocket

```
ws://localhost:8000/api/v1/chat/ws/{roomId}
```

Send

```json
{
  "token": "<access_token>",
  "text": "Hello"
}
```

Receive

```json
{
  "id": 99,
  "room_id": 1,
  "sender_id": 10,
  "text": "Hello",
  "created_at": "2026-01-01T10:00:00"
}
```

---

## AI Compatibility Scoring

The backend uses an LLM (Gemini) to calculate compatibility between a tenant profile and a rental listing.

The AI considers:

- Budget compatibility
- Lifestyle preferences
- Amenities
- Work-from-home suitability
- Communication preferences

The model returns:

- Compatibility Score (0–100)
- Human-readable explanation

If the LLM is unavailable, the backend falls back to heuristic-based scoring.

---

## Notifications

Email integration is implemented in:

```
backend/app/services/email_service.py
```

Supported notification flows:

- Interest request emails
- Listing notifications
- Owner acceptance workflow

---

## Technologies Used

### Frontend

- React
- Material UI
- Axios

### Backend

- FastAPI
- SQLAlchemy
- WebSockets
- JWT Authentication
- PostgreSQL / SQLite

### AI

- Gemini API
- Prompt Engineering
- Heuristic Fallback Scoring

### Email

- Brevo SMTP/API

---

## License

MIT