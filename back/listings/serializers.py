from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
from django.core.files.storage import default_storage
from pathlib import Path


DEFAULT_PROPERTY_IMAGE_DATA_URI = (
    "data:image/svg+xml;utf8,"
    "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>"
    "<rect width='1200' height='800' fill='%23e5e7eb'/>"
    "<text x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='42' fill='%239ca3af' "
    "text-anchor='middle' dominant-baseline='middle'>No Property Image</text>"
    "</svg>"
)


class MunicipalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipality
        fields = '__all__'


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'

    def validate(self, data):
        amenity_type = data.get('amenity_type', getattr(self.instance, 'amenity_type', None))
        price = data.get('price', getattr(self.instance, 'price', 0))

        if amenity_type == "Basic" and price > 100000:
            raise serializers.ValidationError("Basic amenity price cannot exceed ₱100,000.")
        elif amenity_type == "Luxury" and price > 250000:
            raise serializers.ValidationError("Luxury amenity price cannot exceed ₱250,000.")

        return data


class PropertyImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = '__all__'

    def get_image(self, obj):
        request = self.context.get('request')
        # Use uploaded image only when the physical file exists in storage.
        if obj.image and obj.image.name and default_storage.exists(obj.image.name):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url

        # Backend-safe fallback that never depends on a missing media file.
        return DEFAULT_PROPERTY_IMAGE_DATA_URI


class PropertyImageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['image', 'alt_text', 'is_primary']

    def validate_image(self, value):
        # Defense scope: cap property images at 10MB.
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Property image cannot exceed 10MB.")

        valid_extensions = ['.jpg', '.jpeg', '.webp']
        extension = Path(value.name).suffix.lower()
        if extension not in valid_extensions:
            raise serializers.ValidationError("Unsupported file extension. Only JPG, JPEG, and WebP files are allowed.")

        valid_content_types = [
            'image/jpeg', 'image/jpg', 'image/webp'
        ]
        if value.content_type not in valid_content_types:
            raise serializers.ValidationError("Unsupported file type. Only JPG, JPEG, and WebP files are allowed.")

        # Verify actual file content via magic bytes (prevents renamed videos/executables)
        try:
            header = value.read(12)
            value.seek(0)  # Reset file pointer for downstream processing

            image_signatures = [
                b'\xff\xd8\xff',              # JPEG
                b'\x89PNG\r\n\x1a\n',         # PNG
                b'GIF87a', b'GIF89a',         # GIF
                b'RIFF',                       # WebP (RIFF container)
            ]

            is_valid_image = any(header.startswith(sig) for sig in image_signatures)

            # WebP needs additional check: RIFF....WEBP
            if header[:4] == b'RIFF' and header[8:12] != b'WEBP':
                is_valid_image = False

            if not is_valid_image:
                raise serializers.ValidationError(
                    "File content does not match a valid image format. "
                    "The file may be corrupted or is not a real image."
                )
        except serializers.ValidationError:
            raise
        except Exception:
            raise serializers.ValidationError("Unable to verify file content. Please upload a valid image.")

        return value


class PropertySerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    property_tours = serializers.SerializerMethodField()
    owner = serializers.StringRelatedField(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(source='owner', read_only=True)
    agent = serializers.StringRelatedField(read_only=True)
    agent_id = serializers.PrimaryKeyRelatedField(source='agent', read_only=True)
    agent_details = serializers.SerializerMethodField()
    property_municipality = MunicipalitySerializer(read_only=True)

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['property_tours', 'owner_id', 'agent_id']

    def get_property_tours(self, obj):
        from tours.serializers import TourSerializer
        tours = obj.tours.all()
        return TourSerializer(tours, many=True, context=self.context).data

    def get_agent_details(self, obj):
        if obj.agent:
            return {
                "id": obj.agent.id,
                "email": obj.agent.email,
                "first_name": obj.agent.first_name,
                "last_name": obj.agent.last_name,
            }
        return None


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

    def to_internal_value(self, data):
        mutable_data = data.copy()
        listing_type = mutable_data.get("type", getattr(self.instance, "type", None))
        incoming_price = mutable_data.get("price", serializers.empty)

        # Allow blank asking price only for SALE so backend can auto-calculate.
        if incoming_price == "":
            if listing_type == "SALE":
                mutable_data.pop("price", None)
            else:
                mutable_data["price"] = None

        return super().to_internal_value(mutable_data)

    def validate(self, data):
        listing_type = data.get("type", getattr(self.instance, "type", None))
        price = data.get("price", getattr(self.instance, "price", None))
        category = data.get("category", getattr(self.instance, "category", "HOUSE_AND_LOT"))

        property_size = data.get("property_size", getattr(self.instance, "property_size", None))
        building_size = data.get("building_size", getattr(self.instance, "building_size", 0))
        num_bedrooms = data.get("num_bedrooms", getattr(self.instance, "num_bedrooms", 0))
        num_bathrooms = data.get("num_bathrooms", getattr(self.instance, "num_bathrooms", 0))

        if listing_type == "RENT" and (price is None or float(price) <= 0):
            raise serializers.ValidationError({
                "price": "For Rent listings require a fixed price greater than 0."
            })

        if property_size in [None, ""] or float(property_size) <= 0:
            raise serializers.ValidationError({
                "property_size": "Lot area must be greater than 0 sqm."
            })

        if category == "LOT":
            invalid_fields = {}
            if float(building_size or 0) > 0:
                invalid_fields["building_size"] = "Lot listings must not include a building size."
            if int(num_bedrooms or 0) > 0:
                invalid_fields["num_bedrooms"] = "Lot listings must not include bedrooms."
            if int(num_bathrooms or 0) > 0:
                invalid_fields["num_bathrooms"] = "Lot listings must not include bathrooms."
            if invalid_fields:
                raise serializers.ValidationError(invalid_fields)

        if category != "LOT" and listing_type == "SALE" and price is not None and float(price) < 0:
            raise serializers.ValidationError({
                "price": "Price cannot be negative."
            })

        return data

    def create(self, validated_data):
        amenities_data = validated_data.pop('amenities', [])
        images_data = validated_data.pop('images', [])
        should_autocalculate_sale_price = (
            validated_data.get("type") == "SALE"
            and (validated_data.get("price") is None or float(validated_data.get("price") or 0) <= 0)
        )

        if validated_data.get("category") == "LOT":
            validated_data["building_size"] = 0
            validated_data["num_bedrooms"] = 0
            validated_data["num_bathrooms"] = 0

        property_obj = Property.objects.create(**validated_data)

        for amenity_data in amenities_data:
            Amenity.objects.create(property=property_obj, **amenity_data)

        if should_autocalculate_sale_price:
            from .pricing import PricingEngine
            valuation = PricingEngine().calculate_valuation(property_obj)
            property_obj.price = valuation.get("recommended_price") or 0
            property_obj.save(update_fields=["price"])

        for image_data in images_data:
            PropertyImage.objects.create(property=property_obj, **image_data)

        return property_obj

    def update(self, instance, validated_data):
        if validated_data.get("category", instance.category) == "LOT":
            validated_data["building_size"] = 0
            validated_data["num_bedrooms"] = 0
            validated_data["num_bathrooms"] = 0

        updated = super().update(instance, validated_data)

        listing_type = validated_data.get("type", updated.type)
        incoming_price = validated_data.get("price", updated.price)
        should_autocalculate_sale_price = (
            listing_type == "SALE" and (incoming_price is None or float(incoming_price or 0) <= 0)
        )
        if should_autocalculate_sale_price:
            from .pricing import PricingEngine
            valuation = PricingEngine().calculate_valuation(updated)
            updated.price = valuation.get("recommended_price") or 0
            updated.save(update_fields=["price"])

        return updated
    
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
        user = User.objects.create_user(password=password, **validated_data)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.requested_role = role
        profile.role_request_status = "PENDING"
        profile.save(update_fields=["requested_role", "role_request_status"])

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with image support"""
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'profile_image', 'bio', 'phone_number', 'address', 
                 'city', 'state', 'country', 'zipcode', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile with image"""
    email = serializers.EmailField(required=False, allow_blank=True, source="user.email")

    class Meta:
        model = UserProfile
        fields = ['email']

    def validate_profile_image(self, value):
        if value:
            valid_extensions = ['.jpg', '.jpeg', '.webp']
            extension = value.name.lower()[-4:] if len(value.name) > 4 else value.name.lower()[-3:]
            if extension not in valid_extensions:
                raise serializers.ValidationError("Unsupported file extension. Only JPG, JPEG, and WebP files are allowed.")

            valid_content_types = ['image/jpeg', 'image/jpg', 'image/webp']
            if value.content_type not in valid_content_types:
                raise serializers.ValidationError("Unsupported file type. Only JPG, JPEG, and WebP files are allowed.")
                
            # Limit file size to 5MB
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Profile image cannot exceed 5MB.")

        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        email = user_data.get("email", serializers.empty)
        if email is serializers.empty:
            raw_email = self.initial_data.get("email", serializers.empty)
            email = raw_email
        if email is not None:
            instance.user.email = email
            instance.user.save(update_fields=["email"])
        return super().update(instance, validated_data)


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user information including profile"""
    profile = UserProfileSerializer(read_only=True, required=False, allow_null=True)
    groups = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'is_superuser', 'groups', 'profile', 'is_staff']
        read_only_fields = ['id', 'is_superuser', 'is_staff']

    def to_representation(self, instance):
        """Ensure profile exists and handle serialization"""
        # Auto-create profile if it doesn't exist
        if not hasattr(instance, 'profile') or instance.profile is None:
            UserProfile.objects.get_or_create(user=instance)
            # Refresh the instance to get the profile
            instance.refresh_from_db()
        
        return super().to_representation(instance)


class RoleRequestSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ["id", "requested_role", "role_request_status", "created_at", "updated_at", "user"]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "groups": [group.name for group in obj.user.groups.all()],
        }
