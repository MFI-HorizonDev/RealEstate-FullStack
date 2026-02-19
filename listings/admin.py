from django.contrib import admin
from .models import *

# Register your models here.

admin.site.register(Property)
admin.site.register(Municipality)
admin.site.register(Amenity)
admin.site.register(PropertyImage)