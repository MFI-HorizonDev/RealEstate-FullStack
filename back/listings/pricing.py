from decimal import Decimal

from .utils import get_cached_market_buffer, get_cached_demand_signal


class PricingEngine:
    """Dynamic valuation with market buffer, demand, and competitive pressure."""

    BASIC_CAP = 100000
    LUXURY_CAP = 250000
    AMENITY_DECAY_STEP = Decimal("0.22")

    CATEGORY_CURVES = {
        "HOUSE_AND_LOT": {
            "land_weight": Decimal("1.00"),
            "building_multiplier": Decimal("1.25"),
            "demand_sensitivity": Decimal("1.00"),
            "competition_sensitivity": Decimal("1.00"),
        },
        "LOT": {
            "land_weight": Decimal("1.05"),
            "building_multiplier": Decimal("0.00"),
            "demand_sensitivity": Decimal("0.90"),
            "competition_sensitivity": Decimal("1.10"),
        },
        "APARTMENT": {
            "land_weight": Decimal("0.65"),
            "building_multiplier": Decimal("1.40"),
            "demand_sensitivity": Decimal("1.10"),
            "competition_sensitivity": Decimal("1.15"),
        },
        "CONDO": {
            "land_weight": Decimal("0.55"),
            "building_multiplier": Decimal("1.60"),
            "demand_sensitivity": Decimal("1.20"),
            "competition_sensitivity": Decimal("1.20"),
        },
        "COMMERCIAL_SPACE": {
            "land_weight": Decimal("1.20"),
            "building_multiplier": Decimal("1.75"),
            "demand_sensitivity": Decimal("1.15"),
            "competition_sensitivity": Decimal("1.30"),
        },
    }

    def _quantize_int(self, value):
        if not isinstance(value, Decimal):
            value = Decimal(str(value))
        return int(value.quantize(Decimal("1")))

    def _capped_amenity_sum(self, property_obj):
        amenity_values = []
        for amenity in property_obj.amenities.all().order_by("-price"):
            if amenity.amenity_type == "Basic":
                amenity_values.append(Decimal(str(min(amenity.price, self.BASIC_CAP))))
            elif amenity.amenity_type == "Luxury":
                amenity_values.append(Decimal(str(min(amenity.price, self.LUXURY_CAP))))
            else:
                amenity_values.append(Decimal(str(amenity.price)))

        total = Decimal("0")
        for idx, amenity_value in enumerate(amenity_values):
            decay = Decimal("1") + (self.AMENITY_DECAY_STEP * Decimal(idx))
            total += amenity_value / decay
        return total

    def _get_subdivision_multiplier(self, property_obj):
        # if  a subdivision_multiplier field is added to Property later, it will be used
        return getattr(property_obj, "subdivision_multiplier", Decimal("1.0"))

    def calculate_valuation(self, property_obj):
        """
        Returns a detailed valuation breakdown.
        """
        municipality = property_obj.property_municipality
        if not municipality:
            return {
                "base_price": 0,
                "building_price": 0,
                "amenity_impact": 0,
                "demand_adjustment": 0,
                "competitive_adjustment": 0,
                "subtotal_before_subdivision": 0,
                "subdivision_multiplier": 1.0,
                "estimated_total": 0,
            }

        if getattr(property_obj, "type", None) == "RENT":
            fixed_price = property_obj.price or 0
            return {
                "base_price": 0,
                "building_price": 0,
                "amenity_impact": 0,
                "demand_adjustment": 0,
                "competitive_adjustment": 0,
                "subtotal_before_subdivision": int(fixed_price),
                "subdivision_multiplier": 1.0,
                "estimated_total": int(fixed_price),
                "recommendation_band": {
                    "min": int(fixed_price),
                    "max": int(fixed_price),
                },
            }

        market_rate = get_cached_market_buffer(municipality)
        if market_rate is None:
            market_rate = municipality.price_per_sqm
        market_rate = Decimal(str(market_rate))

        category = getattr(property_obj, "category", "HOUSE_AND_LOT")
        curve = self.CATEGORY_CURVES.get(category, self.CATEGORY_CURVES["HOUSE_AND_LOT"])

        sqm = property_obj.property_size or 0
        base_price = market_rate * Decimal(str(sqm)) * curve["land_weight"]

        building_size = getattr(property_obj, "building_size", 0) or 0
        building_price = market_rate * Decimal(str(building_size)) * curve["building_multiplier"]

        amenity_impact = self._capped_amenity_sum(property_obj)

        pre_adjusted = base_price + building_price + amenity_impact

        demand_signal = get_cached_demand_signal(municipality, category)
        demand_score = Decimal(str(demand_signal.get("score", 0))) * curve["demand_sensitivity"]
        demand_adjustment = pre_adjusted * demand_score

        competitive_index = Decimal(str(demand_signal.get("competitive_index", 0)))
        competitive_score = (
            Decimal("-1")
            * competitive_index
            * curve["competition_sensitivity"]
            * Decimal("0.08")
        )
        competitive_adjustment = pre_adjusted * competitive_score

        subtotal_before_subdivision = (
            pre_adjusted + demand_adjustment + competitive_adjustment
        )
        subdivision_multiplier = self._get_subdivision_multiplier(property_obj)
        if not isinstance(subdivision_multiplier, Decimal):
            subdivision_multiplier = Decimal(str(subdivision_multiplier))

        estimated_total = (subtotal_before_subdivision * subdivision_multiplier).quantize(Decimal("1"))

        return {
            "base_price": self._quantize_int(base_price),
            "building_price": self._quantize_int(building_price),
            "amenity_impact": self._quantize_int(amenity_impact),
            "demand_adjustment": self._quantize_int(demand_adjustment),
            "competitive_adjustment": self._quantize_int(competitive_adjustment),
            "subtotal_before_subdivision": self._quantize_int(subtotal_before_subdivision),
            "subdivision_multiplier": float(subdivision_multiplier),
            "estimated_total": int(estimated_total),
            "recommendation_band": {
                "min": self._quantize_int(estimated_total * Decimal("0.97")),
                "max": self._quantize_int(estimated_total * Decimal("1.03")),
            },
        }
