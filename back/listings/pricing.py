from decimal import Decimal
from django.apps import apps
from django.db.models import Q

from .utils import get_cached_market_buffer, get_cached_demand_signal

class PricingEngine:
    """
    Comparable Market Analysis (CMA) System.
    Calculates valuation based on similar local properties and specific adjustments.
    """

    BASIC_CAP = 100000
    LUXURY_CAP = 250000
    AMENITY_DECAY_STEP = Decimal("0.20")
    DEMAND_MIN = Decimal("-0.10")
    DEMAND_MAX = Decimal("0.20")
    HOUSE_BUILDING_RATE_PER_SQM = Decimal("18000")

    # Adjustment Multipliers
    CONDITION_MODIFIERS = {
        "NEW": Decimal("1.15"),   # +15% for brand new/excellent
        "GOOD": Decimal("1.00"),  # Baseline
        "FAIR": Decimal("0.85"),  # -15% for fair/average
        "POOR": Decimal("0.70"),  # -30% for needs renovation
    }

    LOCATION_MODIFIERS = {
        "PREMIUM": Decimal("1.25"),  # +25% for CBD/Elite areas
        "URBAN": Decimal("1.10"),    # +10% for central urban
        "SUBURBAN": Decimal("1.00"), # Baseline
        "RURAL": Decimal("0.90"),    # -10% for rural/remote
    }

    def _quantize_int(self, value):
        if not isinstance(value, Decimal):
            value = Decimal(str(value))
        return int(value.quantize(Decimal("1")))

    def _get_similar_properties(self, property_obj):
        Property = apps.get_model('listings', 'Property')
        
        # Criteria: same municipality, same category, same type (SALE), ACTIVE or SOLD
        similar = Property.objects.filter(
            property_municipality=property_obj.property_municipality,
            category=property_obj.category,
            type="SALE"
        ).filter(Q(status="ACTIVE") | Q(status="SOLD")).exclude(pk=property_obj.pk)
        
        # Take the most recent 5 for a good sample
        return similar.order_by("-created_at")[:5]

    def _calculate_amenity_impact(self, property_obj):
        amenities = property_obj.amenities.all().order_by("-price")
        total = Decimal("0")
        for idx, amenity in enumerate(amenities):
            val = Decimal(str(amenity.price))
            if amenity.amenity_type == "Basic":
                val = min(val, Decimal(str(self.BASIC_CAP)))
            elif amenity.amenity_type == "Luxury":
                val = min(val, Decimal(str(self.LUXURY_CAP)))
            
            decay = Decimal("1") + (self.AMENITY_DECAY_STEP * Decimal(idx))
            total += val / decay
        return total

    def calculate_valuation(self, property_obj):
        """
        Performs Comparable Market Analysis (CMA) and returns a detailed breakdown.
        """
        if getattr(property_obj, "type", None) == "RENT":
            fixed_price = property_obj.price or 0
            return {
                "recommended_price": int(fixed_price),
                "price_per_sqm": 0,
                "explanation": "Rent listings use manual pricing and are not subject to CMA valuation.",
                "comparables": [],
                "adjustments": {"condition": 1.0, "location": 1.0},
                "recommendation_band": {"min": int(fixed_price), "max": int(fixed_price)}
            }

        # 1. Fetch Comparables
        comps = self._get_similar_properties(property_obj)
        comp_data = []
        avg_comp_sqm_price = Decimal("0")
        
        if comps.count() >= 3:
            total_sqm_price = Decimal("0")
            for c in comps:
                sqm_price = Decimal(str(c.price)) / Decimal(str(max(c.property_size, 1)))
                total_sqm_price += sqm_price
                comp_data.append({
                    "id": c.id,
                    "name": c.property_name,
                    "price": c.price,
                    "sqm": c.property_size,
                    "price_per_sqm": int(sqm_price)
                })
            avg_comp_sqm_price = total_sqm_price / Decimal(str(len(comps)))
            explanation_source = f"Based on {len(comps)} similar properties in {property_obj.property_municipality}."
        else:
            # Fallback to municipality base rate if not enough comparables
            avg_comp_sqm_price = Decimal(str(get_cached_market_buffer(property_obj.property_municipality)))
            explanation_source = f"Insufficient local comparables (<3). Falling back to {property_obj.property_municipality} market baseline."

        # 2. Base Valuation
        base_valuation = avg_comp_sqm_price * Decimal(str(property_obj.property_size))
        
        # 3. Adjustments
        condition_mod = self.CONDITION_MODIFIERS.get(property_obj.condition, Decimal("1.0"))
        location_mod = self.LOCATION_MODIFIERS.get(property_obj.location_quality, Decimal("1.0"))
        
        amenity_impact = self._calculate_amenity_impact(property_obj)
        
        # Add construction component only for HOUSE_AND_LOT to reflect build cost/value.
        building_component = Decimal("0")
        if getattr(property_obj, "category", None) == "HOUSE_AND_LOT":
            building_size = Decimal(str(max(getattr(property_obj, "building_size", 0) or 0, 0)))
            building_component = building_size * self.HOUSE_BUILDING_RATE_PER_SQM

        # Apply multipliers to lot-driven CMA baseline, then add amenities/building component.
        adjusted_valuation = (base_valuation * condition_mod * location_mod) + amenity_impact + building_component
        demand_signal = get_cached_demand_signal(property_obj.property_municipality, property_obj.category)
        raw_demand_score = Decimal(str(demand_signal.get("score", 0)))
        demand_score = max(self.DEMAND_MIN, min(self.DEMAND_MAX, raw_demand_score))
        demand_multiplier = Decimal("1.0") + demand_score
        adjusted_valuation = adjusted_valuation * demand_multiplier
        
        # 4. Final Recommendation
        recommended_price = self._quantize_int(adjusted_valuation)
        
        # Prepare Explanation
        cond_label = dict(property_obj.CONDITION_TYPES).get(property_obj.condition, property_obj.condition)
        loc_label = dict(property_obj.LOCATION_QUALITIES).get(property_obj.location_quality, property_obj.location_quality)
        
        explanation = (
            f"{explanation_source} "
            f"Market rate: ₱{int(avg_comp_sqm_price):,}/sqm. "
            f"Adjusted for '{cond_label}' condition ({int((condition_mod-1)*100):+d}%) "
            f"and '{loc_label}' location ({int((location_mod-1)*100):+d}%). "
            f"Added ₱{int(amenity_impact):,} for features/amenities. "
            f"Building component: ₱{int(building_component):,}. "
            f"Demand heat applied at {float(demand_score) * 100:+.1f}%."
        )

        return {
            "recommended_price": recommended_price,
            "price_per_sqm": int(avg_comp_sqm_price),
            "suggested_range": {
                "min": self._quantize_int(adjusted_valuation * Decimal("0.95")),
                "max": self._quantize_int(adjusted_valuation * Decimal("1.05")),
            },
            "explanation": explanation,
            "comparables": comp_data,
            "adjustments": {
                "condition": float(condition_mod),
                "location": float(location_mod),
                "amenity_impact": int(amenity_impact),
                "building_component": int(building_component),
                "demand_score": float(demand_score),
                "demand_multiplier": float(demand_multiplier),
                "competitive_index": float(demand_signal.get("competitive_index", 0.0)),
            }
        }
