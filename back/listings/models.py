from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

class Municipality(models.Model):
    municipality_name = models.CharField(max_length=100)
    price_per_sqm = models.IntegerField(validators=[MinValueValidator(0)])

    class Meta:
        verbose_name_plural = "Municipalities"

    def __str__(self):
        return self.municipality_name

class Property(models.Model):
    LISTING_TYPES= [
        ("SALE", "For Sale"),
        ("RENT", "For Rent"),
    ]
    STATUS_TYPES= [
        ("ACTIVE", "Active"),
        ("SOLD", "Sold"),
        ("UNDER_REVIEW", "Under Review"),
        ("REJECTED", "Rejected"),
        ("INACTIVE", "Inactive"),
    ]
    CATEGORY_TYPES = [
        ("HOUSE_AND_LOT", "House and Lot"),
        ("LOT", "Lot"),
        ("APARTMENT", "Apartment"),
        ("CONDO", "Condo"),
        ("COMMERCIAL_SPACE", "Commercial Space"),
    ]
    CONDITION_TYPES = [
        ("NEW", "New/Excellent"),
        ("GOOD", "Good"),
        ("FAIR", "Fair"),
        ("POOR", "Poor/Needs Renovation"),
    ]
    LOCATION_QUALITIES = [
        ("PREMIUM", "Premium (CBD/Elite)"),
        ("URBAN", "Urban (Central)"),
        ("SUBURBAN", "Suburban"),
        ("RURAL", "Rural"),
    ]
    property_name = models.CharField(max_length=255)
    property_description = models.TextField(blank=True, null=True)
    property_address = models.CharField(max_length=1000)
    property_municipality = models.ForeignKey(Municipality, on_delete=models.CASCADE, related_name="properties")
    owner = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True,related_name="owned_properties")
    agent = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True,related_name="listed_properties")
    category = models.CharField(max_length=20, choices=CATEGORY_TYPES, default="HOUSE_AND_LOT")
    condition = models.CharField(max_length=20, choices=CONDITION_TYPES, default="GOOD")
    location_quality = models.CharField(max_length=20, choices=LOCATION_QUALITIES, default="SUBURBAN")
    property_size = models.IntegerField(validators=[MinValueValidator(0)])
    building_size = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    num_bedrooms = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    num_bathrooms = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    price = models.IntegerField(validators=[MinValueValidator(0)], blank=True, null=True)
    type = models.CharField(max_length=12, choices=LISTING_TYPES)
    is_available_for_tour = models.BooleanField(default=False)
    status = models.CharField(max_length=15, choices=STATUS_TYPES, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Properties"

    def base_price(self):
        if self.property_municipality and self.property_size:
            return self.property_size * self.property_municipality.price_per_sqm
        return 0

    def amenity_price_total(self):
        if not self.pk:
            return 0
            
        total = 0
        for amenity in self.amenities.all():
            if amenity.amenity_type == "Basic" and amenity.price > 100000:
                total += 100000  
            elif amenity.amenity_type == "Luxury" and amenity.price > 250000:
                total += 250000  
            else:
                total += amenity.price
        return total

    def total_price(self):
        return self.base_price() + self.amenity_price_total()

    def save(self, *args, **kwargs):
        is_new = not self.pk
        if self.type == "RENT":
            # Rent listings stay fixed/manual and should not use sale valuation.
            if self.price is None:
                self.price = 0
        elif not self.pk and (self.price is None or self.price == 0):
            self.price = self.total_price()
        super().save(*args, **kwargs)
        # Auto-create a default placeholder image for new properties with no images
        if is_new and not self.images.exists():
            PropertyImage.objects.create(
                property=self,
                image='propertyimg/default.jpg',
                alt_text='Default property image',
                is_primary=True,
            )

    def __str__(self):
        return f"{self.category} {self.type} in {self.property_municipality}, {self.property_name} at ₱{self.price:,}"

def property_image_upload_path(instance, filename):
    return f'propertyimg/property_{instance.property.id}/{filename}'

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(
        upload_to=property_image_upload_path,
        blank=True,
        default='propertyimg/default.jpg',
    )
    alt_text = models.CharField(max_length=200, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.property.property_name}"

class Amenity(models.Model):
    AMENITY_TYPES = [("Basic", "Basic"), ("Luxury", "Luxury")]

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="amenities"
    )
    name = models.CharField(max_length=100)
    amenity_type = models.CharField(max_length=6, choices=AMENITY_TYPES, default="Basic")
    price = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    added_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="added_amenities"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Amenities"

    def clean(self):
        if self.amenity_type == "Basic" and self.price > 100000:
            raise ValidationError({"price": "Basic amenity price cannot exceed ₱100,000."})
        if self.amenity_type == "Luxury" and self.price > 250000:
            raise ValidationError({"price": "Luxury amenity price cannot exceed ₱250,000."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} in {self.property}"


def user_profile_image_upload_path(instance, filename):
    return f'profiles/user_{instance.user.id}/{filename}'


class UserProfile(models.Model):
    """Extended user profile with image support and role information"""
    ROLE_CHOICES = [
        ("Buyer", "Buyer"),
        ("Agent", "Agent"),
        ("Owner", "Owner"),
    ]
    ROLE_REQUEST_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_image = models.ImageField(upload_to=user_profile_image_upload_path, blank=True, null=True)
    requested_role = models.CharField(max_length=20, choices=ROLE_CHOICES, blank=True, null=True)
    role_request_status = models.CharField(
        max_length=12,
        choices=ROLE_REQUEST_STATUS_CHOICES,
        default="PENDING",
    )
    bio = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    zipcode = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"Profile of {self.user.username}"
