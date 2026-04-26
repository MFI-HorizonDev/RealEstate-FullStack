from django.core.cache import cache
from django.db.models import Avg, F, ExpressionWrapper, DecimalField
from django.utils import timezone
from datetime import timedelta
from deals.models import Sale
from tours.models import Tour
from listings.models import Property

SUPPORTED_PROPERTY_CATEGORIES = (
    "HOUSE_AND_LOT",
    "LOT",
    "APARTMENT",
    "CONDO",
    "COMMERCIAL_SPACE",
)

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


def _clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))


def get_market_demand_signal(municipality, category):
    """
    Build a municipality/category demand signal from:
    - recent tour activity
    - recent sales velocity
    - active listing supply
    """
    if category not in SUPPORTED_PROPERTY_CATEGORIES:
        category = "HOUSE_AND_LOT"

    tours_cutoff_dt = timezone.now() - timedelta(days=90)
    sales_cutoff_date = (timezone.now() - timedelta(days=180)).date()

    recent_tours = Tour.objects.filter(
        property__property_municipality=municipality,
        property__category=category,
        created_at__gte=tours_cutoff_dt,
        status__in=["QUEUED", "SCHEDULED", "COMPLETED"],
    ).count()

    recent_sales = Sale.objects.filter(
        property__property_municipality=municipality,
        property__category=category,
        approval_status="COMPLETED",
        date_sold__gte=sales_cutoff_date,
    ).count()

    active_supply = Property.objects.filter(
        property_municipality=municipality,
        category=category,
        status="ACTIVE",
        type="SALE",
    ).count()

    tour_intensity = recent_tours / max(active_supply, 1)
    close_intensity = recent_sales / max(active_supply, 1)
    monthly_sales_rate = recent_sales / 6.0
    months_of_inventory = active_supply / max(monthly_sales_rate, 0.2)

    tour_score = _clamp(tour_intensity / 6.0, 0.0, 1.5)
    close_score = _clamp(close_intensity / 0.8, 0.0, 1.5)
    supply_pressure = _clamp(months_of_inventory / 12.0, 0.0, 1.5)

    raw_score = (
        (tour_score * 0.40)
        + (close_score * 0.45)
        - (supply_pressure * 0.30)
    )

    normalized_score = _clamp(raw_score - 0.25, -0.20, 0.30)
    competitive_index = _clamp(supply_pressure - ((tour_score + close_score) / 2.0), -1.0, 1.0)

    return {
        "category": category,
        "recent_tours": recent_tours,
        "recent_sales": recent_sales,
        "active_supply": active_supply,
        "score": round(normalized_score, 4),
        "competitive_index": round(competitive_index, 4),
    }


def get_cached_demand_signal(municipality, category):
    if category not in SUPPORTED_PROPERTY_CATEGORIES:
        category = "HOUSE_AND_LOT"

    cache_key = f"demand_signal_{municipality.id}_{category}"
    try:
        cached_value = cache.get(cache_key)
    except Exception:
        cached_value = None

    if cached_value is not None:
        return cached_value

    signal = get_market_demand_signal(municipality, category)
    try:
        cache.set(cache_key, signal, timeout=60 * 60)
    except Exception:
        pass

    return signal

def get_cached_market_buffer(municipality):
    """
    Standard getter for the Pricing Engine.
    Tries Redis first. If empty or unavailable, falls back to a live calculation.
    """
    cache_key = f"market_buffer_{municipality.id}"

    try:
        cached_value = cache.get(cache_key)
    except Exception:
        cached_value = None

    if cached_value is not None:
        return cached_value

    # Fallback if cache is empty or Redis is down
    live_calc = get_market_buffer(municipality)
    if live_calc is None:
        return municipality.price_per_sqm

    # Set cache temporarily until Celery takes over (skip if Redis is down)
    try:
        cache.set(cache_key, live_calc, timeout=60 * 60)
    except Exception:
        pass

    return live_calc