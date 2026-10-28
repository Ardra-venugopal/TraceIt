import React from "react";
import { Link } from "react-router-dom";
import { Search, CheckSquare, ArrowRight } from "lucide-react";

export default function ReportChoice() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight">
          File a Campus Report
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Select the type of report you would like to submit to TraceIt.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Option 1: Lost Report */}
        <div className="bg-surface-white border border-subtle hover:border-terracotta/40 p-8 rounded-card flex flex-col justify-between transition-all duration-200">
          <div>
            <div className="w-12 h-12 bg-terracotta/10 text-terracotta rounded-btn flex items-center justify-center mb-6">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-extrabold text-xl text-charcoal mb-3">
              I Lost Something
            </h3>
            <p className="text-sm text-charcoal/80 leading-relaxed mb-6">
              Create a detailed report for your missing belonging. The platform will automatically look for matching items registered as found by other students and staff.
            </p>
          </div>
          <Link
            to="/student/report/lost"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-terracotta hover:bg-terracotta/90 text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
          >
            <span>Start Lost Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Option 2: Found Report */}
        <div className="bg-surface-white border border-subtle hover:border-deep-slate/40 p-8 rounded-card flex flex-col justify-between transition-all duration-200">
          <div>
            <div className="w-12 h-12 bg-deep-slate/10 text-deep-slate rounded-btn flex items-center justify-center mb-6">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-extrabold text-xl text-charcoal mb-3">
              I Found Something
            </h3>
            <p className="text-sm text-charcoal/80 leading-relaxed mb-6">
              Report an item you picked up on campus. Your post will be submitted for admin validation to match it against student queries while protecting finder privacy.
            </p>
          </div>
          <Link
            to="/student/report/found"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-deep-slate hover:bg-deep-slate/90 text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
          >
            <span>Start Found Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
