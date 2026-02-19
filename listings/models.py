from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User
from tours.models import Tour

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
        ("LEASE", "For Lease"),
        ("FORECLOSURE", "Foreclosure"),
    ]
    STATUS_TYPES= [
        ("ACTIVE", "Active"),
        ("SOLD", "Sold"),
        ("UNDER_REVIEW", "Under Review"),
    ]
    property_name = models.CharField(max_length=255)
    property_description = models.TextField(blank=True, null=True)
    property_address = models.CharField(max_length=1000)
    property_municipality = models.ForeignKey(Municipality, on_delete=models.CASCADE, related_name="properties")
    owner = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True,related_name="owned_properties")
    agent = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True,related_name="listed_properties")
    property_size = models.IntegerField(validators=[MinValueValidator(0)])
    num_bedrooms = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    num_bathrooms = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    price = models.IntegerField(validators=[MinValueValidator(0)], blank=True, null=True)
    type = models.CharField(max_length=12, choices=LISTING_TYPES)
    is_available_for_tour = models.BooleanField(default=False)
    property_tours = models.ManyToManyField(Tour,blank=True,related_name="properties_on_tour")
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
        if not self.pk and (self.price is None or self.price == 0):
            self.price = self.total_price() 
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.type} in {self.property_municipality}, {self.property_name} at ₱{self.price:,}"

def property_image_upload_path(instance, filename):
    return f'propertyimg/property_{instance.property.id}/{filename}'

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=property_image_upload_path)
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

    def save(self, *args, **kwargs):
        if self.amenity_type == "Basic" and self.price > 100000:
            self.price = 100000
        elif self.amenity_type == "Luxury" and self.price > 250000:
            self.price = 250000
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} in {self.property}"




