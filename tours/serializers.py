from rest_framework import serializers
from .models import Tour
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.utils import timezone


class TourSerializer(serializers.ModelSerializer):
    property = serializers.StringRelatedField(read_only=True)
    agent = serializers.StringRelatedField(read_only=True)
    buyer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Tour
        fields = '__all__'


class TourCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        exclude = ['agent', 'created_at', 'updated_at']

    def validate_start_time(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Start time cannot be in the past.")
        return value

    def validate(self, data):
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError("Start time must be before end time.")

        return data
    
    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except DjangoValidationError as e:
            raise DRFValidationError({
                "non_field_errors": e.messages
            })
        
    
