from celery import shared_task
from django.core.cache import cache
from listings.models import Municipality
from listings.utils import get_market_buffer

@shared_task
def update_all_market_buffers():
    municipalities = Municipality.objects.all()
    
    for mun in municipalities:
        # Run the heavy DB query
        buffer_value = get_market_buffer(mun)
        
        # Fallback to model's default if no sales
        if buffer_value is None:
            buffer_value = mun.price_per_sqm
            
        # Store in Redis with format: market_buffer_<municipality_id>
        cache_key = f"market_buffer_{mun.id}"
        
        # Cache for 25 hours (provides 1 hour overlap before next midnight run)
        cache.set(cache_key, buffer_value, timeout=60 * 60 * 25)
        
    return "Market buffers updated successfully."
