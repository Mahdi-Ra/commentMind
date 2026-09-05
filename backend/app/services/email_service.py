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


def send_welcome_email(email: str) -> bool:
    return _send_email(
        email,
        "Welcome to CommentMind",
        "Welcome to CommentMind.\n\n"
        "Your account is ready. Add your first site, connect the WordPress plugin or JavaScript widget, "
        "and add knowledge so CommentMind can reply accurately in your brand voice.\n\n"
        "Open your dashboard:\n"
        f"{settings.FRONTEND_BASE_URL}/dashboard\n\n"
        "Need a hand? Reply to this email or contact " + settings.SUPPORT_EMAIL + ".",
    )


def send_trial_started_email(email: str, plan: str, ends_at: str) -> bool:
    return _send_email(
        email,
        f"Your CommentMind {plan.title()} trial has started",
        f"Your 7-day {plan.title()} trial is active until {ends_at}.\n\n"
        "Connect a site, add your knowledge base, and test CommentMind with a real comment before the trial ends.\n\n"
        f"Dashboard: {settings.FRONTEND_BASE_URL}/dashboard",
    )


def send_trial_ending_email(email: str, plan: str, ends_at: str) -> bool:
    return _send_email(
        email,
        f"Your CommentMind {plan.title()} trial ends soon",
        f"Your {plan.title()} trial ends on {ends_at}. Upgrade to keep your paid-plan limits and automated workflow active.\n\n"
        f"Review plans: {settings.FRONTEND_BASE_URL}/pricing",
    )


def send_plan_activated_email(email: str, plan: str, ends_at: str) -> bool:
    return _send_email(
        email,
        f"Your CommentMind {plan.title()} plan is active",
        f"Your payment was confirmed and your {plan.title()} plan is active until {ends_at}.\n\n"
        f"Manage your account: {settings.FRONTEND_BASE_URL}/dashboard/account",
    )


def send_plan_renewal_reminder_email(email: str, plan: str, ends_at: str) -> bool:
    return _send_email(
        email,
        f"Your CommentMind {plan.title()} plan renews soon",
        f"Your {plan.title()} plan ends on {ends_at}. Submit a renewal payment before then to keep uninterrupted access.\n\n"
        f"Renew your plan: {settings.FRONTEND_BASE_URL}/pricing",
    )


def send_plan_expired_email(email: str) -> bool:
    return _send_email(
        email,
        "Your CommentMind plan has moved to Free",
        "Your paid CommentMind plan has ended and your account is now on the Free plan. "
        "Your sites and data remain available; paid limits are no longer active.\n\n"
        f"Choose a plan: {settings.FRONTEND_BASE_URL}/pricing",
    )
