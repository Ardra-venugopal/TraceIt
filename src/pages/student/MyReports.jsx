import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { itemService } from "../../services/itemService";
import ItemCard from "../../components/cards/ItemCard";

export default function MyReports() {
  const currentUser = authService.getCurrentUser();
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("lost"); // lost, found


  useEffect(() => {
    if (!currentUser) return;

    const loadReports = async () => {
      try {
        const allItems = await itemService.getAll();

        const myReports = allItems.filter(
          item => item.reporterUserId === currentUser.id
        );

        setReports(myReports);
      } catch (error) {
        console.error("Failed to load my reports:", error);
      }
    };

    loadReports();
  }, [currentUser?.id]);


  const filteredReports = reports.filter(item => item.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight">
          My Reports
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Review and track lost or found items you have reported to TraceIt.
        </p>
      </div>

      {/* Tabs bar */}
      <div className="border-b border-subtle flex gap-4">
        <button
          onClick={() => setActiveTab("lost")}
          className={`py-3 px-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "lost"
            ? "border-terracotta text-terracotta"
            : "border-transparent text-charcoal/60 hover:text-charcoal hover:border-slate-blue/50"
            }`}
        >
          Lost Items ({reports.filter(r => r.type === "lost").length})
        </button>
        <button
          onClick={() => setActiveTab("found")}
          className={`py-3 px-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "found"
            ? "border-deep-slate text-deep-slate"
            : "border-transparent text-charcoal/60 hover:text-charcoal hover:border-slate-blue/50"
            }`}
        >
          Found Items ({reports.filter(r => r.type === "found").length})
        </button>
      </div>

      {/* Grid Content */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(item => (
            <ItemCard key={item.id} item={item} showReporter={false} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-white border border-subtle p-12 rounded-card text-center text-sm text-dusty-blue">
          You haven't filed any {activeTab} reports yet.
        </div>
      )}
    </div>
  );
}
