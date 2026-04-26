import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

// Layouts
import PublicLayout from "@/components/layout/PublicLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";

// HOCs
import {
  WithAuth,
  WithoutAuth,
  withAdminRole,
  withAgentRole,
  withOwnerRole,
} from "@/features/auth/hoc/ProtectedRoute";

// ============ PUBLIC PAGES (Lazy loaded) ============
const HomePage = lazy(() => import("@/pages/Home"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));
const UnauthorizedPage = lazy(() => import("@/pages/Unauthorized"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const AboutUs = lazy(() => import("@/pages/About"));

// ============ AUTH PAGES (Lazy loaded) ============
const LoginPage = lazy(() => import("@/features/auth/pages/Login"));
const RegisterPage = lazy(() => import("@/features/auth/pages/Register"));

// ============ PROPERTIES FEATURE (Lazy loaded) ============
const PropertiesListPage = lazy(() =>
  import("@/features/properties/pages/PropertiesList")
);
const PropertyDetailsPage = lazy(() =>
  import("@/features/properties/pages/PropertyDetails")
);
const PropertyCreatePage = lazy(() =>
  import("@/features/properties/pages/PropertyCreate")
);
const PropertyEditPage = lazy(() =>
  import("@/features/properties/pages/PropertyEdit")
);

// ============ TOURS FEATURE (Lazy loaded) ============
const ToursListPage = lazy(() => import("@/features/tours/pages/ToursList"));
const TourDetailsPage = lazy(() =>
  import("@/features/tours/pages/TourDetails")
);
const TourBookingPage = lazy(() =>
  import("@/features/tours/pages/TourBooking")
);

// ============ DEALS FEATURE (Lazy loaded) ============
const DealsListPage = lazy(() => import("@/features/deals/pages/DealsList"));
const DealDetailsPage = lazy(() =>
  import("@/features/deals/pages/DealDetails")
);

// ============ PROFILE FEATURE (Lazy loaded) ============
const ProfilePage = lazy(() => import("@/features/profile/pages/Profile"));
const ProfileEditPage = lazy(() =>
  import("@/features/profile/pages/ProfileEdit")
);

// ============ ADMIN FEATURE (Lazy loaded) ============
const AdminDashboard = lazy(() =>
  import("@/features/admin/pages/Dashboard")
);
const AdminUsersPage = lazy(() => import("@/features/admin/pages/Users"));
const AdminPropertiesPage = lazy(() =>
  import("@/features/admin/pages/Properties")
);
const AdminRoleRequestsPage = lazy(() =>
  import("@/features/admin/pages/RoleRequests")
);
const AdminMarketUpdatePage = lazy(() =>
  import("@/features/admin/pages/MarketUpdate")
);

// ============ LOADING COMPONENT ============
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg text-gray-600">Loading...</div>
  </div>
);

// ============ ROUTER CONFIGURATION ============
const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
    children: [
      // ===== PUBLIC ROUTES =====
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "about",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AboutUs />
          </Suspense>
        ),
      },
      {
        path: "privacy",
        element: (
          <Suspense fallback={<PageLoader />}>
            <PrivacyPolicy />
          </Suspense>
        ),
      },
      {
        path: "terms",
        element: (
          <Suspense fallback={<PageLoader />}>
            <TermsOfService />
          </Suspense>
        ),
      },

      // ===== AUTH ROUTES (Guest only) =====
      {
        path: "login",
        element: (
          <Suspense fallback={<PageLoader />}>
            {WithoutAuth(() => <LoginPage />)()}
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={<PageLoader />}>
            {WithoutAuth(() => <RegisterPage />)()}
          </Suspense>
        ),
      },

      // ===== PUBLIC PROPERTIES =====
      {
        path: "properties",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <PropertiesListPage />
              </Suspense>
            ),
          },
          {
            path: ":id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PropertyDetailsPage />
              </Suspense>
            ),
          },
        ],
      },

      // ===== PUBLIC TOURS =====
      {
        path: "tours",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ToursListPage />
              </Suspense>
            ),
          },
          {
            path: ":id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <TourDetailsPage />
              </Suspense>
            ),
          },
        ],
      },

      // ===== UNAUTHORIZED PAGE =====
      {
        path: "unauthorized",
        element: (
          <Suspense fallback={<PageLoader />}>
            <UnauthorizedPage />
          </Suspense>
        ),
      },
    ],
  },

  // ===== DASHBOARD LAYOUT (Protected) =====
  {
    path: "/dashboard",
    element: (
      <>
        {WithAuth(() => <DashboardLayout />)()}
      </>
    ),
    errorElement: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
    children: [
      // ===== PROFILE ROUTES =====
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            {WithAuth(() => <ProfilePage />)()}
          </Suspense>
        ),
      },
      {
        path: "profile/edit",
        element: (
          <Suspense fallback={<PageLoader />}>
            {WithAuth(() => <ProfileEditPage />)()}
          </Suspense>
        ),
      },

      // ===== OWNER/AGENT PROPERTY ROUTES =====
      {
        path: "properties",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                {WithOwnerRole(
                  () => <PropertiesListPage dashboard={true} />
                )()}
              </Suspense>
            ),
          },
          {
            path: "create",
            element: (
              <Suspense fallback={<PageLoader />}>
                {WithOwnerRole(() => <PropertyCreatePage />)()}
              </Suspense>
            ),
          },
          {
            path: ":id",
            element: (
              <Suspense fallback={<PageLoader />}>
                {WithOwnerRole(() => <PropertyDetailsPage dashboard={true} />)()}
              </Suspense>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                {WithOwnerRole(() => <PropertyEditPage />)()}
              </Suspense>
            ),
          },
        ],
      },

      // ===== TOURS ROUTES =====
      {
        path: "tours",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                {WithAuth(() => <ToursListPage dashboard={true} />)()}
              </Suspense>
            ),
          },
          {
            path: ":id",
            element: (
              <Suspense fallback={<PageLoader />}>
                {WithAuth(() => <TourDetailsPage dashboard={true} />)()}
              </Suspense>
            ),
          },
          {
            path: "book",
            element: (
              <Suspense fallback={<PageLoader />}>
                {WithAuth(() => <TourBookingPage />)()}
              </Suspense>
            ),
          },
        ],
      },

      // ===== DEALS ROUTES =====
      {
        path: "deals",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                {WithAuth(() => <DealsListPage />)()}
              </Suspense>
            ),
          },
          {
            path: ":id",
            element: (
              <Suspense fallback={<PageLoader />}>
                {WithAuth(() => <DealDetailsPage />)()}
              </Suspense>
            ),
          },
        ],
      },

      // ===== ADMIN ROUTES =====
      {
        path: "admin",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                {withAdminRole(() => <AdminDashboard />)()}
              </Suspense>
            ),
          },
          {
            path: "users",
            element: (
              <Suspense fallback={<PageLoader />}>
                {withAdminRole(() => <AdminUsersPage />)()}
              </Suspense>
            ),
          },
          {
            path: "properties",
            element: (
              <Suspense fallback={<PageLoader />}>
                {withAdminRole(() => <AdminPropertiesPage />)()}
              </Suspense>
            ),
          },
          {
            path: "role-requests",
            element: (
              <Suspense fallback={<PageLoader />}>
                {withAdminRole(() => <AdminRoleRequestsPage />)()}
              </Suspense>
            ),
          },
          {
            path: "market-update",
            element: (
              <Suspense fallback={<PageLoader />}>
                {withAdminRole(() => <AdminMarketUpdatePage />)()}
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // ===== FALLBACK 404 =====
  {
    path: "*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

/**
 * AppRouter - Main router component to be wrapped with RouterProvider in App.jsx
 */
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
