from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from listings.views import *
from tours.views import *
from deals.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    #Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    #Register
    path('api/register/', RegisterView.as_view(), name='register'),

    # Listings
    path('api/properties/', PropertyListCreateView.as_view(), name='property-list-create'),
    path('api/properties/<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),
    path('api/properties/<int:property_id>/images/', PropertyImageListCreateView.as_view(), name='property-image-list-create'),
    path('api/properties/<int:property_id>/amenities/', AmenityListCreateView.as_view(), name='property-amenities-list-create'),
    path('api/properties/<int:property_id>/amenities/<int:pk>/', AmenityDetailView.as_view(), name='property-amenity-detail'),
    path('api/images/<int:pk>/', PropertyImageDetailView.as_view(), name='property-image-detail'),
    path('api/amenities/<int:pk>/', AmenityDetailView.as_view(), name='amenity-detail'),
    path('api/municipalities/', MunicipalityListCreateView.as_view(), name='municipality-list-create'),
    path('api/municipalities/<int:pk>/', MunicipalityDetailView.as_view(), name='municipality-detail'),

    # Deals
    path('api/sales/', SaleListCreateView.as_view(), name='sale-list-create'),
    path('api/sales/<int:pk>/', SaleDetailView.as_view(), name='sale-detail'),
    
    path('api/commissions/', CommissionListView.as_view(), name='commission-list'),
    path('api/commissions/<int:pk>/', CommissionDetailView.as_view(), name='commission-detail'),
    path('api/pending-sales/', PendingSaleRequestListView.as_view(), name='pending-sale-request-list'),
    path('api/pending-sales/<int:pk>/', PendingSaleRequestDetailView.as_view(), name='pending-sale-request-detail'),
    path('api/admin-sales/approve/<int:pk>/', AdminSaleApprovalView.as_view(), name='admin-sale-approval'),

    # Tours
    path('api/properties/<int:property_id>/tours/', TourListCreateView.as_view(), name='property-tours-list-create'),
    path('api/properties/<int:property_id>/tours/<int:pk>/', TourDetailView.as_view(), name='property-tour-detail'),
    path('api/tours/<int:pk>/', TourDetailView.as_view(), name='tour-detail'),

]
