import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'update-market-buffers-daily': {
        'task': 'listings.tasks.update_all_market_buffers',
        'schedule': crontab(minute=0, hour=0),  # Runs at midnight daily
    },
}
