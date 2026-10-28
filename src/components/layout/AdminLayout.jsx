import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import { 
  LayoutDashboard, 
  Search, 
  CheckSquare, 
  Award, 
  Users, 
  FolderLock, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = authService.getCurrentUser();

  // Route guard
  if (!currentUser || currentUser.role !== "admin") {
    return <div className="p-8 text-center text-red-600">Please sign in as an admin first. <Link to="/admin/login" className="underline">Go to Admin Login</Link></div>;
  }

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Lost Reports", path: "/admin/lost", icon: Search },
    { name: "Found Reports", path: "/admin/found", icon: CheckSquare },
    { name: "Claims", path: "/admin/claims", icon: Award },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Items", path: "/admin/items", icon: FolderLock },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-main-bg flex flex-col md:flex-row">
      {/* Mobile Nav Header */}
      <div className="md:hidden flex items-center justify-between bg-surface-white px-4 h-16 border-b border-subtle">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <span className="font-sans font-extrabold text-xl tracking-tight text-deep-slate">
            TraceIt <span className="text-terracotta text-sm font-semibold uppercase">Admin</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center p-2 rounded-btn text-charcoal hover:text-terracotta hover:bg-warm-beige/50 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-white border-b border-subtle px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-base font-medium rounded-btn transition-colors ${
                  active
                    ? "bg-warm-beige text-terracotta"
                    : "text-charcoal hover:bg-warm-beige/30 hover:text-terracotta"
                }`}
              >
                <Icon className="w-5 h-5 text-dusty-blue" />
                {link.name}
              </Link>
            );
          })}
          <hr className="border-subtle my-2" />
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="flex items-center w-full gap-2.5 px-3 py-2 text-base font-medium text-red-700 hover:bg-red-50 rounded-btn transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-surface-white border-r border-subtle min-h-screen">
        <div className="p-6 border-b border-subtle flex flex-col gap-1">
          <Link to="/admin/dashboard" className="flex items-center">
            <span className="font-sans font-extrabold text-2xl tracking-tight text-deep-slate">
              TraceIt <span className="text-terracotta text-base font-bold">Admin</span>
            </span>
          </Link>
          <div className="text-xs text-dusty-blue mt-1">Logged in as {currentUser.name}</div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-btn transition-all duration-150 ${
                  active
                    ? "bg-warm-beige text-terracotta border-l-4 border-terracotta"
                    : "text-charcoal hover:bg-warm-beige/30 hover:text-terracotta"
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${active ? "text-terracotta" : "text-dusty-blue"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-subtle">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-semibold text-charcoal hover:text-red-700 hover:bg-red-50/50 rounded-btn transition-colors"
          >
            <LogOut className="w-4 h-4 text-dusty-blue" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Panel Content */}
      <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
