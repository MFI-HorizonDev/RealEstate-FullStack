from decimal import Decimal

from .utils import get_cached_market_buffer


class PricingEngine:
    """Valuation using market buffer and capped amenities."""

    BASIC_CAP = 100000
    LUXURY_CAP = 250000

    def _capped_amenity_sum(self, property_obj):
        total = 0
        for amenity in property_obj.amenities.all():
            if amenity.amenity_type == "Basic":
                total += min(amenity.price, self.BASIC_CAP)
            elif amenity.amenity_type == "Luxury":
                total += min(amenity.price, self.LUXURY_CAP)
            else:
                total += amenity.price
        return total

    def _get_subdivision_multiplier(self, property_obj):
        # if  a subdivision_multiplier field is added to Property later, it will be used
        return getattr(property_obj, "subdivision_multiplier", Decimal("1.0"))

    def calculate_valuation(self, property_obj):
        """
        Returns dict: base_price, amenity_impact, subtotal_before_subdivision,
        subdivision_multiplier, estimated_total.
        """
        municipality = property_obj.property_municipality
        if not municipality:
            return {
                "base_price": 0,
                "amenity_impact": 0,
                "subtotal_before_subdivision": 0,
                "subdivision_multiplier": 1.0,
                "estimated_total": 0,
            }

        market_rate = get_cached_market_buffer(municipality)
        if market_rate is None:
            market_rate = municipality.price_per_sqm
        market_rate = Decimal(str(market_rate))

        sqm = property_obj.property_size or 0
        base_price = market_rate * sqm

        amenity_impact = self._capped_amenity_sum(property_obj)
        if not isinstance(amenity_impact, Decimal):
            amenity_impact = Decimal(str(amenity_impact))

        subtotal_before_subdivision = base_price + amenity_impact
        subdivision_multiplier = self._get_subdivision_multiplier(property_obj)
        if not isinstance(subdivision_multiplier, Decimal):
            subdivision_multiplier = Decimal(str(subdivision_multiplier))

        estimated_total = (subtotal_before_subdivision * subdivision_multiplier).quantize(Decimal("1"))

        return {
            "base_price": int(base_price),
            "amenity_impact": int(amenity_impact),
            "subtotal_before_subdivision": int(subtotal_before_subdivision),
            "subdivision_multiplier": float(subdivision_multiplier),
            "estimated_total": int(estimated_total),
        }
