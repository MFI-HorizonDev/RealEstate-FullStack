from rest_framework import generics,permissions, status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from .serializers import *
from core.permissions import *
from .pricing import PricingEngine
from rest_framework.response import Response

# List all properties
class PropertyListView(generics.ListAPIView):
    serializer_class = PropertySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Property.objects.filter(status__in=['ACTIVE', 'UNDER_REVIEW'])
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset

# Create new property
class PropertyCreateView(generics.CreateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertyCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerGroup]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# Retrieve property
class PropertyRetrieveView(generics.RetrieveAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

# Update property
class PropertyUpdateView(generics.UpdateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertyCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

# Delete property
class PropertyDeleteView(generics.DestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

# List all images for a property
class PropertyImageListView(generics.ListAPIView):
    serializer_class = PropertyImageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PropertyImage.objects.filter(property_id=self.kwargs['property_id'])

# Create image for a property
class PropertyImageCreateView(generics.CreateAPIView):
    serializer_class = PropertyImageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        property_id = self.kwargs['property_id']
        property_instance = Property.objects.get(pk=property_id)
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

class PropertyImageDeleteView(generics.DestroyAPIView):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

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

# Create amenity for a property
class AmenityCreateView(generics.CreateAPIView):
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if 'property_id' in self.kwargs:
            property_instance = Property.objects.get(pk=self.kwargs['property_id'])
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

# Delete amenity
class AmenityDeleteView(generics.DestroyAPIView):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

class ValuationPreviewView(generics.RetrieveAPIView):
    queryset = Property.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        property_obj = self.get_object()
        breakdown = PricingEngine().calculate_valuation(property_obj)
        return Response({
            "base_price": breakdown["base_price"],
            "amenity_impact": breakdown["amenity_impact"],
            "estimated_total": breakdown["estimated_total"],
        })


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