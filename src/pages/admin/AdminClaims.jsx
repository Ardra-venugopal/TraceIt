import React, { useState, useEffect } from "react";
//import { addNotification } from "../../services/storageService";
import Badge from "../../components/ui/Badge";
import {
  Search,
  Calendar,
  Eye,
  X,
  Check,
  CheckSquare,
  ShieldQuestion,
} from "lucide-react";

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [relatedItem, setRelatedItem] = useState(null);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const token = localStorage.getItem("traceit_token");

      const response = await fetch(
        "http://localhost:5000/api/claims",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load claims.");
      }

      setClaims(data);

      setSelectedClaim((previous) =>
        previous
          ? data.find((claim) => claim.id === previous.id) || null
          : null
      );
    } catch (error) {
      console.error("Failed to load admin claims:", error);
    }
  };

  const handleSelectClaim = (claim) => {
    setSelectedClaim(claim);

    setRelatedItem({
      id: claim.itemId,
      name: claim.itemName,
      location: claim.itemLocation,
      date: claim.itemDate,
      description: claim.itemDescription,
      status: claim.itemStatus,
    });
  };

  const updateClaimStatus = async (claim, status) => {
    try {
      const token = localStorage.getItem("traceit_token");

      const response = await fetch(
        `http://localhost:5000/api/claims/${claim.id}/status`,
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
        throw new Error(data.message || "Failed to update claim.");
      }




      await loadClaims();


      setRelatedItem((previous) => {
        if (!previous) return previous;

        if (status === "Approved") {
          return { ...previous, status: "Claimed" };
        }

        if (status === "Returned") {
          return { ...previous, status: "Returned" };
        }

        return previous;
      });
    } catch (error) {
      alert(error.message || "Could not update claim status.");
    }
  };

  const handleApproveClaim = (claim) => {
    updateClaimStatus(claim, "Approved");
  };

  const handleRejectClaim = (claim) => {
    updateClaimStatus(claim, "Rejected");
  };

  const handleMarkReturned = (claim) => {
    updateClaimStatus(claim, "Returned");
  };
  const filteredClaims = claims.filter(claim =>
    claim.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.claimantEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight">
          Manage Claims
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Review student ownership claims, match private details, and approve returns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface-white border border-subtle p-4 rounded-card flex gap-3">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-blue" />
              <input
                type="text"
                placeholder="Search claims by item name, claimant, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate"
              />
            </div>
          </div>

          {filteredClaims.length > 0 ? (
            <div className="bg-surface-white border border-subtle rounded-container overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-subtle/50 text-left text-xs">
                  <thead className="bg-warm-beige/30 uppercase tracking-wider font-bold text-deep-slate">
                    <tr>
                      <th className="px-5 py-4">Claimed Item</th>
                      <th className="px-5 py-4">Claimant</th>
                      <th className="px-5 py-4">Submitted</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle/50 text-charcoal">
                    {filteredClaims.map((claim) => (
                      <tr
                        key={claim.id}
                        className={`hover:bg-warm-beige/10 cursor-pointer transition-colors ${selectedClaim?.id === claim.id ? "bg-warm-beige/30" : ""
                          }`}
                        onClick={() => handleSelectClaim(claim)}
                      >
                        <td className="px-5 py-4 font-bold text-sm text-charcoal">
                          {claim.itemName}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-semibold">{claim.claimantName}</div>
                          <div className="text-charcoal/60">{claim.claimantEmail}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-charcoal/70">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-blue" />
                            {claim.dateClaimed}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge status={claim.status} />
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectClaim(claim);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-deep-slate text-deep-slate font-semibold rounded-btn hover:bg-deep-slate hover:text-surface-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
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
              No claims found.
            </div>
          )}
        </div>

        {/* Claim Details Inspection Panel */}
        <div className="bg-surface-white border border-subtle rounded-container p-6 space-y-6">
          {selectedClaim ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-subtle/50 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Inspect Claim</span>
                  <h3 className="font-sans font-extrabold text-lg text-charcoal mt-0.5">{selectedClaim.itemName}</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedClaim(null);
                    setRelatedItem(null);
                  }}
                  className="p-1 text-dusty-blue hover:text-terracotta rounded-btn hover:bg-warm-beige/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Claimant info */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-charcoal">Claimant Identity</h4>
                <div className="bg-warm-beige/30 border border-subtle p-3 rounded-card space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Name:</span>
                    <span className="font-semibold text-charcoal">{selectedClaim.claimantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Email:</span>
                    <span className="font-semibold text-charcoal">{selectedClaim.claimantEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Date Claimed:</span>
                    <span className="font-semibold text-charcoal">{selectedClaim.dateClaimed}</span>
                  </div>
                </div>
              </div>

              {/* Private information */}
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-xs uppercase font-extrabold tracking-widest text-terracotta">
                  <ShieldQuestion className="w-4 h-4 text-terracotta" />
                  <span>Ownership Proof detail</span>
                </div>
                <div className="p-4 bg-terracotta/5 border border-terracotta/15 rounded-card text-xs leading-relaxed text-charcoal">
                  <strong>Student description:</strong>
                  <p className="mt-1 font-sans italic text-charcoal/90">{selectedClaim.privateDetail}</p>
                </div>
              </div>

              {/* Additional comments */}
              {selectedClaim.additionalDescription && (
                <div className="space-y-2 text-xs">
                  <span className="block font-bold text-charcoal/60 uppercase text-[10px] tracking-wider">Additional comments</span>
                  <p className="text-charcoal/80 bg-main-bg p-3 rounded-card border border-subtle/50">{selectedClaim.additionalDescription}</p>
                </div>
              )}

              {/* Original Item details */}
              {relatedItem && (
                <div className="space-y-3 pt-2 border-t border-subtle/50">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-charcoal">Original Found Item Profile</h4>
                  <div className="text-xs space-y-1 text-charcoal/80">
                    <div><span className="font-bold">Location Found:</span> {relatedItem.location}</div>
                    <div><span className="font-bold">Original Date:</span> {relatedItem.date}</div>
                    <div><span className="font-bold">Public Description:</span> {relatedItem.description}</div>
                    <div className="pt-1"><span className="font-bold">Item Status: </span><Badge status={relatedItem.status} /></div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-subtle/50 flex flex-col gap-2">
                {selectedClaim.status === "Pending" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleApproveClaim(selectedClaim)}
                      className="inline-flex justify-center items-center gap-1 px-4 py-2.5 bg-muted-green hover:bg-muted-green/90 text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Claim</span>
                    </button>
                    <button
                      onClick={() => handleRejectClaim(selectedClaim)}
                      className="inline-flex justify-center items-center gap-1 px-4 py-2.5 bg-red-700 hover:bg-red-700/90 text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Claim</span>
                    </button>
                  </div>
                )}

                {selectedClaim.status === "Approved" && (
                  <button
                    onClick={() => handleMarkReturned(selectedClaim)}
                    className="inline-flex justify-center items-center gap-1.5 w-full px-4 py-2.5 bg-deep-slate hover:bg-deep-slate/90 text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Mark as Returned</span>
                  </button>
                )}

                {selectedClaim.status === "Returned" && (
                  <div className="bg-muted-green/10 border border-muted-green/20 rounded-card p-3 text-center text-xs font-bold text-muted-green uppercase tracking-wider">
                    Claim Completed & Returned
                  </div>
                )}

                {selectedClaim.status === "Rejected" && (
                  <div className="bg-red-700/10 border border-red-700/20 rounded-card p-3 text-center text-xs font-bold text-red-700 uppercase tracking-wider">
                    Claim Rejected
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-dusty-blue text-xs flex flex-col items-center justify-center gap-2">
              <ShieldQuestion className="w-10 h-10 text-slate-blue" />
              <span>Select a claim from the table to inspect details and process return.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
