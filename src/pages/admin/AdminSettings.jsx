
import React, { useEffect, useState } from "react";
import { Settings, UserRound, ShieldCheck } from "lucide-react";

export default function AdminSettings() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const token = localStorage.getItem("traceit_token");

        if (!token) {
          throw new Error("Please log in again to view your profile.");
        }

        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load administrator details."
          );
        }

        if (data.role !== "admin") {
          throw new Error("Administrator access is required.");
        }

        setAdmin(data);
      } catch (err) {
        setError(err.message || "Could not load administrator details.");
      } finally {
        setLoading(false);
      }
    };

    loadAdminProfile();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-deep-slate" />
          <span>System Settings</span>
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Adjust portal operational settings and system configurations.
        </p>
      </div>

      <div className="bg-surface-white border border-subtle rounded-container p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-card bg-warm-beige/40">
            <UserRound className="w-6 h-6 text-deep-slate" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-charcoal">
              Administrator Details
            </h2>
            <p className="text-xs text-dusty-blue">
              Current logged-in account
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-dusty-blue">
            Loading administrator details...
          </p>
        ) : error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : (
          <div className="divide-y divide-subtle">
            <div className="py-3 flex justify-between gap-4">
              <span className="text-sm text-dusty-blue">Full Name</span>
              <span className="text-sm font-semibold text-charcoal text-right">
                {admin.name}
              </span>
            </div>

            <div className="py-3 flex justify-between gap-4">
              <span className="text-sm text-dusty-blue">Email</span>
              <span className="text-sm font-semibold text-charcoal text-right break-all">
                {admin.email}
              </span>
            </div>

            <div className="py-3 flex justify-between gap-4">
              <span className="text-sm text-dusty-blue">Role</span>
              <span className="text-sm font-semibold text-charcoal flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-muted-green" />
                Administrator
              </span>
            </div>

            <div className="py-3 flex justify-between gap-4">
              <span className="text-sm text-dusty-blue">Account Status</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${admin.status === "Active"
                    ? "bg-muted-green/10 text-muted-green"
                    : "bg-red-700/10 text-red-700"
                  }`}
              >
                {admin.status || "Unknown"}
              </span>
            </div>

            <div className="py-3 flex justify-between gap-4">
              <span className="text-sm text-dusty-blue">Account Created</span>
              <span className="text-sm font-semibold text-charcoal text-right">
                {admin.createdAt
                  ? new Date(admin.createdAt).toLocaleDateString()
                  : "Not available"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
