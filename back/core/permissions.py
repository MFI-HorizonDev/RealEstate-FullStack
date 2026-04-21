from rest_framework import permissions

class IsSuperUserOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser

class IsSuperAdminGroup(permissions.BasePermission):
    """Permission class that allows SuperAdmin group members to access all resources"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()

class IsAdminGroupOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Admin').exists() or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

class IsAdminGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Admin').exists() or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

class IsAgentGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Agent').exists() or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

class IsOwnerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Owner').exists() or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

class IsBuyerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Buyer').exists() or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

class IsAdminOrAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Admin').exists() or
            request.user.groups.filter(name='Agent').exists() or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

class IsOwnerOrBuyerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Owner').exists() or
            request.user.groups.filter(name='Buyer').exists() or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

class IsAdminOrAgentOrOwnerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Admin').exists() or
            request.user.groups.filter(name='Agent').exists() or
            request.user.groups.filter(name='Owner').exists() or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists() or
            (hasattr(obj, 'owner') and obj.owner == request.user)
        )

class IsOwnerOrAgentOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        # Only owners and agents can modify (unless superuser)
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            is_admin_group = request.user.groups.filter(name__in=['Admin', 'SuperAdmin', 'Super Admin']).exists()
            is_agent_group = request.user.groups.filter(name='Agent').exists()
            if is_admin_group:
                return True

            if hasattr(obj, 'property'):
                return (
                    is_agent_group or
                    (hasattr(obj.property, 'owner') and obj.property.owner == request.user) or
                    (hasattr(obj.property, 'agent') and obj.property.agent == request.user)
                )

            return (
                request.user.is_superuser or
                request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists() or
                is_agent_group or
                (hasattr(obj, 'owner') and obj.owner == request.user) or
                (hasattr(obj, 'agent') and obj.agent == request.user)
            )
        return False