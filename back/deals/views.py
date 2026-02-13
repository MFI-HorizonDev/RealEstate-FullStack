from rest_framework import generics, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from decimal import Decimal
from .models import Sale, Commission, PendingSaleRequest
from .serializers import (
    SaleSerializer, SaleCreateSerializer,
    CommissionSerializer, PendingSaleRequestSerializer
)
from listings.models import Property


class IsPropertyOwnerOrAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST':
            property_id = request.data.get('property_id')
            if property_id:
                try:
                    property_obj = Property.objects.get(pk=property_id)
                    return (request.user == property_obj.owner or
                            request.user == property_obj.agent)
                except Property.DoesNotExist:
                    return False
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if hasattr(obj, 'property'):
            return (request.user == obj.property.owner or
                    request.user == obj.property.agent)
        return False



class SaleListView(generics.ListAPIView):
    serializer_class = SaleSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsPropertyOwnerOrAgent]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Sale.objects.all()
        from django.db.models import Q
        return Sale.objects.filter(
            Q(property__owner=self.request.user) | Q(property__agent=self.request.user)
        )


class SaleCreateView(generics.CreateAPIView):
    serializer_class = SaleCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsPropertyOwnerOrAgent]

    def perform_create(self, serializer):
        with transaction.atomic():
            property_obj = serializer.validated_data.get('property_id')
            final_price = serializer.validated_data['final_price']
            buyer = serializer.validated_data.get('buyer')
            property_set_price = property_obj.total_price()
            requires_admin_approval = False
            reason_for_review = ""

            if final_price > property_set_price * Decimal('2.0'):
                requires_admin_approval = True
                reason_for_review = f"Final price ({final_price}) exceeds 2x property price ({property_set_price})"
            elif final_price < property_set_price * Decimal('0.5'):
                requires_admin_approval = True
                reason_for_review = f"Final price ({final_price}) less than 0.5x property price ({property_set_price})"

            if requires_admin_approval:
                PendingSaleRequest.objects.create(
                    property=property_obj,
                    final_price=final_price,
                    proposed_buyer=buyer,
                    reason_for_review=reason_for_review,
                    created_by=self.request.user
                )
                property_obj.status = 'UNDER_REVIEW'
                property_obj.save()
            else:
                sale_instance = serializer.save()
                property_obj.status = 'SOLD'
                property_obj.save()

                if property_obj.agent:
                    commission_rate = Decimal('5.00')
                    commission_amount = (sale_instance.final_price * commission_rate) / 100
                    Commission.objects.create(
                        sale=sale_instance,
                        agent=property_obj.agent,
                        commission_rate=commission_rate,
                        amount_calculated=commission_amount
                    )


class SaleRetrieveView(generics.RetrieveAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsPropertyOwnerOrAgent]


class SaleUpdateView(generics.UpdateAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsPropertyOwnerOrAgent]


class SaleDeleteView(generics.DestroyAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsPropertyOwnerOrAgent]


class CommissionListView(generics.ListAPIView):
    serializer_class = CommissionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Commission.objects.all()
        return Commission.objects.filter(agent=self.request.user)


class CommissionRetrieveView(generics.RetrieveAPIView):
    queryset = Commission.objects.all()
    serializer_class = CommissionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class CommissionUpdateView(generics.UpdateAPIView):
    queryset = Commission.objects.all()
    serializer_class = CommissionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class CommissionDeleteView(generics.DestroyAPIView):
    queryset = Commission.objects.all()
    serializer_class = CommissionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]



class PendingSaleRequestListView(generics.ListAPIView):
    serializer_class = PendingSaleRequestSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return PendingSaleRequest.objects.filter(status='PENDING')


class PendingSaleRequestRetrieveView(generics.RetrieveAPIView):
    queryset = PendingSaleRequest.objects.all()
    serializer_class = PendingSaleRequestSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser]


class PendingSaleRequestUpdateView(generics.UpdateAPIView):
    queryset = PendingSaleRequest.objects.all()
    serializer_class = PendingSaleRequestSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def perform_update(self, serializer):
        instance = serializer.save()

        property_obj = instance.property

        if instance.status == 'APPROVED':
            sale = Sale.objects.create(
                property=property_obj,
                date_sold=instance.created_at.date(),
                final_price=instance.final_price,
                buyer=instance.proposed_buyer,
                approval_status='APPROVED'
            )
            property_obj.status = 'SOLD'
            property_obj.save()

            if property_obj.agent:
                commission_rate = Decimal('5.00')
                commission_amount = (sale.final_price * commission_rate) / 100
                Commission.objects.create(
                    sale=sale,
                    agent=property_obj.agent,
                    commission_rate=commission_rate,
                    amount_calculated=commission_amount
                )
        elif instance.status == 'REJECTED':
            property_obj.status = 'ACTIVE'
            property_obj.save()


class AdminSaleApprovalView(generics.UpdateAPIView):
    queryset = Sale.objects.filter(approval_status='PENDING_REVIEW')
    serializer_class = SaleSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser]
