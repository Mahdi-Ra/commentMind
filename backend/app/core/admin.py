from app.core.config import settings


def is_platform_admin_email(email: str | None) -> bool:
    """Return whether an email is configured as a platform administrator."""
    configured_emails = settings.ADMIN_EMAILS or settings.PAYMENT_ADMIN_EMAILS
    emails = {
        value.strip().lower()
        for value in configured_emails.split(",")
        if value.strip()
    }
    return bool(email and email.lower() in emails)
