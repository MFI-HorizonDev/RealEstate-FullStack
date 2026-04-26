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
            request.user.groups.filter(name__in=['Agent', 'Verified Agents']).exists() or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

class IsOwnerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.groups.filter(name='Owner').exists() or
            request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists()
        )

class IsOwnerOrAdminGroup(permissions.BasePermission):
    """Owner or Admin can create listings. Agents cannot."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.is_staff or
            request.user.groups.filter(name__in=['Owner', 'Admin', 'SuperAdmin', 'Super Admin']).exists()
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
            request.user.groups.filter(name__in=['Agent', 'Verified Agents']).exists() or
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
            request.user.groups.filter(name__in=['Agent', 'Verified Agents']).exists() or
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
            return (
                request.user.is_superuser or
                request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists() or
                (hasattr(obj, 'owner') and obj.owner == request.user) or
                (hasattr(obj, 'agent') and obj.agent == request.user)
            )
        return False


class IsOwnerOrAgentOrAdminGroup(permissions.BasePermission):
    """
    Object-level permission: allows the property owner, the assigned agent,
    or any Admin/SuperAdmin to perform write operations (edit, delete).
    All authenticated users can read (safe methods).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        if request.user.groups.filter(name__in=['Admin', 'SuperAdmin', 'Super Admin']).exists():
            return True
        if hasattr(obj, 'owner') and obj.owner == request.user:
            return True
        if hasattr(obj, 'agent') and obj.agent == request.user:
            return True
        return False


class IsPropertyOwnerOrSuperAdmin(permissions.BasePermission):
    """
    Write access is limited to the listing owner.
    Superusers and SuperAdmin members keep override access for system recovery.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if request.user.is_superuser:
            return True

        if request.user.groups.filter(name='Admin').exists():
            return True

        if request.user.groups.filter(name__in=['Agent', 'Verified Agents']).exists():
            property_id = view.kwargs.get('property_id')
            if property_id:
                from listings.models import Property
                try:
                    property_obj = Property.objects.get(pk=property_id)
                    return property_obj.agent == request.user
                except Property.DoesNotExist:
                    return False

        if request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists():
            return True

        # Check for property_id in URL kwargs (for Create views)
        property_id = view.kwargs.get('property_id')
        if property_id:
            from listings.models import Property
            try:
                property_obj = Property.objects.get(pk=property_id)
                return property_obj.owner == request.user or property_obj.agent == request.user
            except Property.DoesNotExist:
                return False

        return True

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        if request.user.groups.filter(name='Admin').exists():
            return True

        if request.user.groups.filter(name__in=['SuperAdmin', 'Super Admin']).exists():
            return True

        property_obj = getattr(obj, 'property', None)
        if property_obj is not None:
            if getattr(property_obj, 'owner', None) == request.user:
                return True
            if getattr(property_obj, 'agent', None) == request.user:
                return True

        owner = getattr(obj, 'owner', None)
        if owner is not None:
            return owner == request.user

        return False
