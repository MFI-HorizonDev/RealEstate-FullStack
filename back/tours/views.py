from rest_framework import generics, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import PermissionDenied
from .models import Tour
from .serializers import TourSerializer, TourCreateSerializer


class IsOwnerOrAgentOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated and request.user.is_superuser:
            return True

        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        if hasattr(obj, 'property'):
            return (
                obj.property.owner == request.user or
                obj.property.agent == request.user or
                request.user.is_superuser
            )
        return False


class IsTourCreatorOrPropertyAgent(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated and request.user.is_superuser:
            return True

        if request.method in permissions.SAFE_METHODS:
            return True

        return (
            obj.agent == request.user or
            (hasattr(obj, 'property') and obj.property.agent == request.user) or
            (hasattr(obj, 'property') and obj.property.owner == request.user) or
            request.user.is_superuser
        )

class TourListView(generics.ListAPIView):
    serializer_class = TourSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tour.objects.all()


class TourCreateView(generics.CreateAPIView):
    serializer_class = TourCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        tour_property = serializer.validated_data.get('property')

        if tour_property and not tour_property.is_available_for_tour:
            raise PermissionDenied(
                "This property is not available for tours."
            )

        if tour_property and self.request.user not in [
            tour_property.owner,
            tour_property.agent
        ] and not self.request.user.is_superuser:
            raise PermissionDenied(
                "Only property owner or agent can create tours."
            )

        serializer.save(agent=self.request.user)


class TourRetrieveView(generics.RetrieveAPIView):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]

class TourUpdateView(generics.UpdateAPIView):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsTourCreatorOrPropertyAgent]


class TourDeleteView(generics.DestroyAPIView):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrAgentOrReadOnly]
