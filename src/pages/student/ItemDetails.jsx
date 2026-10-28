
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { itemService } from "../../services/itemService";
import { matchingService } from "../../services/matchingService";
import Badge from "../../components/ui/Badge";
import MatchCard from "../../components/cards/MatchCard";
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
  Calendar,
  Tag,
  ArrowLeft,
  FileQuestion,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  const [privateDetail, setPrivateDetail] = useState("");
  const [additionalDescription, setAdditionalDescription] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [itemLoading, setItemLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadItemDetails = async () => {
      setItemLoading(true);
      setItem(null);
      setImageFailed(false);

      try {
        const allItems = await itemService.getAll();
        const foundItem = allItems.find((entry) => entry.id === id);

        if (!foundItem) {
          if (!cancelled) setItem(null);
          return;
        }

        if (cancelled) return;
        setItem(foundItem);

        if (
          foundItem.type === "lost" &&
          foundItem.reporterUserId === currentUser?.id
        ) {
          const candidateMatches = matchingService.findMatches(
            foundItem,
            allItems
          );

          if (!cancelled) setMatches(candidateMatches);
        } else {
          if (!cancelled) setMatches([]);
        }

        const token = localStorage.getItem("traceit_token");

        if (!token || !currentUser) {
          if (!cancelled) setHasClaimed(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/claims/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const claims = await response.json();

        if (!response.ok) {
          throw new Error(claims.message || "Failed to load your claims.");
        }

        if (!cancelled) {
          setHasClaimed(
            claims.some((claim) => claim.itemId === foundItem.id)
          );
        }
      } catch (error) {
        console.error("Failed to load item details:", error);

        if (!cancelled) {
          setItem(null);
        }
      } finally {
        if (!cancelled) setItemLoading(false);
      }
    };

    loadItemDetails();

    return () => {
      cancelled = true;
    };
  }, [id, currentUser?.id]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError("");

    if (!privateDetail.trim()) {
      setClaimError(
        "Please fill in the private identifying detail to verify ownership."
      );
      return;
    }

    try {
      const token = localStorage.getItem("traceit_token");

      if (!token) {
        throw new Error("Please log in before submitting a claim.");
      }

      const response = await fetch(`${BACKEND_URL}/api/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item.id,
          privateDetail: privateDetail.trim(),
          additionalDescription: additionalDescription.trim(),
          proofImagePath: proofImage
            ? `/placeholder-${proofImage}`
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit claim.");
      }

      setClaimSuccess(true);
      setHasClaimed(true);
      setIsClaimFormOpen(false);

      setTimeout(() => {
        navigate("/student/claims");
      }, 2000);
    } catch (err) {
      setClaimError(
        err.message || "Failed to submit claim. Please try again."
      );
    }
  };

  const getCategoryIcon = (category) => {
    const size = "w-20 h-20 text-dusty-blue";
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

  if (itemLoading) {
    return (
      <div className="text-center p-8 text-dusty-blue">
        Loading item details...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center p-8 text-dusty-blue">
        Item not found.
      </div>
    );
  }

  const isOwner =
    item.reporterUserId === currentUser?.id ||
    item.reporterEmail === currentUser?.email;

  const imageUrl = item.imagePath
    ? item.imagePath.startsWith("http://") ||
      item.imagePath.startsWith("https://")
      ? item.imagePath
      : `${BACKEND_URL}${item.imagePath.startsWith("/") ? "" : "/"}${item.imagePath}`
    : null;

  return (
    <div className="space-y-8">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-dusty-blue hover:text-terracotta transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to List</span>
        </button>
      </div>

      <div className="bg-surface-white border border-subtle rounded-container overflow-hidden grid grid-cols-1 md:grid-cols-3">
        {/* Photo when available, otherwise the category icon */}
        <div className="bg-warm-beige p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-subtle min-h-[320px]">
          <div className="w-full max-w-sm h-64 flex items-center justify-center overflow-hidden rounded-card">
            {imageUrl && !imageFailed ? (
              <img
                src={imageUrl}
                alt={item.name ? `Photo of ${item.name}` : "Item photo"}
                className="w-full h-full object-contain rounded-card"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="p-6 bg-surface-white rounded-full border border-slate-blue/20">
                {getCategoryIcon(item.category)}
              </div>
            )}
          </div>

          <span className="text-xs uppercase font-extrabold text-dusty-blue mt-4 tracking-widest">
            {item.category}
          </span>

          <div className="mt-3 flex gap-2 flex-wrap justify-center">
            <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-deep-slate text-surface-white">
              {item.type}
            </span>
            <Badge status={item.status} />
          </div>
        </div>

        <div className="md:col-span-2 p-6 md:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-terracotta">
                {item.brand}
              </span>

              <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-charcoal tracking-tight mt-0.5">
                {item.name}
              </h1>
            </div>

            <p className="text-sm text-charcoal/90 leading-relaxed border-t border-subtle/40 pt-4">
              {item.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-charcoal/80">
                <MapPin className="w-4 h-4 text-slate-blue" />
                <div>
                  <span className="block font-bold text-charcoal/60 uppercase text-[9px] tracking-wider">
                    Location
                  </span>
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-charcoal/80">
                <Calendar className="w-4 h-4 text-slate-blue" />
                <div>
                  <span className="block font-bold text-charcoal/60 uppercase text-[9px] tracking-wider">
                    Date Reported
                  </span>
                  <span>
                    {new Date(item.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-charcoal/80">
                <Clock className="w-4 h-4 text-slate-blue" />
                <div>
                  <span className="block font-bold text-charcoal/60 uppercase text-[9px] tracking-wider">
                    Approx. Time
                  </span>
                  <span>{item.time || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-charcoal/80">
                <Tag className="w-4 h-4 text-slate-blue" />
                <div>
                  <span className="block font-bold text-charcoal/60 uppercase text-[9px] tracking-wider">
                    Color Accent
                  </span>
                  <span>{item.color}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-subtle/50 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-charcoal/60">
            <div>
              <span>Reported by: </span>
              <span className="font-bold text-charcoal">
                {isOwner ? "You (Self)" : item.reporterName}
              </span>
            </div>

            {!isOwner && (
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-dusty-blue">
                <ShieldCheck className="w-3.5 h-3.5 text-muted-green" />
                <span>Protected Identity</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {claimSuccess && (
        <div className="bg-muted-green/10 border border-muted-green/20 rounded-card p-4 flex items-center gap-3 text-muted-green text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>
            Claim submitted! Your claim for {item.name} is now under review.
          </span>
        </div>
      )}

      {item.type === "found" && !isOwner && (
        <div className="bg-surface-white border border-subtle rounded-container p-6 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-sans font-extrabold text-xl text-charcoal">
                Is this your item?
              </h3>
              <p className="text-xs text-dusty-blue mt-1">
                Provide ownership verification details so university admins
                can verify your claim.
              </p>
            </div>

            {!isClaimFormOpen && !hasClaimed && (
              <button
                onClick={() => setIsClaimFormOpen(true)}
                className="px-5 py-2.5 bg-terracotta hover:bg-terracotta/90 text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
              >
                Submit Claim
              </button>
            )}
          </div>

          {hasClaimed && !claimSuccess && (
            <div className="p-4 bg-warm-beige/50 border border-subtle rounded-card text-xs text-charcoal/80 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-muted-green" />
              <span>
                You have already submitted a claim for this item. Check status
                in{" "}
                <Link
                  to="/student/claims"
                  className="font-bold text-terracotta underline"
                >
                  My Claims
                </Link>.
              </span>
            </div>
          )}

          {isClaimFormOpen && (
            <form
              onSubmit={handleClaimSubmit}
              className="border-t border-subtle/50 pt-6 space-y-4"
            >
              {claimError && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs font-medium text-red-700 rounded-btn">
                  {claimError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Private Identifying Detail{" "}
                  <span className="text-terracotta">*</span>
                </label>

                <textarea
                  required
                  rows="2"
                  value={privateDetail}
                  onChange={(e) => setPrivateDetail(e.target.value)}
                  placeholder="Describe a unique detail that helps verify ownership."
                  className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Additional Proof/Details (Optional)
                </label>

                <textarea
                  rows="2"
                  value={additionalDescription}
                  onChange={(e) => setAdditionalDescription(e.target.value)}
                  placeholder="Provide any other useful details."
                  className="w-full px-3 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Upload Proof Image (Optional)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProofImage(e.target.files?.[0]?.name || null)
                  }
                  className="block w-full text-xs text-dusty-blue file:mr-4 file:py-2 file:px-4 file:rounded-btn file:border-0 file:text-xs file:font-semibold file:bg-warm-beige file:text-charcoal hover:file:bg-slate-blue/30 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClaimFormOpen(false)}
                  className="px-4 py-2 border border-slate-blue text-charcoal hover:bg-warm-beige/30 font-semibold text-xs rounded-btn uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-terracotta hover:bg-terracotta/90 text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
                >
                  Submit Ownership Claim
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {item.type === "lost" && isOwner && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-terracotta" />
            <h3 className="font-sans font-extrabold text-xl text-charcoal">
              Potential Found Matches
            </h3>
          </div>

          <div className="space-y-3">
            {matches.length > 0 ? (
              matches.map((candidate) => (
                <MatchCard key={candidate.item.id} candidate={candidate} />
              ))
            ) : (
              <div className="bg-surface-white border border-subtle p-8 rounded-card text-center text-xs text-dusty-blue">
                No potential matching found items logged in the system yet.
                We'll alert you if a student logs a matching description.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
