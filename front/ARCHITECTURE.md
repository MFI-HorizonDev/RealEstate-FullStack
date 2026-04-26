# Frontend Architecture Documentation

## Overview

This real estate frontend follows a **feature-based architecture** with clear separation of concerns, leveraging TanStack Query for data management and React Router for navigation.

## Folder Structure

```
src/
├── features/                    # Feature modules (main)
│   ├── auth/                   # Authentication feature
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/            # AuthContext & AuthProvider
│   │   ├── hoc/                # Protected route HOCs
│   │   ├── hooks/              # useAuth, useLogin, useRegister
│   │   ├── pages/              # Login, Register pages
│   │   └── types/
│   ├── properties/             # Properties feature
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/              # useGetProperties, useCreateProperty, etc.
│   │   └── pages/              # List, Create, Edit, Details pages
│   ├── tours/                  # Tours feature
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/              # useTours, useCreateTour, etc.
│   │   └── pages/
│   ├── deals/                  # Sales/Deals feature
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/              # useSales, usePendingSales, etc.
│   │   └── pages/
│   ├── admin/                  # Admin feature
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/              # useAdmin, useGetUsers, etc.
│   │   └── pages/              # Dashboard, Users, Properties, etc.
│   └── profile/                # User profile feature
│       ├── api/
│       ├── components/
│       ├── hooks/              # useProfile, useGetMyProfile
│       └── pages/              # Profile, ProfileEdit
├── shared/                     # Shared utilities & components
│   ├── components/             # Reusable UI components
│   │   ├── PropertyCard.jsx
│   │   ├── PropertyFilter.jsx
│   │   └── LoadingAndErrorStates.jsx
│   ├── hooks/                  # Shared hooks (useDebounce, etc.)
│   │   └── useMunicipalities.js
│   └── utils/                  # Utilities
│       └── apiClient.js        # Centralized API client
├── config/                     # Configuration
│   └── router.jsx              # Centralized routing
├── pages/                      # Root level pages
│   ├── Home.jsx
│   ├── NotFound.jsx
│   ├── Unauthorized.jsx
│   └── ...
├── components/                 # Global components
│   ├── layout/
│   │   ├── PublicLayout.jsx
│   │   └── DashboardLayout.jsx
│   └── ui/                     # shadcn/ui components
├── App.jsx                     # Root app component
└── main.jsx                    # Entry point
```

## Key Patterns

### 1. Custom Hooks for Data Fetching

All API interactions are handled through custom hooks using TanStack Query:

```javascript
// features/properties/hooks/useProperties.js

export const useGetProperties = (params = {}) => {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return apiClient(`/api/properties/?${queryString}`);
    },
    enabled: params.enabled !== false,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyData) =>
      apiClient("/api/properties/create/", {
        method: "POST",
        body: JSON.stringify(propertyData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};
```

**Usage in Components:**

```javascript
function MyComponent() {
  const { data, isLoading, error } = useGetProperties({ page: 1 });
  const { mutate: createProperty } = useCreateProperty();

  return (
    // JSX here
  );
}
```

### 2. API Client with Authentication

Centralized API client (`shared/utils/apiClient.js`) handles:
- Authorization header injection
- Token refresh logic
- Error handling

```javascript
// Usage:
const response = await apiClient("/api/properties/", {
  method: "POST",
  body: JSON.stringify(data),
});
```

### 3. Authentication Context

Auth state managed via React Context + AuthProvider:

```javascript
// In main App.jsx:
<AuthProvider>
  <AppRouter />
</AuthProvider>

// In components:
const { user, isAuthenticated, login, logout } = useAuth();
```

### 4. Protected Routes with HOCs

Role-based access control using HOCs:

```javascript
// In router.jsx:
{
  path: "dashboard/admin",
  element: (
    <Suspense fallback={<PageLoader />}>
      {withAdminRole(() => <AdminDashboard />)()}
    </Suspense>
  ),
}

// Or direct usage:
export default withAuth(MyComponent, ["ADMIN", "AGENT"]);
```

### 5. Centralized Routing

All routes defined in `config/router.jsx` with:
- Lazy loading for code splitting
- Route guards (protected/guest-only)
- Nested routes for layouts
- Error boundaries

## Feature Organization

### Each Feature Module Contains:

- **api/**: API endpoint configurations (optional, mostly in hooks)
- **hooks/**: Custom hooks for CRUD operations
- **components/**: Feature-specific reusable components
- **pages/**: Page components (List, Create, Edit, Details, etc.)
- **context/**: Local state management (if needed)
- **types/**: TypeScript types (if using TS)

### Example: Properties Feature

```javascript
// Hook usage in component
import { useGetProperties, useCreateProperty } from '@/features/properties/hooks/useProperties';

function PropertiesList() {
  const { data: propertiesData, isLoading, error } = useGetProperties({ page: 1 });
  const { mutate: createProperty } = useCreateProperty();

  return (
    <PropertyCard property={property} onFavorite={handleFavorite} />
  );
}
```

## Component Best Practices

### 1. Presentational Components

Keep components small and focused:

```javascript
// PropertyCard.jsx - Pure presentational component
export const PropertyCard = ({ property, onFavorite }) => (
  <Card>
    <img src={property.image} />
    <h2>{property.name}</h2>
    <button onClick={() => onFavorite(property.id)}>Favorite</button>
  </Card>
);
```

### 2. Container Components

Handle logic and data fetching:

```javascript
// PropertiesList.jsx - Container component
function PropertiesList() {
  const { data: properties } = useGetProperties();

  return (
    <div>
      {properties.map(prop => (
        <PropertyCard 
          key={prop.id} 
          property={prop}
          onFavorite={handleFavorite}
        />
      ))}
    </div>
  );
}
```

### 3. Use shadcn/ui Components

Build consistent UI with shadcn/ui:

```javascript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

## Data Flow

```
Component → Custom Hook (useGetX, useCreateX)
         ↓
      TanStack Query (useQuery, useMutation)
         ↓
      apiClient (shared/utils/apiClient.js)
         ↓
      Backend API (/api/...)
```

## Query Key Conventions

```javascript
// List queries
queryKey: ["properties", { page: 1, search: "villa" }]

// Detail queries
queryKey: ["property", propertyId]

// Related queries
queryKey: ["propertyImages", propertyId]

// Admin queries
queryKey: ["adminUsers", { role: "AGENT" }]
```

## Adding a New Feature

1. Create feature folder: `src/features/featureName/`
2. Create subfolders: `pages/`, `components/`, `hooks/`
3. Define custom hooks in `hooks/` using TanStack Query
4. Create page components in `pages/`
5. Add routes in `config/router.jsx`
6. Implement HOC protection if needed

Example:

```bash
mkdir -p src/features/reviews/{pages,components,hooks}
# Create hooks first (data layer)
# Then pages (container components)
# Then components (presentational)
# Finally, add routes
```

## Environment Configuration

```javascript
// .env
VITE_API_URL=http://localhost:8000

// Usage
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```

## State Management Strategy

- **Queries**: Use TanStack Query (data from server)
- **Mutations**: Use TanStack Query mutations (updates)
- **Auth State**: Use React Context (global)
- **Form State**: Use useState (local)
- **Complex Local State**: Consider Zustand/Redux if needed

## Error Handling

```javascript
// In hooks
return useQuery({
  queryKey: ["data"],
  queryFn: async () => {
    try {
      return await apiClient("/api/endpoint/");
    } catch (error) {
      throw error; // Let React Query handle it
    }
  },
});

// In components
const { error, isError } = useQuery(...);
if (isError) return <ErrorAlert error={error} />;
```

## Performance Optimization

1. **Code Splitting**: Routes use lazy loading
2. **Query Caching**: TanStack Query handles caching
3. **Memoization**: Use React.memo for expensive components
4. **Pagination**: Implemented in list pages
5. **Debouncing**: Use debounced search inputs

## Development Workflow

1. **Create Feature Structure**: Set up folders
2. **Define Hooks**: Implement data fetching logic
3. **Build Pages**: Container components
4. **Build Components**: Presentational components
5. **Add Routes**: Update `config/router.jsx`
6. **Test**: Verify data flow and UI

## Deployment

Build for production:

```bash
npm run build
```

Outputs to `dist/` folder for serving.

---

**Last Updated**: April 26, 2026
