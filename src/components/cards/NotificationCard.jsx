import React from "react";
import { Bell, Check, Eye } from "lucide-react";

export default function NotificationCard({ notification, onMarkRead }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { day: "numeric", month: "short" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  return (
    <div className={`border rounded-card p-4 flex gap-4 items-start transition-colors ${
      notification.read 
        ? "bg-surface-white border-subtle opacity-75" 
        : "bg-surface-white border-terracotta/30 shadow-sm"
    }`}>
      {/* Icon */}
      <div className={`p-2 rounded-full flex-shrink-0 ${
        notification.read ? "bg-warm-beige text-dusty-blue" : "bg-terracotta/10 text-terracotta"
      }`}>
        <Bell className="w-5 h-5" />
      </div>

      {/* Message Content */}
      <div className="flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h4 className={`font-sans font-bold text-sm text-charcoal leading-tight ${
            !notification.read ? "text-terracotta" : ""
          }`}>
            {notification.title}
          </h4>
          <span className="text-[10px] text-slate-blue whitespace-nowrap">
            {formatDate(notification.date)}
          </span>
        </div>
        <p className="text-xs text-charcoal/80 mt-1 leading-relaxed">
          {notification.message}
        </p>
      </div>

      {/* Action Button */}
      {!notification.read && onMarkRead && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="flex-shrink-0 p-1 text-dusty-blue hover:text-terracotta rounded-btn hover:bg-warm-beige/30 transition-colors"
          title="Mark as read"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
