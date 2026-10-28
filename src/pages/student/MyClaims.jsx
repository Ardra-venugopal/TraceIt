import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import Badge from "../../components/ui/Badge";
import { Link } from "react-router-dom";
import { Award, Calendar, ExternalLink, HelpCircle } from "lucide-react";

export default function MyClaims() {
  const currentUser = authService.getCurrentUser();
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const loadMyClaims = async () => {
      try {
        const token = localStorage.getItem("traceit_token");

        const response = await fetch(
          "http://localhost:5000/api/claims/my",
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
      } catch (error) {
        console.error("Failed to load my claims:", error);
      }
    };

    loadMyClaims();
  }, [currentUser?.email]);
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight flex items-center gap-2">
          My Claims
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Track the verification status of claims you've submitted for found belongings on campus.
        </p>
      </div>

      {/* Claims List/Grid */}
      {claims.length > 0 ? (
        <div className="bg-surface-white border border-subtle rounded-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-subtle/50 text-left text-xs">
              <thead className="bg-warm-beige/30 uppercase tracking-wider font-bold text-deep-slate">
                <tr>
                  <th className="px-6 py-4">Claimed Item</th>
                  <th className="px-6 py-4">Claim Date</th>
                  <th className="px-6 py-4">Verification Note</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/50 text-charcoal">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-warm-beige/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-charcoal">
                      {claim.itemName}
                    </td>
                    <td className="px-6 py-4 text-charcoal/70 flex items-center gap-1.5 pt-4">
                      <Calendar className="w-3.5 h-3.5 text-slate-blue" />
                      <span>{new Date(claim.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </td>
                    <td className="px-6 py-4 text-charcoal/80 max-w-xs truncate">
                      {claim.privateDetail}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={claim.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/student/item/${claim.itemId}`}
                        className="inline-flex items-center gap-1 font-bold text-terracotta hover:underline"
                      >
                        <span>View Item</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface-white border border-subtle p-12 rounded-card text-center text-sm text-dusty-blue">
          You haven't submitted any claims yet. Browse the found items directory to submit claims.
        </div>
      )
      }
    </div >
  );
}
