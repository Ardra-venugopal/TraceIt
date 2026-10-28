import React, { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import { BarChart3, TrendingUp, RefreshCw, Layers, MapPin } from "lucide-react";

export default function AdminAnalytics() {
  const [data, setData] = useState({
    lost: 0,
    found: 0,
    returned: 0,
    recoveryRate: 0,
    categoryCounts: {},
    locationCounts: {},
    claimStats: { pending: 0, approved: 0, returned: 0, rejected: 0 }
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const token = localStorage.getItem("traceit_token");

        const [items, claimsResponse] = await Promise.all([
          itemService.getAll(),
          fetch("http://localhost:5000/api/claims", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!claimsResponse.ok) {
          throw new Error("Could not load claims.");
        }

        const claims = await claimsResponse.json();

        const lost = items.filter(i => i.type === "lost").length;
        const found = items.filter(i => i.type === "found").length;
        const returned = items.filter(i => i.status === "Returned").length;

        const recoveryRate =
          lost > 0 ? Math.round((returned / lost) * 100) : 0;

        const categoryCounts = {};
        items.forEach(i => {
          const category = i.category || "Uncategorized";
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        const locationCounts = {};
        items.forEach(i => {
          const location = i.location || "Unknown";
          locationCounts[location] = (locationCounts[location] || 0) + 1;
        });

        const claimStats = {
          pending: 0,
          approved: 0,
          returned: 0,
          rejected: 0,
        };

        claims.forEach(c => {
          const status = (c.status || "Pending").toLowerCase();

          if (status === "pending" || status === "under review") {
            claimStats.pending++;
          } else if (status === "approved") {
            claimStats.approved++;
          } else if (status === "returned") {
            claimStats.returned++;
          } else if (status === "rejected") {
            claimStats.rejected++;
          }
        });

        setData({
          lost,
          found,
          returned,
          recoveryRate,
          categoryCounts,
          locationCounts,
          claimStats,
        });
      } catch (error) {
        console.error("Analytics loading error:", error);
        alert("Could not load analytics. Please check the backend.");
      }
    };

    loadAnalytics();
  }, []);

  const sortedCategories = Object.entries(data.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const sortedLocations = Object.entries(data.locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCategoryCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;
  const maxLocationCount = sortedLocations.length > 0 ? sortedLocations[0][1] : 1;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-terracotta" />
          <span>System Analytics</span>
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Review lost & found matching metrics and campus recovery rates.
        </p>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recovery Rate Card */}
        <div className="bg-surface-white border border-subtle p-6 rounded-card space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-dusty-blue">
            <TrendingUp className="w-4 h-4 text-muted-green" />
            <span>Campus Recovery Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-muted-green">{data.recoveryRate}%</span>
            <span className="text-xs text-charcoal/70">of lost items recovered</span>
          </div>
          <div className="w-full bg-warm-beige h-2 rounded-full overflow-hidden">
            <div
              className="bg-muted-green h-full rounded-full"
              style={{ width: `${data.recoveryRate}%` }}
            />
          </div>
        </div>

        {/* Ratio Card */}
        <div className="bg-surface-white border border-subtle p-6 rounded-card space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-dusty-blue">
            <RefreshCw className="w-4 h-4 text-terracotta" />
            <span>Lost vs Found Ratio</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-3xl font-extrabold text-terracotta">{data.lost}</span>
              <span className="block text-[10px] text-slate-blue uppercase font-bold mt-1">Lost Reports</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-deep-slate">{data.found}</span>
              <span className="block text-[10px] text-slate-blue uppercase font-bold mt-1">Found Reports</span>
            </div>
          </div>
        </div>

        {/* Claim statuses card */}
        <div className="bg-surface-white border border-subtle p-6 rounded-card space-y-4">
          <div className="text-xs uppercase font-extrabold tracking-widest text-dusty-blue">
            <span>Claims Audits</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-charcoal/80">
            <div className="flex justify-between border-b border-subtle/30 pb-1">
              <span>Pending Review:</span>
              <span className="font-bold text-terracotta">{data.claimStats.pending}</span>
            </div>
            <div className="flex justify-between border-b border-subtle/30 pb-1">
              <span>Approved Claims:</span>
              <span className="font-bold text-muted-green">{data.claimStats.approved}</span>
            </div>
            <div className="flex justify-between border-b border-subtle/30 pb-1">
              <span>Returned to Owner:</span>
              <span className="font-bold text-deep-slate">{data.claimStats.returned}</span>
            </div>
            <div className="flex justify-between border-b border-subtle/30 pb-1">
              <span>Rejected Claims:</span>
              <span className="font-bold text-red-700">{data.claimStats.rejected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Categories and Locations chart breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Bar Chart */}
        <div className="bg-surface-white border border-subtle p-6 rounded-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-deep-slate">
            <Layers className="w-4 h-4 text-dusty-blue" />
            <span>Top Categories</span>
          </div>

          <div className="space-y-3 pt-2">
            {sortedCategories.map(([category, count]) => {
              const percentage = Math.max(10, Math.round((count / maxCategoryCount) * 100));
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs text-charcoal/90 font-medium">
                    <span>{category}</span>
                    <span className="font-bold">{count} items</span>
                  </div>
                  <div className="w-full bg-main-bg h-3 border border-subtle/50 rounded-full overflow-hidden">
                    <div
                      className="bg-dusty-blue h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {sortedCategories.length === 0 && (
              <div className="text-center py-8 text-xs text-dusty-blue">No category data.</div>
            )}
          </div>
        </div>

        {/* Locations Bar Chart */}
        <div className="bg-surface-white border border-subtle p-6 rounded-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-deep-slate">
            <MapPin className="w-4 h-4 text-dusty-blue" />
            <span>Top Lost & Found Locations</span>
          </div>

          <div className="space-y-3 pt-2">
            {sortedLocations.map(([location, count]) => {
              const percentage = Math.max(10, Math.round((count / maxLocationCount) * 100));
              return (
                <div key={location} className="space-y-1">
                  <div className="flex justify-between text-xs text-charcoal/90 font-medium">
                    <span>{location}</span>
                    <span className="font-bold">{count} items</span>
                  </div>
                  <div className="w-full bg-main-bg h-3 border border-subtle/50 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-blue h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {sortedLocations.length === 0 && (
              <div className="text-center py-8 text-xs text-dusty-blue">No location data.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
