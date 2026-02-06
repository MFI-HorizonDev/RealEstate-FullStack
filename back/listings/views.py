from rest_framework import generics, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from .serializers import *

# Import custom permissions from core
from core.permissions import (
    IsOwnerGroup,
    IsOwnerOrBuyerGroup,
    IsOwner,
    IsOwnerOrAgentOrReadOnly,
    IsAdminOrAgent,  # Add this for agent permissions
    IsAdminOrAgentOrOwnerGroup,  # Add this for broader access
)


class IsOwnerOrAgentOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or assigned agents
    to edit it. Others can only read.
    For objects that have a property relationship (like Amenity, PropertyImage),
    it checks the property's owner/agent.
    Admin users have full access.
    """
    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.is_staff:
            return True

        # Read permissions for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions (PUT, PATCH) and DELETE only to the owner or assigned agent
        # For objects with property relationship
        if hasattr(obj, 'property'):
            return (obj.property.owner == request.user or
                    (hasattr(obj.property, 'agent') and obj.property.agent == request.user))
        # For objects with owner/agent relationship
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user or (hasattr(obj, 'agent') and obj.agent == request.user)
        return False


class IsOwnerOrAgent(permissions.BasePermission):
    """
    Custom permission to only allow owners or agents to access certain views.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users (staff).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff and request.user.is_authenticated


class MunicipalityListCreateView(generics.ListCreateAPIView):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'POST':
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


class MunicipalityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


class AmenityListCreateView(generics.ListCreateAPIView):
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'POST':
            permission_classes = [permissions.IsAuthenticated] 
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if 'property_id' in self.kwargs:
            return Amenity.objects.filter(property_id=self.kwargs['property_id'])
        else:
            return Amenity.objects.all()

    def perform_create(self, serializer):
        if 'property_id' in self.kwargs:
            from .models import Property
            amenity_property = Property.objects.get(pk=self.kwargs['property_id'])
            if (self.request.user == amenity_property.owner or
                (hasattr(amenity_property, 'agent') and self.request.user == amenity_property.agent)):
                serializer.save(property=amenity_property, added_by=self.request.user)
            else:
                raise permissions.PermissionDenied("You don't have permission to add amenities to this property.")
        else:
            amenity_property = serializer.validated_data.get('property')
            if amenity_property:
                if (self.request.user == amenity_property.owner or
                    (hasattr(amenity_property, 'agent') and self.request.user == amenity_property.agent)):
                    serializer.save(added_by=self.request.user)
                else:
                    raise permissions.PermissionDenied("You don't have permission to add amenities to this property.")
            else:
                serializer.save(added_by=self.request.user)


class AmenityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

    def get_queryset(self):
        if 'property_id' in self.kwargs and 'pk' in self.kwargs:
            return Amenity.objects.filter(
                property_id=self.kwargs['property_id'],
                id=self.kwargs['pk']
            )
        else:
            return Amenity.objects.filter(id=self.kwargs['pk'])


class PropertyListCreateView(generics.ListCreateAPIView):
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Property.objects.filter(status__in=['ACTIVE', 'UNDER_REVIEW'])

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PropertyCreateSerializer
        return PropertySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            permission_classes = [IsOwnerGroup]
        else:
            permission_classes = [permissions.IsAuthenticated]  
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.all()
    authentication_classes = [JWTAuthentication]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PropertyCreateSerializer
        return PropertySerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            permission_classes = [IsOwnerOrAgentOrReadOnly]  
        elif self.request.method in ['PUT', 'PATCH']:
            permission_classes = [IsOwnerOrAgentOrReadOnly]  
        else:  
            permission_classes = [permissions.IsAuthenticated]  
        return [permission() for permission in permission_classes]


class PropertyImageListCreateView(generics.ListCreateAPIView):
    serializer_class = PropertyImageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        property_id = self.kwargs['property_id']
        return PropertyImage.objects.filter(property_id=property_id)

    def perform_create(self, serializer):
        property_id = self.kwargs['property_id']
        property_instance = Property.objects.get(pk=property_id)
        if self.request.user == property_instance.owner or (
            hasattr(property_instance, 'agent') and self.request.user == property_instance.agent
        ):
            serializer.save(property_id=property_id)
        else:
            raise permissions.PermissionDenied("You don't have permission to add images to this property.")


class PropertyImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PropertyImage.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
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