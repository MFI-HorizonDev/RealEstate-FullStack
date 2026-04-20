# Real Estate Full Stack - Implementation Guide

## Overview
This document outlines all the changes made to implement permissions-based access control and image upload functionality across the Real Estate application.

---

## ✅ Backend Implementation

### 1. **UserProfile Model** (listings/models.py)
- Added `UserProfile` model with one-to-one relationship to Django User
- Supports profile images with automatic path generation
- Includes extended user information: bio, phone, address, city, state, country, zipcode
- Auto-created via Django signals when a new user is created

### 2. **User Profile Serializers** (listings/serializers.py)
Added three new serializers:
- `UserProfileSerializer`: Full profile data
- `UserProfileUpdateSerializer`: For updating profile with image validation
- `UserDetailSerializer`: Complete user info with profile and groups

### 3. **User Profile Views** (listings/views.py)
- `UserProfileView`: Retrieve and update current user profile
- `UserProfileUpdateView`: Dedicated endpoint for profile updates (PATCH)
- `UserProfileRetrieveView`: Get any user's profile by ID

### 4. **Super Admin CRUD Endpoints** (listings/views.py)
Complete admin access to all resources:
- `AdminUserListView`: List all users
- `AdminUserDetailView`: Full CRUD on users
- `AdminPropertyListView`: View all properties
- `AdminPropertyDetailView`: CRUD on properties
- `AdminMunicipalityListView`: Manage municipalities
- `AdminMunicipalityDetailView`: Full control
- `AdminAmenityListView`: View all amenities
- `AdminAmenityDetailView`: Full control

### 5. **Property Image Upload Hooks** (listings/views.py)
The existing `PropertyImage` model supports multiple images per property with:
- Automatic upload path generation
- Alt text support
- Primary image flagging
- Created timestamp

### 6. **Signals** (listings/signals.py)
Added automatic UserProfile creation:
- Creates UserProfile when User is created
- Ensures every user has a profile

### 7. **Enhanced Permissions** (core/permissions.py)
Already includes comprehensive permission classes:
- `IsSuperAdminGroup`: Super admin access
- `IsAdminGroup`: Admin access
- `IsAgentGroup`: Agent access
- `IsOwnerGroup`: Owner access
- `IsBuyerGroup`: Buyer access
- Compound permissions for multiple roles

### 8. **URL Routes** (core/urls.py)
Added new endpoints:
- Profile endpoints:
  - `api/profile/update/` - Update current user profile
  - `api/users/<id>/` - Get user profile by ID
- Admin CRUD endpoints:
  - `api/admin/users/` - User management
  - `api/admin/properties/` - Property management
  - `api/admin/municipalities/` - Municipality management
  - `api/admin/amenities/` - Amenity management

### 9. **Database Migrations**
You need to run migrations to create the new tables:
```bash
cd back
python manage.py makemigrations
python manage.py migrate
```

---

## ✅ Frontend Implementation

### 1. **Enhanced Authentication** (services/api/useAuth.js)
Updated to include:
- `isSuperAdmin()`: Check if user is super admin
- `hasRole()`: Check if user has specific role
- `hasAnyRole()`: Check if user has any of multiple roles
- `canEditProperty()`: Check if user can edit a property
- `canDeleteProperty()`: Check if user can delete a property
- Returns user groups in auth hook

### 2. **Permission Utilities** (services/permissions.js)
Helper functions for UI logic:
- `canAccessAdmin()`: Check admin access
- `canCreateListing()`: Check listing creation rights
- `canEditListing()`: Check listing edit rights
- `canDeleteListing()`: Check listing delete rights
- `canManageUsers()`: Check user management rights
- `canBookTour()`: Check tour booking rights
- `canApproveSale()`: Check sale approval rights
- `canViewCommissions()`: Check commission viewing rights
- `getUserRoleDisplay()`: Get role display name

### 3. **Permission Guard Components** (components/PermissionGuard.jsx)
Reusable components for conditional rendering:
- `<CanAccess roles="">`: Show content if user has role(s)
- `<AdminOnly>`: Show content only for super admins
- `<IfLoggedIn>`: Show content only if logged in
- `<IfNotLoggedIn>`: Show content if not logged in
- `<RoleBasedContent>`: Render different content per role

### 4. **Enhanced withAuth HOC** (hoc/withAuth.jsx)
Updated to support:
- Role-based access control with single or multiple roles
- Super admin requirement option
- Proper loading states during user fetch
- Super admin bypass for role-protected routes

### 5. **User Profile Management Hook** (services/api/useProfile.js)
New hooks for profile operations:
- `useUserProfile()`: Fetch current user profile
- `useUploadProfileImage()`: Upload profile image with validation
- `useUpdateProfile()`: Update profile information
- `useGetUserProfile()`: Fetch any user's profile
- `useAllUsers()`: List all users (admin only)
- `useUpdateUser()`: Update user (admin only)
- `useDeleteUser()`: Delete user (admin only)

### 6. **Property Image Upload Hooks** (services/api/useProperties.js)
New image management hooks:
- `useUploadPropertyImages()`: Upload multiple property images
- `useDeletePropertyImage()`: Remove property image
- `useUpdatePropertyImage()`: Update image metadata

### 7. **Enhanced Profile Page** (pages/Profile.jsx)
Complete rewrite with:
- Profile image upload with camera button
- Real-time image validation
- File size limits (5MB max)
- File type validation
- Extended profile information display
- Responsive design

---

## 🔐 User Roles & Permissions

### Available Roles:
1. **Super Admin** (`is_superuser`)
   - Full access to all resources
   - Can perform CRUD on any user, property, municipality, amenity
   - Can approve/reject sales
   - Can manage all listings

2. **Admin** (Group)
   - Can approve property listings
   - Can approve sales
   - Can view and manage users
   - Can manage municipalities and amenities

3. **Agent** (Group)
   - Can create and manage listings
   - Can book tours
   - Can view commissions
   - Can edit their own listings

4. **Owner** (Group)
   - Can create listings for their properties
   - Can book tours
   - Can upload property images
   - Can manage their own listings

5. **Buyer** (Group)
   - Can book property tours
   - Can view properties and listings
   - Read-only access to most resources

---

## 📋 Setup Instructions

### 1. **Backend Setup**

```bash
cd back

# Create migrations for new UserProfile model
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create groups if they don't exist
python manage.py shell
```

Then in the Django shell:
```python
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

# Create groups
groups = ['Super Admin', 'Admin', 'Agent', 'Owner', 'Buyer']
for group_name in groups:
    Group.objects.get_or_create(name=group_name)

exit()
```

### 2. **Frontend Setup**

No additional setup needed. The components are ready to use.

---

## 📝 Usage Examples

### Backend API Examples:

#### Upload Profile Image
```bash
curl -X PATCH http://localhost:8000/api/profile/update/ \
  -H "Authorization: Bearer <token>" \
  -F "profile_image=@image.jpg" \
  -F "bio=My bio here"
```

#### Get Current User with Profile
```bash
curl -X GET http://localhost:8000/api/me/ \
  -H "Authorization: Bearer <token>"
```

#### Admin: List All Users
```bash
curl -X GET http://localhost:8000/api/admin/users/ \
  -H "Authorization: Bearer <token>"
```

#### Admin: Update Property Status
```bash
curl -X PATCH http://localhost:8000/api/admin/properties/1/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "ACTIVE"}'
```

### Frontend Component Examples:

#### Show Content Only for Agents
```jsx
import { CanAccess } from '@/components/PermissionGuard';

<CanAccess roles="Agent">
  <button>Create Listing</button>
</CanAccess>
```

#### Admin-Only Dashboard
```jsx
import withAuth from '@/hoc/withAuth';

export default withAuth(AdminDashboard, null, true); // true = requireSuperAdmin
```

#### Check Permissions in Component
```jsx
import { useAuth } from '@/services/api/useAuth';
import { canEditListing } from '@/services/permissions';

function PropertyCard({ property }) {
  const { user } = useAuth();
  const canEdit = canEditListing(user, property.owner.id);
  
  return (
    <div>
      {canEdit && <button>Edit</button>}
    </div>
  );
}
```

#### Upload Profile Image
```jsx
import { useUploadProfileImage } from '@/services/api/useProfile';

function ProfileForm() {
  const uploadImage = useUploadProfileImage();
  
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    uploadImage.mutate(file);
  };
  
  return <input type="file" onChange={handleImageSelect} />;
}
```

---

## 🎯 Key Features Implemented

✅ **Permission-Based Access Control**
- Super admin can access/modify everything
- Role-based UI rendering
- Endpoint-level permission checks
- Frontend permission guards

✅ **Image Upload Functionality**
- Profile image upload with validation
- Property image uploads (via existing PropertyImage model)
- File type and size validation
- Automatic path generation

✅ **User Profile Management**
- Extended user profiles with bio, contact, address
- Profile image storage
- Admin user management endpoints
- User listing and filtering

✅ **Super Admin CRUD**
- Full control over all users
- Property management
- Municipality management
- Amenity management

✅ **Frontend Components**
- Permission-aware UI components
- Image upload forms
- Profile page with image upload
- Role-based navigation

---

## 🚀 Next Steps

1. **Create admin dashboard** - Use the admin CRUD endpoints
2. **Add tour booking interface** - Use existing Tour models
3. **Implement sales management** - Use existing Sale models
4. **Add notifications** - For property updates, tour bookings
5. **Create agent dashboard** - Commission tracking, listings management

---

## 📞 API Reference

### User Management
- `GET /api/me/` - Get current user profile
- `PATCH /api/profile/update/` - Update current user profile
- `GET /api/users/<id>/` - Get user profile by ID
- `GET /api/admin/users/` - List all users (admin)
- `PATCH /api/admin/users/<id>/` - Update user (admin)
- `DELETE /api/admin/users/<id>/` - Delete user (admin)

### Property Management
- `GET /api/properties/` - List active properties
- `POST /api/properties/create/` - Create property
- `GET /api/properties/<id>/` - Get property details
- `PATCH /api/properties/<id>/update/` - Update property
- `DELETE /api/properties/<id>/delete/` - Delete property
- `GET /api/admin/properties/` - List all properties (admin)
- `PATCH /api/admin/properties/<id>/` - Update property (admin)

### Property Images
- `GET /api/properties/<id>/images/` - List property images
- `POST /api/properties/<id>/images/create/` - Upload images
- `DELETE /api/images/<id>/delete/` - Delete image

### Municipalities
- `GET /api/municipalities/` - List municipalities
- `POST /api/municipalities/create/` - Create municipality (admin)
- `GET /api/admin/municipalities/` - List all (admin)
- `PATCH /api/admin/municipalities/<id>/` - Update (admin)

### Amenities
- `GET /api/properties/<id>/amenities/` - List property amenities
- `POST /api/properties/<id>/amenities/create/` - Create amenity
- `GET /api/admin/amenities/` - List all amenities (admin)
- `PATCH /api/admin/amenities/<id>/` - Update amenity (admin)

---

## 🐛 Troubleshooting

### Profile image not uploading?
- Check file size (max 5MB)
- Verify file type (JPG, PNG, GIF, WebP)
- Ensure media directory exists: `back/media/`
- Check MEDIA_URL and MEDIA_ROOT in settings.py

### Permission denied errors?
- Verify user is in correct group
- Check token is valid (not expired)
- Ensure super admin has is_superuser=True
- Review permission classes in views

### Images not persisting?
- Run migrations: `python manage.py migrate`
- Ensure Pillow is installed: `pip install Pillow`
- Check database for UserProfile entries

---

## 📚 Additional Resources

- Django Permissions: https://docs.djangoproject.com/en/5.2/topics/auth/
- Django Signals: https://docs.djangoproject.com/en/5.2/topics/signals/
- DRF Permissions: https://www.django-rest-framework.org/api-guide/permissions/
- File Uploads: https://docs.djangoproject.com/en/5.2/topics/files/
