import React, { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import Badge from "../../components/ui/Badge";
import { Search, Trash2, Calendar, MapPin, SlidersHorizontal } from "lucide-react";

const CATEGORIES = [
  "All Categories", "Electronics", "Documents", "Accessories", "Stationery",
  "Bags", "Water Bottles", "Keys", "Clothing", "ID Cards", "Other"
];

const LOCATIONS = [
  "All Locations", "Central Library", "Block 1", "Block 2", "Block 3",
  "Cafeteria", "Auditorium", "Computer Lab", "Sports Complex", "Hostel", "Parking Area"
];

const STATUSES = [
  "All Statuses", "Active", "Pending Review", "Approved", "Awaiting Owner", "Claimed", "Returned", "Rejected"
];

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all"); // all, lost, found
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const list = await itemService.getAll();
      setItems(list);
    } catch (error) {
      console.error("Failed to load admin items:", error);
      alert("Could not load reports. Please check whether the backend is running.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item? This action is permanent."
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

      alert("Report deleted successfully!");
      await loadItems();
    } catch (error) {
      console.error("Delete report error:", error);
      alert(error.message || "Could not delete the report.");
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.reporterName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;

    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesLocation =
      selectedLocation === "All Locations" ||
      item.location.toLowerCase() === selectedLocation.toLowerCase();

    const matchesStatus =
      selectedStatus === "All Statuses" ||
      item.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesType && matchesCategory && matchesLocation && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight">
          Master Item Catalog
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Catalog review of all reported items (lost & found) on campus.
        </p>
      </div>

      {/* Filters block */}
      <div className="bg-surface-white border border-subtle p-4 rounded-card space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-blue" />
          <input
            type="text"
            placeholder="Search items by name, description, reporter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-subtle/50 text-xs">
          <div className="flex items-center gap-1 font-bold uppercase tracking-wider text-charcoal">
            <SlidersHorizontal className="w-3.5 h-3.5 text-dusty-blue" />
            <span>Refine Catalog:</span>
          </div>

          {/* Type Select */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-slate-blue/30 rounded-btn px-2.5 py-1.5 bg-main-bg/50 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-blue/30 rounded-btn px-2.5 py-1.5 bg-main-bg/50 focus:outline-none"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Location Select */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-slate-blue/30 rounded-btn px-2.5 py-1.5 bg-main-bg/50 focus:outline-none"
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-blue/30 rounded-btn px-2.5 py-1.5 bg-main-bg/50 focus:outline-none"
          >
            {STATUSES.map(stat => (
              <option key={stat} value={stat}>{stat}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {(searchQuery || selectedType !== "all" || selectedCategory !== "All Categories" || selectedLocation !== "All Locations" || selectedStatus !== "All Statuses") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
                setSelectedCategory("All Categories");
                setSelectedLocation("All Locations");
                setSelectedStatus("All Statuses");
              }}
              className="text-xs font-bold text-terracotta hover:underline ml-auto"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Catalog Table */}
      {filteredItems.length > 0 ? (
        <div className="bg-surface-white border border-subtle rounded-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-subtle/50 text-left text-xs">
              <thead className="bg-warm-beige/30 uppercase tracking-wider font-bold text-deep-slate">
                <tr>
                  <th className="px-5 py-4">Item details</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Reporter / Finder</th>
                  <th className="px-5 py-4">Date / Place</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/50 text-charcoal">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-warm-beige/10 transition-colors">
                    {/* Item */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-charcoal">{item.name}</div>
                      <div className="text-charcoal/60 mt-0.5 max-w-[200px] truncate">{item.description}</div>
                      <div className="text-[10px] text-dusty-blue font-bold uppercase mt-1">{item.category}</div>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4 whitespace-nowrap capitalize">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.type === "lost" ? "bg-terracotta/10 text-terracotta" : "bg-deep-slate/10 text-deep-slate"
                        }`}>
                        {item.type}
                      </span>
                    </td>

                    {/* Reporter */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold">{item.reporterName}</div>
                      <div className="text-charcoal/60">{item.reporterEmail}</div>
                    </td>

                    {/* Date/Place */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-blue" />{item.date}</div>
                      <div className="flex items-center gap-0.5 text-charcoal/60 mt-0.5"><MapPin className="w-3.5 h-3.5 text-slate-blue" />{item.location}</div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge status={item.status} />
                    </td>

                    {/* Delete button */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-700 hover:text-surface-white hover:bg-red-700 rounded-btn transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface-white border border-subtle p-12 rounded-card text-center text-sm text-dusty-blue">
          No catalog items found matching filters.
        </div>
      )}
    </div>
  );
}
