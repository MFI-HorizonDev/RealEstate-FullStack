import React from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/services/api/useAuth";
import { Navigate, useLocation } from "react-router";

const pageTitles = {
  "/tours": "My Tours",
  "/bookings": "My Bookings",
  "/admin/audit-dashboard": "Audit Dashboard",
  "/admin/pending-sales": "Pending Sales",
  "/admin/market-update": "Market Update",
  "/agent/dashboard": "Agent Dashboard",
  "/agent/properties": "Agent Properties",
  "/agent/commissions": "Agent Commissions",
  "/owner/dashboard": "Owner Dashboard",
  "/owner/listings": "My Listings",
  "/buyer/dashboard": "Buyer Dashboard",
  "/profile": "Account Profile",
  "/test-pagination": "Test Pagination",
};

export default function withDashboardSidebar(Component) {
  function DashboardSidebarWrapper(props) {
    const { user, isLoading, isLoggedIn } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-800" />
            <p className="font-medium text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      );
    }

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const pageTitle = (() => {
      if (pathSegments.length === 0) return "Dashboard";
      const last = pathSegments[pathSegments.length - 1];
      const raw = last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
      return pageTitles[location.pathname] || raw;
    })();

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-screen">
          <main>
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div className="h-4 w-px bg-gray-300" />
                <h1 className="text-sm font-bold text-gray-900 md:text-base">{pageTitle}</h1>
              </div>
              {user && (
                <div className="flex items-center gap-3">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-bold text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {user.groups?.[0] || "User"}
                    </p>
                  </div>
                  <UserAvatar size="lg" showImage />
                </div>
              )}
            </header>
            <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 p-6 lg:p-10">
              <Component {...props} />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  DashboardSidebarWrapper.displayName = `withDashboardSidebar(${Component.displayName || Component.name || "Component"})`;
  return DashboardSidebarWrapper;
}

