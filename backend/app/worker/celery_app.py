"""
Celery application factory.

Workers are started separately:
    celery -A app.worker.celery_app worker --loglevel=info
"""
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "commentmind",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.worker.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Retry failed tasks up to 3 times with exponential back-off
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_default_retry_delay=10,
    task_max_retries=3,
    # Keep results for 1 hour (enough for the API to poll)
    result_expires=3600,
    # Route all tasks to the default queue
    task_routes={
        "app.worker.tasks.*": {"queue": "default"},
    },
    beat_schedule={
        "account-lifecycle": {
            "task": "app.worker.tasks.run_account_lifecycle",
            "schedule": crontab(minute=0, hour="*/6"),
        },
    },
)
