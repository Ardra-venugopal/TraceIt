import React, { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import Badge from "../../components/ui/Badge";
import { Search, UserMinus, UserCheck, ShieldAlert } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userStats, setUserStats] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("traceit_token");

      const [usersResponse, items, claimsResponse] = await Promise.all([
        fetch("http://localhost:5000/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        itemService.getAll(),
        fetch("http://localhost:5000/api/claims", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersResponse.ok) {
        throw new Error("Could not load users.");
      }

      if (!claimsResponse.ok) {
        throw new Error("Could not load claims.");
      }

      const list = await usersResponse.json();
      const claims = await claimsResponse.json();

      setUsers(list);

      const stats = {};

      list.forEach(user => {
        stats[user.email] = {
          reports: items.filter(
            item => item.reporterUserId === user.id
          ).length,
          claims: claims.filter(
            claim => claim.claimantUserId === user.id
          ).length,
        };
      });

      setUserStats(stats);
    } catch (error) {
      console.error("Load users error:", error);
      alert(error.message || "Could not load users.");
    }
  };


  const handleToggleStatus = async (user) => {
    const nextStatus =
      user.status === "Active" ? "Suspended" : "Active";

    try {
      const token = localStorage.getItem("traceit_token");

      const response = await fetch(
        `http://localhost:5000/api/auth/users/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update user status.");
      }

      await loadUsers();
    } catch (error) {
      console.error("Update user status error:", error);
      alert(error.message || "Could not update user status.");
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.studentId && user.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight">
          Manage Users
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Monitor student registration activity and moderate user portal access status.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-surface-white border border-subtle p-4 rounded-card flex gap-3">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-blue" />
          <input
            type="text"
            placeholder="Search students by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-blue/40 rounded-btn text-sm focus:outline-none focus:border-deep-slate"
          />
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-surface-white border border-subtle rounded-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-subtle/50 text-left text-xs">
              <thead className="bg-warm-beige/30 uppercase tracking-wider font-bold text-deep-slate">
                <tr>
                  <th className="px-6 py-4">Student Info</th>
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Reports Filed</th>
                  <th className="px-6 py-4">Claims Filed</th>
                  <th className="px-6 py-4">Portal Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/50 text-charcoal">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-warm-beige/10 transition-colors">
                    {/* User profile details */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-charcoal flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-warm-beige border border-slate-blue/20 text-deep-slate font-extrabold flex items-center justify-center text-xs uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <span>{user.name}</span>
                        {user.role === "admin" && (
                          <span className="px-1.5 py-0.25 bg-deep-slate text-surface-white text-[8px] font-bold rounded uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-charcoal/60 mt-0.5 ml-9">{user.email}</div>
                    </td>

                    {/* ID */}
                    <td className="px-6 py-4 font-mono font-semibold text-charcoal">
                      {user.studentId || "N/A"}
                    </td>

                    {/* Reports count */}
                    <td className="px-6 py-4 font-semibold text-charcoal text-center sm:text-left">
                      {userStats[user.email]?.reports || 0}
                    </td>

                    {/* Claims count */}
                    <td className="px-6 py-4 font-semibold text-charcoal text-center sm:text-left">
                      {userStats[user.email]?.claims || 0}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <Badge status={user.status} />
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {user.role !== "admin" ? (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 border font-semibold rounded-btn text-xs transition-colors ${user.status === "Active"
                            ? "border-red-700 text-red-700 hover:bg-red-700 hover:text-surface-white"
                            : "border-muted-green text-muted-green hover:bg-muted-green hover:text-surface-white"
                            }`}
                        >
                          {user.status === "Active" ? (
                            <>
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-blue uppercase font-bold italic tracking-wider">System Root</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface-white border border-subtle p-12 rounded-card text-center text-sm text-dusty-blue">
          No students found matching your query.
        </div>
      )}
    </div>
  );
}
