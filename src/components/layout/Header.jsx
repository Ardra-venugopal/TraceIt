import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface-white border-b border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-sans font-extrabold text-2xl tracking-tight text-terracotta">
                TraceIt
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-sm font-medium text-charcoal hover:text-terracotta transition-colors duration-150"
            >
              Home
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-charcoal hover:text-terracotta transition-colors duration-150"
            >
              How It Works
            </a>
            <Link
              to="/student/login"
              className="text-sm font-medium text-charcoal hover:text-terracotta transition-colors duration-150"
            >
              Lost & Found
            </Link>
            <a
              href="#about"
              className="text-sm font-medium text-charcoal hover:text-terracotta transition-colors duration-150"
            >
              About
            </a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/student/login"
              className="text-sm font-medium text-deep-slate hover:text-terracotta px-3 py-2 transition-colors duration-150"
            >
              Student Portal
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-surface-white bg-deep-slate hover:bg-terracotta rounded-btn transition-colors duration-150"
            >
              Admin Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
