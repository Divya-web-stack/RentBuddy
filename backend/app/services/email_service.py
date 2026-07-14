import os
import requests


class EmailService:
    @staticmethod
    def send_email(*, to_email: str, subject: str, body: str) -> None:
        api_key = os.getenv("BREVO_API_KEY")
        from_email = os.getenv("BREVO_FROM_EMAIL")

         # Debug prints
        print("BREVO_API_KEY:", repr(api_key))
        print("BREVO_FROM_EMAIL:", repr(from_email))


        if not api_key:
            raise RuntimeError(
                "BREVO_API_KEY is missing. Set it in backend/.env."
            )

        if not from_email:
            raise RuntimeError(
                "BREVO_FROM_EMAIL is missing. Set it in backend/.env."
            )

        url = "https://api.brevo.com/v3/smtp/email"

        payload = {
            "sender": {
                "name": "RentBuddy",
                "email": from_email,
            },
            "to": [
                {
                    "email": to_email,
                }
            ],
            "subject": subject,
            "htmlContent": body,
        }

        headers = {
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json",
        }

        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=20,
        )

        if response.status_code not in (200, 201):
            raise RuntimeError(
                f"Brevo email failed ({response.status_code}): {response.text}"
            )