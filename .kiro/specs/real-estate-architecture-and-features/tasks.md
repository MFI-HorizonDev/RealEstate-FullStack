# Implementation Plan: Real Estate Architecture and Features

## Overview

Implementation follows the user-defined priority order: security and bug fixes first (Track 3), then architecture refactor (Track 1), then missing features (Track 2), and finally the CMA pricing system (Track 3 tail). Each task builds on the previous, ending with full integration. The frontend uses React + Vite, Tailwind CSS v4, TanStack Query, React Router v7, and shadcn/ui. The backend uses Django + DRF, Simple JWT, and django-filter.

---

## Tasks


## Track 3 (Priority 1–7): Bug Fixes & Improvements

- [ ] 1. Enforce property edit/delete permissions (security)
  - [x] 1.1 Add `IsOwnerOrAgentOrAdminGroup` object-level permission to `PropertyDeleteView`
    - In `back/listings/views.py`, change `PropertyDeleteView.permission_classes` from `[IsAdminGroup]` to `[IsOwnerOrAgentOrAdminGroup]`
    - Add `get_object()` override that calls `self.check_object_permissions(request, obj)` so the object-level check fires
    - The existing `IsOwnerOrAgentOrReadOnly` class in `back/core/permissions.py` already covers owner/agent; add a new `IsOwnerOrAgentOrAdminGroup` class that also allows Admin/SuperAdmin on DELETE
    - _Requirements: 17.5_

  - [x] 1.2 Add `canEditProperty` permission helper to the frontend
    - Create `front/src/features/properties/api/permissions.js`
    - Export `canEditProperty(authContext, property)` that returns `true` when `authContext.isAdmin`, `authContext.user.id === property.owner_id`, or `authContext.user.id === property.agent_id`
    - Export `resolveProfileImageUrl(path, baseUrl)` placeholder here or in a shared utils file (used later in task 9)
    - _Requirements: 17.1, 17.3_

  - [ ]* 1.3 Write property test for `canEditProperty`
    - **Property 10: Permission check correctness**
    - **Validates: Requirements 17.1, 17.3**
    - Use fast-check to generate arbitrary `authContext` and `property` objects and assert the function returns `true` iff at least one of the three conditions holds

  - [ ] 1.4 Enforce permissions in `PropertyDetails` and `PropertyEdit` pages
    - In `front/src/pages/Owner/Properties/PropertyDetails.jsx`, import `canEditProperty` and `useAuth`; conditionally render the edit and delete buttons only when `canEditProperty` returns `true`
    - In `front/src/pages/Owner/Properties/PropertyEdit.jsx`, add an in-page guard: if `canEditProperty` returns `false` after the property loads, redirect to `/properties/:id` and show a `toast.error` message
    - Handle HTTP 403 responses from the backend by displaying a descriptive toast error (do not crash)
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.6_

  - [ ]* 1.5 Write unit tests for permission enforcement in `PropertyDetails`
    - Render `PropertyDetails` with mock property data and mock auth contexts (owner, agent, admin, unrelated user)
    - Assert edit/delete buttons are present for owner/agent/admin and absent for unrelated user
    - _Requirements: 17.4_

- [~] 2. Handle HTTP 400 errors with field-level feedback
  - [ ] 2.1 Create `parseFieldErrors` utility
    - Create `front/src/shared/lib/parseFieldErrors.js`
    - Export `parseFieldErrors(errorData)` that maps a DRF error response object (field → string | string[]) to a flat object of field → single string
    - Handle `non_field_errors` and `detail` keys by returning them under a `_nonField` key
    - _Requirements: 18.1, 18.4_

  - [ ]* 2.2 Write property test for `parseFieldErrors`
    - **Property 11: Field error parser maps all fields**
    - **Validates: Requirements 18.1, 18.4**
    - Use fast-check to generate arbitrary DRF error bodies and assert every input key appears in the output with a non-empty string value

  - [ ] 2.3 Verify `apiClient.js` propagates HTTP 400 errors
    - Confirm `front/src/hooks/api/apiClient.js` throws with `error.data = errorData` for HTTP 400 responses (it already does — add a comment confirming this and ensure no silent swallowing)
    - _Requirements: 18.3_

  - [ ]* 2.4 Write property test for API client HTTP 400 propagation
    - **Property 3: API client never swallows HTTP 400 responses**
    - **Validates: Requirements 1.4, 18.3**
    - Mock `fetch` to return a 400 response with a JSON body; assert `apiRequest` rejects with an error whose `.data` matches the body

  - [ ] 2.5 Wire `parseFieldErrors` into `PropertyCreate` and `PropertyEdit` forms
    - In `front/src/pages/Owner/Properties/PropertyCreate.jsx` and `PropertyEdit.jsx`, catch mutation errors, call `parseFieldErrors(error.data)`, and render inline error messages below each affected field
    - Display `_nonField` errors as `toast.error()`
    - Keep the form populated with previously entered values on failure
    - _Requirements: 18.1, 18.2, 18.5, 18.6_

- [~] 3. Fix dark mode visibility across all pages
  - [ ] 3.1 Audit and replace hardcoded colour classes in property pages
    - In `front/src/pages/Owner/Properties/all-properties.jsx` (and `PropertyDetails.jsx`, `PropertyCreate.jsx`, `PropertyEdit.jsx`), replace all hardcoded Tailwind colour classes (`text-gray-*`, `bg-white`, `bg-gray-*`, `border-gray-*`, `text-black`, etc.) with theme tokens (`text-foreground`, `bg-background`, `bg-card`, `border-border`, `text-muted-foreground`, etc.)
    - _Requirements: 19.1, 19.2_

  - [ ] 3.2 Audit and replace hardcoded colour classes in shared components and other pages
    - Apply the same token replacement to `front/src/components/`, `front/src/pages/Profile.jsx`, `front/src/pages/Places.jsx`, dashboard pages, and any remaining pages that use hardcoded colours
    - Verify the `ModeToggle` component is present in both `PublicLayout` (navbar) and `DashboardLayout` (header)
    - _Requirements: 19.1, 19.2, 19.5_

  - [ ] 3.3 Verify dark mode CSS variables in `index.css`
    - Confirm `front/src/index.css` `.dark` block has a `--primary` value with sufficient chroma (already set to `oklch(0.42 0.18 265)` — verify it is not overridden elsewhere)
    - Confirm `localStorage` key `re-ui-theme` is used by `ThemeProvider` and that `"system"` preference applies `prefers-color-scheme`
    - _Requirements: 19.3, 19.6, 19.7_

- [~] 4. Fix profile update not reflecting immediately after save
  - [ ] 4.1 Update `UserProfileUpdateView` to return the full updated profile in the response body
    - In `back/listings/views.py`, override `update()` in `UserProfileUpdateView` to return the serialized updated profile using `UserProfileUpdateSerializer` (or a combined serializer) with HTTP 200
    - _Requirements: 20.4_

  - [ ] 4.2 Invalidate TanStack Query caches after profile update
    - In `front/src/pages/Profile.jsx` (or the mutation hook it uses), after a successful `PATCH /api/profile/update/`, call `queryClient.invalidateQueries(['userProfile'])` and `queryClient.invalidateQueries(['user'])`
    - After a successful profile image upload, trigger a re-fetch of profile data within 500 ms
    - If the backend returns an empty body, trigger a separate `GET /api/me/` request
    - _Requirements: 20.1, 20.2, 20.3, 20.5_

- [~] 5. Fix breadcrumb navigation correctness
  - [ ] 5.1 Extend `PATH_TITLES` in `DashboardLayout` to cover all route segments
    - In `front/src/components/layout/DashboardLayout.jsx`, add entries to the `PATH_TITLES` map for every route segment used in `router.jsx` (e.g., `audit`, `pending-sales`, `market-update`, `dashboard`, `agent`, `owner`, `buyer`, `superadmin`, `listings`, `commissions`, `bookings`, `tours`, `places`, `profile`)
    - _Requirements: 21.4_

  - [ ] 5.2 Skip non-navigable breadcrumb segments
    - Update the breadcrumb generation logic so that segments with no standalone page (e.g., role prefixes like `admin`, `agent`, `owner` that are only path prefixes) are rendered as plain text labels, not clickable links
    - For dynamic ID segments (e.g., `/properties/42`), render as `#42` with a link to the correct detail page
    - _Requirements: 21.1, 21.2, 21.3_

- [~] 6. Implement conditional Lot form fields
  - [ ] 6.1 Add category-driven field visibility to `PropertyCreate` and `PropertyEdit`
    - In `front/src/pages/Owner/Properties/PropertyCreate.jsx` and `PropertyEdit.jsx`, watch the `category` field value
    - When `category === 'LOT'`, hide (conditionally render) the `num_bedrooms`, `num_bathrooms`, and `building_size` inputs and reset their values to `0`
    - When category changes away from `'LOT'`, restore the hidden fields and clear any associated validation errors
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

  - [ ]* 6.2 Write property tests for Lot category field visibility
    - **Property 12: Lot category hides structure fields**
    - **Property 13: Non-Lot categories show all fields**
    - **Validates: Requirements 22.1, 22.3**
    - Render the form with `category = 'LOT'` and assert bedroom/bathroom/building_size inputs are absent; render with each non-Lot category and assert they are present

  - [ ] 6.3 Update `PropertyDetails` to hide Lot-irrelevant stats
    - In `front/src/pages/Owner/Properties/PropertyDetails.jsx`, conditionally hide the bedroom, bathroom, and building size stat blocks when `property.category === 'LOT'`
    - _Requirements: 22.6_

  - [ ] 6.4 Verify backend does not require structure fields for Lot category
    - In `back/listings/serializers.py` `PropertyCreateSerializer`, ensure `num_bedrooms`, `num_bathrooms`, and `building_size` are not required when `category` is `'LOT'` (they already have `default=0` on the model — confirm the serializer does not override this with `required=True`)
    - _Requirements: 22.5_

- [~] 7. Add success notification after property creation
  - [ ] 7.1 Implement `PropertyCreatedDialog` component
    - Create `front/src/pages/Owner/Properties/PropertyCreatedDialog.jsx` (or place in a shared components folder)
    - Build on shadcn/ui `<Dialog>` — props: `isOpen`, `propertyName`, `propertyId`, `onViewListing`, `onDismiss`
    - Render the property name, a "View Listing" button (navigates to `/properties/:propertyId`), and an "OK" button (dismisses and stays or navigates to owner listings)
    - _Requirements: 23.1, 23.2, 23.3, 23.4_

  - [ ] 7.2 Wire `PropertyCreatedDialog` into `PropertyCreate`
    - In `front/src/pages/Owner/Properties/PropertyCreate.jsx`, after the create mutation succeeds, store the new property ID in local state and set `dialogOpen = true`
    - Render `<PropertyCreatedDialog>` with the new property's name and ID
    - Only show the dialog on creation, not on update
    - _Requirements: 23.5, 23.6_

- [ ] 8. Checkpoint — Track 3 (priority 1–7) complete
  - Ensure all tests pass, ask the user if questions arise.


---

## Track 1 (Priority 8): Architecture Alignment

- [ ] 9. Consolidate to a single authoritative API client
  - [ ] 9.1 Create `src/shared/api/` directory with the canonical client and config
    - Create `front/src/shared/api/config.js` by moving (copying content from) `front/src/hooks/api/config.js` — export `BASE_URL` and `API_BASE_URL`
    - Create `front/src/shared/api/apiClient.js` by moving (copying content from) `front/src/hooks/api/apiClient.js` — update its import of `config` to point to `./config`
    - Add the `apiRequestMultipart` helper to `front/src/shared/api/apiClient.js` for `FormData` uploads (omits `Content-Type` header so the browser sets the multipart boundary)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 9.2 Write property tests for the canonical API client
    - **Property 1: API client always prepends BASE_URL**
    - **Property 2: API client always attaches Authorization header**
    - **Validates: Requirements 1.2, 1.3**
    - Mock `fetch`; use fast-check to generate arbitrary endpoint paths and tokens; assert the constructed URL starts with `BASE_URL` and the `Authorization` header equals `Bearer <token>`

  - [ ] 9.3 Update all imports across the frontend to use `@/shared/api/apiClient`
    - Search for all imports of `src/hooks/api/apiClient`, `src/services/api/apiClient`, `../hooks/api/apiClient`, `../../hooks/api/apiClient`, and similar patterns
    - Replace every occurrence with `@/shared/api/apiClient` (or the correct relative path)
    - Update `front/src/context/AuthContext.jsx` to import `BASE_URL` from `@/shared/api/config` instead of `@/hooks/api/config`
    - _Requirements: 1.1_

  - [ ] 9.4 Delete the duplicate API layer
    - Delete `front/src/services/api/` directory and all its contents
    - Delete `front/src/hooks/api/apiClient.js` and `front/src/hooks/api/config.js` (the originals, now superseded by `src/shared/api/`)
    - Verify no remaining imports reference the deleted paths (run a grep search)
    - _Requirements: 1.1_

- [ ] 10. Migrate to feature-based frontend folder structure
  - [ ] 10.1 Create the `src/features/` directory skeleton
    - Create the following empty index files to establish the folder structure:
      - `front/src/features/properties/api/.gitkeep`
      - `front/src/features/properties/hooks/.gitkeep`
      - `front/src/features/properties/components/.gitkeep`
      - `front/src/features/properties/pages/.gitkeep`
      - `front/src/features/municipalities/api/.gitkeep`, `hooks/`, `components/`, `pages/`
      - `front/src/features/profile/api/.gitkeep`, `hooks/`, `components/`, `pages/`
      - `front/src/features/auth/api/.gitkeep`, `hooks/`, `components/`, `pages/`
      - `front/src/features/admin/api/.gitkeep`, `hooks/`, `components/`, `pages/`
      - `front/src/features/agent/pages/.gitkeep`
      - `front/src/features/owner/pages/.gitkeep`
      - `front/src/features/deals/hooks/.gitkeep`, `pages/`
    - _Requirements: 2.1_

  - [ ] 10.2 Create `src/shared/` structure and move shared utilities
    - Move `front/src/lib/utils.js` → `front/src/shared/lib/utils.js`
    - Move `front/src/hooks/use-mobile.js` (if it exists) → `front/src/shared/hooks/use-mobile.js`
    - Move shadcn/ui components from `front/src/components/ui/` → `front/src/shared/components/ui/` (keep the folder intact)
    - Move shared components used across multiple features (e.g., `ImageCropperModal`, `ModeToggle`, `UserAvatar`) to `front/src/shared/components/`
    - Update all imports affected by these moves
    - _Requirements: 2.2, 6.4_

  - [ ] 10.3 Create `src/layouts/` and `src/routes/` directories
    - Move `front/src/components/layout/PublicLayout.jsx` → `front/src/layouts/PublicLayout.jsx`
    - Move `front/src/components/layout/DashboardLayout.jsx` → `front/src/layouts/DashboardLayout.jsx`
    - Move `front/src/Router/router.jsx` → `front/src/routes/router.jsx`
    - Move `front/src/Router/ProtectedRoute.jsx` → `front/src/routes/ProtectedRoute.jsx`
    - Move `front/src/Router/GuestOnlyRoute.jsx` → `front/src/routes/GuestOnlyRoute.jsx`
    - Update all imports in `front/src/main.jsx` and any other files that reference these paths
    - _Requirements: 2.3, 2.4_

  - [ ] 10.4 Move property pages and components into `src/features/properties/`
    - Move `front/src/pages/Owner/Properties/all-properties.jsx` → `front/src/features/properties/pages/AllProperties.jsx`
    - Move `front/src/pages/Owner/Properties/PropertyDetails.jsx` → `front/src/features/properties/pages/PropertyDetails.jsx`
    - Move `front/src/pages/Owner/Properties/PropertyCreate.jsx` → `front/src/features/properties/pages/PropertyCreate.jsx`
    - Move `front/src/pages/Owner/Properties/PropertyEdit.jsx` → `front/src/features/properties/pages/PropertyEdit.jsx`
    - Move any property-specific components (cards, forms) to `front/src/features/properties/components/`
    - Update all imports in `front/src/routes/router.jsx` and any other consumers
    - _Requirements: 2.1, 2.5_

  - [ ] 10.5 Move remaining pages into their feature folders
    - Move `front/src/pages/Places.jsx` → `front/src/features/municipalities/pages/Places.jsx`
    - Move `front/src/pages/Profile.jsx` → `front/src/features/profile/pages/Profile.jsx`
    - Move `front/src/login/login.jsx` → `front/src/features/auth/pages/Login.jsx`
    - Move `front/src/login/signup.jsx` → `front/src/features/auth/pages/Signup.jsx`
    - Move admin pages (`AdminAuditDashboard`, `PendingSales`, `MarketUpdate`) → `front/src/features/admin/pages/`
    - Move agent pages (`AgentDashboard`, `AgentProperties`, `AgentCommissions`) → `front/src/features/agent/pages/`
    - Move owner pages (`OwnerDashboard`, `MyListings`) → `front/src/features/owner/pages/`
    - Move buyer pages (`BuyerDashboard`) → `front/src/features/buyer/pages/`
    - Move SuperAdmin pages (`ManageUsers`, `ManageProperties`) → `front/src/features/admin/pages/`
    - Update all imports in `front/src/routes/router.jsx`
    - _Requirements: 2.1, 2.5_

- [ ] 11. Create domain hooks with TanStack Query
  - [ ] 11.1 Create properties domain API module and hooks
    - Create `front/src/features/properties/api/propertiesApi.js` with functions: `fetchProperties(params)`, `fetchPropertyById(id)`, `createProperty(data)`, `updateProperty(id, data)`, `deleteProperty(id)` — each calls `apiGet`/`apiPost`/`apiPatch`/`apiDelete` from `@/shared/api/apiClient`
    - Create `front/src/features/properties/hooks/useProperties.js` exporting: `useGetProperties(params)`, `useGetPropertyById(id)`, `useCreateProperty()`, `useUpdateProperty()`, `useDeleteProperty()`
    - Each query hook uses a stable `queryKey`; each mutation hook invalidates `['properties']` (and `['property', id]` for update) on success
    - _Requirements: 3.1, 3.5, 3.6, 3.7_

  - [ ] 11.2 Create municipalities domain API module and hooks
    - Create `front/src/features/municipalities/api/municipalitiesApi.js` with `fetchMunicipalities()` and `fetchMunicipalityById(id)`
    - Create `front/src/features/municipalities/hooks/useMunicipalities.js` exporting `useGetMunicipalities()` and `useGetMunicipalityById(id)`
    - _Requirements: 3.2, 3.5_

  - [ ] 11.3 Create profile domain API module and hooks
    - Create `front/src/features/profile/api/profileApi.js` with `fetchProfile()`, `updateProfile(data)`, `uploadProfileImage(formData)`
    - Create `front/src/features/profile/hooks/useProfile.js` exporting `useGetProfile()`, `useUpdateProfile()`, `useUploadProfileImage()`
    - `useUpdateProfile` invalidates `['userProfile']` and `['user']` on success
    - _Requirements: 3.3, 3.6_

  - [ ] 11.4 Create auth domain API module and hooks
    - Create `front/src/features/auth/api/authApi.js` with `login(credentials)`, `signup(data)`, `fetchCurrentUser()`
    - Create `front/src/features/auth/hooks/useAuth.js` exporting `useLogin()`, `useSignup()`, `useCurrentUser()`
    - _Requirements: 3.4, 3.5_

  - [ ] 11.5 Create admin domain API module and hooks
    - Create `front/src/features/admin/api/adminApi.js` with `fetchAdminStats()`, `fetchAdminUsers()`, `fetchUserById(id)`
    - Create `front/src/features/admin/hooks/useAdmin.js` exporting `useAdminStats()`, `useAdminUsers()`, `useGetUserById(id)`
    - _Requirements: 3.5_

  - [ ] 11.6 Refactor existing pages to use domain hooks instead of direct API calls
    - Update `AllProperties`, `PropertyDetails`, `PropertyCreate`, `PropertyEdit`, `Profile`, `Places`, and dashboard pages to import and use the new domain hooks
    - Remove any remaining direct calls to `apiGet`, `apiPost`, `apiPatch`, `apiDelete` from inside React components
    - _Requirements: 3.7_

- [ ] 12. Clean up the router configuration
  - [ ] 12.1 Consolidate duplicate routes and add missing guards
    - In `front/src/routes/router.jsx`, remove duplicate route definitions (e.g., `admin/audit-dashboard` and `dashboard/audit` that render the same page — keep one canonical path)
    - Ensure every authenticated route is wrapped in `<ProtectedRoute>`
    - Ensure login and signup routes are wrapped in `<GuestOnlyRoute>`
    - Add a catch-all `*` route that renders the `Notfound` page (already exists — verify it is last)
    - When `isLoading` is `true`, `ProtectedRoute` renders a loading spinner rather than redirecting
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 15.5_

  - [ ] 12.2 Add role-based redirect to `ProtectedRoute`
    - In `front/src/routes/ProtectedRoute.jsx`, when a user without the required role accesses a role-restricted route, redirect to `/` (home page)
    - _Requirements: 4.4_

- [ ] 13. Reorganise backend Django apps under `back/apps/`
  - [ ] 13.1 Create `back/apps/` directory and move app packages
    - Create `back/apps/__init__.py`
    - Move `back/listings/` → `back/apps/listings/`
    - Move `back/deals/` → `back/apps/deals/`
    - Move `back/guardian/` → `back/apps/guardian/`
    - Move `back/tours/` (if it exists at root) → `back/apps/tours/`
    - _Requirements: 5.1_

  - [ ] 13.2 Update `INSTALLED_APPS` and all import paths
    - In `back/core/settings.py`, change `"listings"` → `"apps.listings"`, `"deals"` → `"apps.deals"`, `"guardian"` → `"apps.guardian"`, `"tours"` → `"apps.tours"`
    - In `back/core/urls.py`, update `from listings.views import *` → `from apps.listings.views import *`, and similarly for `tours` and `deals`
    - Update `back/core/authentication.py` if it imports from `listings`
    - Update any cross-app imports (e.g., `tours/serializers.py` importing from `listings`)
    - Update each app's `apps.py` `name` attribute (e.g., `name = "apps.listings"`)
    - _Requirements: 5.2, 5.3_

  - [ ] 13.3 Verify the backend starts without errors after the move
    - Run `python manage.py check` from `back/` to confirm no import errors or missing app configs
    - Run `python manage.py migrate --run-syncdb` to confirm migrations resolve correctly under the new app paths
    - _Requirements: 5.3, 5.4_

- [ ] 14. Checkpoint — Track 1 architecture refactor complete
  - Ensure all tests pass and `python manage.py check` passes. Ask the user if questions arise.


---

## Track 2 (Priority 9): Missing Features

- [~] 15. Implement backend statistics endpoint for Admin Dashboard
  - [ ] 15.1 Add `AdminStatsView` to `back/listings/views.py`
    - Create `AdminStatsView(APIView)` with `permission_classes = [IsAdminGroup]`
    - In a single `transaction.atomic()` block, compute: `total_properties`, `properties_under_review`, `total_users`, and `users_by_role` (query `Group` membership for Buyer, Agent, Owner, Admin)
    - Register the endpoint at `GET /api/admin/stats/` in `back/core/urls.py`
    - Return HTTP 403 for non-Admin/SuperAdmin callers
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ]* 15.2 Write Hypothesis property test for admin stats endpoint
    - **Property 15: Admin stats counts match actual data**
    - **Validates: Requirements 16.2**
    - Use Hypothesis to generate a database state with known user/group counts; call the endpoint and assert the response values match the actual counts

- [~] 16. Implement Admin Analytics Dashboard page
  - [ ] 16.1 Create `AdminAnalyticsDashboard` page component
    - Create `front/src/features/admin/pages/AdminAnalyticsDashboard.jsx`
    - Call `useAdminStats()` (from task 11.5) to fetch `GET /api/admin/stats/`
    - Render four `<StatsCard>` components: total properties, under review, total users, users by role
    - Render a `<BarChart>` (shadcn/ui `ChartContainer` + Recharts) for users-by-role breakdown
    - Render a `<PieChart>` for property status distribution
    - Loading state: `<Skeleton>` components in place of each chart
    - Error state: `<Alert variant="destructive">` with the error message
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 16.2 Add `AdminAnalyticsDashboard` route and protect it
    - In `front/src/routes/router.jsx`, add route `/admin/analytics` (or replace the existing audit dashboard route) that renders `<AdminAnalyticsDashboard>` wrapped in `ProtectedRoute` with Admin/SuperAdmin guard
    - _Requirements: 7.5_

- [~] 17. Implement Admin User Profile Viewer
  - [ ] 17.1 Tighten `UserProfileRetrieveView` permission to Admin-only
    - In `back/listings/views.py`, change `UserProfileRetrieveView.permission_classes` from `[permissions.IsAuthenticated]` to `[IsAdminGroup]`
    - Verify the view returns HTTP 404 for non-existent users (DRF `RetrieveAPIView` handles this automatically)
    - _Requirements: 8.5, 8.6_

  - [ ] 17.2 Create `ProfileView` read-only page for Admin
    - Create `front/src/features/profile/pages/ProfileView.jsx`
    - Accept `:id` URL param; fetch target user data via `useGetUserById(id)` (from task 11.5)
    - If `id === currentUser.id`, render the editable `Profile` component
    - If `id !== currentUser.id`, render a read-only view: display all profile fields but omit the edit button, image upload button, and save/cancel buttons
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 14.1, 14.2, 14.3_

  - [ ] 17.3 Add "View Profile" action to the user list and register the route
    - In `front/src/features/admin/pages/ManageUsers.jsx` (or `front/src/pages/SuperAdmin/ManageUsers.jsx`), add a "View Profile" button/link per user row that navigates to `/profile/:id`
    - In `front/src/routes/router.jsx`, add route `/profile/:id` protected to Admin/SuperAdmin only; render `<ProfileView>`
    - _Requirements: 8.1, 8.2, 14.4_

- [~] 18. Implement property search, filter, and sort
  - [ ] 18.1 Create `filterAndSortProperties` pure function
    - Create `front/src/features/properties/api/filterProperties.js`
    - Export `filterAndSortProperties(properties, filters)` where `filters = { search, municipality, type, sort }`
    - `search`: case-insensitive substring match on `property_name` or `property_address`
    - `municipality`: exact match on `property_municipality.id`
    - `type`: exact match on `type` field (`'SALE'` | `'RENT'`)
    - `sort`: `'price_asc'` | `'price_desc'` | `'newest'` | `'oldest'`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 18.2 Write property tests for `filterAndSortProperties`
    - **Property 4: Text search filter is correct**
    - **Property 5: Municipality filter is correct**
    - **Property 6: Listing type filter is correct**
    - **Property 7: Price sort invariant**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
    - Use fast-check to generate arbitrary property arrays and filter inputs; assert each filter returns only matching properties and sort produces a monotone sequence

  - [ ] 18.3 Add filter/sort UI controls to `AllProperties` page
    - In `front/src/features/properties/pages/AllProperties.jsx`, add:
      - A debounced (300 ms) text `<Input>` for search
      - A municipality `<Select>` dropdown
      - A listing type `<Select>` or `<Tabs>` (For Sale / For Rent / All)
      - A sort `<Select>` (Price ↑, Price ↓, Newest, Oldest)
    - Sync all filter/sort state to URL query params via `useSearchParams`
    - Call `filterAndSortProperties` on the fetched property list with the active filter state
    - Show an empty-state message and "Clear filters" button when no results match
    - "Clear filters" resets all params and navigates to the base URL
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ]* 18.4 Write property test for filter state URL round-trip
    - **Property 8: Filter state URL round-trip**
    - **Validates: Requirements 9.8**
    - Use fast-check to generate arbitrary filter state objects; serialise to URL params and parse back; assert the result equals the original

  - [ ] 18.5 Add `municipality_id` filter support to `PropertyListView`
    - In `back/listings/views.py` `PropertyListView.get_queryset()`, add handling for `?municipality_id=` query param: `queryset.filter(property_municipality_id=municipality_id)`
    - _Requirements: 10.5_

- [~] 19. Implement Municipality Detail page
  - [ ] 19.1 Create `MunicipalityDetail` page component
    - Create `front/src/features/municipalities/pages/MunicipalityDetail.jsx`
    - Accept `:id` URL param; call `useGetMunicipalityById(id)` and `useGetProperties({ municipality_id: id, status: 'ACTIVE' })`
    - Display: municipality name, price per sqm badge, and a grid of property cards
    - Loading state: `<Skeleton>` cards
    - Empty state: "No active listings in this municipality yet."
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 19.2 Register `/places/:id` route and link from Places page
    - In `front/src/routes/router.jsx`, add route `/places/:id` that renders `<MunicipalityDetail>` (protected, authenticated)
    - In `front/src/features/municipalities/pages/Places.jsx`, make each municipality card/row navigate to `/places/:id`
    - _Requirements: 10.1, 10.6_

- [~] 20. Implement Property Delete Confirmation Dialog
  - [ ] 20.1 Create `DeletePropertyDialog` component
    - Create `front/src/features/properties/components/DeletePropertyDialog.jsx`
    - Build on shadcn/ui `<Dialog>` — props: `propertyName`, `isOpen`, `onConfirm`, `onCancel`, `isDeleting`
    - Display the property name and an irreversibility warning
    - Confirm button: disabled + spinner while `isDeleting`
    - _Requirements: 11.1, 11.2, 11.5, 11.8_

  - [ ] 20.2 Wire `DeletePropertyDialog` into `PropertyDetails` and `MyListings`
    - In `front/src/features/properties/pages/PropertyDetails.jsx`, replace any direct delete calls with the dialog flow: open dialog → confirm → call `useDeleteProperty()` mutation → on success show toast + remove from list; on error show toast + keep dialog open
    - Apply the same pattern in `front/src/features/owner/pages/MyListings.jsx`
    - Only render the delete button when `canEditProperty` returns `true`
    - _Requirements: 11.1, 11.3, 11.4, 11.6, 11.7, 12.5, 17.4_

- [~] 21. Complete full property CRUD for authorised users
  - [ ] 21.1 Validate required fields in `PropertyCreate` and `PropertyEdit`
    - Ensure `PropertyCreate` and `PropertyEdit` validate that name, address, municipality, category, property_size, and type are present before submitting
    - Display inline validation errors next to each missing field
    - On successful creation, navigate to the new property's detail page (in addition to showing the `PropertyCreatedDialog` from task 7)
    - On successful update, show a toast success message and reflect updated data without a full page reload (invalidate `['property', id]` and `['properties']`)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.6, 12.7_

- [~] 22. Implement Profile edit mode
  - [ ] 22.1 Refactor `Profile.jsx` to support read-only and edit modes
    - In `front/src/features/profile/pages/Profile.jsx`, default to read-only display mode showing: full name, username, email, role badges, profile image, bio, phone number, and address fields
    - "Edit" button switches to edit mode: replace display fields with inputs/textareas for email, bio, phone, address, city, state, country, zipcode
    - "Cancel" discards changes and returns to read-only
    - "Save Changes" calls `useUpdateProfile()`, shows toast on success/error; disables button and shows spinner while in progress
    - Profile image upload opens `ImageCropperModal`, validates file ≤ 5 MB and supported type, shows loading indicator during upload
    - Construct profile image URL as absolute: `BASE_URL + relativePath` when path is relative
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

  - [ ]* 22.2 Write property test for `resolveProfileImageUrl`
    - **Property 9: Profile image URL is always absolute**
    - **Validates: Requirements 13.8, 20.3**
    - Use fast-check to generate arbitrary path strings (relative and absolute); assert `resolveProfileImageUrl(path)` always returns a string starting with `http`

- [ ] 23. Checkpoint — Track 2 missing features complete
  - Ensure all tests pass, ask the user if questions arise.


---

## Track 3 (Priority 10): CMA Pricing System

- [~] 24. Implement backend CMA endpoint
  - [ ] 24.1 Create `CMAView` in `back/listings/views.py`
    - Add `CMAView(APIView)` with `permission_classes = [IsAdminOrAgentOrOwnerGroup]`
    - Accept `POST /api/properties/cma/` with body: `{ municipality_id, category, property_size, building_size?, amenities? }`
    - Query comparable properties: same `property_municipality_id` + same `category`, `status='ACTIVE'`, at least 3
    - For each comparable, compute `price_per_sqm = price / property_size`
    - Derive `min_price_per_sqm`, `max_price_per_sqm`, `avg_price_per_sqm`
    - Multiply by subject `property_size` to get `suggested_min`, `suggested_max`, `recommended_price`
    - If fewer than 3 comparables: set `fallback=True`, use `municipality.price_per_sqm` as single-point estimate
    - Return: `{ suggested_min, suggested_max, recommended_price, price_per_sqm, comparables_count, explanation, fallback }`
    - Return HTTP 404 with `{ "detail": "Municipality not found." }` if `municipality_id` does not exist
    - Register at `POST /api/properties/cma/` in `back/core/urls.py`
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.7_

  - [ ]* 24.2 Write Hypothesis property test for CMA recommended price band
    - **Property 14: CMA recommended price is within the suggested band**
    - **Validates: Requirements 24.3**
    - Use Hypothesis to generate valid CMA inputs with 3+ comparable properties; call the view logic directly and assert `suggested_min <= recommended_price <= suggested_max`

- [~] 25. Implement frontend CMA Suggestion Panel
  - [ ] 25.1 Create `CMASuggestionPanel` component
    - Create `front/src/features/properties/components/CMASuggestionPanel.jsx`
    - Props: `municipalityId`, `category`, `propertySize`, `onUsePrice(price)`
    - "Get Price Suggestion" button triggers a `useMutation` that calls `POST /api/properties/cma/`
    - Display: price range (low–high), recommended price, price per sqm, explanation text
    - If `fallback=true`, display a notice that insufficient comparable data was found
    - "Use this price" button calls `onUsePrice(recommended_price)` to auto-fill the price field
    - Non-blocking: user can ignore the panel and enter a custom price
    - Loading state: spinner inside the panel
    - _Requirements: 24.1, 24.4, 24.5, 24.8, 24.9_

  - [ ] 25.2 Embed `CMASuggestionPanel` in `PropertyCreate` and `PropertyEdit`
    - In `front/src/features/properties/pages/PropertyCreate.jsx` and `PropertyEdit.jsx`, render `<CMASuggestionPanel>` as a collapsible panel below the price field
    - Pass the current `municipalityId`, `category`, and `propertySize` values from the form state
    - Wire `onUsePrice` to set the price field value
    - _Requirements: 24.1, 24.8, 24.9_

- [ ] 26. Final checkpoint — all tracks complete
  - Ensure all tests pass (frontend and backend). Run `python manage.py check` to verify backend integrity. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 8, 14, 23, and 26 ensure incremental validation
- Property tests use **fast-check** (frontend) and **Hypothesis** (backend)
- Unit tests validate specific examples and edge cases
- The implementation order follows the user-defined priority: security → bug fixes → architecture → features → CMA
