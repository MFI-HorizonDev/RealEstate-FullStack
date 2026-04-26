# Design Document

## Real Estate Architecture and Features

---

## Overview

This design covers three parallel tracks for the RealEstate full-stack application:

- **Track 1 — Architecture Alignment**: Consolidate the duplicate API client, migrate to a feature-based frontend folder structure, formalise domain hooks, clean up the router, and reorganise backend Django apps under `apps/`.
- **Track 2 — Missing Features**: Admin analytics dashboard with charts, admin user profile viewer, property search/filter/sort, municipality detail page, delete confirmation dialog, full property CRUD, and profile edit mode.
- **Track 3 — Bug Fixes & Improvements**: Permission enforcement on property edit/delete, HTTP 400 error handling, dark mode visibility, profile update reflection, breadcrumb navigation, conditional Lot form fields, success notifications, and a CMA pricing system.

The frontend is React + Vite with Tailwind CSS v4, TanStack Query, React Router v7, and shadcn/ui (New York style). The backend is Django + DRF with Simple JWT, Pillow, and django-filter. CSS variables in `index.css` use the oklch colour space. An existing `ThemeProvider` context persists the theme preference in `localStorage` under `re-ui-theme`.

---

## Architecture

### Frontend Architecture

The current frontend has grown organically: domain hooks live under `src/hooks/api/`, a duplicate API layer exists in `src/services/api/`, pages are flat under `src/pages/`, and route guards are scattered. The target architecture is a feature-based layout:

```
front/src/
├── features/
│   ├── properties/
│   │   ├── api/          # domain API functions (call apiClient)
│   │   ├── hooks/        # TanStack Query wrappers (useGetProperties, etc.)
│   │   ├── components/   # PropertyCard, PropertyForm, DeleteConfirmDialog, etc.
│   │   └── pages/        # AllProperties, PropertyDetails, PropertyCreate, PropertyEdit
│   ├── municipalities/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── pages/        # Places, MunicipalityDetail
│   ├── profile/
│   │   ├── api/
│   │   ├── hooks/        # useGetProfile, useUpdateProfile, useUploadProfileImage
│   │   ├── components/
│   │   └── pages/        # Profile (own), ProfileView (admin read-only)
│   ├── auth/
│   │   ├── api/
│   │   ├── hooks/        # useLogin, useSignup, useCurrentUser
│   │   ├── components/
│   │   └── pages/        # Login, Signup
│   ├── admin/
│   │   ├── api/
│   │   ├── hooks/        # useAdminStats, useAdminUsers
│   │   ├── components/   # StatsCard, UserRow, etc.
│   │   └── pages/        # AdminAnalyticsDashboard, ManageUsers, ManageProperties
│   ├── agent/
│   │   └── pages/        # AgentDashboard, AgentProperties, AgentCommissions
│   ├── owner/
│   │   └── pages/        # OwnerDashboard, MyListings
│   └── deals/
│       ├── hooks/
│       └── pages/        # PendingSales, MarketUpdate
├── shared/
│   ├── api/
│   │   ├── apiClient.js  # THE single authoritative API client
│   │   └── config.js     # BASE_URL constant
│   ├── components/
│   │   ├── ui/           # shadcn/ui components (unchanged)
│   │   ├── ConfirmDialog.jsx
│   │   ├── ImageCropperModal.jsx
│   │   ├── ModeToggle.jsx
│   │   ├── UserAvatar.jsx
│   │   ├── PermissionGuard.jsx
│   │   └── PropertyImageManager.jsx
│   ├── hooks/
│   │   └── use-mobile.js
│   └── lib/
│       └── utils.js
├── layouts/
│   ├── PublicLayout.jsx
│   └── DashboardLayout.jsx
├── routes/
│   ├── router.jsx        # createBrowserRouter — all routes in one file
│   ├── ProtectedRoute.jsx
│   └── GuestOnlyRoute.jsx
├── context/
│   ├── AuthContext.jsx   # unchanged location (imported widely)
│   └── ThemeProvider.jsx # unchanged location
└── main.jsx
```

The migration is additive: new feature folders are created, existing files are moved (with import updates), and the `src/services/api/` directory is deleted once all consumers are migrated.

### Backend Architecture

The backend currently has Django apps (`listings`, `deals`, `guardian`) at the project root alongside `core/`. The target layout groups all apps under `back/apps/`:

```
back/
├── apps/
│   ├── listings/   # moved from back/listings/
│   ├── deals/      # moved from back/deals/
│   ├── tours/      # moved from back/tours/
│   └── guardian/   # moved from back/guardian/
├── core/           # unchanged — settings, urls, wsgi, asgi, celery
└── manage.py
```

`INSTALLED_APPS` entries change from `"listings"` to `"apps.listings"`, etc. All import paths in `core/urls.py` and cross-app imports are updated accordingly. Migrations are preserved in place; Django resolves them via the new app label.

### Data Flow

```
Browser
  └─► React Component
        └─► Domain Hook (TanStack Query)
              └─► Feature API module
                    └─► shared/api/apiClient.js (fetch + JWT)
                          └─► Django DRF endpoint
                                └─► Model / PricingEngine
```

---

## Components and Interfaces

### Track 1: API Client Consolidation

**`src/shared/api/apiClient.js`** — the single authoritative client. The existing `src/hooks/api/apiClient.js` is moved here. `src/services/api/apiClient.js` is deleted. All imports across the codebase are updated to point to `@/shared/api/apiClient`.

The client exposes: `apiRequest`, `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`. It also exports a `apiRequestMultipart` helper for `FormData` uploads (profile image, property images) that omits the `Content-Type` header so the browser sets the correct `multipart/form-data` boundary.

**`src/shared/api/config.js`** — exports `BASE_URL` and `API_BASE_URL`. The existing `src/hooks/api/config.js` is moved here.

### Track 1: Domain Hooks

Each feature's `hooks/` folder contains TanStack Query wrappers. Key hooks:

**Properties domain** (`src/features/properties/hooks/`):
- `useGetProperties(params)` — `useQuery(['properties', params])`
- `useGetPropertyById(id)` — `useQuery(['property', id])`
- `useCreateProperty()` — `useMutation`, invalidates `['properties']` on success
- `useUpdateProperty(id)` — `useMutation`, invalidates `['properties']` and `['property', id]`
- `useDeleteProperty()` — `useMutation`, invalidates `['properties']`

**Municipalities domain** (`src/features/municipalities/hooks/`):
- `useGetMunicipalities()` — `useQuery(['municipalities'])`
- `useGetMunicipalityById(id)` — `useQuery(['municipality', id])`

**Profile domain** (`src/features/profile/hooks/`):
- `useGetProfile()` — `useQuery(['userProfile'])`
- `useUpdateProfile()` — `useMutation`, invalidates `['userProfile']` and `['user']`
- `useUploadProfileImage()` — `useMutation`, invalidates `['userProfile']`

**Auth domain** (`src/features/auth/hooks/`):
- `useLogin()` — `useMutation`
- `useSignup()` — `useMutation`
- `useCurrentUser()` — `useQuery(['user'])`

**Admin domain** (`src/features/admin/hooks/`):
- `useAdminStats()` — `useQuery(['adminStats'])`
- `useAdminUsers()` — `useQuery(['adminUsers'])`
- `useGetUserById(id)` — `useQuery(['user', id])`

### Track 2: Admin Analytics Dashboard

**`AdminAnalyticsDashboard` page** (`src/features/admin/pages/AdminAnalyticsDashboard.jsx`):

- Calls `useAdminStats()` which hits `GET /api/admin/stats/`
- Renders four `<StatsCard>` components (total properties, under review, total users, users by role)
- Renders a `<BarChart>` (shadcn/ui `ChartContainer` + Recharts) for users-by-role breakdown
- Renders a `<PieChart>` for property status distribution
- Loading state: `<Skeleton>` components in place of each chart
- Error state: `<Alert variant="destructive">` with the error message

**Backend `AdminStatsView`** (`back/listings/views.py`):
- `GET /api/admin/stats/` — permission: `IsAdminGroup`
- Returns: `{ total_properties, properties_under_review, total_users, users_by_role: { Buyer, Agent, Owner, Admin } }`
- Computed in a single `with transaction.atomic()` block

### Track 2: Admin User Profile Viewer

**`ProfileView` page** (`src/features/profile/pages/ProfileView.jsx`):
- Accepts a `:id` URL param
- If `id === currentUser.id` → renders the editable `Profile` component
- If `id !== currentUser.id` → renders a read-only view (no edit button, no image upload, no save/cancel)
- Fetches from `GET /api/users/{id}/` via `useGetUserById(id)`

**Route**: `/profile/:id` — protected, accessible only to Admin/SuperAdmin

**Backend**: The existing `UserProfileRetrieveView` at `GET /api/users/<int:pk>/` already returns full profile data. Its permission class is updated from `IsAuthenticated` to `IsAdminGroup` to enforce the Admin-only requirement.

### Track 2: Property Search, Filter, and Sort

The `AllProperties` page gains:
- A text search `<Input>` that filters by `property_name` or `property_address` (client-side, debounced 300 ms)
- Municipality `<Select>` (already exists — keep)
- Listing type `<Tabs>` or `<Select>` (already exists — keep)
- Sort `<Select>` with options: Price ↑, Price ↓, Newest, Oldest
- All filter/sort state is synced to URL query params via `useSearchParams`
- "Clear filters" button resets all params and navigates to the base URL

The filtering and sorting logic is extracted into a pure `filterAndSortProperties(properties, filters)` function in `src/features/properties/api/filterProperties.js` so it can be unit-tested independently of React.

### Track 2: Municipality Detail Page

**`MunicipalityDetail` page** (`src/features/municipalities/pages/MunicipalityDetail.jsx`):
- Route: `/places/:id`
- Calls `useGetMunicipalityById(id)` and `useGetProperties({ municipality_id: id, status: 'ACTIVE' })`
- Displays: municipality name, price per sqm badge, property grid
- Loading: `<Skeleton>` cards
- Empty state: "No active listings in this municipality yet."

**Backend**: `PropertyListView.get_queryset()` already supports `?status=` filtering. A `municipality_id` query param filter is added using `django-filter` or a manual `filter()` call.

### Track 2: Property Delete Confirmation Dialog

**`DeletePropertyDialog`** (`src/shared/components/ConfirmDialog.jsx` — generic, or `src/features/properties/components/DeletePropertyDialog.jsx` — specific):
- Built on shadcn/ui `<Dialog>`
- Props: `propertyName`, `isOpen`, `onConfirm`, `onCancel`, `isDeleting`
- Confirm button: disabled + spinner while `isDeleting`
- On success: toast success + close dialog
- On error: toast error + keep dialog open

### Track 2: Full Property CRUD

The existing `PropertyCreate` and `PropertyEdit` pages are moved into `src/features/properties/pages/`. The forms are refactored to:
- Use `react-hook-form` + `zod` for validation (or the existing manual validation pattern — match existing style)
- Display inline field errors from HTTP 400 responses
- Show the `DeletePropertyDialog` on the detail page and listings page
- Navigate to the new property's detail page on successful creation (Req 12.6)
- Show a success modal dialog (not just a toast) on creation (Req 23)

### Track 2: Profile Edit Mode

The existing `Profile.jsx` is refactored to:
- Default to read-only display mode
- "Edit" button switches to edit mode (replaces display fields with inputs)
- "Cancel" discards changes and returns to read-only
- "Save Changes" submits via `useUpdateProfile()`, shows toast on success/error
- Profile image upload opens `ImageCropperModal` (already implemented)
- Profile image URL is always constructed as absolute: `BASE_URL + relativePath` when path is relative

### Track 3: Permission Enforcement

**Frontend**: `PropertyEdit` and `PropertyDetails` pages check `canEditProperty(user, property)` before rendering edit/delete controls. The helper:

```js
// src/features/properties/api/permissions.js
export function canEditProperty(authContext, property) {
  if (!authContext || !property) return false;
  if (authContext.isAdmin) return true;
  const userId = authContext.user?.id;
  return userId === property.owner_id || userId === property.agent_id;
}
```

If the user navigates directly to `/properties/:id/edit` without permission, `ProtectedRoute` (or an in-page check) redirects to `/properties/:id` with a toast error.

**Backend**: `PropertyDeleteView` permission class is changed from `IsAdminGroup` to `IsOwnerOrAgentOrAdminGroup` (a new permission class that checks `obj.owner == request.user OR obj.agent == request.user OR user is Admin/SuperAdmin`). `PropertyUpdateView` already uses `IsOwnerOrAgentOrReadOnly` but the object-level check is verified to include Admin.

### Track 3: HTTP 400 Error Handling

`apiClient.js` already throws errors with `error.data = errorData`. The improvement is:
- Domain hooks expose `error.data` to components
- A shared `parseFieldErrors(errorData)` utility maps DRF field error arrays to single strings
- Form components call `parseFieldErrors` and render errors next to each field
- Non-field errors (`detail`, `non_field_errors`) are shown as a toast

### Track 3: Dark Mode Visibility

All hardcoded colour classes (`text-gray-900`, `bg-white`, `border-gray-200`, etc.) are replaced with theme tokens (`text-foreground`, `bg-background`, `border-border`). The `all-properties.jsx` page is the primary offender. A systematic pass replaces hardcoded colours in all pages and components.

### Track 3: Breadcrumb Navigation

`DashboardLayout`'s `PATH_TITLES` map is extended to include every route segment. Segments that have no standalone page (e.g., `/admin`, `/agent`) are excluded from the breadcrumb link generation. Dynamic segments like `/properties/42` render as `#42` with a link to `/properties/42`.

### Track 3: Conditional Lot Form Fields

In `PropertyCreate` and `PropertyEdit`, a `useEffect` watches the `category` field. When `category === 'LOT'`, the `num_bedrooms`, `num_bathrooms`, and `building_size` fields are hidden (CSS `hidden` class or conditional render) and their values are reset to `0`. When category changes away from `LOT`, the fields are restored.

### Track 3: Success Notification (Property Creation)

After `useCreateProperty` succeeds, a modal `<Dialog>` (not a toast) is shown with:
- Property name
- "View Listing" button → navigates to `/properties/:newId`
- "OK" button → dismisses and stays on page (or navigates to owner listings)

### Track 3: CMA Pricing System

**Backend `CMAView`** (`back/listings/views.py`):
- `POST /api/properties/cma/`
- Accepts: `{ municipality_id, category, property_size, building_size?, amenities? }`
- Finds comparable properties: same municipality + same category, status ACTIVE, at least 3
- Computes price per sqm for each comparable: `price / property_size`
- Derives: `min_price_per_sqm`, `max_price_per_sqm`, `avg_price_per_sqm`
- Returns: `{ suggested_min, suggested_max, recommended_price, price_per_sqm, comparables_count, explanation, fallback: bool }`
- If fewer than 3 comparables: `fallback: true`, uses `municipality.price_per_sqm` as single-point estimate
- Permission: `IsAdminOrAgentOrOwnerGroup`

**Frontend `CMASuggestionPanel`** (`src/features/properties/components/CMASuggestionPanel.jsx`):
- Rendered inside `PropertyCreate` / `PropertyEdit` as a collapsible panel
- "Get Price Suggestion" button triggers `useCMAQuery` mutation
- Displays: price range, recommended price, price per sqm, explanation text
- "Use this price" button auto-fills the price field
- Non-blocking: user can ignore and enter a custom price

---

## Data Models

### Existing Models (unchanged)

**`Property`**: `property_name`, `property_address`, `property_municipality` (FK), `owner` (FK User), `agent` (FK User), `category` (HOUSE_AND_LOT | LOT | APARTMENT | CONDO | COMMERCIAL_SPACE), `property_size`, `building_size`, `num_bedrooms`, `num_bathrooms`, `price`, `type` (SALE | RENT), `status` (ACTIVE | UNDER_REVIEW | REJECTED | SOLD | INACTIVE), `created_at`, `updated_at`.

**`Municipality`**: `municipality_name`, `price_per_sqm`.

**`UserProfile`**: `user` (OneToOne), `profile_image`, `bio`, `phone_number`, `address`, `city`, `state`, `country`, `zipcode`, `requested_role`, `role_request_status`.

**`PropertyImage`**: `property` (FK), `image`, `alt_text`, `is_primary`.

**`Amenity`**: `property` (FK), `name`, `amenity_type` (Basic | Luxury), `price`, `added_by`.

### New Backend Endpoints (no new models required)

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/admin/stats/` | Admin/SuperAdmin | Aggregate platform statistics |
| POST | `/api/properties/cma/` | Agent/Owner/Admin | CMA price suggestion |
| GET | `/api/users/{id}/` | Admin/SuperAdmin | Full user profile (already exists, permission tightened) |

### Frontend Data Shapes

**Admin Stats response**:
```ts
{
  total_properties: number;
  properties_under_review: number;
  total_users: number;
  users_by_role: { Buyer: number; Agent: number; Owner: number; Admin: number };
}
```

**CMA response**:
```ts
{
  suggested_min: number;
  suggested_max: number;
  recommended_price: number;
  price_per_sqm: number;
  comparables_count: number;
  explanation: string;
  fallback: boolean;
}
```

**Filter state** (synced to URL params):
```ts
{
  search: string;          // ?search=
  municipality: string;    // ?municipality=
  type: 'SALE' | 'RENT' | 'all';  // ?type=
  sort: 'price_asc' | 'price_desc' | 'newest' | 'oldest';  // ?sort=
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API client always prepends BASE_URL

*For any* valid endpoint path string (e.g., `/api/properties/`), the URL constructed by `apiRequest` shall start with `BASE_URL` followed by the endpoint path.

**Validates: Requirements 1.2**

---

### Property 2: API client always attaches Authorization header

*For any* valid access token stored in localStorage, every request made by `apiRequest` shall include an `Authorization` header whose value is `Bearer <token>`.

**Validates: Requirements 1.3**

---

### Property 3: API client never swallows HTTP 400 responses

*For any* HTTP 400 response body, `apiRequest` shall throw an error whose `.data` property contains the parsed response body, and shall never resolve successfully.

**Validates: Requirements 1.4, 18.3**

---

### Property 4: Text search filter is correct

*For any* array of property objects and any non-empty search string, `filterAndSortProperties(properties, { search })` shall return only properties where `property_name` or `property_address` contains the search string (case-insensitive), and shall never include a property that does not match.

**Validates: Requirements 9.1**

---

### Property 5: Municipality filter is correct

*For any* array of property objects and any municipality ID, `filterAndSortProperties(properties, { municipality: id })` shall return only properties whose `property_municipality.id` equals the selected ID.

**Validates: Requirements 9.2**

---

### Property 6: Listing type filter is correct

*For any* array of property objects and any type in `['SALE', 'RENT']`, `filterAndSortProperties(properties, { type })` shall return only properties whose `type` field equals the selected type.

**Validates: Requirements 9.3**

---

### Property 7: Price sort invariant

*For any* array of property objects, `filterAndSortProperties(properties, { sort: 'price_asc' })` shall return a list where each element's price is greater than or equal to the previous element's price; `sort: 'price_desc'` shall return a list where each element's price is less than or equal to the previous element's price.

**Validates: Requirements 9.4**

---

### Property 8: Filter state URL round-trip

*For any* valid filter state object `{ search, municipality, type, sort }`, serialising it to URL query params and then parsing those params back shall produce an object equal to the original filter state.

**Validates: Requirements 9.8**

---

### Property 9: Profile image URL is always absolute

*For any* profile image path returned by the backend (whether relative like `/media/profiles/...` or already absolute), the `resolveProfileImageUrl(path)` function shall return a string that starts with `http` (i.e., is an absolute URL).

**Validates: Requirements 13.8, 20.3**

---

### Property 10: Permission check correctness

*For any* `authContext` object and any `property` object, `canEditProperty(authContext, property)` shall return `true` if and only if at least one of the following holds: `authContext.isAdmin === true`, `authContext.user.id === property.owner_id`, or `authContext.user.id === property.agent_id`.

**Validates: Requirements 17.1, 17.3**

---

### Property 11: Field error parser maps all fields

*For any* DRF error response body (an object mapping field names to arrays of error strings), `parseFieldErrors(errorBody)` shall return an object where every key present in the input is also present in the output, and every output value is a non-empty string.

**Validates: Requirements 18.1, 18.4**

---

### Property 12: Lot category hides structure fields

*For any* property form state where `category === 'LOT'`, the rendered form shall not contain inputs for `num_bedrooms`, `num_bathrooms`, or `building_size`.

**Validates: Requirements 22.1**

---

### Property 13: Non-Lot categories show all fields

*For any* property form state where `category` is one of `['HOUSE_AND_LOT', 'APARTMENT', 'CONDO', 'COMMERCIAL_SPACE']`, the rendered form shall contain inputs for `num_bedrooms`, `num_bathrooms`, and `building_size`.

**Validates: Requirements 22.3**

---

### Property 14: CMA recommended price is within the suggested band

*For any* CMA result returned by the backend, `recommended_price` shall be greater than or equal to `suggested_min` and less than or equal to `suggested_max`.

**Validates: Requirements 24.3**

---

### Property 15: Admin stats counts match actual data

*For any* database state with a known set of users and their group memberships, the response from `GET /api/admin/stats/` shall return `total_users` equal to the actual user count, and each value in `users_by_role` equal to the actual count of users in that group.

**Validates: Requirements 16.2**

---

## Error Handling

### Frontend Error Handling

**API errors**: `apiClient.js` throws `Error` objects with `.status` (HTTP status code) and `.data` (parsed response body). Domain hooks expose `error` from `useMutation`/`useQuery`. Components check `error.status` to distinguish 400 (validation), 403 (permission), 404 (not found), and 5xx (server error).

**HTTP 400**: `parseFieldErrors(error.data)` maps field names to human-readable strings. Each form field renders its error below the input. Non-field errors (`detail`, `non_field_errors`) are shown as a `toast.error()`.

**HTTP 403**: A `toast.error("You do not have permission to perform this action.")` is shown. The user is not redirected (they may still be on a valid page).

**HTTP 404**: The page renders an inline "Not found" message rather than crashing.

**Network errors**: `apiClient.js` catches `fetch` rejections and re-throws with a user-friendly message. Components show a generic "Something went wrong. Please try again." toast.

**Token expiry**: `apiClient.js` attempts one silent refresh. If the refresh fails, it clears tokens and dispatches `auth-changed`. `AuthContext` listens for `auth-changed` and clears the user state, causing `ProtectedRoute` to redirect to `/login`.

### Backend Error Handling

**Validation errors**: DRF serializers raise `ValidationError` which DRF converts to HTTP 400 with a field-keyed JSON body. No changes needed.

**Permission errors**: DRF permission classes return HTTP 403. The new `IsOwnerOrAgentOrAdminGroup` object-level permission returns 403 (not 404) to avoid leaking existence information.

**Not found**: DRF `generics.RetrieveAPIView` returns HTTP 404 automatically. The CMA endpoint returns a 404 with `{ "detail": "Municipality not found." }` if the provided `municipality_id` does not exist.

**CMA insufficient data**: Returns HTTP 200 with `{ fallback: true, explanation: "Fewer than 3 comparable properties found. Using municipality baseline price." }` — not an error, just a degraded result.

---

## Testing Strategy

### Unit Tests

Unit tests cover specific examples, edge cases, and pure functions:

- `filterAndSortProperties` — test each filter type with concrete examples, empty arrays, and edge cases (all properties filtered out, single property, duplicate prices for sort stability)
- `canEditProperty` — test all combinations: owner, agent, admin, unrelated user, null inputs
- `parseFieldErrors` — test DRF error shapes: single string, array of strings, nested objects, `non_field_errors`, `detail`
- `resolveProfileImageUrl` — test relative paths, absolute paths, null/undefined inputs
- `CMASuggestionPanel` — render with mock CMA data, verify price range display and "Use this price" button behaviour
- `DeletePropertyDialog` — render, simulate confirm, simulate cancel, verify loading state

### Property-Based Tests

Property-based tests use **fast-check** (JavaScript) for frontend logic and **Hypothesis** (Python) for backend logic. Each test runs a minimum of 100 iterations.

**Frontend (fast-check)**:

```
// Feature: real-estate-architecture-and-features, Property 1: API client always prepends BASE_URL
// Feature: real-estate-architecture-and-features, Property 2: API client always attaches Authorization header
// Feature: real-estate-architecture-and-features, Property 3: API client never swallows HTTP 400 responses
// Feature: real-estate-architecture-and-features, Property 4: Text search filter is correct
// Feature: real-estate-architecture-and-features, Property 5: Municipality filter is correct
// Feature: real-estate-architecture-and-features, Property 6: Listing type filter is correct
// Feature: real-estate-architecture-and-features, Property 7: Price sort invariant
// Feature: real-estate-architecture-and-features, Property 8: Filter state URL round-trip
// Feature: real-estate-architecture-and-features, Property 9: Profile image URL is always absolute
// Feature: real-estate-architecture-and-features, Property 10: Permission check correctness
// Feature: real-estate-architecture-and-features, Property 11: Field error parser maps all fields
// Feature: real-estate-architecture-and-features, Property 12: Lot category hides structure fields
// Feature: real-estate-architecture-and-features, Property 13: Non-Lot categories show all fields
// Feature: real-estate-architecture-and-features, Property 14: CMA recommended price is within the suggested band
```

**Backend (Hypothesis)**:

```python
# Feature: real-estate-architecture-and-features, Property 15: Admin stats counts match actual data
```

### Integration Tests

Integration tests verify wiring between components and the API:

- `GET /api/admin/stats/` — verify response shape, verify 403 for non-admin users
- `POST /api/properties/cma/` — verify with 3+ comparables, verify fallback with 0–2 comparables
- `GET /api/users/{id}/` — verify 404 for non-existent user, verify 403 for non-admin caller
- `PATCH /api/properties/{id}/update/` — verify 403 when caller is neither owner, agent, nor admin
- `DELETE /api/properties/{id}/delete/` — verify 403 for unrelated user, verify 204 for owner

### Smoke Tests

- Frontend folder structure: verify `src/services/api/apiClient.js` does not exist after migration
- Backend app paths: verify `python manage.py check` passes after moving apps to `apps/`
- Route coverage: verify every route in `router.jsx` has a corresponding page component that renders without crashing
