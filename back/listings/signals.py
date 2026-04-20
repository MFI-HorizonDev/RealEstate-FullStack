from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Property, UserProfile
from .pricing import PricingEngine
from django.contrib.auth.models import User


THRESHOLD = 0.15  # 15% difference


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create a UserProfile when a new User is created"""
    if created:
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save UserProfile when User is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()


@receiver(post_save, sender=Property)
def flag_property_price_deviation(sender, instance, created, **kwargs):
    # need a price to compare
    if instance.price is None:
        return

    engine = PricingEngine()
    breakdown = engine.calculate_valuation(instance)
    estimate = breakdown.get("estimated_total") or 0

    # skip if estimate is not usable
    if not estimate:
        return

    actual = instance.price
    difference_ratio = abs(actual - estimate) / float(estimate)

    if difference_ratio > THRESHOLD and instance.status not in ["UNDER_REVIEW", "ACTIVE", "REJECTED"]:
        # update directly to avoid recursive signal saves
        Property.objects.filter(pk=instance.pk).update(status="UNDER_REVIEW")

