from celery import shared_task
from django.core.cache import cache
from listings.models import Municipality
from listings.utils import (
    SUPPORTED_PROPERTY_CATEGORIES,
    get_market_buffer,
    get_market_demand_signal,
)

@shared_task
def update_all_market_buffers():
    municipalities = Municipality.objects.all()
    
    for mun in municipalities:
        # Run the heavy DB query for 30-day market rate
        buffer_value = get_market_buffer(mun)
        
        # Fallback to model's default if no sales
        if buffer_value is None:
            buffer_value = mun.price_per_sqm
            
        # Store in Redis with format: market_buffer_<municipality_id>
        cache_key = f"market_buffer_{mun.id}"
        
        # Cache for 25 hours (provides 1 hour overlap before next midnight run)
        cache.set(cache_key, buffer_value, timeout=60 * 60 * 25)

        # Also refresh municipality/category demand signal caches.
        for category in SUPPORTED_PROPERTY_CATEGORIES:
            demand_key = f"demand_signal_{mun.id}_{category}"
            demand_signal = get_market_demand_signal(mun, category)
            cache.set(demand_key, demand_signal, timeout=60 * 60 * 25)
        
    return "Market buffers updated successfully."
