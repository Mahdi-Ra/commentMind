import logging
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from app.core.config import settings

logger = logging.getLogger(__name__)


def smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)


def _send_email(email: str, subject: str, body: str) -> bool:
    if not smtp_configured():
        logger.warning("Transactional email requested for %s, but SMTP is not configured. Subject: %s", email, subject)
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = formataddr((settings.SMTP_FROM_NAME, settings.SMTP_FROM_EMAIL))
    message["To"] = email
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            if settings.SMTP_USERNAME:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
        return True
    except Exception:
        logger.exception("Failed to send transactional email to %s", email)
        return False


def send_password_reset_email(email: str, reset_url: str) -> bool:
    return _send_email(
        email,
        "Reset your CommentMind password",
        "Use this link to reset your CommentMind password:\n\n"
        f"{reset_url}\n\n"
        "This link expires in 30 minutes. If you did not request it, you can ignore this email.",
    )


def send_verification_email(email: str, verification_url: str) -> bool:
    return _send_email(
        email,
        "Verify your CommentMind email address",
        "Welcome to CommentMind. Verify your email address to secure your account:\n\n"
        f"{verification_url}\n\n"
        "This link expires in 24 hours. If you did not create a CommentMind account, you can ignore this email.",
    )
