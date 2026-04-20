from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


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
