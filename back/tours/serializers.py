from django.utils import timezone
from rest_framework import serializers

from listings.models import Property
from .models import Tour


def agent_has_daily_conflict(agent, tour_datetime, exclude_tour_pk=None):
    if agent is None or tour_datetime is None:
        return False

    qs = Tour.objects.filter(
        agent=agent,
        status__in=[Tour.STATUS_QUEUED, Tour.STATUS_SCHEDULED],
        tour_datetime__date=tour_datetime.date(),
    )
    if exclude_tour_pk is not None:
        qs = qs.exclude(pk=exclude_tour_pk)
    return qs.exists()


class TourSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)
    buyer_details = serializers.SerializerMethodField()
    agent = serializers.PrimaryKeyRelatedField(read_only=True)
    agent_details = serializers.SerializerMethodField()
    property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all())
    property_details = serializers.SerializerMethodField()

    class Meta:
        model = Tour
        fields = [
            "id",
            "property",
            "property_details",
            "agent",
            "agent_details",
            "buyer",
            "buyer_details",
            "tour_datetime",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["agent", "buyer", "status", "created_at", "updated_at"]

    def get_buyer_details(self, obj):
        if obj.buyer:
            return {
                "id": obj.buyer.id,
                "first_name": obj.buyer.first_name,
                "last_name": obj.buyer.last_name,
                "email": obj.buyer.email
            }
        return None

    def get_agent_details(self, obj):
        if obj.agent:
            return {
                "id": obj.agent.id,
                "first_name": obj.agent.first_name,
                "last_name": obj.agent.last_name,
                "email": obj.agent.email
            }
        return None

    def get_property_details(self, obj):
        if obj.property:
            return {
                "id": obj.property.id,
                "property_name": obj.property.property_name,
                "property_address": obj.property.property_address,
                "price": obj.property.price
            }
        return None

    def validate_tour_datetime(self, value):
        if self.instance is None and value < timezone.now():
            raise serializers.ValidationError("Tour time cannot be in the past.")
        return value

    def validate(self, attrs):
        if self.instance is not None:
            return attrs

        prop = attrs.get("property")
        tour_datetime = attrs.get("tour_datetime")
        if prop is None or tour_datetime is None:
            return attrs

        agent = prop.agent or getattr(prop, "owner", None)
        if agent is None:
            raise serializers.ValidationError(
                {"property": "This property has no assigned tour handler."}
            )

        if agent_has_daily_conflict(agent, tour_datetime):
            raise serializers.ValidationError(
                "This agent already has a tour on this date."
            )

        return attrs


class TourAgentActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        fields = ["status"]

    def validate(self, attrs):
        if self.instance.status != Tour.STATUS_QUEUED:
            raise serializers.ValidationError(
                "Only tours in QUEUED status can be updated here."
            )

        new_status = attrs.get("status")
        if new_status not in (Tour.STATUS_SCHEDULED, Tour.STATUS_REJECTED):
            raise serializers.ValidationError(
                {"status": "Must be SCHEDULED or REJECTED."}
            )

        if new_status == Tour.STATUS_SCHEDULED:
            agent = self.instance.agent
            dt = self.instance.tour_datetime
            if agent is None:
                raise serializers.ValidationError(
                    "Tour has no agent assigned; cannot schedule."
                )
            if agent_has_daily_conflict(agent, dt, exclude_tour_pk=self.instance.pk):
                raise serializers.ValidationError(
                    "This agent already has a tour on this date."
                )

        return attrs


class TourManageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        fields = ["status", "tour_datetime"]
        extra_kwargs = {"tour_datetime": {"required": False}}

    def validate(self, attrs):
        status = attrs.get("status", self.instance.status)
        dt = attrs.get("tour_datetime", self.instance.tour_datetime)

        allowed_status = {
            Tour.STATUS_QUEUED,
            Tour.STATUS_SCHEDULED,
            Tour.STATUS_COMPLETED,
            Tour.STATUS_REJECTED,
        }
        if status not in allowed_status:
            raise serializers.ValidationError({"status": "Invalid status."})

        if dt and status in {Tour.STATUS_QUEUED, Tour.STATUS_SCHEDULED}:
            if agent_has_daily_conflict(self.instance.agent, dt, exclude_tour_pk=self.instance.pk):
                raise serializers.ValidationError("This agent already has a tour on this date.")

        return attrs
