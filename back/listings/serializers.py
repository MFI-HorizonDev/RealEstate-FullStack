from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password


class MunicipalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipality
        fields = '__all__'


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'

    def validate(self, data):
        amenity_type = data.get('amenity_type')
        price = data.get('price', 0)

        if amenity_type == "Basic" and price > 100000:
            raise serializers.ValidationError("Basic amenity price cannot exceed ₱100,000.")
        elif amenity_type == "Luxury" and price > 250000:
            raise serializers.ValidationError("Luxury amenity price cannot exceed ₱250,000.")

        return data


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = '__all__'


class PropertyImageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['image', 'alt_text', 'is_primary']

    def validate_image(self, value):
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        extension = value.name.lower()[-4:] if len(value.name) > 4 else value.name.lower()[-3:]
        if extension not in valid_extensions:
            raise serializers.ValidationError("Unsupported file extension. Only JPG, PNG, GIF, and WebP files are allowed.")

        valid_content_types = [
            'image/jpeg', 'image/jpg', 'image/png',
            'image/gif', 'image/webp'
        ]
        if value.content_type not in valid_content_types:
            raise serializers.ValidationError("Unsupported file type. Only image files are allowed.")

        return value


class PropertySerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    property_tours = serializers.SerializerMethodField()
    owner = serializers.StringRelatedField(read_only=True)
    agent = serializers.StringRelatedField(read_only=True)
    property_municipality = MunicipalitySerializer(read_only=True)

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['property_tours']

    def get_property_tours(self, obj):
        from tours.serializers import TourSerializer
        tours = obj.tours.all()
        return TourSerializer(tours, many=True, context=self.context).data


class PropertyCreateSerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, required=False)
    images = PropertyImageCreateSerializer(many=True, required=False)

    class Meta:
        model = Property
        exclude = ['owner']

    def validate_images(self, value):
        if len(value) > 20:
            raise serializers.ValidationError("A property cannot have more than 20 images.")
        return value

    def create(self, validated_data):
        amenities_data = validated_data.pop('amenities', [])
        images_data = validated_data.pop('images', [])

        property_obj = Property.objects.create(**validated_data)

        for amenity_data in amenities_data:
            Amenity.objects.create(property=property_obj, **amenity_data)

        for image_data in images_data:
            PropertyImage.objects.create(property=property_obj, **image_data)

        return property_obj
    
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[('Buyer', 'Buyer'), ('Agent', 'Agent'), ('Owner', 'Owner')], write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.pop('role')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        if role:
            try:
                group = Group.objects.get(name=role)
                user.groups.add(group)
            except Group.DoesNotExist:
                pass 

        return user
