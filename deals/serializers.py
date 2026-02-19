from rest_framework import serializers
from .models import Sale, Commission, PendingSaleRequest
from listings.models import Property
from listings.serializers import PropertySerializer


class CommissionSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.username', read_only=True)

    class Meta:
        model = Commission
        fields = '__all__'


class SaleSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    commissions = CommissionSerializer(many=True, read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all(), write_only=True)

    class Meta:
        model = Sale
        fields = '__all__'

    def to_internal_value(self, data):
        # Handle the property_id conversion properly before validation
        property_id = data.get('property_id')
        if property_id:
            try:
                property_obj = Property.objects.get(pk=property_id)
                data['property_id'] = property_obj
            except Property.DoesNotExist:
                pass  # Let the validation handle the error
        return super().to_internal_value(data)

    def create(self, validated_data):
        property_id = validated_data.pop('property_id', None)
        if property_id:
            validated_data['property'] = property_id
            property_obj = property_id
            property_obj.status = 'SOLD'
            property_obj.save()

        return Sale.objects.create(**validated_data)


class SaleCreateSerializer(serializers.ModelSerializer):
    property_id = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all(), write_only=True)

    class Meta:
        model = Sale
        exclude = ['property']

    def validate(self, attrs):
        # If final_price is not provided, automatically set it to the property's total_price
        property_obj = attrs.get('property_id')
        if property_obj and ('final_price' not in attrs or not attrs['final_price'] or attrs['final_price'] == 0):
            attrs['final_price'] = property_obj.total_price()
        return attrs

    def create(self, validated_data):
        property_obj = validated_data.pop('property_id')

        property_obj.status = 'SOLD'
        property_obj.save()

        return Sale.objects.create(property=property_obj, **validated_data)


class PendingSaleRequestSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.property_name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = PendingSaleRequest
        fields = '__all__'
        read_only_fields = ('status', 'created_at', 'updated_at')