import React from "react";
import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import { 
  Laptop, 
  FileText, 
  Glasses, 
  PenTool, 
  Briefcase, 
  CupSoda, 
  Key, 
  Shirt, 
  Contact2, 
  HelpCircle, 
  MapPin, 
  Calendar 
} from "lucide-react";

export default function ItemCard({ item, showReporter = true }) {
  const getCategoryIcon = (category) => {
    const size = "w-8 h-8 text-dusty-blue";
    const cat = category ? category.toLowerCase() : "";

    switch (cat) {
      case "electronics":
        return <Laptop className={size} />;
      case "documents":
        return <FileText className={size} />;
      case "accessories":
        return <Glasses className={size} />;
      case "stationery":
        return <PenTool className={size} />;
      case "bags":
        return <Briefcase className={size} />;
      case "water bottles":
        return <CupSoda className={size} />;
      case "keys":
        return <Key className={size} />;
      case "clothing":
        return <Shirt className={size} />;
      case "id cards":
        return <Contact2 className={size} />;
      default:
        return <HelpCircle className={size} />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  return (
    <div className="bg-surface-white border border-subtle rounded-card overflow-hidden flex flex-col hover:border-terracotta/40 transition-colors duration-200">
      {/* Category Icon Banner (replaces placeholders) */}
      <div className="bg-warm-beige p-6 flex items-center justify-center border-b border-subtle relative">
        {getCategoryIcon(item.category)}
        <div className="absolute top-3 right-3">
          <Badge status={item.status} />
        </div>
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-deep-slate text-surface-white`}>
            {item.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue block mb-1">
            {item.category}
          </span>
          <h3 className="font-sans font-bold text-lg text-charcoal mb-2 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-sm text-charcoal/80 line-clamp-2 mb-4 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata info */}
        <div className="space-y-2 border-t border-subtle/50 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-charcoal/70">
            <MapPin className="w-3.5 h-3.5 text-slate-blue" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-charcoal/70">
            <Calendar className="w-3.5 h-3.5 text-slate-blue" />
            <span>{formatDate(item.date)}</span>
          </div>
          {showReporter && (
            <div className="text-xs text-charcoal/60 italic pt-1">
              {item.type === "lost" ? "Reported by" : "Found by"} {item.reporterName}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <Link
            to={`/student/item/${item.id}`}
            className="block text-center w-full py-2 border border-deep-slate hover:bg-deep-slate hover:text-surface-white text-deep-slate font-semibold text-sm rounded-btn transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
