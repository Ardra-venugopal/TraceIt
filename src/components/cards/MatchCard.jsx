import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import Badge from "../ui/Badge";

export default function MatchCard({ candidate }) {
  const { item, score } = candidate;

  return (
    <div className="bg-surface-white border border-subtle hover:border-terracotta/40 rounded-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
      <div className="flex items-start gap-4">
        {/* Score Circle Indicator */}
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-warm-beige border border-terracotta/20 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold text-terracotta leading-none">{score}%</span>
          <span className="text-[8px] uppercase tracking-wider text-dusty-blue mt-0.5">match</span>
        </div>

        {/* Content Details */}
        <div>
          <span className="text-[9px] uppercase font-bold tracking-widest text-dusty-blue block">
            {item.category} • {item.type}
          </span>
          <h4 className="font-sans font-bold text-base text-charcoal mb-1">
            {item.name}
          </h4>
          <div className="flex items-center gap-1 text-xs text-charcoal/70">
            <MapPin className="w-3.5 h-3.5 text-slate-blue" />
            <span>{item.location}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full sm:w-auto">
        <Link
          to={`/student/item/${item.id}`}
          className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2 border border-deep-slate text-deep-slate hover:bg-deep-slate hover:text-surface-white font-semibold text-xs rounded-btn uppercase tracking-wider transition-colors"
        >
          <span>View Match</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
