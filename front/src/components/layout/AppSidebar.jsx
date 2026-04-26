import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import {
  Home,
  Building2,
  MapPin,
  CalendarDays,
  CalendarCheck,
  UserCircle,
  LogOut,
  ShieldAlert,
  Users,
  DollarSign,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Zap,
} from "lucide-react";
import { logout } from "@/hooks/api/authentication/useAuth";
import { useAuth as useContextAuth } from "@/context/AuthContext";

export function AppSidebar() {
  const location = useLocation();
  const { user, isAdmin: canAdminFromContext, isAgent: canCreateAsAgent, isOwner: canCreateAsOwner } = useContextAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const isAdmin    = user?.is_superuser || user?.groups?.includes("Admin") || user?.groups?.includes("SuperAdmin") || user?.groups?.includes("Super Admin");
  const isSuperAdmin = user?.is_superuser || user?.groups?.includes("SuperAdmin") || user?.groups?.includes("Super Admin");
  const isAgent    = user?.groups?.includes("Agent");
  const isOwner    = user?.groups?.includes("Owner");
  const isBuyer    = user?.groups?.includes("Buyer");

  // ── Nav sections per role ──────────────────────────────────────────────────
  const adminItems = isAdmin ? [
    { title: "Audit Dashboard",     url: "/admin/audit-dashboard",  icon: ShieldAlert },
    { title: "Pending Sales",       url: "/admin/pending-sales",    icon: ClipboardList },
    { title: "Create Listing",      url: "/properties/create",      icon: PlusCircle },
    { title: "Trigger Market Update", url: "/admin/market-update",  icon: Zap },
  ] : [];

  const superAdminItems = isSuperAdmin ? [
    { title: "Manage Users",        url: "/superadmin/users",       icon: Users },
    { title: "All Properties",      url: "/superadmin/properties",  icon: Building2 },
  ] : [];

  const agentItems = isAgent ? [
    { title: "Agent Dashboard",     url: "/agent/dashboard",        icon: LayoutDashboard },
    { title: "My Tours",            url: "/tours",                  icon: CalendarDays },
    { title: "Create Listing",      url: "/properties/create",      icon: PlusCircle },
    ...(canAdminFromContext ? [{ title: "My Commissions", url: "/agent/commissions", icon: DollarSign }] : []),
  ] : [];

  const ownerItems = isOwner ? [
    { title: "Owner Dashboard",     url: "/owner/dashboard",        icon: LayoutDashboard },
    { title: "My Listings",         url: "/owner/listings",         icon: Building2 },
    ...(canCreateAsAgent || canCreateAsOwner || canAdminFromContext ? [{ title: "Create Listing", url: "/properties/create", icon: PlusCircle }] : []),
    { title: "My Sales",            url: "/bookings",               icon: DollarSign },
  ] : [];

  const buyerItems = isBuyer ? [
    { title: "Buyer Dashboard",     url: "/buyer/dashboard",        icon: LayoutDashboard },
    { title: "Browse Properties",   url: "/all-properties",         icon: Building2 },
    { title: "My Tours",            url: "/tours",                  icon: CalendarDays },
    { title: "My Bookings",         url: "/bookings",               icon: CalendarCheck },
  ] : [];

  const exploreItems = [
    { title: "Public Home",         url: "/",                       icon: Home },
    { title: "Locations",           url: "/places",                 icon: MapPin },
    { title: "My Profile",          url: "/profile",                icon: UserCircle },
  ];

  const NavSection = ({ label, items }) => {
    if (!items.length) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                  <Link to={item.url} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">RE</span>
          </div>
          <h2 className="font-bold text-lg text-foreground">RealEstate</h2>
        </Link>
        {user && (
          <div className="mt-4 px-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Logged in as</p>
            <p className="text-sm font-bold text-primary truncate">{user.first_name} {user.last_name}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.is_superuser && (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-700 font-bold uppercase">
                  SuperAdmin
                </span>
              )}
              {user.groups?.map(g => (
                <span key={g} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded border border-border font-bold uppercase">
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <NavSection label="Admin"      items={adminItems} />
        <NavSection label="SuperAdmin" items={superAdminItems} />
        <NavSection label="Agent"      items={agentItems} />
        <NavSection label="Owner"      items={ownerItems} />
        <NavSection label="Buyer"      items={buyerItems} />
        <NavSection label="Explore"    items={exploreItems} />
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
