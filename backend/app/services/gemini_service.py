import os
import json
from typing import Any, Dict, List
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

# Support both env var names:
# - GEMINI_API_KEY (older)
# - GOOGLE_GEMINI_API_KEY (current in backend/.env)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GEMINI_API_KEY")


class GeminiService:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or GEMINI_API_KEY

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def score_matches(self, listing_data: Dict[str, Any], profiles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not self.is_configured() or not profiles:
            return []

        try:
            import requests
        except ImportError:
            return []

        prompt = self._build_prompt(listing_data, profiles)
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        response = requests.post(
            url,
            params={"key": self.api_key},
            json=payload,
            timeout=20,
        )
        response.raise_for_status()
        result = response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        return self._parse_response(text)

    def _build_prompt(self, listing_data: Dict[str, Any], profiles: List[Dict[str, Any]]) -> str:
        return f"""
You are an AI matching assistant for a rental platform.
Score how well each saved profile matches the posted listing.
Return ONLY valid JSON as an array of objects with keys: profile_id, full_name, email, score, reason.
The listing data is:
{json.dumps(listing_data, indent=2)}

The profiles are:
{json.dumps(profiles, indent=2)}

Rules:
- score must be an integer from 0 to 100.
- reason should be a short explanation.
- Prefer profiles that match location, budget, property type, room type, furnishing, and amenities.
"""

    def _parse_response(self, text: str) -> List[Dict[str, Any]]:
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass

        try:
            start = text.find("[")
            end = text.rfind("]")
            if start != -1 and end != -1 and end > start:
                return json.loads(text[start:end + 1])
        except Exception:
            return []

        return []
