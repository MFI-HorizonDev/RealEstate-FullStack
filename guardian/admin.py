from django.contrib import admin


from .models import GuardianFlag

@admin.register(GuardianFlag)
class GuardianFlagAdmin(admin.ModelAdmin):
	list_display = ("property", "flag_type", "triggered_at", "resolved")
	list_filter = ("flag_type", "resolved")
	search_fields = ("property__property_name", "details")
