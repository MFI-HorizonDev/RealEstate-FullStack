from rest_framework import generics, permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from .serializers import *
from core.permissions import *
from core.authentication import CookieJWTAuthentication
from core.throttles import RegisterRateThrottle
from .pricing import PricingEngine
from .tasks import update_all_market_buffers
from .throttles import VerifiedAgentThrottle, UnverifiedAgentThrottle
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import Group, User
from django.conf import settings
from django.shortcuts import get_object_or_404

JWTAuthentication = CookieJWTAuthentication

# Health Check
class HealthCheckView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        return Response({"status": "ok", "message": "Backend is running"})

# List all properties
class PropertyListView(generics.ListAPIView):
    serializer_class = PropertySerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = user.is_superuser or user.groups.filter(
            name__in=["Admin", "SuperAdmin", "Super Admin"]
        ).exists()

        if is_admin:
            queryset = Property.objects.filter(
                status__in=["ACTIVE", "UNDER_REVIEW", "REJECTED", "INACTIVE"]
            )
        else:
            queryset = Property.objects.filter(status="ACTIVE")

        status_param = self.request.query_params.get('status')
        if status_param and is_admin:
            queryset = queryset.filter(status=status_param)
        return queryset.order_by('-created_at')

# Create new property (agent/owner/admin only)
class PropertyCreateView(generics.CreateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertyCreateSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdminOrAgentOrOwnerGroup]
    throttle_classes = [VerifiedAgentThrottle, UnverifiedAgentThrottle]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# Retrieve property
class PropertyRetrieveView(generics.RetrieveAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

# Update property (owner/agent only)
class PropertyUpdateView(generics.UpdateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertyCreateSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

# Delete property (admin only)
class PropertyDeleteView(generics.DestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdminGroup]

# Admin-only: approve or reject a flagged listing by updating its status
class AdminPropertyStatusView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdminGroup]

    def patch(self, request, pk):
        try:
            property_obj = Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return Response({"detail": "Property not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        allowed = [s[0] for s in Property.STATUS_TYPES]
        if new_status not in allowed:
            return Response(
                {"detail": f"Invalid status. Allowed values: {allowed}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        property_obj.status = new_status
        property_obj.save(update_fields=["status"])
        return Response({"id": pk, "status": new_status}, status=status.HTTP_200_OK)


class AdminPropertyAgentAssignView(APIView):
    """
    Admin endpoint to assign, reassign, or clear a property's assigned agent.
    Accepts payload: {"agent_id": <int|null>}
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdminGroup]

    def patch(self, request, pk):
        try:
            property_obj = Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return Response({"detail": "Property not found."}, status=status.HTTP_404_NOT_FOUND)

        incoming_agent_id = request.data.get("agent_id", None)

        # Allow admin to unassign an agent explicitly
        if incoming_agent_id in [None, "", "null"]:
            property_obj.agent = None
            property_obj.save(update_fields=["agent"])
            return Response(
                {"id": pk, "agent_id": None, "detail": "Agent unassigned successfully."},
                status=status.HTTP_200_OK,
            )

        try:
            agent_id = int(incoming_agent_id)
        except (TypeError, ValueError):
            return Response(
                {"detail": "agent_id must be an integer or null."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            selected_user = User.objects.get(pk=agent_id)
        except User.DoesNotExist:
            return Response({"detail": "Selected agent user not found."}, status=status.HTTP_404_NOT_FOUND)

        is_agent_user = selected_user.groups.filter(name__in=["Agent", "Verified Agents"]).exists()
        if not is_agent_user and not selected_user.is_superuser:
            return Response(
                {"detail": "Selected user is not an Agent."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        property_obj.agent = selected_user
        property_obj.save(update_fields=["agent"])

        return Response(
            {
                "id": pk,
                "agent_id": selected_user.id,
                "agent_username": selected_user.username,
                "detail": "Agent assigned successfully.",
            },
            status=status.HTTP_200_OK,
        )


class AdminAgentListView(APIView):
    """Return only users that can be assigned as agents."""
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdminGroup]

    def get(self, request):
        agent_users = (
            User.objects.filter(groups__name__in=["Agent", "Verified Agents"])
            .distinct()
            .order_by("first_name", "last_name", "username")
        )

        data = [
            {
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}".strip() or user.username,
                "username": user.username,
            }
            for user in agent_users
        ]
        return Response(data, status=status.HTTP_200_OK)

# List all images for a property
class PropertyImageListView(generics.ListAPIView):
    serializer_class = PropertyImageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PropertyImage.objects.filter(property_id=self.kwargs['property_id'])

# Create image for a property
class PropertyImageCreateView(generics.CreateAPIView):
    serializer_class = PropertyImageCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        property_id = self.kwargs['property_id']
        property_instance = get_object_or_404(Property, pk=property_id)
        if self.request.user == property_instance.owner or (
            hasattr(property_instance, 'agent') and self.request.user == property_instance.agent
        ):
            serializer.save(property_id=property_id)
        else:
            raise permissions.PermissionDenied("You don't have permission to add images to this property.")

# Retrieve, Update, Delete each image separately
class PropertyImageRetrieveView(generics.RetrieveAPIView):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

class PropertyImageUpdateView(generics.UpdateAPIView):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

# Delete property image (admin only)
class PropertyImageDeleteView(generics.DestroyAPIView):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminGroup]

# List all municipalities
class MunicipalityListView(generics.ListAPIView):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

# Create new municipality (admin only)
class MunicipalityCreateView(generics.CreateAPIView):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminGroup]

# Retrieve a municipality
class MunicipalityRetrieveView(generics.RetrieveAPIView):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

# Update a municipality (admin only)
class MunicipalityUpdateView(generics.UpdateAPIView):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminGroup]

# Delete a municipality (admin only)
class MunicipalityDeleteView(generics.DestroyAPIView):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminGroup]

# List amenities (nested under property)
class AmenityListView(generics.ListAPIView):
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if 'property_id' in self.kwargs:
            return Amenity.objects.filter(property_id=self.kwargs['property_id'])
        return Amenity.objects.all()

# Create amenity for a property (agent/owner/admin only)
class AmenityCreateView(generics.CreateAPIView):
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminOrAgentOrOwnerGroup]

    def perform_create(self, serializer):
        if 'property_id' in self.kwargs:
            property_instance = get_object_or_404(Property, pk=self.kwargs['property_id'])
            if (self.request.user == property_instance.owner or
                (hasattr(property_instance, 'agent') and self.request.user == property_instance.agent)):
                serializer.save(property=property_instance, added_by=self.request.user)
            else:
                raise permissions.PermissionDenied("You don't have permission to add amenities to this property.")
        else:
            property_instance = serializer.validated_data.get('property')
            if property_instance:
                if (self.request.user == property_instance.owner or
                    (hasattr(property_instance, 'agent') and self.request.user == property_instance.agent)):
                    serializer.save(added_by=self.request.user)
                else:
                    raise permissions.PermissionDenied("You don't have permission to add amenities to this property.")
            else:
                serializer.save(added_by=self.request.user)

# Retrieve amenity
class AmenityRetrieveView(generics.RetrieveAPIView):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

# Update amenity
class AmenityUpdateView(generics.UpdateAPIView):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

# Delete amenity (admin only)
class AmenityDeleteView(generics.DestroyAPIView):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminGroup]

class ValuationPreviewView(generics.RetrieveAPIView):
    queryset = Property.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        property_obj = self.get_object()
        breakdown = PricingEngine().calculate_valuation(property_obj)
        return Response(breakdown)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = []
    authentication_classes = []
    throttle_classes = [RegisterRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        response = Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'groups': [group.name for group in user.groups.all()]
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
        response.set_cookie(
            settings.AUTH_COOKIE_ACCESS,
            str(refresh.access_token),
            httponly=settings.AUTH_COOKIE_HTTPONLY,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
        )
        response.set_cookie(
            settings.AUTH_COOKIE_REFRESH,
            str(refresh),
            httponly=settings.AUTH_COOKIE_HTTPONLY,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
            path=settings.AUTH_COOKIE_REFRESH_PATH,
        )
        return response


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        response = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie(settings.AUTH_COOKIE_ACCESS)
        response.delete_cookie(settings.AUTH_COOKIE_REFRESH, path=settings.AUTH_COOKIE_REFRESH_PATH)
        return response
class UserProfileView(generics.RetrieveAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        # Ensure user has a profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_superuser': user.is_superuser,
            'groups': [group.name for group in user.groups.all()],
            'profile': {
                'profile_image': profile.profile_image.url if profile.profile_image else None,
                'bio': profile.bio,
                'phone_number': profile.phone_number,
                'address': profile.address,
                'city': profile.city,
                'state': profile.state,
                'country': profile.country,
                'zipcode': profile.zipcode,
            }
        })


class UserProfileUpdateView(generics.UpdateAPIView):
    """Update user profile with image upload"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile

    def get_serializer_class(self):
        return UserProfileUpdateSerializer

    def perform_update(self, serializer):
        serializer.save()


class UserProfileRetrieveView(generics.RetrieveAPIView):
    """Retrieve user profile by user ID"""
    serializer_class = UserDetailSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    lookup_field = 'pk'


# ===== SUPER ADMIN CRUD ENDPOINTS =====

class AdminUserListView(generics.ListAPIView):
    """List all users (SuperAdmin only)"""
    serializer_class = UserDetailSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperAdminGroup]
    queryset = User.objects.all()


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a user (SuperAdmin only)"""
    serializer_class = UserDetailSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperAdminGroup]
    queryset = User.objects.all()
    lookup_field = 'pk'


class AdminPropertyListView(generics.ListAPIView):
    """List all properties regardless of status (SuperAdmin only)"""
    serializer_class = PropertySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperAdminGroup]
    queryset = Property.objects.all()


class AdminPropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete any property (SuperAdmin only)"""
    serializer_class = PropertyCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperAdminGroup]
    queryset = Property.objects.all()
    lookup_field = 'pk'


class AdminMunicipalityListView(generics.ListCreateAPIView):
    """List and create municipalities (SuperAdmin only)"""
    serializer_class = MunicipalitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperAdminGroup]
    queryset = Municipality.objects.all()


class AdminMunicipalityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a municipality (SuperAdmin only)"""
    serializer_class = MunicipalitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperAdminGroup]
    queryset = Municipality.objects.all()
    lookup_field = 'pk'


class AdminAmenityListView(generics.ListCreateAPIView):
    """List all amenities (SuperAdmin only)"""
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperAdminGroup]
    queryset = Amenity.objects.all()


class AdminAmenityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete an amenity (SuperAdmin only)"""
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperAdminGroup]
    queryset = Amenity.objects.all()
    lookup_field = 'pk'


class TriggerMarketBufferUpdateView(APIView):
    """Manually trigger the market buffer recalculation — for demo/admin use only."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminGroup]

    def post(self, request):
        result = update_all_market_buffers()
        return Response({"detail": result}, status=status.HTTP_200_OK)


class AdminRoleRequestListView(generics.ListAPIView):
    """List user role requests for admin approval workflow."""
    serializer_class = RoleRequestSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminGroup]

    def get_queryset(self):
        status_param = self.request.query_params.get("status", "PENDING")
        role_param = self.request.query_params.get("role")
        qs = UserProfile.objects.exclude(requested_role__isnull=True).exclude(requested_role="")
        if status_param:
            qs = qs.filter(role_request_status=status_param)
        if role_param:
            roles = [r.strip() for r in role_param.split(",") if r.strip()]
            if roles:
                qs = qs.filter(requested_role__in=roles)
        return qs.select_related("user").order_by("-updated_at")


class AdminRoleRequestActionView(APIView):
    """Approve or reject a requested role (Admin only)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminGroup]

    def patch(self, request, pk):
        try:
            profile = UserProfile.objects.select_related("user").get(pk=pk)
        except UserProfile.DoesNotExist:
            return Response({"detail": "Role request not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")
        if action not in ["approve", "reject"]:
            return Response({"detail": "Action must be 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)

        if not profile.requested_role:
            return Response({"detail": "No requested role to review."}, status=status.HTTP_400_BAD_REQUEST)

        if action == "approve":
            role_name = profile.requested_role
            group, _ = Group.objects.get_or_create(name=role_name)
            profile.user.groups.add(group)
            if role_name == "Agent":
                verified_group, _ = Group.objects.get_or_create(name="Verified Agents")
                profile.user.groups.add(verified_group)
            elif role_name == "Owner":
                verified_group, _ = Group.objects.get_or_create(name="Verified Owners")
                profile.user.groups.add(verified_group)
            profile.role_request_status = "APPROVED"
            profile.save(update_fields=["role_request_status", "updated_at"])
            return Response({"detail": f"Role {role_name} approved."}, status=status.HTTP_200_OK)

        profile.role_request_status = "REJECTED"
        profile.save(update_fields=["role_request_status", "updated_at"])
        return Response({"detail": "Role request rejected."}, status=status.HTTP_200_OK)

