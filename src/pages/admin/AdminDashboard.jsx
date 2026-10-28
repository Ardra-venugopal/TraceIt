import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { itemService } from "../../services/itemService";
import Badge from "../../components/ui/Badge";
import {
  FileText,
  Search,
  CheckSquare,
  Award,
  Users,
  ChevronRight,
  MapPin,
  Calendar
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    claims: 0,
    returned: 0,
    users: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("traceit_token");

        const [items, claimsResponse, usersResponse] = await Promise.all([
          itemService.getAll(),
          fetch("http://localhost:5000/api/claims", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/auth/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!claimsResponse.ok) {
          throw new Error("Could not load claims.");
        }

        if (!usersResponse.ok) {
          throw new Error("Could not load users.");
        }

        const claims = await claimsResponse.json();
        const users = await usersResponse.json();

        setStats({
          lost: items.filter(item => item.type === "lost").length,
          found: items.filter(item => item.type === "found").length,
          claims: claims.filter(claim =>
            ["Pending", "Under Review"].includes(claim.status)
          ).length,
          returned: items.filter(item => item.status === "Returned").length,
          users: users.filter(user =>
            user.status === "Active" && user.role === "student"
          ).length,
        });

        setRecentReports(
          [...items]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        );

        setPendingClaims(
          claims
            .filter(claim =>
              ["Pending", "Under Review"].includes(claim.status)
            )
            .slice(0, 3)
        );
      } catch (error) {
        console.error("Dashboard loading error:", error);
        alert("Could not load dashboard data. Please check the backend.");
      }
    };

    loadDashboard();
  }, []);
  return (
    <div className="space-y-8">
      {/* Welcome admin */}
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight">
          Admin Console
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Monitor lost & found statistics, review claims, and audit item statuses.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface-white border border-subtle p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Total Lost</span>
          <span className="text-3xl font-extrabold text-terracotta mt-2">{stats.lost}</span>
        </div>
        <div className="bg-surface-white border border-subtle p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Total Found</span>
          <span className="text-3xl font-extrabold text-deep-slate mt-2">{stats.found}</span>
        </div>
        <div className="bg-surface-white border border-subtle p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Pending Claims</span>
          <span className="text-3xl font-extrabold text-terracotta mt-2">{stats.claims}</span>
        </div>
        <div className="bg-surface-white border border-subtle p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Returned Items</span>
          <span className="text-3xl font-extrabold text-muted-green mt-2">{stats.returned}</span>
        </div>
        <div className="bg-surface-white border border-subtle p-5 rounded-card flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Active Users</span>
          <span className="text-3xl font-extrabold text-deep-slate mt-2">{stats.users}</span>
        </div>
      </div>

      {/* Grid: Combined reports list & Pending claims */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports Table (2 columns wide on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-bold text-lg text-charcoal">Recent Item Submissions</h3>
            <Link to="/admin/items" className="text-xs font-bold text-terracotta hover:underline flex items-center gap-0.5">
              <span>View Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-surface-white border border-subtle rounded-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-subtle/50 text-left text-xs">
                <thead className="bg-warm-beige/35 uppercase tracking-wider font-bold text-deep-slate">
                  <tr>
                    <th className="px-5 py-3">Item</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Reporter</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle/50 text-charcoal">
                  {recentReports.map(item => (
                    <tr key={item.id} className="hover:bg-warm-beige/10 transition-colors">
                      <td className="px-5 py-3 font-bold text-charcoal truncate max-w-[150px]">
                        {item.name}
                      </td>
                      <td className="px-5 py-3 capitalize font-semibold">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${item.type === "lost" ? "bg-terracotta/10 text-terracotta" : "bg-deep-slate/10 text-deep-slate"
                          }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-charcoal/70">{item.reporterName}</td>
                      <td className="px-5 py-3 text-charcoal/70">{item.location}</td>
                      <td className="px-5 py-3">
                        <Badge status={item.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={item.type === "lost" ? "/admin/lost" : "/admin/found"}
                          className="font-bold text-terracotta hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending Claims List (1 column wide) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-bold text-lg text-charcoal">Awaiting Claims</h3>
            <Link to="/admin/claims" className="text-xs font-bold text-terracotta hover:underline">
              All Claims
            </Link>
          </div>

          <div className="space-y-3">
            {pendingClaims.length > 0 ? (
              pendingClaims.map(claim => (
                <div key={claim.id} className="bg-surface-white border border-subtle rounded-card p-4 hover:border-slate-blue/50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">
                      Claim Submission
                    </span>
                    <Badge status={claim.status} />
                  </div>
                  <h4 className="font-bold text-sm text-charcoal mt-1 line-clamp-1">
                    {claim.itemName}
                  </h4>
                  <div className="text-xs text-charcoal/80 mt-1">
                    Claimed by: <span className="font-semibold">{claim.claimantName}</span>
                  </div>
                  <div className="mt-3 flex justify-between items-center pt-2 border-t border-subtle/50">
                    <span className="text-[10px] text-slate-blue flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(claim.dateClaimed).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                    </span>
                    <Link
                      to="/admin/claims"
                      className="text-xs font-bold text-deep-slate hover:text-terracotta uppercase tracking-wider"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-surface-white border border-subtle p-8 rounded-card text-center text-xs text-dusty-blue">
                No claims require review at this time.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
