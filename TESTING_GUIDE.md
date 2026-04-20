# Testing Guide

## Manual Testing with cURL

### Setup
```bash
# Save token in variable for convenience
TOKEN="your_access_token_here"
BASE_URL="http://localhost:8000"

# Or set them from login response
TOKEN=$(curl -X POST $BASE_URL/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"your_email@example.com","password":"password"}' | grep -o '"access":"[^"]*' | grep -o '[^"]*$')
```

---

## Authentication Tests

### 1. User Registration
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "role": "Agent"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "groups": ["Agent"]
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. User Login
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Get Current User Profile
```bash
curl -X GET http://localhost:8000/api/me/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_superuser": false,
  "groups": ["Agent"],
  "profile": {
    "id": 1,
    "profile_image": null,
    "bio": null,
    "phone_number": null,
    "address": null
  }
}
```

---

## Profile Management Tests

### 1. Upload Profile Image
```bash
# Create a test image first (or use existing one)
curl -X PATCH http://localhost:8000/api/profile/update/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "profile_image=@/path/to/image.jpg" \
  -F "bio=Software developer and real estate enthusiast" \
  -F "phone_number=+1234567890"
```

**Expected Response:**
```json
{
  "id": 1,
  "profile_image": "http://localhost:8000/media/profiles/user_1/image.jpg",
  "bio": "Software developer and real estate enthusiast",
  "phone_number": "+1234567890",
  "address": null,
  "city": null
}
```

### 2. Update Profile Information (without image)
```bash
curl -X PATCH http://localhost:8000/api/profile/update/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "New bio",
    "phone_number": "+9876543210",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipcode": "10001"
  }'
```

### 3. Get Another User's Profile
```bash
curl -X GET http://localhost:8000/api/users/2/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## Property Management Tests

### 1. Create a New Property (Owner/Agent Only)
```bash
curl -X POST http://localhost:8000/api/properties/create/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "property_name": "Beautiful Modern House",
    "property_description": "A stunning 3-bedroom house with garden",
    "property_address": "123 Oak Street",
    "property_municipality": 1,
    "property_size": 250,
    "num_bedrooms": 3,
    "num_bathrooms": 2,
    "type": "SALE",
    "price": 500000,
    "is_available_for_tour": true
  }'
```

### 2. List Properties
```bash
curl -X GET http://localhost:8000/api/properties/ \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get Property Details
```bash
curl -X GET http://localhost:8000/api/properties/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Upload Property Images
```bash
# Single image
curl -X POST http://localhost:8000/api/properties/1/images/create/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/property_image.jpg" \
  -F "alt_text=Living room view" \
  -F "is_primary=true"

# Multiple images
curl -X POST http://localhost:8000/api/properties/1/images/create/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/image1.jpg" \
  -F "alt_text=Front view" \
  -F "is_primary=true"
```

### 5. List Property Images
```bash
curl -X GET http://localhost:8000/api/properties/1/images/ \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Delete Property Image
```bash
curl -X DELETE http://localhost:8000/api/images/1/delete/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## Admin Tests (Super Admin Only)

### 1. List All Users
```bash
curl -X GET http://localhost:8000/api/admin/users/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 2. Get User Details
```bash
curl -X GET http://localhost:8000/api/admin/users/2/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 3. Update User
```bash
curl -X PATCH http://localhost:8000/api/admin/users/2/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith"
  }'
```

### 4. Delete User
```bash
curl -X DELETE http://localhost:8000/api/admin/users/2/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 5. List All Properties (Admin View)
```bash
curl -X GET http://localhost:8000/api/admin/properties/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 6. Update Property Status (Admin)
```bash
curl -X PATCH http://localhost:8000/api/admin/properties/1/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "ACTIVE"}'
```

### 7. Delete Property (Admin)
```bash
curl -X DELETE http://localhost:8000/api/admin/properties/1/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Municipality Tests

### 1. List Municipalities
```bash
curl -X GET http://localhost:8000/api/municipalities/ \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Create Municipality (Admin Only)
```bash
curl -X POST http://localhost:8000/api/municipalities/create/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "municipality_name": "San Francisco",
    "price_per_sqm": 15000
  }'
```

### 3. Admin: List All Municipalities
```bash
curl -X GET http://localhost:8000/api/admin/municipalities/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 4. Admin: Update Municipality
```bash
curl -X PATCH http://localhost:8000/api/admin/municipalities/1/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price_per_sqm": 16000}'
```

---

## Amenity Tests

### 1. List Property Amenities
```bash
curl -X GET http://localhost:8000/api/properties/1/amenities/ \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Create Amenity
```bash
curl -X POST http://localhost:8000/api/properties/1/amenities/create/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Swimming Pool",
    "amenity_type": "Luxury",
    "price": 150000
  }'
```

### 3. Admin: List All Amenities
```bash
curl -X GET http://localhost:8000/api/admin/amenities/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Permission Test Scenarios

### Scenario 1: Agent Creating Listing
```bash
# Login as agent
TOKEN=$(curl -X POST $BASE_URL/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"agent@example.com","password":"pass"}' | grep -o '"access":"[^"]*' | grep -o '[^"]*$')

# Try to create property - SHOULD SUCCEED
curl -X POST http://localhost:8000/api/properties/create/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"property_name":"House","property_address":"123 St","property_municipality":1,"property_size":200,"type":"SALE"}'
```

### Scenario 2: Buyer Creating Listing
```bash
# Login as buyer
TOKEN=$(curl -X POST $BASE_URL/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"buyer@example.com","password":"pass"}' | grep -o '"access":"[^"]*' | grep -o '[^"]*$')

# Try to create property - SHOULD FAIL with 403 Forbidden
curl -X POST http://localhost:8000/api/properties/create/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"property_name":"House","property_address":"123 St","property_municipality":1,"property_size":200,"type":"SALE"}'
```

### Scenario 3: Super Admin Accessing Everything
```bash
# Login as super admin
TOKEN=$(curl -X POST $BASE_URL/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"admin"}' | grep -o '"access":"[^"]*' | grep -o '[^"]*$')

# Access admin endpoints - SHOULD ALL SUCCEED
curl -X GET http://localhost:8000/api/admin/users/ \
  -H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:8000/api/admin/properties/ \
  -H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:8000/api/admin/municipalities/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## Frontend Component Testing

### Test PermissionGuard Components
```jsx
// In your test file or component
import { CanAccess, AdminOnly } from '@/components/PermissionGuard';
import { render, screen } from '@testing-library/react';

describe('PermissionGuard', () => {
  test('Shows content for users with required role', () => {
    render(
      <CanAccess roles="Agent">
        <div>Agent Content</div>
      </CanAccess>
    );
    
    expect(screen.getByText('Agent Content')).toBeInTheDocument();
  });

  test('Hides content for users without required role', () => {
    render(
      <CanAccess roles="Admin">
        <div>Admin Only</div>
      </CanAccess>
    );
    
    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
  });
});
```

### Test withAuth HOC
```jsx
import withAuth from '@/hoc/withAuth';
import MyComponent from '@/pages/MyComponent';

// Protect with single role
const ProtectedAgent = withAuth(MyComponent, "Agent");

// Protect with multiple roles
const ProtectedManagement = withAuth(MyComponent, ["Agent", "Admin"]);

// Protect for super admin only
const AdminPanel = withAuth(MyComponent, null, true);
```

---

## Common Test Cases

| Test Case | Expected Result |
|-----------|-----------------|
| User without token accessing `/api/me/` | 401 Unauthorized |
| Buyer trying to create property | 403 Forbidden |
| Agent uploading property image | 201 Created |
| Admin listing all users | 200 OK with user list |
| User uploading invalid image format | 400 Bad Request |
| User uploading oversized image (>5MB) | 400 Bad Request |
| Super admin deleting user | 204 No Content |
| Non-owner editing property | 403 Forbidden |

---

## Performance Testing

### Test Concurrent Image Uploads
```bash
# Upload 5 images simultaneously
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/properties/1/images/create/ \
    -H "Authorization: Bearer $TOKEN" \
    -F "image=@/path/to/image$i.jpg" &
done
wait
```

### Test Pagination
```bash
# Get second page of properties
curl -X GET "http://localhost:8000/api/properties/?page=2" \
  -H "Authorization: Bearer $TOKEN"

# Check response includes pagination info
# Expected: "count", "next", "previous", "results"
```

---

## Troubleshooting Tests

### 403 Forbidden Error
- Check user is in correct group
- Verify token is valid and not expired
- Check super admin status with `/api/me/`

### 400 Bad Request
- Validate JSON syntax
- Check required fields are provided
- Verify file formats for image uploads

### File Upload Issues
- Ensure file exists at provided path
- Check file size limits (5MB max)
- Verify file is valid image format
- Check disk space available

### Token Expired
```bash
# Refresh token
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "refresh_token_here"}'
```
