# Requirements Document

## Introduction

This spec covers three parallel tracks for the RealEstate web application — a full-stack platform built with React + Vite (frontend) and Django + DRF (backend).

**Track 1 — Architecture Alignment:** The existing codebase has grown organically and contains structural inconsistencies: duplicate API clients in `src/services/api/` and `src/hooks/api/`, flat page organisation that mixes role-specific and shared concerns, scattered route guards, and backend apps living at the project root rather than under a grouped `apps/` folder. This track defines what the system's structure must look like after the refactor.

**Track 2 — Missing Features:** Several real estate capabilities described in the product checklist are absent or incomplete: an Admin analytics dashboard with charts, the ability for Admins to view any user's profile, text search and sort controls on the Properties page, a Municipality detail page that lists its properties, delete confirmation dialogs for property CRUD, and a fully functional Profile edit mode.

**Track 3 — Bug Fixes & Improvements:** A prioritised list of known issues and improvements: user permission enforcement on property editing, HTTP 400 error handling, dark mode visibility across all pages, profile update reflection, breadcrumb navigation correctness, conditional property form fields for the Lot category, success notifications, and a Comparable Market Analysis pricing system.

All tracks are expressed as requirements — what the system must do or be — not as implementation instructions.

---

## Glossary

- **System**: The RealEstate web application as a whole (frontend + backend).
- **Frontend**: The React + Vite single-page application served to the browser.
- **Backend**: The Django + DRF API server.
- **Router**: The single `createBrowserRouter` configuration file at `src/Router/router.jsx`.
- **ProtectedRoute**: A route guard component that redirects unauthenticated users to `/login`.
- **GuestOnlyRoute**: A route guard component that redirects already-authenticated users away from auth pages.
- **Feature_Module**: A self-contained folder under `src/features/{domain}/` containing `components/`, `hooks/`, `api/`, and `pages/` sub-folders for one domain.
- **Shared_Module**: The `src/shared/` folder containing components, hooks, and utilities reused across Feature_Modules.
- **API_Client**: The single authoritative HTTP utility at `src/shared/api/apiClient.js` that attaches the `Authorization: Bearer` header and handles token refresh.
- **Domain_Hook**: A TanStack Query `useQuery` or `useMutation` wrapper scoped to one data domain (e.g., `useGetProperties`, `useCreateProperty`).
- **Admin**: A user whose Django group includes `"Admin"`.
- **SuperAdmin**: A user whose `is_superuser` flag is `true`.
- **Agent**: A user whose Django group includes `"Agent"`.
- **Owner**: A user whose Django group includes `"Owner"`.
- **Buyer**: A user whose Django group includes `"Buyer"`.
- **Property**: A real estate listing stored in the `listings_property` table with fields: name, address, municipality, category, size, price, type (SALE/RENT), status (ACTIVE/UNDER_REVIEW/REJECTED/SOLD/INACTIVE).
- **Municipality**: A geographic area record with `municipality_name` and `price_per_sqm`.
- **UserProfile**: The extended profile record linked one-to-one to a Django `User`, containing bio, phone, address, city, state, country, zipcode, and profile image.
- **Admin_Dashboard**: A dedicated dashboard page accessible only to Admin and SuperAdmin users showing platform analytics.
- **Confirmation_Dialog**: A modal dialog that requires explicit user confirmation before executing a destructive action.
- **BASE_URL**: The environment-scoped constant that holds the API origin (e.g., `http://localhost:8000`).
- **Lot_Property**: A Property whose `category` field is set to `"LOT"` — a land-only listing with no structure.
- **CMA**: Comparable Market Analysis — a pricing method that derives a suggested price range by comparing a subject property against at least three recently listed similar properties in the same municipality.
- **Theme_Token**: A CSS custom property defined in `index.css` (e.g., `--background`, `--foreground`, `--primary`) that automatically resolves to the correct light or dark value based on the active theme class on `<html>`.
- **Breadcrumb**: The navigational trail rendered in the dashboard header that shows the current page path as a series of clickable links.

---

## Requirements

---

### Requirement 1: Single Authoritative API Client

**User Story:** As a developer, I want one canonical API client used everywhere, so that authentication headers, token refresh logic, and the BASE_URL constant are never duplicated.

#### Acceptance Criteria

1. THE System SHALL expose exactly one API client module; all other API client files (e.g., `src/services/api/apiClient.js`) SHALL be removed.
2. THE API_Client SHALL read `BASE_URL` from a single configuration constant and prepend it to every request path.
3. WHEN a request is made, THE API_Client SHALL attach an `Authorization: Bearer <token>` header using the access token stored in `localStorage`.
4. WHEN a response returns HTTP 401 with a token-invalid error code, THE API_Client SHALL attempt one silent token refresh before retrying the original request.
5. IF the token refresh fails, THEN THE API_Client SHALL clear stored tokens and dispatch an `auth-changed` event so the UI can redirect to login.
6. THE API_Client SHALL use the native `fetch` API exclusively; no third-party HTTP libraries SHALL be introduced.

---

### Requirement 2: Feature-Based Frontend Folder Structure

**User Story:** As a developer, I want the frontend organised by domain feature rather than by file type, so that all code related to one domain is co-located and easy to navigate.

#### Acceptance Criteria

1. THE Frontend SHALL organise domain code under `src/features/{domain}/` folders, where each domain folder contains at minimum `components/`, `hooks/`, `api/`, and `pages/` sub-folders.
2. THE Frontend SHALL provide a `src/shared/` folder containing components, hooks, and utilities that are used by more than one Feature_Module.
3. THE Frontend SHALL provide a `src/layouts/` folder containing layout components (`PublicLayout`, `DashboardLayout`).
4. THE Frontend SHALL provide a `src/routes/` folder containing the Router configuration and route guard components (`ProtectedRoute`, `GuestOnlyRoute`).
5. WHEN a component, hook, or utility is used by only one Feature_Module, THE System SHALL place it inside that Feature_Module's folder.
6. WHEN a component, hook, or utility is used by two or more Feature_Modules, THE System SHALL place it inside `src/shared/`.
7. THE Frontend SHALL not contain duplicate implementations of the same hook or utility across different folders.

---

### Requirement 3: Domain Hooks Built on TanStack Query

**User Story:** As a developer, I want each data domain to expose named hooks that wrap TanStack Query, so that components never call the API client directly and caching is consistent.

#### Acceptance Criteria

1. THE Properties domain SHALL expose the following Domain_Hooks: `useGetProperties`, `useGetPropertyById`, `useCreateProperty`, `useUpdateProperty`, `useDeleteProperty`.
2. THE Municipalities domain SHALL expose Domain_Hooks: `useGetMunicipalities`, `useGetMunicipalityById`.
3. THE Profile domain SHALL expose Domain_Hooks: `useGetProfile`, `useUpdateProfile`, `useUploadProfileImage`.
4. THE Authentication domain SHALL expose Domain_Hooks: `useLogin`, `useSignup`, `useCurrentUser`.
5. WHEN a Domain_Hook fetches data, THE Domain_Hook SHALL use `useQuery` with a stable, descriptive `queryKey` array.
6. WHEN a Domain_Hook mutates data, THE Domain_Hook SHALL use `useMutation` and invalidate the relevant `queryKey` on success.
7. THE System SHALL not call `apiGet`, `apiPost`, `apiPatch`, `apiPut`, or `apiDelete` directly from inside a React component; all API calls SHALL go through Domain_Hooks.

---

### Requirement 4: Centralised Route Configuration

**User Story:** As a developer, I want all application routes defined in one file using `createBrowserRouter`, so that the full route map is visible in a single place.

#### Acceptance Criteria

1. THE Router SHALL define all application routes in a single file using `createBrowserRouter` from `react-router`.
2. THE Router SHALL use `ProtectedRoute` to guard every route that requires authentication.
3. THE Router SHALL use `GuestOnlyRoute` to guard login and signup routes so authenticated users cannot access them.
4. WHEN a user without the required role attempts to access a role-restricted route, THE ProtectedRoute SHALL redirect the user to the home page (`/`).
5. THE Router SHALL not contain duplicate route definitions for the same logical page.
6. THE Router SHALL define a catch-all `*` route that renders the 404 Not Found page.

---

### Requirement 5: Backend App Organisation

**User Story:** As a developer, I want backend Django apps grouped under an `apps/` folder with core configuration isolated in `core/`, so that the project root is uncluttered and the separation between config and business logic is clear.

#### Acceptance Criteria

1. THE Backend SHALL organise all Django application packages (`listings`, `deals`, `tours`, `guardian`) under a single `back/apps/` directory.
2. THE Backend SHALL keep Django project configuration files (`settings.py`, `urls.py`, `wsgi.py`, `asgi.py`, `celery.py`) inside `back/core/`.
3. WHEN apps are moved to `back/apps/`, THE Backend SHALL update all `INSTALLED_APPS` entries, import paths, and migration references so the application starts without errors.
4. THE Backend SHALL not duplicate app logic; each domain SHALL have exactly one app package.

---

### Requirement 6: Small, Reusable, Stateless Components

**User Story:** As a developer, I want UI components to be small and focused, so that they are easy to test, reuse, and reason about.

#### Acceptance Criteria

1. THE Frontend SHALL separate presentational components (receive props, render UI) from container components (own state, call hooks, pass data down).
2. WHEN a component renders a list item, a card, a badge, or a form field, THE System SHALL implement it as a stateless presentational component that accepts all data via props.
3. THE Frontend SHALL not place data-fetching logic (TanStack Query calls) inside presentational components.
4. WHEN a presentational component is used in more than one Feature_Module, THE System SHALL place it in `src/shared/components/`.

---

### Requirement 7: Admin Analytics Dashboard

**User Story:** As an Admin or SuperAdmin, I want a dedicated analytics dashboard with charts, so that I can monitor platform health at a glance without querying the database manually.

#### Acceptance Criteria

1. WHEN an Admin or SuperAdmin navigates to the Admin Dashboard, THE Admin_Dashboard SHALL display the following summary statistics: total property count, count of properties with status `UNDER_REVIEW`, total registered user count, and user count broken down by role (Buyer, Agent, Owner, Admin).
2. THE Admin_Dashboard SHALL render the summary statistics using shadcn/ui Chart components (bar chart or pie chart) sourced from `@/components/ui/chart`.
3. WHEN the Admin_Dashboard data is loading, THE Admin_Dashboard SHALL display skeleton placeholder components in place of charts.
4. IF the data fetch fails, THEN THE Admin_Dashboard SHALL display an error message describing the failure without crashing the page.
5. THE Admin_Dashboard SHALL be accessible only to users whose group includes `"Admin"` or whose `is_superuser` flag is `true`; all other users SHALL be redirected to `/`.
6. THE Backend SHALL expose an endpoint that returns aggregate counts (total properties, properties under review, total users, users per role) in a single response so the dashboard requires at most two API calls to populate all charts.

---

### Requirement 8: Admin User Profile Viewer

**User Story:** As an Admin, I want to click on any user in the user list and view their full profile, so that I can review their information without needing direct database access.

#### Acceptance Criteria

1. WHEN an Admin views the user list, THE System SHALL display a "View Profile" action for each user row.
2. WHEN an Admin activates the "View Profile" action for a user, THE System SHALL navigate to a profile view page for that user.
3. THE System SHALL reuse the existing `Profile` page component to display another user's profile in read-only mode.
4. WHEN the profile page is rendered for a user other than the logged-in user, THE Profile page SHALL display the target user's information and SHALL NOT render the edit controls or the profile image upload button.
5. THE Backend SHALL expose a `GET /api/users/{id}/` endpoint that returns the full profile data for any user; this endpoint SHALL be accessible to Admin and SuperAdmin users.
6. IF the requested user does not exist, THEN THE Backend SHALL return HTTP 404 with a descriptive error message.

---

### Requirement 9: Property Search, Filter, and Sort

**User Story:** As a user browsing properties, I want to search by keyword, filter by municipality and listing type, and sort results, so that I can quickly find properties that match my criteria.

#### Acceptance Criteria

1. THE Properties page SHALL provide a text search input that filters the displayed property list by property name or address as the user types.
2. THE Properties page SHALL provide a municipality dropdown filter that limits results to properties in the selected Municipality.
3. THE Properties page SHALL provide a listing type filter (For Sale / For Rent / All) that limits results to the selected type.
4. THE Properties page SHALL provide a sort control with at minimum two options: price ascending and price descending.
5. WHEN the user changes any filter or sort control, THE Properties page SHALL update the displayed list without requiring a full page reload.
6. WHEN no properties match the active filters, THE Properties page SHALL display an empty-state message and a "Clear filters" action.
7. WHEN the user activates "Clear filters", THE Properties page SHALL reset all filter and sort controls to their default values and display the full unfiltered list.
8. THE Properties page SHALL persist active filter and sort values in the URL query string so that the filtered view can be bookmarked and shared.

---

### Requirement 10: Municipality Detail Page with Property Listings

**User Story:** As a user, I want to click on a municipality and see all properties located there, so that I can explore listings by location.

#### Acceptance Criteria

1. WHEN a user selects a Municipality from the Locations page, THE System SHALL navigate to a Municipality detail page for that Municipality.
2. THE Municipality detail page SHALL display the municipality name, price per sqm, and a list of all active Properties whose `property_municipality` matches that Municipality.
3. WHEN the Municipality detail page is loading, THE System SHALL display skeleton placeholder components.
4. IF no active properties exist for the selected Municipality, THEN THE Municipality detail page SHALL display an empty-state message.
5. THE Backend SHALL support filtering the property list by `municipality_id` via a query parameter on the existing `GET /api/properties/` endpoint.
6. THE Router SHALL define a route `/places/:id` that renders the Municipality detail page for the given municipality ID.

---

### Requirement 11: Property Delete Confirmation Dialog

**User Story:** As an Owner, Agent, or Admin, I want a confirmation dialog before a property is deleted, so that accidental deletions are prevented.

#### Acceptance Criteria

1. WHEN a user with delete permission activates the delete action on a property, THE System SHALL open a Confirmation_Dialog before executing the deletion.
2. THE Confirmation_Dialog SHALL display the property name and a warning that the action is irreversible.
3. WHEN the user confirms deletion inside the Confirmation_Dialog, THE System SHALL call the delete API endpoint and close the dialog.
4. WHEN the user cancels inside the Confirmation_Dialog, THE System SHALL close the dialog and leave the property unchanged.
5. WHILE the delete API call is in progress, THE Confirmation_Dialog SHALL disable the confirm button and display a loading indicator.
6. IF the delete API call fails, THEN THE System SHALL display a toast error message and keep the property in the list.
7. WHEN the delete API call succeeds, THE System SHALL display a toast success message and remove the property from the displayed list without a full page reload.
8. THE Confirmation_Dialog SHALL be implemented using the existing shadcn/ui `Dialog` component from `@/components/ui/dialog`.

---

### Requirement 12: Full Property CRUD for Authorised Users

**User Story:** As an Owner, Agent, or Admin, I want to create, read, update, and delete my property listings from the UI, so that I can manage my listings without using the admin panel.

#### Acceptance Criteria

1. THE System SHALL provide a property creation form accessible to users whose group includes `"Agent"`, `"Owner"`, or `"Admin"`.
2. THE System SHALL provide a property edit form accessible to the property owner, the assigned agent, or any Admin.
3. WHEN a property is created or updated, THE System SHALL validate that required fields (name, address, municipality, category, size, type) are present before submitting.
4. IF a required field is missing on submission, THEN THE System SHALL display an inline validation error next to the relevant field.
5. THE System SHALL provide a delete action on the property detail page and on the owner's listings page, subject to the Confirmation_Dialog requirement (Requirement 11).
6. WHEN a property is successfully created, THE System SHALL navigate the user to the new property's detail page.
7. WHEN a property is successfully updated, THE System SHALL display a toast success message and reflect the updated data without a full page reload.

---

### Requirement 13: User Profile Display and Edit Mode

**User Story:** As a logged-in user, I want to view my profile information and switch to an edit mode to update it, so that I can keep my details current.

#### Acceptance Criteria

1. WHEN a logged-in user navigates to `/profile`, THE Profile page SHALL display the user's full name, username, email, role badges, profile image, bio, phone number, and address fields in read-only mode by default.
2. WHEN the user activates the "Edit" button, THE Profile page SHALL replace each read-only display field with an editable input or textarea for: email, bio, phone number, address, city, state, country, and zipcode.
3. WHEN the user activates "Save Changes", THE Profile page SHALL submit the updated fields to the backend and display a toast success message on success.
4. WHEN the user activates "Cancel", THE Profile page SHALL discard unsaved changes and return to read-only display mode.
5. WHILE the profile update API call is in progress, THE Profile page SHALL disable the "Save Changes" button and display a loading indicator.
6. IF the profile update API call fails, THEN THE Profile page SHALL display a toast error message and remain in edit mode so the user can retry.
7. WHEN a user uploads a new profile image, THE Profile page SHALL open an image cropper modal before uploading, validate that the file is under 5 MB and is a supported image type (JPEG, PNG, GIF, WebP), and display a loading indicator while the upload is in progress.
8. THE Profile page SHALL display the profile image using the full absolute URL, constructing it from BASE_URL when the stored path is relative.

---

### Requirement 14: Read-Only Profile View for Admin

**User Story:** As an Admin, I want to view any user's profile in read-only mode, so that I can review their information from the user management dashboard.

#### Acceptance Criteria

1. THE System SHALL provide a route `/profile/:id` that renders the Profile page for the user with the given ID.
2. WHEN the authenticated user's ID does not match the `:id` parameter, THE Profile page SHALL render in read-only mode with no edit controls, no image upload button, and no save/cancel buttons.
3. WHEN the authenticated user's ID matches the `:id` parameter, THE Profile page SHALL render in the standard editable mode described in Requirement 13.
4. THE `/profile/:id` route SHALL be accessible only to Admin and SuperAdmin users; all other users SHALL be redirected to `/`.
5. THE Profile page SHALL fetch the target user's data from `GET /api/users/{id}/` when a non-self ID is provided.

---

### Requirement 15: Consistent Authentication State Management

**User Story:** As a developer, I want authentication state managed in one place, so that all components read from the same source of truth and stale auth data never causes UI inconsistencies.

#### Acceptance Criteria

1. THE System SHALL maintain authentication state through a single `AuthContext` provider mounted at the application root.
2. THE AuthContext SHALL expose: `user`, `isLoggedIn`, `isLoading`, `isSuperAdmin`, `isAdmin`, `isAgent`, `isOwner`, `isBuyer`, and `logout`.
3. WHEN the `auth-changed` event is dispatched, THE AuthContext SHALL invalidate the `["user"]` TanStack Query cache entry and re-fetch the current user.
4. THE System SHALL not duplicate role-checking logic across components; all role checks SHALL use the helpers exposed by `AuthContext` or the `useAuth` hook.
5. WHEN `isLoading` is `true`, THE ProtectedRoute SHALL render a loading spinner rather than redirecting.

---

### Requirement 16: Backend Statistics Endpoint for Admin Dashboard

**User Story:** As a backend developer, I want a dedicated statistics endpoint, so that the Admin Dashboard can retrieve all aggregate counts in one request.

#### Acceptance Criteria

1. THE Backend SHALL expose a `GET /api/admin/stats/` endpoint accessible only to Admin and SuperAdmin users.
2. WHEN the endpoint is called, THE Backend SHALL return a JSON object containing: `total_properties` (integer), `properties_under_review` (integer), `total_users` (integer), and `users_by_role` (object mapping each role name to its user count).
3. THE Backend SHALL compute `users_by_role` by querying Django group membership for the groups: `Buyer`, `Agent`, `Owner`, `Admin`.
4. IF the requesting user is not Admin or SuperAdmin, THEN THE Backend SHALL return HTTP 403.
5. THE Backend SHALL return the statistics response within a single database transaction to ensure count consistency.

---

### Requirement 17: Property Edit and Delete Restricted to Listing Owner

**User Story:** As a property owner, I want only myself (or an Admin) to be able to edit or delete my listing, so that other users cannot modify or remove properties they do not own.

#### Acceptance Criteria

1. WHEN a user navigates to a property edit page, THE System SHALL verify that the authenticated user is either the property's `owner`, the property's assigned `agent`, or an Admin/SuperAdmin before rendering the edit form.
2. IF the authenticated user does not meet the ownership or admin condition, THEN THE System SHALL redirect them to the property detail page and display a toast error message stating they do not have permission to edit this listing.
3. WHEN a user attempts to activate the delete action on a property, THE System SHALL verify the same ownership or admin condition before opening the Confirmation_Dialog.
4. IF the authenticated user does not meet the ownership or admin condition for deletion, THEN THE System SHALL not render the delete button at all.
5. THE Backend SHALL enforce ownership checks on `PATCH /api/properties/{id}/update/` and `DELETE /api/properties/{id}/delete/` endpoints, returning HTTP 403 if the requesting user is not the owner, assigned agent, or Admin/SuperAdmin.
6. THE Frontend SHALL not rely solely on hiding UI elements for permission enforcement; it SHALL also handle HTTP 403 responses from the backend gracefully by displaying a descriptive error message.

---

### Requirement 18: HTTP 400 Error Handling and User Feedback

**User Story:** As a user submitting forms, I want clear error messages when my request is rejected, so that I know exactly what to fix without seeing a generic failure.

#### Acceptance Criteria

1. WHEN the backend returns HTTP 400, THE System SHALL parse the response body and display field-level validation errors next to the relevant form inputs.
2. WHEN the backend returns a non-field error (e.g., `non_field_errors` or `detail`) with HTTP 400, THE System SHALL display the error message in a visible alert or toast notification.
3. THE API_Client SHALL never silently swallow HTTP 400 responses; it SHALL always propagate the parsed error data to the calling Domain_Hook.
4. WHEN a Domain_Hook mutation receives an error, THE Domain_Hook SHALL expose the error object so the calling component can render field-specific messages.
5. THE System SHALL display human-readable error messages; raw JSON strings or stack traces SHALL NOT be shown to end users.
6. WHEN a form submission fails with HTTP 400, THE System SHALL keep the form populated with the user's previously entered values so they do not need to re-enter data.

---

### Requirement 19: Full Dark Mode Visibility Across All Pages

**User Story:** As a user who prefers dark mode, I want every page and component to be readable and visually consistent in dark mode, so that I never encounter unreadable text or invisible elements.

#### Acceptance Criteria

1. THE System SHALL use only Theme_Tokens (e.g., `text-foreground`, `bg-background`, `bg-card`, `border-border`) for all text, background, and border colours; hardcoded colour classes (e.g., `text-gray-900`, `bg-white`, `border-gray-200`) SHALL NOT appear in any component.
2. WHEN the active theme is `dark`, THE System SHALL render all pages — including the dashboard, property listing pages, create/edit listing forms, modals, tables, and cards — with sufficient contrast between text and background.
3. THE dark mode CSS variables defined in `index.css` under `.dark` SHALL provide a `--primary` value that is a visible, saturated colour (not near-white) so that the navbar and primary buttons remain visually distinct in dark mode.
4. WHEN the user toggles the theme using the ModeToggle switch, THE System SHALL apply the new theme immediately across all visible elements without requiring a page reload.
5. THE ModeToggle component SHALL be present and functional on every page — both public pages (via the navbar) and dashboard pages (via the dashboard header).
6. THE System SHALL persist the user's theme preference in `localStorage` under the key `re-ui-theme` and restore it on the next page load.
7. WHEN the stored theme preference is `"system"`, THE System SHALL apply the theme that matches the operating system's `prefers-color-scheme` media query.

---

### Requirement 20: Profile Update Reflects Immediately After Save

**User Story:** As a user, I want my updated profile information to appear on the page immediately after I save it, so that I can confirm my changes were applied without refreshing.

#### Acceptance Criteria

1. WHEN the profile update API call succeeds, THE Profile page SHALL display the updated values in read-only mode without requiring a manual page refresh.
2. THE Profile page SHALL invalidate the `["userProfile"]` and `["user"]` TanStack Query cache entries immediately after a successful update so that all components reading from those caches reflect the new data.
3. WHEN a new profile image is successfully uploaded, THE Profile page SHALL display the new image immediately by re-fetching the profile data within 500 ms of the upload completing.
4. THE Backend `PATCH /api/profile/update/` endpoint SHALL return the full updated profile object in its response body so the frontend can update the cache without a separate GET request.
5. IF the backend returns an empty body on a successful PATCH, THEN THE Frontend SHALL trigger a separate `GET /api/me/` request to refresh the displayed data.

---

### Requirement 21: Breadcrumb Navigation Correctness

**User Story:** As a user navigating the dashboard, I want breadcrumb links to lead to real pages, so that I never land on a 404 when clicking a breadcrumb segment.

#### Acceptance Criteria

1. WHEN the dashboard renders a Breadcrumb, each segment SHALL link to a route that is defined in the Router and renders a real page component.
2. THE Breadcrumb SHALL not generate links for path segments that do not correspond to a navigable page (e.g., role prefixes like `/admin` or `/agent` that have no standalone page).
3. WHEN a Breadcrumb segment corresponds to a dynamic ID (e.g., `/properties/42`), THE Breadcrumb SHALL display a human-readable label (e.g., `#42`) and link to the correct detail page.
4. THE `PATH_TITLES` mapping in `DashboardLayout` SHALL contain an entry for every route segment used in the application so that no segment falls back to a raw slug.
5. WHEN a breadcrumb link is clicked, THE Router SHALL navigate to the target route without a full page reload.

---

### Requirement 22: Conditional Property Form Fields for Lot Category

**User Story:** As an Owner or Agent creating a Lot listing, I want the form to show only fields relevant to land (lot area), so that I am not asked to fill in irrelevant fields like bedrooms or bathrooms.

#### Acceptance Criteria

1. WHEN the user selects `"LOT"` as the property category in the create or edit form, THE System SHALL hide the following fields: number of bedrooms, number of bathrooms, and building size.
2. WHEN the user selects `"LOT"`, THE System SHALL display and require the lot area (property size in sqm) field.
3. WHEN the user selects any category other than `"LOT"` (e.g., `"HOUSE_AND_LOT"`, `"APARTMENT"`, `"CONDO"`, `"COMMERCIAL_SPACE"`), THE System SHALL display all standard fields including bedrooms, bathrooms, and building size.
4. WHEN the category changes from `"LOT"` to another category, THE System SHALL restore the hidden fields and clear any validation errors associated with them.
5. THE Backend SHALL not require `num_bedrooms`, `num_bathrooms`, or `building_size` when `category` is `"LOT"`; these fields SHALL default to `0` if omitted.
6. WHEN a Lot_Property is displayed on the property detail page, THE System SHALL not render bedroom, bathroom, or building size statistics.

---

### Requirement 23: Success Notification After Property Creation

**User Story:** As an Owner or Agent who has just created a listing, I want a clear success notification with a confirmation action, so that I know the listing was saved before I navigate away.

#### Acceptance Criteria

1. WHEN a property is successfully created, THE System SHALL display a success notification that includes the property name and a confirmation button labelled "OK" or "View Listing".
2. THE success notification SHALL be rendered as a modal dialog (not just a toast) so that it requires explicit user acknowledgement before dismissing.
3. WHEN the user activates "View Listing" in the success notification, THE System SHALL navigate to the newly created property's detail page.
4. WHEN the user activates "OK" in the success notification, THE System SHALL dismiss the dialog and remain on the current page or navigate to the owner's listings page.
5. THE success notification SHALL display even if the user's internet connection is slow; it SHALL only appear after the backend has confirmed the creation with a successful HTTP response.
6. THE success notification SHALL not appear for property updates — only for new property creation.

---

### Requirement 24: Comparable Market Analysis (CMA) Pricing System

**User Story:** As an Owner or Agent creating a listing, I want the system to suggest a price range based on comparable properties in the same municipality, so that I can set a competitive and market-aligned price.

#### Acceptance Criteria

1. WHEN a user is creating or editing a property listing, THE System SHALL provide a "Get Price Suggestion" action that triggers a CMA calculation.
2. THE CMA calculation SHALL use at least three comparable properties from the same municipality that share the same category (e.g., House and Lot, Condo) as the subject property.
3. THE CMA calculation SHALL compute the price per sqm for each comparable property and derive a suggested price range (minimum, maximum, and recommended) for the subject property based on its size.
4. THE CMA output SHALL include: suggested price range (low–high), recommended listing price, calculated price per sqm, and a brief explanation of the factors used.
5. WHEN fewer than three comparable properties exist in the same municipality and category, THE System SHALL notify the user that insufficient data is available and fall back to the municipality's baseline `price_per_sqm` for a single-point estimate.
6. THE CMA calculation SHALL factor in the following adjustments when comparable data is available: property condition (if provided), number and type of amenities, and location quality (municipality `price_per_sqm` relative to the platform average).
7. THE Backend SHALL expose a `POST /api/properties/cma/` endpoint that accepts the subject property's attributes and returns the CMA result; this endpoint SHALL be accessible to Agent, Owner, Admin, and SuperAdmin users.
8. THE CMA result SHALL be displayed as a non-blocking suggestion panel within the property form; the user SHALL be able to accept the recommended price (auto-fill the price field) or ignore it and enter a custom price.
9. THE suggested price SHALL NOT be automatically applied to the price field without explicit user action.
