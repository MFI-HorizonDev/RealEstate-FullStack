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