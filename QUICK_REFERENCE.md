# Quick Reference Guide

## Frontend Components

### Permission Guard Components

```jsx
// Show content only if user has specific role
<CanAccess roles="Agent">
  <CreateListingButton />
</CanAccess>

// Show content only if user has any of these roles
<CanAccess roles={["Agent", "Owner"]}>
  <ManagePropertiesPanel />
</CanAccess>

// Show content only for super admins
<AdminOnly>
  <AdminDashboard />
</AdminOnly>

// Show content only if logged in
<IfLoggedIn>
  <UserDashboard />
</IfLoggedIn>

// Show content only if NOT logged in
<IfNotLoggedIn>
  <LoginButton />
</IfNotLoggedIn>
```

### Protecting Routes

```jsx
// Protect route with role requirement
import withAuth from '@/hoc/withAuth';
import AgentDashboard from '@/pages/AgentDashboard';

export default withAuth(AgentDashboard, "Agent");

// Protect route for super admin only
export default withAuth(AdminPanel, null, true); // true = requireSuperAdmin

// Protect route with multiple role options
export default withAuth(Dashboard, ["Agent", "Owner"]);
```

### Checking Permissions Programmatically

```jsx
import { useAuth } from '@/services/api/useAuth';
import { canEditListing, canDeleteListing } from '@/services/permissions';

function PropertyCard({ property }) {
  const { user } = useAuth();
  
  const canEdit = canEditListing(user, property.owner.id);
  const canDelete = canDeleteListing(user, property.owner.id);
  
  return (
    <>
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
    </>
  );
}
```

### Uploading Profile Image

```jsx
import { useUploadProfileImage } from '@/services/api/useProfile';
import { useState } from 'react';

function ProfileImageUpload() {
  const uploadImage = useUploadProfileImage();
  const [preview, setPreview] = useState(null);
  
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview
      setPreview(URL.createObjectURL(file));
      
      // Upload
      uploadImage.mutate(file, {
        onSuccess: () => {
          alert('Image uploaded!');
        },
        onError: (error) => {
          alert(`Error: ${error.message}`);
        },
      });
    }
  };
  
  return (
    <>
      <input 
        type="file" 
        accept="image/*"
        onChange={handleImageSelect}
        disabled={uploadImage.isPending}
      />
      {preview && <img src={preview} alt="Preview" className="w-32 h-32" />}
      {uploadImage.isPending && <p>Uploading...</p>}
    </>
  );
}
```

### Uploading Property Images

```jsx
import { useUploadPropertyImages } from '@/services/api/useProperties';

function PropertyImageUpload({ propertyId }) {
  const uploadImages = useUploadPropertyImages();
  
  const handleImagesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadImages.mutate({ propertyId, images: files }, {
        onSuccess: () => {
          alert(`${files.length} image(s) uploaded!`);
        },
        onError: (error) => {
          alert(`Error: ${error.message}`);
        },
      });
    }
  };
  
  return (
    <>
      <input 
        type="file"
        multiple
        accept="image/*"
        onChange={handleImagesSelect}
        disabled={uploadImages.isPending}
      />
      {uploadImages.isPending && <p>Uploading {uploadImages.variables.images.length} images...</p>}
    </>
  );
}
```

## Backend API Quick Reference

### Authentication
- `POST /api/token/` - Login (returns access & refresh tokens)
- `POST /api/register/` - Register new user
- `POST /api/token/refresh/` - Refresh access token
- `GET /api/token/verify/` - Verify token

### User Profile
- `GET /api/me/` - Get current user with profile
- `PATCH /api/profile/update/` - Update profile + image
- `GET /api/users/<id>/` - Get another user's profile

### Admin User Management
- `GET /api/admin/users/` - List all users (admin only)
- `GET /api/admin/users/<id>/` - Get user details (admin only)
- `PATCH /api/admin/users/<id>/` - Update user (admin only)
- `DELETE /api/admin/users/<id>/` - Delete user (admin only)

### Properties
- `GET /api/properties/` - List active properties
- `POST /api/properties/create/` - Create new property
- `GET /api/properties/<id>/` - Get property details
- `PATCH /api/properties/<id>/update/` - Update property
- `DELETE /api/properties/<id>/delete/` - Delete property

### Admin Property Management
- `GET /api/admin/properties/` - List all properties (admin only)
- `GET /api/admin/properties/<id>/` - Get property (admin only)
- `PATCH /api/admin/properties/<id>/` - Update property (admin only)
- `DELETE /api/admin/properties/<id>/` - Delete property (admin only)

### Property Images
- `GET /api/properties/<id>/images/` - List property images
- `POST /api/properties/<id>/images/create/` - Upload property images
- `DELETE /api/images/<id>/delete/` - Delete image

### Municipalities
- `GET /api/municipalities/` - List municipalities
- `POST /api/municipalities/create/` - Create municipality
- `GET /api/admin/municipalities/` - List all (admin only)
- `PATCH /api/admin/municipalities/<id>/` - Update (admin only)

### Amenities
- `GET /api/properties/<id>/amenities/` - List amenities
- `POST /api/properties/<id>/amenities/create/` - Create amenity
- `GET /api/admin/amenities/` - List all amenities (admin only)
- `PATCH /api/admin/amenities/<id>/` - Update amenity (admin only)

## User Roles Reference

| Role | Capabilities |
|------|-------------|
| **Super Admin** | Full access to everything, can manage all users and resources |
| **Admin** | Approve listings, approve sales, manage users, manage municipalities |
| **Agent** | Create/manage listings, book tours, view commissions |
| **Owner** | Create listings for properties, book tours, manage own listings |
| **Buyer** | Book tours, view properties, read-only access |

## Common Tasks

### Assign User to Role
```python
from django.contrib.auth.models import User, Group

user = User.objects.get(username='john')
group = Group.objects.get(name='Agent')
user.groups.add(group)
```

### Check User Permission in View
```python
from core.permissions import IsSuperAdminGroup

class MyView(generics.ListAPIView):
    permission_classes = [IsSuperAdminGroup]
```

### Upload File Size Limits
- Profile images: max 5MB
- Property images: validated by serializer
- Allowed formats: JPG, PNG, GIF, WebP

### Media File Paths
- Profile images: `/media/profiles/user_{id}/{filename}`
- Property images: `/media/propertyimg/property_{id}/{filename}`

## Debugging

### Check User Groups
```python
from django.contrib.auth.models import User

user = User.objects.get(username='john')
print(user.groups.all())  # List user's groups
print(user.is_superuser)  # Check super admin status
```

### View All Groups
```python
from django.contrib.auth.models import Group

for group in Group.objects.all():
    print(f"{group.name}: {group.user_set.count()} users")
```

### Check Token Validity
```bash
curl -X POST http://localhost:8000/api/token/verify/ \
  -H "Content-Type: application/json" \
  -d '{"token": "your_token_here"}'
```

### Test Image Upload
```bash
curl -X PATCH http://localhost:8000/api/profile/update/ \
  -H "Authorization: Bearer your_token" \
  -F "profile_image=@path/to/image.jpg" \
  -F "bio=Test bio"
```

## Performance Tips

1. Use pagination for large property lists: `?page=2`
2. Cache user profiles with staleTime in useQuery
3. Use React.memo for permission-guarded components
4. Optimize images before upload
5. Use CDN for media files in production

## Security Reminders

- Never commit tokens to version control
- Always validate file types and sizes
- Use HTTPS in production
- Implement rate limiting for API
- Keep JWT tokens short-lived
- Validate user input on both frontend and backend
