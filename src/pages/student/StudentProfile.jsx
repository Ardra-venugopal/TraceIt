
import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { User, Mail } from "lucide-react";
import Badge from "../../components/ui/Badge";

const API_URL = "http://localhost:5000/api/auth/me";

export default function StudentProfile() {
  const currentUser = authService.getCurrentUser();

  const [profile, setProfile] = useState(currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("traceit_token");

      if (!token) {
        setError("Please log in again to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load your profile."
          );
        }

        setProfile(data);
        setError("");
      } catch (err) {
        console.error("Load student profile error:", err.message);
        setError(err.message || "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-sm text-dusty-blue">
        Loading your profile...
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-3">
        <h1 className="font-extrabold text-2xl text-charcoal">
          My Account
        </h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.name || "Student";
  const studentStatus = profile.status || "Active";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight">
          My Account
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          View your profile details and active university credentials.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="bg-surface-white border border-subtle rounded-container p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-subtle/50">
          <div className="w-20 h-20 rounded-full bg-deep-slate text-surface-white font-extrabold text-3xl flex items-center justify-center border border-subtle">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="font-sans font-extrabold text-2xl text-charcoal">
              {displayName}
            </h2>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-dusty-blue">
              <span>Student Account</span>
              <span>•</span>
              <Badge
                status={
                  studentStatus === "Active"
                    ? "Active-User"
                    : studentStatus
                }
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-dusty-blue">
              Full Name
            </span>
            <span className="text-sm font-semibold text-charcoal">
              {displayName}
            </span>
          </div>

          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-dusty-blue">
              Student ID Card
            </span>
            <span className="text-sm font-semibold text-charcoal">
              {profile.studentId || "N/A"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-dusty-blue">
              University Email
            </span>
            <span className="text-sm font-semibold text-charcoal">
              {profile.email || "N/A"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-dusty-blue">
              Portal Access Role
            </span>
            <span className="text-sm font-semibold text-charcoal uppercase tracking-wider">
              {profile.role || "student"}
            </span>
          </div>
        </div>

        <div className="p-4 bg-warm-beige/35 border border-subtle rounded-card text-xs text-charcoal/70 leading-relaxed">
          <strong>Account status:</strong>{" "}
          Your profile information is retrieved from the TraceIt backend.
          Contact your administrator if your account details need correction.
        </div>
      </div>
    </div>
  );
}
