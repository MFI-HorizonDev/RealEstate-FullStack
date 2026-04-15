from django.shortcuts import render


# Example: Expose a view for state transitions (for future API use)
from .models import GuardianEngine
from listings.models import Property
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.permissions import IsAdminGroup

class PropertyStateTransitionView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAdminGroup]

	def post(self, request, pk):
		property_obj = Property.objects.get(pk=pk)
		new_status = request.data.get("new_status")
		if not new_status:
			return Response({"error": "new_status required"}, status=status.HTTP_400_BAD_REQUEST)
		success = GuardianEngine.handle_state_transition(property_obj, new_status)
		if success:
			return Response({"success": True, "new_status": property_obj.status})
		return Response({"success": False, "error": "Invalid state transition"}, status=status.HTTP_400_BAD_REQUEST)
