from django.db import models
from django.contrib.auth.models import User


class Tour(models.Model):
    STATUS_QUEUED = "QUEUED"
    STATUS_SCHEDULED = "SCHEDULED"
    STATUS_COMPLETED = "COMPLETED"
    STATUS_REJECTED = "REJECTED"

    STATUS_CHOICES = [
        (STATUS_QUEUED, "Queued"),
        (STATUS_SCHEDULED, "Scheduled"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_REJECTED, "Rejected"),
    ]

    property = models.ForeignKey(
        "listings.Property",
        on_delete=models.CASCADE,
        related_name="tours",
    )
    agent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tours_as_agent",
        null=True,
        blank=True,
    )
    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tours_as_buyer",
        null=True,
        blank=True,
    )
    tour_datetime = models.DateTimeField()
    status = models.CharField(
        max_length=12,
        choices=STATUS_CHOICES,
        default=STATUS_QUEUED,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-tour_datetime"]

    def __str__(self):
        agent_name = self.agent.get_username() if self.agent else "no agent"
        buyer_name = self.buyer.get_username() if self.buyer else "no buyer"
        when = self.tour_datetime.strftime("%Y-%m-%d %H:%M")
        return f"Tour {self.property.property_name} — {when} ({self.status}) {agent_name}/{buyer_name}"
