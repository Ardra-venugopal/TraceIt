
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { itemService } from "../../services/itemService";
import { ArrowLeft, Upload, CheckCircle2, X } from "lucide-react";

const CATEGORIES = [
  "Electronics",
  "Documents",
  "Accessories",
  "Stationery",
  "Bags",
  "Water Bottles",
  "Keys",
  "Clothing",
  "ID Cards",
  "Other",
];

const LOCATIONS = [
  "Central Library",
  "Block 1",
  "Block 2",
  "Block 3",
  "Cafeteria",
  "Auditorium",
  "Computer Lab",
  "Sports Complex",
  "Hostel",
  "Parking Area",
];

export default function ReportFound() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [location, setLocation] = useState("Central Library");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImageFile(null);
      setError("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, WebP, or GIF image.");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be 5MB or smaller.");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    setError("");
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (submitting) return;

    if (!currentUser) {
      setError("Please log in before submitting a found-item report.");
      return;
    }

    if (
      !name.trim() ||
      !description.trim() ||
      !color.trim() ||
      !date
    ) {
      setError(
        "Please fill in all required fields: Item Name, Description, Colour, and Date."
      );
      return;
    }

    const newItem = {
      name: name.trim(),
      type: "found",
      category,
      description: description.trim(),
      brand: brand.trim() || "Generic",
      color: color.trim(),
      location,
      date,
      time: time || "12:00",
      additionalDetails: additionalDetails.trim(),
    };

    try {
      setSubmitting(true);

      const result = await itemService.create(newItem, imageFile);
      const saved = result.item;

      if (!saved?.id) {
        throw new Error("The report was submitted, but no item ID was returned.");
      }

      setSuccess(true);

      setTimeout(() => {
        navigate(`/student/item/${saved.id}`);
      }, 2000);
    } catch (err) {
      setError(
        err.message || "Failed to submit the report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="inline-flex p-4 bg-muted-green/10 text-muted-green rounded-full">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h2 className="font-sans font-extrabold text-2xl text-charcoal">
          Found report submitted
        </h2>

        <p className="text-sm text-dusty-blue max-w-sm mx-auto leading-relaxed">
          Your report has been saved and marked as Pending Review for
          administrative approval. Redirecting to item details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Link
        to="/student/report"
        className="inline-flex items-center gap-1 text-xs font-semibold text-dusty-blue hover:text-terracotta mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Options</span>
      </Link>

      <div className="bg-surface-white border border-subtle rounded-card p-6 md:p-8 space-y-6">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-charcoal tracking-tight">
            Report a Found Item
          </h1>

          <p className="text-xs text-dusty-blue mt-1">
            Provide details about the item you found. An administrator will
            review the report to help return it to the correct owner.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 text-xs font-medium text-red-700 rounded-btn"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                Item Name <span className="text-terracotta">*</span>
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. JBL Tune Earbuds or Blue Water Bottle"
                className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                Category <span className="text-terracotta">*</span>
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate bg-surface-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                Colour <span className="text-terracotta">*</span>
              </label>

              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Silver, Olive Green, Black"
                className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                Brand
              </label>

              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. JBL, Hydro Flask"
                className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                Location Found <span className="text-terracotta">*</span>
              </label>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate bg-surface-white"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                Date Found <span className="text-terracotta">*</span>
              </label>

              <input
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                Approximate Time
              </label>

              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
              Description <span className="text-terracotta">*</span>
            </label>

            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe where you found the item and any visible details."
              className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
              Additional Details (Optional)
            </label>

            <textarea
              rows={2}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="For example, whether you handed the item to the cafeteria desk."
              className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
              Upload Image (Optional)
            </label>

            <div className="mt-1 border-2 border-dashed border-slate-blue/30 hover:border-deep-slate rounded-card p-6 flex flex-col items-center justify-center cursor-pointer transition-colors relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Choose an image of the found item"
              />

              <Upload className="w-8 h-8 text-dusty-blue mb-2" />

              <span className="text-xs text-charcoal font-semibold text-center">
                {imageFile
                  ? `Selected: ${imageFile.name}`
                  : "Click or drag to choose an item image"}
              </span>

              <span className="text-[10px] text-slate-blue mt-1">
                PNG, JPG, WebP, or GIF, up to 5MB.
              </span>
            </div>

            {imagePreview && (
              <div className="mt-3 relative w-fit">
                <img
                  src={imagePreview}
                  alt="Preview of the found item"
                  className="w-40 h-40 object-cover rounded-card border border-subtle"
                />

                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="absolute -top-2 -right-2 p-1 bg-white border border-subtle rounded-full text-charcoal shadow-sm"
                  aria-label="Remove selected image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-subtle/50 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-deep-slate hover:bg-deep-slate/90 disabled:opacity-60 disabled:cursor-not-allowed text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Found Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
