from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from core.permissions import IsBuyerGroup
from .models import Tour
from .serializers import TourAgentActionSerializer, TourManageSerializer, TourSerializer


class TourListCreateView(generics.ListCreateAPIView):
    serializer_class = TourSerializer
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsBuyerGroup()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Tour.objects.none()

        if user.is_superuser or user.groups.filter(name__in=["Admin", "SuperAdmin", "Super Admin"]).exists():
            return Tour.objects.all()

        if user.groups.filter(name__in=["Agent", "Verified Agents"]).exists():
            return Tour.objects.filter(agent=user)

        if user.groups.filter(name="Buyer").exists():
            return Tour.objects.filter(buyer=user)

        return Tour.objects.none()

    def perform_create(self, serializer):
        prop = serializer.validated_data.get("property")
        if prop and not prop.is_available_for_tour:
            raise PermissionDenied("This property is not available for tours.")

        agent = prop.agent if prop else None
        serializer.save(
            buyer=self.request.user,
            agent=agent,
            status=Tour.STATUS_QUEUED,
        )


class TourRetrieveView(generics.RetrieveAPIView):
    serializer_class = TourSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Tour.objects.none()
        if user.is_superuser or user.groups.filter(name__in=["Admin", "SuperAdmin", "Super Admin"]).exists():
            return Tour.objects.all()
        if user.groups.filter(name__in=["Agent", "Verified Agents"]).exists():
            return Tour.objects.filter(agent=user)
        if user.groups.filter(name="Buyer").exists():
            return Tour.objects.filter(buyer=user)
        return Tour.objects.none()


class IsAgentOrAdminForTourAction(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return bool(
            request.user.is_superuser
            or request.user.groups.filter(name__in=["Agent", "Verified Agents", "Admin", "SuperAdmin", "Super Admin"]).exists()
        )

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.groups.filter(name__in=["Admin", "SuperAdmin", "Super Admin"]).exists():
            return True
        return obj.agent_id == request.user.id


class TourAgentActionView(generics.UpdateAPIView):
    queryset = Tour.objects.filter(status=Tour.STATUS_QUEUED)
    serializer_class = TourAgentActionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAgentOrAdminForTourAction]
    http_method_names = ["patch", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.is_superuser or user.groups.filter(name__in=["Admin", "SuperAdmin", "Super Admin"]).exists():
            return qs
        if user.groups.filter(name__in=["Agent", "Verified Agents"]).exists():
            return qs.filter(agent=user)
        return Tour.objects.none()


class TourManageView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TourManageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAgentOrAdminForTourAction]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        qs = Tour.objects.all()
        if user.is_superuser or user.groups.filter(name__in=["Admin", "SuperAdmin", "Super Admin"]).exists():
            return qs
        if user.groups.filter(name__in=["Agent", "Verified Agents"]).exists():
            return qs.filter(agent=user)
        return Tour.objects.none()
