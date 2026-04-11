# Generated manually for Smart Tour Booking Engine

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def forwards_status_and_datetime(apps, schema_editor):
    Tour = apps.get_model("tours", "Tour")
    status_map = {
        "Scheduled": "SCHEDULED",
        "Completed": "COMPLETED",
        "Cancelled": "REJECTED",
    }
    for tour in Tour.objects.all():
        tour.tour_datetime = tour.start_time
        tour.status = status_map.get(tour.status, "SCHEDULED")
        tour.save(update_fields=["tour_datetime", "status"])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("tours", "0002_tour_agent_tour_buyer"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="tour",
            name="tour_datetime",
            field=models.DateTimeField(null=True),
        ),
        migrations.RunPython(forwards_status_and_datetime, noop_reverse),
        migrations.AlterField(
            model_name="tour",
            name="tour_datetime",
            field=models.DateTimeField(),
        ),
        migrations.RemoveField(model_name="tour", name="start_time"),
        migrations.RemoveField(model_name="tour", name="end_time"),
        migrations.AlterField(
            model_name="tour",
            name="status",
            field=models.CharField(
                choices=[
                    ("QUEUED", "Queued"),
                    ("SCHEDULED", "Scheduled"),
                    ("COMPLETED", "Completed"),
                    ("REJECTED", "Rejected"),
                ],
                default="QUEUED",
                max_length=12,
            ),
        ),
    ]
