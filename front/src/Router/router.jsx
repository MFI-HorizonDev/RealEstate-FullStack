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
import AuthDebug from "../pages/AuthDebug";

// Public / shared
import Profile from "../pages/Profile";
import Places from "../pages/Places";
import Tours from "../pages/Tours";
import Bookings from "../pages/Bookings";
import TestPagination from "../pages/TestPagination";

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
import OwnerDashboard from "../pages/Owner/Dashboard";
import MyListings from "../pages/Owner/MyListings";

// Buyer
import BuyerDashboard from "../pages/Customer/BuyerDashboard";

// ── Helper: wrap in DashboardLayout + ProtectedRoute ──────────────────────────
const dash = (element, requiredRole = null) => (
  <DashboardLayout>
    <ProtectedRoute requiredRole={requiredRole}>
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
    element: <PublicLayout><ProtectedRoute requiredRole="Owner"><PropertyCreate /></ProtectedRoute></PublicLayout>,
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
  { path: "admin/pending-sales",   element: dash(<PendingSales />,         "Admin") },
  { path: "admin/market-update",   element: dash(<MarketUpdate />,         "Admin") },

  // ── Dashboard: Agent ─────────────────────────────────────────────────────────
  { path: "agent/dashboard",   element: dash(<AgentDashboard />,   "Agent") },
  { path: "agent/properties",  element: dash(<AgentProperties />,  "Agent") },
  { path: "agent/commissions", element: dash(<AgentCommissions />, "Agent") },

  // ── Dashboard: SuperAdmin ─────────────────────────────────────────────────────
  { path: "superadmin/users",      element: dash(<ManageUsers />) },
  { path: "superadmin/properties", element: dash(<ManageProperties />) },

  // ── Dashboard: Owner ─────────────────────────────────────────────────────────
  { path: "owner/dashboard",  element: dash(<OwnerDashboard />, "Owner") },
  { path: "owner/listings",   element: dash(<MyListings />,     "Owner") },

  // ── Dashboard: Buyer ─────────────────────────────────────────────────────────
  { path: "buyer/dashboard", element: dash(<BuyerDashboard />, "Buyer") },

  // ── Misc ─────────────────────────────────────────────────────────────────────
  { path: "test-pagination", element: dash(<TestPagination />) },
  { path: "login",      element: <GuestOnlyRoute><Login /></GuestOnlyRoute> },
  { path: "signup",     element: <GuestOnlyRoute><Signup /></GuestOnlyRoute> },
  { path: "auth-debug", element: <AuthDebug /> },
  { path: "*",          element: <Notfound /> },
]);
