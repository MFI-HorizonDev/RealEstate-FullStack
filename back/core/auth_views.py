from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .throttles import LoginRateThrottle


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allow login via either username or email using the default /api/token/ endpoint.
    """

    def validate(self, attrs):
        identifier = attrs.get(self.username_field)
        if identifier:
            user = get_user_model().objects.filter(email__iexact=identifier).first()
            if user:
                attrs[self.username_field] = user.get_username()

        return super().validate(attrs)


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        access_token = response.data.get("access")
        refresh_token = response.data.get("refresh")
        if access_token:
            response.set_cookie(
                settings.AUTH_COOKIE_ACCESS,
                access_token,
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )
        if refresh_token:
            response.set_cookie(
                settings.AUTH_COOKIE_REFRESH,
                refresh_token,
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path=settings.AUTH_COOKIE_REFRESH_PATH,
            )
        return response


class CookieTokenRefreshView(APIView):
    throttle_classes = [LoginRateThrottle]
    permission_classes = []
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        payload = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        if not payload.get("refresh"):
            cookie_refresh = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
            if cookie_refresh:
                payload["refresh"] = cookie_refresh

        serializer = TokenRefreshSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        response = Response(data, status=status.HTTP_200_OK)
        access_token = data.get("access")
        refresh_token = data.get("refresh")
        if access_token:
            response.set_cookie(
                settings.AUTH_COOKIE_ACCESS,
                access_token,
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )
        if refresh_token:
            response.set_cookie(
                settings.AUTH_COOKIE_REFRESH,
                refresh_token,
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path=settings.AUTH_COOKIE_REFRESH_PATH,
            )
        return response
