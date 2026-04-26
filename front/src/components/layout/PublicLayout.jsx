import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { CircleUserRound, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { logout, isUserLoggedIn, useAuth } from "@/hooks/api/authentication/useAuth";
import { useAuth as useContextAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/UserAvatar";
import ModeToggle from "@/components/ModeToggle";


export default function PublicLayout({ children }) {
  const auth = useContextAuth();
  const { user, isLoggedIn, logout: handleLogout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
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
    { to: "/about", label: "About" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md shadow-sm border-b border-primary">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-amber-900 rounded-lg flex items-center justify-center group-hover:bg-amber-800 transition shadow-sm">
              <span className="text-white font-bold text-lg">RE</span>
            </div>
            <h1 className="font-bold text-xl text-primary-foreground group-hover:text-primary-foreground/80 transition tracking-tight">RealEstate</h1>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex flex-row gap-8 text-primary-foreground font-medium">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`hover:text-primary-foreground/70 transition-colors ${location.pathname === to ? "text-primary-foreground font-bold underline underline-offset-8" : ""}`}
              >
                {label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                to={dashboardPath}
                className="hover:text-primary-foreground/70 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth actions */}
          <div className="flex items-center gap-3">
            <ModeToggle />
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden text-primary-foreground p-2 rounded-lg hover:bg-primary-foreground/10 transition"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium flex items-center gap-2 text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
                <Link to="/profile" className="group">
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-primary-foreground group-hover:text-primary-foreground/70 transition-colors">{user?.first_name} {user?.last_name}</p>
                      <p className="text-[10px] text-primary-foreground/60">{user?.groups?.[0]}</p>
                    </div>
                    <UserAvatar size="default" showImage={true} />
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-primary-foreground hover:text-primary-foreground/70 transition-colors font-semibold px-4 py-2">
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

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={closeMobile} />
          <div className="relative flex flex-col w-72 max-w-full bg-primary h-full shadow-xl pt-20 px-6 gap-2 overflow-y-auto">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobile}
                className={`py-3 text-lg font-medium border-b border-primary-foreground/20 ${
                  location.pathname === to ? "text-primary-foreground font-bold" : "text-primary-foreground/80 hover:text-primary-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                to={dashboardPath}
                onClick={closeMobile}
                className="py-3 text-lg font-medium border-b border-primary-foreground/20 text-primary-foreground/80 hover:text-primary-foreground flex items-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </Link>
            )}
            {isLoggedIn ? (
              <button
                onClick={() => { handleLogout(); closeMobile(); }}
                className="mt-4 text-left py-3 text-lg font-medium text-red-300 hover:text-red-200 flex items-center gap-2 w-full"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <Link to="/login" onClick={closeMobile} className="py-3 text-center text-primary-foreground font-semibold border border-primary-foreground/30 rounded-lg hover:bg-primary-foreground/10">
                  Sign In
                </Link>
                <Link to="/signup" onClick={closeMobile} className="py-3 text-center bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="flex-grow pt-20 md:pt-28">
        {children}
      </main>


      {/* Footer */}
      <footer className="bg-primary text-primary-foreground border-t border-primary/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">RE</span>
                </div>
                <h3 className="text-white font-bold text-xl tracking-tight">RealEstate</h3>
              </div>
              <p className="text-sm text-primary-foreground/70 leading-relaxed">Your trusted partner in finding the perfect property across the country. Premium service for premium lifestyles.</p>
            </div>
            <div>
              <h4 className="text-primary-foreground font-bold mb-6 text-sm uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-3 text-sm text-primary-foreground/80">
                <li><Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link></li>
                <li><Link to="/all-properties" className="hover:text-primary-foreground transition-colors">Properties</Link></li>
                <li><Link to="/places" className="hover:text-primary-foreground transition-colors">Locations</Link></li>
                {isLoggedIn && (
                  <li><Link to={dashboardPath} className="hover:text-primary-foreground transition-colors">Dashboard</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-primary-foreground font-bold mb-6 text-sm uppercase tracking-widest">Support</h4>
              <ul className="space-y-3 text-sm text-primary-foreground/80">
                <li><a href="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-primary-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-primary-foreground font-bold mb-6 text-sm uppercase tracking-widest">Contact Us</h4>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li className="flex items-center gap-2">Email: info@realestate.ph</li>
                <li className="flex items-center gap-2">Phone: +63 (2) 8123 4567</li>
                <li className="flex items-center gap-2">Address: BGC, Taguig City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-sm text-primary-foreground/60">
              Copyright &copy; {new Date().getFullYear()} RealEstate Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

