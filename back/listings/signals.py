from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Property
from .pricing import PricingEngine


THRESHOLD = 0.15  # 15% difference


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

    if difference_ratio > THRESHOLD and instance.status != "UNDER_REVIEW":
        # update directly to avoid recursive signal saves
        Property.objects.filter(pk=instance.pk).update(status="UNDER_REVIEW")

