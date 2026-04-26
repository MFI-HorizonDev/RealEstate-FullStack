import React from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/api/authentication/useAuth";
import UserAvatar from "@/components/UserAvatar";
import { Navigate, useLocation, Link } from "react-router";
import ModeToggle from "@/components/ModeToggle";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const BREADCRUMB_ROUTE_OVERRIDES = {
  "/admin": "/admin/audit-dashboard",
  "/agent": "/agent/dashboard",
  "/owner": "/owner/dashboard",
  "/buyer": "/buyer/dashboard",
  "/superadmin": "/superadmin/users",
  "/properties": "/all-properties",
  "/dashboard": "/owner/dashboard", // Fallback for legacy /dashboard/X paths
};

// Maps exact paths to human-readable titles
const PATH_TITLES = {
  "admin":              "Admin",
  "audit-dashboard":    "Audit Dashboard",
  "pending-sales":      "Pending Sales",
  "market-update":      "Market Update",
  "superadmin":         "Super Admin",
  "users":              "Manage Users",
  "properties":         "Properties",
  "agent":              "Agent",
  "dashboard":          "Dashboard",
  "commissions":        "Commissions",
  "owner":              "Owner",
  "listings":           "My Listings",
  "buyer":              "Buyer",
  "tours":              "My Tours",
  "bookings":           "My Bookings",
  "profile":            "Profile",
  "places":             "Locations",
  "create":             "Create Listing",
  "edit":               "Edit",
  "test-pagination":    "Test Pagination",
  "all-properties":     "All Properties",
};

// Segments that are dynamic IDs (numeric or UUID-like)
const isDynamicId = (segment) => /^\d+$/.test(segment) || /^[0-9a-f-]{8,}$/i.test(segment);

const toTitle = (segment) => {
  if (isDynamicId(segment)) return `#${segment}`;
  return PATH_TITLES[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
};

export default function DashboardLayout({ children }) {
  const { user, isLoading, isLoggedIn } = useAuth();
  const location = useLocation();


  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4 mx-auto" />
          <p className="text-muted-foreground font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }


  // Generate breadcrumbs from path
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    title: toTitle(segment),
    href:
      BREADCRUMB_ROUTE_OVERRIDES[`/${pathSegments.slice(0, index + 1).join("/")}`] ||
      `/${pathSegments.slice(0, index + 1).join("/")}`,
    isLast: index === pathSegments.length - 1,
  }));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen flex flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border mx-2" />
            <Breadcrumb className="hidden md:block">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.length > 0 && <BreadcrumbSeparator />}
                {breadcrumbs.map((bc, idx) => (
                  <React.Fragment key={bc.href}>
                    <BreadcrumbItem>
                      {bc.isLast ? (
                        <BreadcrumbPage>{bc.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={bc.href}>{bc.title}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            {/* Mobile: show only current page title */}
            <span className="font-semibold text-sm md:hidden">
              {breadcrumbs[breadcrumbs.length - 1]?.title ?? "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle variant="dashboard" />
            {user && (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold">{user.first_name} {user.last_name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {user.groups?.[0] ?? "User"}
                  </p>
                </div>
                <UserAvatar size="lg" showImage={true} />
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 bg-muted/30 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
