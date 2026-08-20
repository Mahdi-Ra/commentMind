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
from datetime import datetime, timezone

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


async def _run(task, comment_id: str, site_id: str) -> dict:
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.comment import Comment
    from app.models.site import Site
    from app.models.knowledge import KnowledgeChunk
    from app.services.ai_service import analyze_comment
    from app.services.comment_service import determine_comment_status
    from app.services.embedding_service import get_relevant_chunks

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

            # Run AI analysis
            analysis = await analyze_comment(
                content=comment.content,
                site_name=site.name,
                tone=site.tone,
                language=site.language,
                knowledge_context=knowledge_context,
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
