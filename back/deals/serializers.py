from rest_framework import serializers
from .models import Sale, PendingSaleRequest
from listings.models import Property
from listings.serializers import PropertySerializer

# Factory Data 


def _validate_unique_sale_property(property_obj, current_sale=None):
    sale_qs = Sale.objects.filter(property=property_obj)
    if current_sale:
        sale_qs = sale_qs.exclude(pk=current_sale.pk)

    if sale_qs.exists():
        raise serializers.ValidationError({
            'property_id': 'A sale record already exists for this property.'
        })

class SaleSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all(), write_only=True)

    class Meta:
        model = Sale
        fields = '__all__'

    def validate(self, attrs):
        property_obj = attrs.get('property_id')
        if property_obj:
            _validate_unique_sale_property(property_obj, current_sale=self.instance)
        return attrs

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
        if property_obj:
            _validate_unique_sale_property(property_obj, current_sale=self.instance)

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
        read_only_fields = ('created_at', 'updated_at')
