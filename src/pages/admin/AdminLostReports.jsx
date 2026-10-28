import React, { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import Badge from "../../components/ui/Badge";
import { Search, Trash2, Check, X, CheckSquare, Calendar, MapPin } from "lucide-react";

export default function AdminLostReports() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const updateReportStatus = async (item, status) => {
    try {
      const token = localStorage.getItem("traceit_token");

      const response = await fetch(
        `http://localhost:5000/api/items/${item.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update report status.");
      }

      await loadItems();
    } catch (error) {
      console.error("Update report status error:", error);
      alert(error.message || "Could not update report status.");
    }
  };
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const all = await itemService.getAll("lost");
      setItems(all);
    } catch (error) {
      console.error("Failed to load lost reports:", error);
      alert("Could not load lost reports. Please check the backend.");
    }
  };

  const handleApprove = (item) => {
    updateReportStatus(item, "Approved");
  };

  const handleReject = (item) => {
    updateReportStatus(item, "Rejected");
  };

  const handleResolve = (item) => {
    updateReportStatus(item, "Resolved");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this report?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("traceit_token");

      const response = await fetch(
        `http://localhost:5000/api/items/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete report.");
      }

      await loadItems();
      alert("Lost report deleted successfully!");
    } catch (error) {
      console.error("Delete lost report error:", error);
      alert(error.message || "Could not delete the report.");
    }
  };

  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase();

    return (
      (item.name || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query) ||
      (item.reporterName || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight">
          Manage Lost Reports
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Review, approve, resolve, or remove lost reports filed by students.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-surface-white border border-subtle p-4 rounded-card flex gap-3">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-blue" />
          <input
            type="text"
            placeholder="Search reports by item name, reporter or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-terracotta"
          />
        </div>
      </div>

      {/* Table */}
      {filteredItems.length > 0 ? (
        <div className="bg-surface-white border border-subtle rounded-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-subtle/50 text-left text-xs">
              <thead className="bg-warm-beige/30 uppercase tracking-wider font-bold text-deep-slate">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Reported By</th>
                  <th className="px-6 py-4">Date / Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/50 text-charcoal">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-warm-beige/10 transition-colors">
                    {/* Item details */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-charcoal">{item.name}</div>
                      <div className="text-charcoal/60 line-clamp-1 mt-0.5 max-w-xs">{item.description}</div>
                      <div className="flex gap-2 items-center mt-1 text-[10px] text-dusty-blue uppercase font-semibold">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-blue" />{item.location}</span>
                      </div>
                    </td>

                    {/* Reporter info */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-charcoal">{item.reporterName}</div>
                      <div className="text-charcoal/60">{item.reporterEmail}</div>
                    </td>

                    {/* Date/Time */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-blue" />{item.date}</div>
                      <div className="text-charcoal/60 mt-0.5">{item.time}</div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={item.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        {item.status !== "Approved" && item.status !== "Resolved" && (
                          <button
                            onClick={() => handleApprove(item)}
                            className="p-1.5 bg-muted-green/10 hover:bg-muted-green text-muted-green hover:text-surface-white rounded-btn transition-colors"
                            title="Approve Report"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== "Rejected" && item.status !== "Resolved" && (
                          <button
                            onClick={() => handleReject(item)}
                            className="p-1.5 bg-red-700/10 hover:bg-red-700 text-red-700 hover:text-surface-white rounded-btn transition-colors"
                            title="Reject Report"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== "Resolved" && (
                          <button
                            onClick={() => handleResolve(item)}
                            className="p-1.5 bg-deep-slate/10 hover:bg-deep-slate text-deep-slate hover:text-surface-white rounded-btn transition-colors"
                            title="Mark Resolved"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 bg-red-700/10 hover:bg-red-700 text-red-700 hover:text-surface-white rounded-btn transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface-white border border-subtle p-12 rounded-card text-center text-sm text-dusty-blue">
          No lost reports found.
        </div>
      )}
    </div>
  );
}
