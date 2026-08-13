import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)


def send_password_reset_email(email: str, reset_url: str) -> bool:
    if not smtp_configured():
        logger.warning("Password reset requested for %s. Reset URL: %s", email, reset_url)
        return False

    message = EmailMessage()
    message["Subject"] = "Reset your CommentMind AI password"
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = email
    message.set_content(
        "Use this link to reset your CommentMind AI password:\n\n"
        f"{reset_url}\n\n"
        "This link expires in 30 minutes. If you did not request it, you can ignore this email."
    )

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            if settings.SMTP_USERNAME:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
        return True
    except Exception:
        logger.exception("Failed to send password reset email to %s", email)
        return False
