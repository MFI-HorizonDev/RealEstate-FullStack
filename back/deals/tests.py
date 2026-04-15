from decimal import Decimal
from datetime import date

from django.contrib.auth.models import User
from django.test import TestCase

from deals.models import Sale
from deals.serializers import SaleCreateSerializer, SaleSerializer
from listings.models import Municipality, Property


class SaleSerializerValidationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='sale_tester',
            password='password123'
        )
        self.municipality = Municipality.objects.create(
            municipality_name='Serializer City',
            price_per_sqm=50000
        )
        self.property = Property.objects.create(
            property_name='Primary Test Property',
            property_address='123 Serializer Ave',
            property_municipality=self.municipality,
            property_size=100,
            type='SALE',
            owner=self.user,
            agent=self.user,
            status='ACTIVE'
        )
        self.existing_sale = Sale.objects.create(
            property=self.property,
            date_sold=date.today(),
            final_price=Decimal('5000000.00'),
            buyer=self.user,
            approval_status='COMPLETED'
        )

    def test_sale_create_serializer_rejects_duplicate_property(self):
        serializer = SaleCreateSerializer(data={
            'property_id': self.property.id,
            'date_sold': str(date.today()),
            'final_price': '5500000.00',
            'buyer': self.user.id,
            'approval_status': 'COMPLETED',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('property_id', serializer.errors)

    def test_sale_serializer_rejects_duplicate_property(self):
        serializer = SaleSerializer(data={
            'property_id': self.property.id,
            'date_sold': str(date.today()),
            'final_price': '5600000.00',
            'buyer': self.user.id,
            'approval_status': 'COMPLETED',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('property_id', serializer.errors)

    def test_sale_serializer_allows_same_property_on_same_instance_update(self):
        serializer = SaleSerializer(
            instance=self.existing_sale,
            data={'property_id': self.property.id},
            partial=True
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
