import React from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/services/api/useAuth";
import UserAvatar from "@/components/UserAvatar";
import { Navigate, useLocation } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const pageTitles = {
  "/tours": "My Tours",
  "/bookings": "My Bookings",
  "/admin/audit-dashboard": "Audit Dashboard",
  "/test-pagination": "Test Pagination",
  "/profile": "Account Profile",
};

export default function DashboardLayout({ children }) {
  const { user, isLoading, isLoggedIn } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mb-4 mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Generate breadcrumbs from path
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const isLast = index === pathSegments.length - 1;
    const rawTitle = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const title = pageTitles[href] || rawTitle;
    return { title, href, isLast };
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen flex flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="h-4 w-px bg-gray-300 mx-2" />
            <Breadcrumb className="hidden md:block">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.length > 0 && <BreadcrumbSeparator />}
                {breadcrumbs.map((bc, idx) => (
                  <React.Fragment key={bc.href}>
                    <BreadcrumbItem>
                      {bc.isLast ? (
                        <BreadcrumbPage className="font-bold text-gray-900">{bc.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={bc.href}>{bc.title}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            {/* Fallback for mobile */}
            <div className="font-bold text-sm text-gray-900 md:hidden">
              {breadcrumbs[breadcrumbs.length - 1]?.title || "Dashboard"}
            </div>
          </div>

          
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user.first_name} {user.last_name}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.groups?.[0] || 'User'}</p>
              </div>
              <UserAvatar size="lg" showImage={true} />
            </div>
          )}
        </header>
        <main className="flex-1 p-6 lg:p-10 bg-gray-50/50 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

