from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView
)
from listings.views import *
from tours.views import *
from deals.views import *
from .authentication import EmailOrUsernameTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Health Check
    path('api/health/', HealthCheckView.as_view(), name='health-check'),

    # Auth
    path('api/token/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/me/', UserProfileView.as_view(), name='user-profile'),
    path('api/profile/update/', UserProfileUpdateView.as_view(), name='user-profile-update'),
    path('api/users/<int:pk>/', UserProfileRetrieveView.as_view(), name='user-profile-retrieve'),


    # Register
    path('api/register/', RegisterView.as_view(), name='register'),

    # Properties
    path('api/properties/', PropertyListView.as_view(), name='property-list'),
    path('api/properties/create/', PropertyCreateView.as_view(), name='property-create'),
    path('api/properties/<int:pk>/', PropertyRetrieveView.as_view(), name='property-retrieve'),
    path('api/properties/<int:pk>/update/', PropertyUpdateView.as_view(), name='property-update'),
    path('api/properties/<int:pk>/delete/', PropertyDeleteView.as_view(), name='property-delete'),
    path('api/properties/<int:pk>/admin-status/', AdminPropertyStatusView.as_view(), name='property-admin-status'),
    path('api/properties/<int:pk>/valuation-preview/', ValuationPreviewView.as_view(), name='property-valuation-preview'),

    # Property Images
    path('api/properties/<int:property_id>/images/', PropertyImageListView.as_view(), name='property-image-list'),
    path('api/properties/<int:property_id>/images/create/', PropertyImageCreateView.as_view(), name='property-image-create'),
    path('api/images/<int:pk>/', PropertyImageRetrieveView.as_view(), name='property-image-retrieve'),
    path('api/images/<int:pk>/update/', PropertyImageUpdateView.as_view(), name='property-image-update'),
    path('api/images/<int:pk>/delete/', PropertyImageDeleteView.as_view(), name='property-image-delete'),

    # Municipalities
    path('api/municipalities/', MunicipalityListView.as_view(), name='municipality-list'),
    path('api/municipalities/create/', MunicipalityCreateView.as_view(), name='municipality-create'),
    path('api/municipalities/<int:pk>/', MunicipalityRetrieveView.as_view(), name='municipality-retrieve'),
    path('api/municipalities/<int:pk>/update/', MunicipalityUpdateView.as_view(), name='municipality-update'),
    path('api/municipalities/<int:pk>/delete/', MunicipalityDeleteView.as_view(), name='municipality-delete'),

    # Amenities
    path('api/properties/<int:property_id>/amenities/', AmenityListView.as_view(), name='property-amenity-list'),
    path('api/properties/<int:property_id>/amenities/create/', AmenityCreateView.as_view(), name='property-amenity-create'),
    path('api/amenities/<int:pk>/', AmenityRetrieveView.as_view(), name='amenity-retrieve'),
    path('api/amenities/<int:pk>/update/', AmenityUpdateView.as_view(), name='amenity-update'),
    path('api/amenities/<int:pk>/delete/', AmenityDeleteView.as_view(), name='amenity-delete'),

    # Tours
    path('api/tours/', TourListCreateView.as_view(), name='tour-list-create'),
    path('api/tours/<int:pk>/', TourRetrieveView.as_view(), name='tour-retrieve'),
    path('api/tours/<int:pk>/agent-action/', TourAgentActionView.as_view(), name='tour-agent-action'),
    path('api/tours/<int:pk>/manage/', TourManageView.as_view(), name='tour-manage'),

    # Sales
    path('api/sales/', SaleListView.as_view(), name='sale-list'),
    path('api/sales/create/', SaleCreateView.as_view(), name='sale-create'),
    path('api/sales/<int:pk>/', SaleRetrieveView.as_view(), name='sale-retrieve'),
    path('api/sales/<int:pk>/update/', SaleUpdateView.as_view(), name='sale-update'),
    path('api/sales/<int:pk>/delete/', SaleDeleteView.as_view(), name='sale-delete'),

    # Commissions
    path('api/commissions/', CommissionListView.as_view(), name='commission-list'),
    path('api/commissions/<int:pk>/', CommissionRetrieveView.as_view(), name='commission-retrieve'),
    path('api/commissions/<int:pk>/update/', CommissionUpdateView.as_view(), name='commission-update'),
    path('api/commissions/<int:pk>/delete/', CommissionDeleteView.as_view(), name='commission-delete'),

    # Sales Requests
    path('api/pending-sales/', PendingSaleRequestListView.as_view(), name='pending-sale-list'),
    path('api/pending-sales/<int:pk>/', PendingSaleRequestRetrieveView.as_view(), name='pending-sale-retrieve'),
    path('api/pending-sales/<int:pk>/update/', PendingSaleRequestUpdateView.as_view(), name='pending-sale-update'),

    # Admin Sale Approval
    path('api/admin-sales/approve/<int:pk>/', AdminSaleApprovalView.as_view(), name='admin-sale-approval'),

    # Demo: manually trigger market buffer recalculation
    path('api/admin/trigger-market-update/', TriggerMarketBufferUpdateView.as_view(), name='trigger-market-update'),
    path('api/admin/role-requests/', AdminRoleRequestListView.as_view(), name='admin-role-request-list'),
    path('api/admin/role-requests/<int:pk>/action/', AdminRoleRequestActionView.as_view(), name='admin-role-request-action'),

    # ===== SUPER ADMIN CRUD ENDPOINTS =====
    # Users Management
    path('api/admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('api/admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),

    # Properties Management
    path('api/admin/properties/', AdminPropertyListView.as_view(), name='admin-property-list'),
    path('api/admin/properties/<int:pk>/', AdminPropertyDetailView.as_view(), name='admin-property-detail'),

    # Municipalities Management
    path('api/admin/municipalities/', AdminMunicipalityListView.as_view(), name='admin-municipality-list'),
    path('api/admin/municipalities/<int:pk>/', AdminMunicipalityDetailView.as_view(), name='admin-municipality-detail'),

    # Amenities Management
    path('api/admin/amenities/', AdminAmenityListView.as_view(), name='admin-amenity-list'),
    path('api/admin/amenities/<int:pk>/', AdminAmenityDetailView.as_view(), name='admin-amenity-detail'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

