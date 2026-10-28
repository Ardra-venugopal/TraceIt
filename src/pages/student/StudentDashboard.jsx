import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { itemService } from "../../services/itemService";
import { matchingService } from "../../services/matchingService";
import MatchCard from "../../components/cards/MatchCard";
import { PlusCircle, Search, HelpCircle, FileText, CheckCircle2, Award, BellRing } from "lucide-react";

export default function StudentDashboard() {
  const currentUser = authService.getCurrentUser();
  const [stats, setStats] = useState({
    lostCount: 0,
    foundCount: 0,
    claimCount: 0,
    matchCount: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState([]);


  useEffect(() => {
    if (!currentUser) return;

    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("traceit_token");

        const [allItems, claimsResponse] = await Promise.all([
          itemService.getAll(),
          fetch("http://localhost:5000/api/claims/my", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!claimsResponse.ok) {
          throw new Error("Could not load your claims.");
        }

        const myClaims = await claimsResponse.json();

        const myLost = allItems.filter(
          item =>
            item.type === "lost" &&
            item.reporterUserId === currentUser.id
        );

        const myFound = allItems.filter(
          item =>
            item.type === "found" &&
            item.reporterUserId === currentUser.id
        );

        let matches = [];

        myLost.forEach(lostItem => {
          const itemMatches = matchingService.findMatches(
            lostItem,
            allItems
          );
          matches = [...matches, ...itemMatches];
        });

        const uniqueMatchesMap = {};

        matches.forEach(match => {
          const id = match.item.id;

          if (
            !uniqueMatchesMap[id] ||
            uniqueMatchesMap[id].score < match.score
          ) {
            uniqueMatchesMap[id] = match;
          }
        });

        const uniqueMatches = Object.values(uniqueMatchesMap)
          .sort((a, b) => b.score - a.score);

        setStats({
          lostCount: myLost.length,
          foundCount: myFound.length,
          claimCount: myClaims.filter(claim =>
            ["Pending", "Under Review"].includes(claim.status)
          ).length,
          matchCount: uniqueMatches.length,
        });

        const combined = [...myLost, ...myFound]
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.date) -
              new Date(a.createdAt || a.date)
          )
          .slice(0, 3);

        setRecentReports(combined);
        setPotentialMatches(uniqueMatches.slice(0, 3));
      } catch (error) {
        console.error("Student dashboard error:", error);
      }
    };

    loadDashboard();
  }, [currentUser?.id]);


  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-charcoal tracking-tight">
          Good morning, {currentUser.name}
        </h1>
        <p className="text-sm text-dusty-blue mt-1">
          Keep track of your lost and found reports.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-white border border-subtle p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">My Lost Reports</span>
          <span className="text-3xl font-extrabold text-terracotta mt-2">{stats.lostCount}</span>
        </div>
        <div className="bg-surface-white border border-subtle p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">My Found Reports</span>
          <span className="text-3xl font-extrabold text-deep-slate mt-2">{stats.foundCount}</span>
        </div>
        <div className="bg-surface-white border border-subtle p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Possible Matches</span>
          <span className="text-3xl font-extrabold text-terracotta mt-2">{stats.matchCount}</span>
        </div>
        <div className="bg-surface-white border border-subtle p-5 rounded-card flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-dusty-blue">Active Claims</span>
          <span className="text-3xl font-extrabold text-muted-green mt-2">{stats.claimCount}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-white border border-subtle p-6 rounded-card flex justify-between items-start gap-4 hover:border-terracotta/40 transition-colors">
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-lg text-charcoal">Report Something Lost</h3>
            <p className="text-xs text-charcoal/80 leading-relaxed max-w-sm">
              Tell the campus what you're looking for. We will run match check notifications for you.
            </p>
            <div className="pt-2">
              <Link
                to="/student/report/lost"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-terracotta hover:bg-terracotta/90 text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Lost Item</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-surface-white border border-subtle p-6 rounded-card flex justify-between items-start gap-4 hover:border-deep-slate/40 transition-colors">
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-lg text-charcoal">Found Something?</h3>
            <p className="text-xs text-charcoal/80 leading-relaxed max-w-sm">
              Help return an item to its owner. Log found items and secure them with administration.
            </p>
            <div className="pt-2">
              <Link
                to="/student/report/found"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-slate hover:bg-deep-slate/90 text-surface-white font-bold text-xs uppercase tracking-wider rounded-btn transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Found Item</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity & Matches lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Possible Matches (Middle & Right Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-bold text-lg text-charcoal">Potential Found Matches</h3>
            <Link to="/student/lost" className="text-xs font-bold text-terracotta hover:underline">
              Browse All Lost
            </Link>
          </div>

          <div className="space-y-3">
            {potentialMatches.length > 0 ? (
              potentialMatches.map((candidate) => (
                <MatchCard key={candidate.item.id} candidate={candidate} />
              ))
            ) : (
              <div className="bg-surface-white border border-subtle p-8 rounded-card text-center text-xs text-dusty-blue">
                No potential matches found at this time. Submit a lost report to start matching.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity (Left Column) */}
        <div className="space-y-4">
          <h3 className="font-sans font-bold text-lg text-charcoal">Your Recent Reports</h3>

          <div className="space-y-3">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="bg-surface-white border border-subtle rounded-card p-4 hover:border-slate-blue/50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-dusty-blue">
                      {report.category} • {report.type}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${report.type === "lost" ? "bg-terracotta/10 text-terracotta" : "bg-deep-slate/10 text-deep-slate"
                      }`}>
                      {report.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-charcoal mt-1 line-clamp-1">
                    {report.name}
                  </h4>
                  <p className="text-xs text-charcoal/70 line-clamp-1 mt-1">
                    {report.location} • {new Date(report.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <Link
                      to={`/student/item/${report.id}`}
                      className="text-xs font-bold text-deep-slate hover:text-terracotta uppercase tracking-wider flex items-center gap-0.5"
                    >
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-surface-white border border-subtle p-8 rounded-card text-center text-xs text-dusty-blue">
                You haven't filed any reports yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
