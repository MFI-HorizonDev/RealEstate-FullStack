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
    # path('api/properties/', PropertyListCreateView.as_view(), name='property-list-create'),
    # path('api/properties/<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),
    # path('api/properties/<int:pk>/valuation-preview/', ValuationPreviewView.as_view(), name='property-valuation-preview'),
    # path('api/properties/<int:property_id>/images/', PropertyImageListCreateView.as_view(), name='property-image-list-create'),
    # path('api/properties/<int:property_id>/amenities/', AmenityListCreateView.as_view(), name='property-amenities-list-create'),
    # path('api/properties/<int:property_id>/amenities/<int:pk>/', AmenityDetailView.as_view(), name='property-amenity-detail'),
    # path('api/images/<int:pk>/', PropertyImageDetailView.as_view(), name='property-image-detail'),
    # path('api/amenities/<int:pk>/', AmenityDetailView.as_view(), name='amenity-detail'),
    # path('api/municipalities/', MunicipalityListCreateView.as_view(), name='municipality-list-create'),
    # path('api/municipalities/<int:pk>/', MunicipalityDetailView.as_view(), name='municipality-detail'),

    # Tours
    # path('api/properties/<int:property_id>/tours/', TourListCreateView.as_view(), name='property-tours-list-create'),
    # path('api/properties/<int:property_id>/tours/<int:pk>/', TourDetailView.as_view(), name='property-tour-detail'),
    # path('api/tours/<int:pk>/', TourDetailView.as_view(), name='tour-detail'),

    # # Deals
    # path('api/sales/', SaleListCreateView.as_view(), name='sale-list-create'),
    # path('api/sales/<int:pk>/', SaleDetailView.as_view(), name='sale-detail'),
    # path('api/commissions/', CommissionListView.as_view(), name='commission-list'),
    # path('api/commissions/<int:pk>/', CommissionDetailView.as_view(), name='commission-detail'),
    # path('api/pending-sales/', PendingSaleRequestListView.as_view(), name='pending-sale-request-list'),
    # path('api/pending-sales/<int:pk>/', PendingSaleRequestDetailView.as_view(), name='pending-sale-request-detail'),
    # path('api/admin-sales/approve/<int:pk>/', AdminSaleApprovalView.as_view(), name='admin-sale-approval'),

    # Properties
    path('api/properties/', PropertyListView.as_view(), name='property-list'),
    path('api/properties/create/', PropertyCreateView.as_view(), name='property-create'),
    path('api/properties/<int:pk>/', PropertyRetrieveView.as_view(), name='property-retrieve'),
    path('api/properties/<int:pk>/update/', PropertyUpdateView.as_view(), name='property-update'),
    path('api/properties/<int:pk>/delete/', PropertyDeleteView.as_view(), name='property-delete'),

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

    # Valuation preview for a property
    path('api/properties/<int:pk>/valuation-preview/', ValuationPreviewView.as_view(), name='property-valuation-preview'),

    # Tours
    path("api/tours/", TourListCreateView.as_view(), name="tour-list-create"),
    path("api/tours/<int:pk>/", TourRetrieveView.as_view(), name="tour-retrieve"),
    path(
        "api/tours/<int:pk>/agent-action/",
        TourAgentActionView.as_view(),
        name="tour-agent-action",
    ),

    #Sales
    path('api/sales/', SaleListView.as_view(), name='sale-list'),
    path('api/sales/create/', SaleCreateView.as_view(), name='sale-create'),
    path('api/sales/<int:pk>/', SaleRetrieveView.as_view(), name='sale-retrieve'),
    path('api/sales/<int:pk>/update/', SaleUpdateView.as_view(), name='sale-update'),
    path('api/sales/<int:pk>/delete/', SaleDeleteView.as_view(), name='sale-delete'),

    #Commissions
    path('api/commissions/', CommissionListView.as_view(), name='commission-list'),
    path('api/commissions/<int:pk>/', CommissionRetrieveView.as_view(), name='commission-retrieve'),
    path('api/commissions/<int:pk>/update/', CommissionUpdateView.as_view(), name='commission-update'),
    path('api/commissions/<int:pk>/delete/', CommissionDeleteView.as_view(), name='commission-delete'),

    #Sales Requests
    path('api/pending-sales/', PendingSaleRequestListView.as_view(), name='pending-sale-list'),
    path('api/pending-sales/<int:pk>/', PendingSaleRequestRetrieveView.as_view(), name='pending-sale-retrieve'),
    path('api/pending-sales/<int:pk>/update/', PendingSaleRequestUpdateView.as_view(), name='pending-sale-update'),

    #Admin Sale Approval
    path('api/admin-sales/approve/<int:pk>/', AdminSaleApprovalView.as_view(), name='admin-sale-approval'),

]
