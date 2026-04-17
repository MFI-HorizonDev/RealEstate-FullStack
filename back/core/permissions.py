from rest_framework import permissions

class IsSuperUserOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser

class IsSuperAdminGroup(permissions.BasePermission):
    """Permission class that allows SuperAdmin group members to access all resources"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='SuperAdmin').exists()
        )

    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or request.user.groups.filter(name='SuperAdmin').exists()

class IsAdminGroupOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.groups.filter(name='Admin').exists() or
            request.user.groups.filter(name='SuperAdmin').exists()
        )

class IsAdminGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Admin').exists() or
            request.user.groups.filter(name='SuperAdmin').exists()
        )

class IsAgentGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Agent').exists() or
            request.user.groups.filter(name='SuperAdmin').exists()
        )

class IsOwnerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Owner').exists() or
            request.user.groups.filter(name='SuperAdmin').exists()
        )

class IsBuyerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Buyer').exists() or
            request.user.groups.filter(name='SuperAdmin').exists()
        )

class IsAdminOrAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Admin').exists() or
            request.user.groups.filter(name='Agent').exists() or
            request.user.groups.filter(name='SuperAdmin').exists()
        )

class IsOwnerOrBuyerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Owner').exists() or
            request.user.groups.filter(name='Buyer').exists() or
            request.user.groups.filter(name='SuperAdmin').exists()
        )

class IsAdminOrAgentOrOwnerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Admin').exists() or
            request.user.groups.filter(name='Agent').exists() or
            request.user.groups.filter(name='Owner').exists() or
            request.user.groups.filter(name='SuperAdmin').exists()
        )

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or (hasattr(obj, 'owner') and obj.owner == request.user)

class IsOwnerOrAgentOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        # Only owners and agents can modify (not admin)
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return (
                (hasattr(obj, 'owner') and obj.owner == request.user) or
                (hasattr(obj, 'agent') and obj.agent == request.user)
            )
        return False