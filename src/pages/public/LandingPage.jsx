import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import { authService } from "../../services/authService";
import { 
  FileText, 
  Search, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Calendar 
} from "lucide-react";

export default function LandingPage() {
  const currentUser = authService.getCurrentUser();
  const studentDashboardLink = currentUser && currentUser.role === "student" 
    ? "/student/dashboard" 
    : "/student/login";

  return (
    <div className="min-h-screen bg-main-bg flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="flex-grow flex items-center py-16 md:py-24 border-b border-subtle bg-warm-texture">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-terracotta bg-terracotta/10 px-3 py-1 rounded-full">
            Campus Lost & Found Platform
          </span>
          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl text-charcoal mt-6 tracking-tight leading-none">
            Find it. Claim it. <span className="text-terracotta">Trace it.</span>
          </h1>
          <p className="font-sans font-medium text-lg sm:text-xl text-dusty-blue mt-6 max-w-2xl mx-auto leading-relaxed">
            TraceIt brings your campus Lost & Found into one simple, organized place. No more lost keys, calculators, or textbooks.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to={studentDashboardLink}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-terracotta hover:bg-terracotta/90 text-surface-white font-bold text-sm tracking-wider uppercase rounded-btn transition-colors"
            >
              Report a Lost Item
            </Link>
            <Link
              to={currentUser && currentUser.role === "student" ? "/student/found" : "/student/login"}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-deep-slate hover:bg-deep-slate/90 text-surface-white font-bold text-sm tracking-wider uppercase rounded-btn transition-colors"
            >
              Browse Found Items
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-surface-white border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight">
              How TraceIt Works
            </h2>
            <p className="text-sm text-dusty-blue mt-2">
              Recovering your items on campus is simple and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="border border-subtle p-6 rounded-card bg-main-bg/50">
              <div className="w-10 h-10 rounded-btn bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-sans font-bold text-base text-charcoal mb-2">Report</h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Log a lost or found report with descriptive text, brand, color, location, and photos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border border-subtle p-6 rounded-card bg-main-bg/50">
              <div className="w-10 h-10 rounded-btn bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-sans font-bold text-base text-charcoal mb-2">Discover</h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Our algorithm processes candidate descriptions to flag high-confidence matches.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border border-subtle p-6 rounded-card bg-main-bg/50">
              <div className="w-10 h-10 rounded-btn bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-sans font-bold text-base text-charcoal mb-2">Claim</h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Submit private identifying details and prove ownership of a matching found item.
              </p>
            </div>

            {/* Step 4 */}
            <div className="border border-subtle p-6 rounded-card bg-main-bg/50">
              <div className="w-10 h-10 rounded-btn bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="font-sans font-bold text-base text-charcoal mb-2">Recover</h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Once approved by campus administration, arrange a safe pickup to retrieve your item.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explanation Section */}
      <section id="about" className="py-16 bg-main-bg border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-terracotta">
                Campus Safety & Trust
              </span>
              <h2 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight mt-2">
                A Secure Platform for University Students
              </h2>
              <p className="text-sm text-charcoal/80 mt-4 leading-relaxed">
                TraceIt maps Lost & Found operations with administrative guardrails. Reports must pass student and admin checks. We never expose your private information or email address directly on public listings.
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-muted-green mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Admin Approvals</h4>
                    <p className="text-xs text-charcoal/70">All claims are checked by campus admins before items change hands.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-muted-green mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Privacy First</h4>
                    <p className="text-xs text-charcoal/70">Personal contact information is hidden; communications flow through notifications.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-muted-green mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Algorithm Matching</h4>
                    <p className="text-xs text-charcoal/70">Find potential items instantly rather than scanning walls of postings.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-white border border-subtle p-8 rounded-card space-y-6">
              <h3 className="font-sans font-extrabold text-xl text-deep-slate">
                Platform Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-warm-beige/30 border border-subtle rounded-card text-center">
                  <span className="block text-2xl font-extrabold text-terracotta">350+</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Items Reported</span>
                </div>
                <div className="p-4 bg-warm-beige/30 border border-subtle rounded-card text-center">
                  <span className="block text-2xl font-extrabold text-muted-green">89%</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Recovery Rate</span>
                </div>
                <div className="p-4 bg-warm-beige/30 border border-subtle rounded-card text-center">
                  <span className="block text-2xl font-extrabold text-deep-slate">48 hrs</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Avg. Return Time</span>
                </div>
                <div className="p-4 bg-warm-beige/30 border border-subtle rounded-card text-center">
                  <span className="block text-2xl font-extrabold text-charcoal">1,200+</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Active Students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-surface-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-sans font-extrabold text-3xl text-charcoal">
            Lost something? Start a report.
          </h2>
          <p className="text-sm text-dusty-blue mt-2 max-w-md mx-auto">
            Submit a descriptive lost report and trace your item against found reports on campus.
          </p>
          <div className="mt-8">
            <Link
              to={studentDashboardLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta/90 text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
            >
              <span>File Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-slate py-8 border-t border-subtle mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-blue">
          <p className="font-semibold">&copy; {new Date().getFullYear()} TraceIt — University Lost & Found. For prototype purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
