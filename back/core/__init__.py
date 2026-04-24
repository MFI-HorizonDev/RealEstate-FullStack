# Celery disabled for local development (requires Redis)
from .celery import app as celery_app

__all__ = ('celery_app',)
