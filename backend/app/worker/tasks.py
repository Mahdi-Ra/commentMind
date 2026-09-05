"""
Celery tasks for background processing.

Main task: process_comment_async
  - Called by the widget endpoint immediately after saving a "pending" comment
  - Runs the full AI pipeline (embedding lookup → GPT analysis → status update)
  - Updates the comment row in-place when done
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from celery import Task

from app.worker.celery_app import celery_app

logger = logging.getLogger(__name__)


class _AsyncTask(Task):
    """Base task that runs async functions inside a fresh event loop."""

    def run_async(self, coro):
        return asyncio.run(coro)


@celery_app.task(
    bind=True,
    base=_AsyncTask,
    name="app.worker.tasks.process_comment_async",
    max_retries=3,
    default_retry_delay=15,
)
def process_comment_async(self, comment_id: str, site_id: str) -> dict:
    """
    Background task: run AI analysis on a saved comment and update its status.

    Args:
        comment_id: UUID of the Comment row (already saved as "pending")
        site_id:    UUID of the owning Site row

    Returns:
        dict with final status and ai_reply (for result inspection / webhooks)
    """
    return self.run_async(_run(self, comment_id, site_id))


@celery_app.task(base=_AsyncTask, name="app.worker.tasks.run_account_lifecycle")
def run_account_lifecycle() -> dict:
    """Send lifecycle emails and downgrade expired subscriptions every six hours."""
    return asyncio.run(_run_account_lifecycle())


async def _run_account_lifecycle() -> dict:
    from sqlalchemy import select
    from app.core.config import settings
    from app.core.database import AsyncSessionLocal
    from app.models.user import User
    from app.services.billing_service import downgrade_expired_plan
    from app.services.email_service import (
        send_plan_expired_email,
        send_plan_renewal_reminder_email,
        send_trial_ending_email,
        send_welcome_email,
    )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    trial_reminder_cutoff = now + timedelta(days=settings.TRIAL_REMINDER_DAYS)
    plan_reminder_cutoff = now + timedelta(days=settings.PLAN_RENEWAL_REMINDER_DAYS)
    sent = {"welcome": 0, "trial_reminder": 0, "plan_reminder": 0, "expired": 0}

    async with AsyncSessionLocal() as db:
        users = list((await db.execute(select(User).where(User.is_active.is_(True)))).scalars().all())
        for user in users:
            if user.is_verified and not user.welcome_email_sent_at and send_welcome_email(user.email):
                user.welcome_email_sent_at = now
                sent["welcome"] += 1

            if user.trial_plan and user.trial_ends_at:
                if user.trial_ends_at <= now:
                    user.plan = "free"
                    user.trial_plan = None
                    user.trial_ends_at = None
                    user.trial_reminder_sent_at = None
                elif user.trial_ends_at <= trial_reminder_cutoff and not user.trial_reminder_sent_at:
                    if send_trial_ending_email(user.email, user.trial_plan, user.trial_ends_at.date().isoformat()):
                        user.trial_reminder_sent_at = now
                        sent["trial_reminder"] += 1

            if user.plan != "free" and not user.trial_plan and user.plan_ends_at:
                if user.plan_ends_at <= now:
                    if downgrade_expired_plan(user):
                        send_plan_expired_email(user.email)
                        sent["expired"] += 1
                elif user.plan_ends_at <= plan_reminder_cutoff and not user.plan_reminder_sent_at:
                    if send_plan_renewal_reminder_email(user.email, user.plan, user.plan_ends_at.date().isoformat()):
                        user.plan_reminder_sent_at = now
                        sent["plan_reminder"] += 1
        await db.commit()
    logger.info("Account lifecycle completed: %s", sent)
    return sent


async def _run(task, comment_id: str, site_id: str) -> dict:
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.comment import Comment
    from app.models.site import Site
    from app.models.knowledge import KnowledgeChunk
    from app.services.ai_service import analyze_comment
    from app.services.comment_service import determine_comment_status
    from app.services.embedding_service import get_relevant_chunks
    from app.services.search_console_service import get_page_query_context

    async with AsyncSessionLocal() as db:
        try:
            # Load comment
            result = await db.execute(select(Comment).where(Comment.id == comment_id))
            comment = result.scalar_one_or_none()
            if not comment:
                logger.error("Comment %s not found", comment_id)
                return {"error": "comment_not_found"}

            # Load site
            result = await db.execute(select(Site).where(Site.id == site_id))
            site = result.scalar_one_or_none()
            if not site:
                logger.error("Site %s not found", site_id)
                return {"error": "site_not_found"}

            # Get relevant knowledge via vector search
            knowledge_chunks = await get_relevant_chunks(
                db, site_id, comment.content, limit=8
            )
            knowledge_context = "\n---\n".join(knowledge_chunks)
            search_context = await get_page_query_context(db, site_id, comment.post_url)

            # Run AI analysis
            analysis = await analyze_comment(
                content=comment.content,
                site_name=site.name,
                tone=site.tone,
                language=site.language,
                knowledge_context=knowledge_context,
                page_context=search_context,
                custom_instructions=site.custom_instructions or "",
            )

            # Determine final status
            status, spam_score = determine_comment_status(site, analysis)

            # Update comment in DB
            comment.status = status
            comment.intent = analysis.get("intent")
            comment.spam_score = spam_score
            comment.sentiment = analysis.get("sentiment")
            comment.ai_reply = analysis.get("reply")
            comment.reply_sent = status == "replied"
            now = datetime.now(timezone.utc).replace(tzinfo=None)
            comment.reply_sent_at = now if status == "replied" else None
            comment.processing_time_ms = analysis.get("processing_time_ms")
            comment.processed_at = now

            await db.commit()

            logger.info(
                "Comment %s processed: status=%s spam=%.2f",
                comment_id,
                status,
                spam_score,
            )
            return {
                "comment_id": comment_id,
                "status": status,
                "ai_reply": analysis.get("reply"),
                "spam_score": spam_score,
            }

        except Exception as exc:
            await db.rollback()
            logger.exception("Error processing comment %s: %s", comment_id, exc)
            raise task.retry(exc=exc)
