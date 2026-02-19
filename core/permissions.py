from rest_framework import permissions

class IsAdminGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name='Admin').exists()

class IsAgentGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name='Agent').exists()

class IsOwnerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name='Owner').exists()

class IsBuyerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name='Buyer').exists()

class IsAdminOrAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.groups.filter(name='Admin').exists() or
            request.user.groups.filter(name='Agent').exists()
        )

class IsOwnerOrBuyerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.groups.filter(name='Owner').exists() or
            request.user.groups.filter(name='Buyer').exists()
        )

class IsAdminOrAgentOrOwnerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.groups.filter(name='Admin').exists() or
            request.user.groups.filter(name='Agent').exists() or
            request.user.groups.filter(name='Owner').exists()
        )

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return hasattr(obj, 'owner') and obj.owner == request.user

class IsOwnerOrAgentOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        if request.method in ['PUT', 'PATCH']:
            return (
                (hasattr(obj, 'owner') and obj.owner == request.user) or
                (hasattr(obj, 'agent') and obj.agent == request.user)
            )
        return False