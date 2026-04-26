import React from "react";
import { Link, useLocation } from "react-router";
import { CircleUserRound, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/services/api/useAuth";
import { useAuth as useContextAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/UserAvatar";


export default function PublicLayout({ children }) {
  const auth = useContextAuth();
  const { user, isLoggedIn, logout: handleLogout } = useAuth();
  const location = useLocation();
  const dashboardPath = (() => {
    if (auth?.isAuthLoading) return "#";
    if (!isLoggedIn) return "/login";
    if (user?.is_superuser || user?.groups?.includes("SuperAdmin") || user?.groups?.includes("Super Admin")) return "/superadmin/users";
    // Prioritize owner/agent dashboards before admin for mixed-role accounts.
    if (user?.groups?.includes("Owner")) return "/owner/dashboard";
    if (user?.groups?.includes("Agent")) return "/agent/dashboard";
    if (user?.groups?.includes("Admin")) return "/admin/audit-dashboard";
    if (user?.groups?.includes("Buyer")) return "/buyer/dashboard";
    return "/tours";
  })();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/all-properties", label: "Properties" },
    { to: "/places", label: "Locations" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-800/95 backdrop-blur-md shadow-sm border-b border-blue-900">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-amber-900 rounded-lg flex items-center justify-center group-hover:bg-amber-800 transition shadow-sm">
              <span className="text-white font-bold text-lg">RE</span>
            </div>
            <h1 className="font-bold text-xl text-white group-hover:text-gray-200 transition tracking-tight">RealEstate</h1>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex flex-row gap-8 text-white font-medium">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`hover:text-amber-300 transition-colors ${location.pathname === to ? "text-amber-300 font-bold underline underline-offset-8" : ""}`}
              >
                {label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                to={dashboardPath}
                className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth actions */}
          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="text-white/80 hover:text-amber-300 transition-colors font-medium flex items-center gap-2 text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
                <Link to="/profile" className="group">
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">{user?.first_name} {user?.last_name}</p>
                      <p className="text-[10px] text-blue-200">{user?.groups?.[0]}</p>
                    </div>
                    <UserAvatar size="default" showImage={true} />
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-white hover:text-amber-300 transition-colors font-semibold px-4 py-2">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-grow pt-28">
        {children}
      </main>


      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100 border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">RE</span>
                </div>
                <h3 className="text-white font-bold text-xl tracking-tight">RealEstate</h3>
              </div>
              <p className="text-sm text-blue-200 leading-relaxed">Your trusted partner in finding the perfect property across the country. Premium service for premium lifestyles.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-amber-300 transition-colors">Home</Link></li>
                <li><Link to="/all-properties" className="hover:text-amber-300 transition-colors">Properties</Link></li>
                <li><Link to="/places" className="hover:text-amber-300 transition-colors">Locations</Link></li>
                {isLoggedIn && (
                  <li><Link to={dashboardPath} className="hover:text-amber-300 transition-colors">Dashboard</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-amber-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-300 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Contact Us</h4>
              <ul className="space-y-3 text-sm text-blue-100">
                <li className="flex items-center gap-2">Email: info@realestate.ph</li>
                <li className="flex items-center gap-2">Phone: +63 (2) 8123 4567</li>
                <li className="flex items-center gap-2">Address: BGC, Taguig City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-sm text-blue-300/80">
              Copyright &copy; {new Date().getFullYear()} RealEstate Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

