from django.core.cache import cache
from django.db.models import Avg, F, ExpressionWrapper, DecimalField
from django.utils import timezone
from datetime import timedelta
from deals.models import Sale

def get_last_30_days_sales(municipality):
    cutoff = timezone.now().date() - timedelta(days=30)

    return Sale.objects.filter(
        property__property_municipality=municipality,
        approval_status="COMPLETED",
        date_sold__gte=cutoff
    )

def get_market_buffer(municipality):
    sales = get_last_30_days_sales(municipality)

    return sales.annotate(
        price_per_sqm=ExpressionWrapper(
            F("final_price") / F("property__property_size"),
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
    ).aggregate(
        avg_price_per_sqm=Avg("price_per_sqm")
    )["avg_price_per_sqm"]

def get_cached_market_buffer(municipality):
    """
    Standard getter for the Pricing Engine.
    Tries Redis first. If empty (e.g., server restart), triggers a live calculation.
    """
    cache_key = f"market_buffer_{municipality.id}"
    cached_value = cache.get(cache_key)
    
    if cached_value is not None:
        return cached_value
        
    # Fallback if cache is empty
    live_calc = get_market_buffer(municipality)
    if live_calc is None:
        return municipality.price_per_sqm
        
    # Set cache temporarily until Celery takes over
    cache.set(cache_key, live_calc, timeout=60 * 60)
    return live_calc