import React from "react";

export default function Badge({ status, variant }) {
  const getColors = () => {
    if (variant === "match") {
      return "bg-terracotta/10 text-terracotta border-terracotta/20";
    }

    const s = status ? status.toLowerCase() : "";

    switch (s) {
      // Success states (Muted Green)
      case "approved":
      case "returned":
      case "claimed":
      case "resolved":
      case "active-user":
        return "bg-muted-green/10 text-muted-green border-muted-green/20";
      
      // Attention / Primary Accent states (Terracotta)
      case "active":
      case "lost":
        return "bg-terracotta/10 text-terracotta border-terracotta/20";
      
      // Secondary Action states (Deep Slate Blue)
      case "awaiting owner":
      case "found":
        return "bg-deep-slate/10 text-deep-slate border-deep-slate/20";

      // Neutral / Review states (Dusty Blue)
      case "pending review":
      case "under review":
      case "pending":
        return "bg-dusty-blue/10 text-dusty-blue border-dusty-blue/20";
      
      // Warn / Error / Suspended states
      case "rejected":
      case "suspended":
        return "bg-red-700/10 text-red-700 border-red-700/20";
      
      default:
        return "bg-slate-blue/15 text-charcoal/80 border-slate-blue/30";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getColors()}`}>
      {status}
    </span>
  );
}
