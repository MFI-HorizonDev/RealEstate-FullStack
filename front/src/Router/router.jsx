import { createBrowserRouter } from "react-router";

// Layouts
import PublicLayout from "../components/layout/PublicLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestOnlyRoute from "./GuestOnlyRoute";

// Auth
import Login from "../login/login";
import Signup from "../login/signup";
import Notfound from "../notfound";
import App from "../App";

// Public / shared
import Profile from "../pages/Profile";
import Places from "../pages/Places";
import Tours from "../pages/Tours";
import Bookings from "../pages/Bookings";
import TestPagination from "../pages/TestPagination";
import DataPolicyPage from "../pages/DataPolicyPage";
import TermsOfService from "../pages/TermsOfService";
import AboutUs from "../pages/about-us";

// Properties (shared)
import AllProperties from "../pages/Owner/Properties/all-properties";
import PropertyDetails from "../pages/Owner/Properties/PropertyDetails";
import PropertyCreate from "../pages/Owner/Properties/PropertyCreate";
import PropertyEdit from "../pages/Owner/Properties/PropertyEdit";

// Admin
import AdminAuditDashboard from "../pages/Admin/AdminAuditDashboard";
import PendingSales from "../pages/Admin/PendingSales";
import MarketUpdate from "../pages/Admin/MarketUpdate";

// Agent
import AgentDashboard from "../pages/Agent/Dashboard";
import AgentProperties from "../pages/Agent/Properties";
import AgentCommissions from "../pages/Agent/Commissions";

// SuperAdmin
import ManageUsers from "../pages/SuperAdmin/ManageUsers";
import ManageProperties from "../pages/SuperAdmin/ManageProperties";

// Owner
import OwnerDashboard from "../pages/Owner/dashboard";
import MyListings from "../pages/Owner/MyListings";

// Buyer
import BuyerDashboard from "../pages/Customer/BuyerDashboard";

// ── Helper: wrap in DashboardLayout + ProtectedRoute ──────────────────────────
const dash = (element, requiredRole = null, allow = null) => (
  <DashboardLayout>
    <ProtectedRoute requiredRole={requiredRole} allow={allow}>
      {element}
    </ProtectedRoute>
  </DashboardLayout>
);

export let routes = createBrowserRouter([
  // ── Public pages ────────────────────────────────────────────────────────────
  { path: "/", element: <PublicLayout><App /></PublicLayout> },

  {
    path: "all-properties",
    element: <PublicLayout><ProtectedRoute><AllProperties /></ProtectedRoute></PublicLayout>,
  },
  {
    path: "properties/create",
    element: (
      <PublicLayout>
        <ProtectedRoute allow={(auth) => auth.isAgent || auth.isOwner || auth.isAdmin} redirectTo="/">
          <PropertyCreate />
        </ProtectedRoute>
      </PublicLayout>
    ),
  },
  {
    path: "properties/:id",
    element: <PublicLayout><ProtectedRoute><PropertyDetails /></ProtectedRoute></PublicLayout>,
  },
  {
    path: "properties/:id/edit",
    element: <PublicLayout><ProtectedRoute><PropertyEdit /></ProtectedRoute></PublicLayout>,
  },
  {
    path: "places",
    element: <PublicLayout><ProtectedRoute><Places /></ProtectedRoute></PublicLayout>,
  },
  {
    path: "profile",
    element: <PublicLayout><ProtectedRoute><Profile /></ProtectedRoute></PublicLayout>,
  },

  // ── Dashboard: shared ────────────────────────────────────────────────────────
  { path: "tours",    element: dash(<Tours />) },
  { path: "bookings", element: dash(<Bookings />) },

  // ── Dashboard: Admin ─────────────────────────────────────────────────────────
  { path: "admin/audit-dashboard", element: dash(<AdminAuditDashboard />, "Admin") },
  {
    path: "dashboard/audit",
    element: (
      <DashboardLayout>
        <ProtectedRoute allow={(auth) => auth.isAdmin} redirectTo="/">
          <AdminAuditDashboard />
        </ProtectedRoute>
      </DashboardLayout>
    ),
  },
  { path: "admin/pending-sales",   element: dash(<PendingSales />,         "Admin") },
  { path: "admin/market-update",   element: dash(<MarketUpdate />,         "Admin") },

  // ── Dashboard: Agent ─────────────────────────────────────────────────────────
  { path: "agent/dashboard",   element: dash(<AgentDashboard />,   null, (auth) => auth.isAgent || auth.isOwner || auth.isAdmin) },
  {
    path: "dashboard/agent",
    element: (
      <DashboardLayout>
        <ProtectedRoute allow={(auth) => auth.isAgent || auth.isOwner} redirectTo="/">
          <AgentDashboard />
        </ProtectedRoute>
      </DashboardLayout>
    ),
  },
  { path: "agent/properties",  element: dash(<AgentProperties />,  null, (auth) => auth.isAgent || auth.isOwner || auth.isAdmin) },
  { path: "agent/commissions", element: dash(<AgentCommissions />, null, (auth) => auth.isAdmin) },

  // ── Dashboard: SuperAdmin ─────────────────────────────────────────────────────
  {
    path: "superadmin/users",
    element: dash(<ManageUsers />, null, (auth) => auth.isSuperAdmin),
  },
  {
    path: "superadmin/properties",
    element: dash(<ManageProperties />, null, (auth) => auth.isSuperAdmin),
  },

  // ── Dashboard: Owner ─────────────────────────────────────────────────────────
  { path: "owner/dashboard",  element: dash(<OwnerDashboard />, null, (auth) => auth.isOwner || auth.isAgent || auth.isAdmin) },
  { path: "owner/listings",   element: dash(<MyListings />,     null, (auth) => auth.isOwner || auth.isAgent || auth.isAdmin) },

  // ── Dashboard: Buyer ─────────────────────────────────────────────────────────
  { path: "buyer/dashboard", element: dash(<BuyerDashboard />, "Buyer") },

  { path: "privacy", element: <PublicLayout><DataPolicyPage /></PublicLayout> },
  { path: "terms",   element: <PublicLayout><TermsOfService /></PublicLayout> },
  { path: "about",   element: <PublicLayout><AboutUs /></PublicLayout> },

  // ── Misc ─────────────────────────────────────────────────────────────────────
  { path: "test-pagination", element: dash(<TestPagination />) },
  { path: "login",      element: <GuestOnlyRoute><Login /></GuestOnlyRoute> },
  { path: "signup",     element: <GuestOnlyRoute><Signup /></GuestOnlyRoute> },
  { path: "*",          element: <Notfound /> },
]);
