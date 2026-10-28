import React, { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import ItemCard from "../../components/cards/ItemCard";
import { Search as SearchIcon, SlidersHorizontal, Calendar, MapPin } from "lucide-react";

const CATEGORIES = [
  "All Categories", "Electronics", "Documents", "Accessories", "Stationery",
  "Bags", "Water Bottles", "Keys", "Clothing", "ID Cards", "Other"
];

const LOCATIONS = [
  "All Locations", "Central Library", "Block 1", "Block 2", "Block 3",
  "Cafeteria", "Auditorium", "Computer Lab", "Sports Complex", "Hostel", "Parking Area"
];

export default function LostItems() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest

  useEffect(() => {
    const loadLostItems = async () => {
      try {
        const allItems = await itemService.getAll("lost");

        const lostOnly = allItems.filter(
          (item) =>
            item.status !== "Rejected" &&
            item.status !== "Returned" &&
            item.status !== "Resolved"
        );

        setItems(lostOnly);
      } catch (error) {
        console.error("Failed to load lost items:", error);
      }
    };

    loadLostItems();
  }, []);

  // Filter & Sort Logic
  const filteredItems = items
    .filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesLocation =
        selectedLocation === "All Locations" ||
        item.location.toLowerCase() === selectedLocation.toLowerCase();

      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date + "T" + (a.time || "00:00"));
      const dateB = new Date(b.date + "T" + (b.time || "00:00"));
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight">
          Lost Items Directory
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Browse items reported missing across campus.
        </p>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-surface-white border border-subtle p-4 rounded-card space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-grow relative">
            <SearchIcon className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-blue" />
            <input
              type="text"
              placeholder="Search lost items (e.g. Casio, wallet, AirPods)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-terracotta"
            />
          </div>

          {/* Sort selection */}
          <div className="flex gap-2 min-w-[150px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-slate-blue/40 rounded-btn px-3 py-2 text-xs font-semibold uppercase tracking-wider text-deep-slate focus:outline-none focus:border-terracotta bg-surface-white"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
          </div>
        </div>

        {/* Categories & Locations Selector Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-subtle/50">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal">
            <SlidersHorizontal className="w-3.5 h-3.5 text-dusty-blue" />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-blue/30 rounded-btn px-2.5 py-1.5 text-xs text-charcoal bg-main-bg/50 focus:outline-none"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Location Dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-slate-blue/30 rounded-btn px-2.5 py-1.5 text-xs text-charcoal bg-main-bg/50 focus:outline-none"
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Reset Filters CTA */}
          {(searchQuery || selectedCategory !== "All Categories" || selectedLocation !== "All Locations") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setSelectedLocation("All Locations");
              }}
              className="text-xs font-bold text-terracotta hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid List */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-white border border-subtle p-12 rounded-card text-center text-sm text-dusty-blue">
          No lost items found matching your filters.
        </div>
      )}
    </div>
  );
}
