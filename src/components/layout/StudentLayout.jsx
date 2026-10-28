import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import { 
  Home, 
  Search, 
  CheckSquare, 
  PlusCircle, 
  FolderOpen, 
  Award, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = authService.getCurrentUser();

  // Route guard
  if (!currentUser || currentUser.role !== "student") {
    // Check if admin is logged in, then they shouldn't access student views or we let them. 
    // It's safer to redirect to login if no session exists.
    return <div className="p-8 text-center text-red-600">Please sign in as a student first. <Link to="/student/login" className="underline">Go to Login</Link></div>;
  }

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/student/dashboard", icon: Home },
    { name: "Lost Items", path: "/student/lost", icon: Search },
    { name: "Found Items", path: "/student/found", icon: CheckSquare },
    { name: "Report", path: "/student/report", icon: PlusCircle },
    { name: "My Reports", path: "/student/reports", icon: FolderOpen },
    { name: "My Claims", path: "/student/claims", icon: Award },
    { name: "Notifications", path: "/student/notifications", icon: Bell },
  ];

  const isActive = (path) => {
    if (path === "/student/report") {
      return location.pathname.startsWith("/student/report");
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-main-bg flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-surface-white border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side Brand */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/student/dashboard" className="flex items-center">
                  <span className="font-sans font-extrabold text-2xl tracking-tight text-terracotta">
                    TraceIt
                  </span>
                </Link>
              </div>
              
              {/* Desktop Nav Items */}
              <div className="hidden lg:ml-8 lg:flex lg:space-x-4 items-center">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded-btn ${
                        active
                          ? "bg-warm-beige text-terracotta"
                          : "text-charcoal hover:bg-warm-beige/50 hover:text-terracotta"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side User Info & Logout */}
            <div className="hidden lg:flex items-center gap-4">
              <Link 
                to="/student/profile" 
                className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-terracotta transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-deep-slate text-surface-white flex items-center justify-center text-xs font-bold uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <span>{currentUser.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-charcoal hover:text-red-700 transition-colors rounded-btn"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-btn text-charcoal hover:text-terracotta hover:bg-warm-beige/50 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-surface-white border-t border-subtle px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-base font-medium rounded-btn transition-colors ${
                    active
                      ? "bg-warm-beige text-terracotta"
                      : "text-charcoal hover:bg-warm-beige/30 hover:text-terracotta"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
            
            <hr className="border-subtle my-2" />
            
            <div className="flex items-center justify-between px-3 py-2">
              <Link 
                to="/student/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-base font-medium text-charcoal"
              >
                <div className="w-8 h-8 rounded-full bg-deep-slate text-surface-white flex items-center justify-center text-xs font-bold uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <span>{currentUser.name}</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 px-3 py-2 text-base font-medium text-charcoal hover:text-red-700 rounded-btn transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content wrapper */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
