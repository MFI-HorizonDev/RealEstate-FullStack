from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from listings.models import Property
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta


# --- GuardianFlag for threshold/anti-griefing ---
class GuardianFlag(models.Model):
	FLAG_TYPE_CHOICES = [
		("THRESHOLD", "Threshold Deviation"),
		("GRIEFING", "Anti-Griefing"),
	]
	property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="guardian_flags")
	flag_type = models.CharField(max_length=20, choices=FLAG_TYPE_CHOICES)
	triggered_at = models.DateTimeField(auto_now_add=True)
	resolved = models.BooleanField(default=False)
	details = models.TextField(blank=True, null=True)

	def __str__(self):
		return f"{self.flag_type} flag for {self.property} at {self.triggered_at}"


# --- Guardian Logic ---
class GuardianEngine:
	@staticmethod
	def check_threshold_flag(property_obj, threshold_percent=20):
		"""
		Flags if price deviates more than threshold_percent from market buffer.
		"""
		from listings.pricing import PricingEngine
		from listings.utils import get_market_buffer
		market_buffer = get_market_buffer(property_obj.property_municipality)
		if market_buffer is None or not property_obj.price:
			return None
		market_buffer = Decimal(str(market_buffer))
		price = Decimal(str(property_obj.price))
		deviation = abs(price - market_buffer) / market_buffer * 100
		if deviation > threshold_percent:
			flag = GuardianFlag.objects.create(
				property=property_obj,
				flag_type="THRESHOLD",
				details=f"Price deviates {deviation:.2f}% from market buffer (₱{market_buffer:,})"
			)
			return flag
		return None

	@staticmethod
	def check_anti_griefing(property_obj, min_minutes=30, agent_tier=None):
		"""
		Prevents rapid price changes. If last update < min_minutes ago, flag.
		Optionally, agent_tier can allow shorter intervals for trusted agents.
		"""
		now = timezone.now()
		last_update = property_obj.updated_at
		interval = timedelta(minutes=min_minutes)
		# Example: trusted agents can update every 10 min
		if agent_tier == "trusted":
			interval = timedelta(minutes=10)
		if last_update and (now - last_update) < interval:
			flag = GuardianFlag.objects.create(
				property=property_obj,
				flag_type="GRIEFING",
				details=f"Price updated too soon after last change. Interval: {interval}"
			)
			return flag
		return None

	@staticmethod
	def handle_state_transition(property_obj, new_status):
		"""
		Handles state transitions for a property (e.g., Pending Review → Verified).
		"""
		valid_transitions = {
			"UNDER_REVIEW": ["ACTIVE", "VERIFIED"],
			"ACTIVE": ["UNDER_REVIEW", "SOLD"],
			"VERIFIED": ["ACTIVE", "SOLD"],
			"SOLD": [],
		}
		current = property_obj.status
		if new_status in valid_transitions.get(current, []):
			property_obj.status = new_status
			property_obj.save()
			return True
		return False
