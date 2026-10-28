import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import StudentLayout from "./components/layout/StudentLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Public Pages
import LandingPage from "./pages/public/LandingPage";
import StudentLogin from "./pages/student/StudentLogin";
import StudentSignup from "./pages/student/StudentSignup";
import AdminLogin from "./pages/admin/AdminLogin";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import LostItems from "./pages/student/LostItems";
import FoundItems from "./pages/student/FoundItems";
import ReportChoice from "./pages/student/ReportChoice";
import ReportLost from "./pages/student/ReportLost";
import ReportFound from "./pages/student/ReportFound";
import ItemDetails from "./pages/student/ItemDetails";
import MyReports from "./pages/student/MyReports";
import MyClaims from "./pages/student/MyClaims";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentProfile from "./pages/student/StudentProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLostReports from "./pages/admin/AdminLostReports";
import AdminFoundReports from "./pages/admin/AdminFoundReports";
import AdminClaims from "./pages/admin/AdminClaims";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminItems from "./pages/admin/AdminItems";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Student Module (Protected by StudentLayout) */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="lost" element={<LostItems />} />
          <Route path="found" element={<FoundItems />} />
          <Route path="report" element={<ReportChoice />} />
          <Route path="report/lost" element={<ReportLost />} />
          <Route path="report/found" element={<ReportFound />} />
          <Route path="item/:id" element={<ItemDetails />} />
          <Route path="reports" element={<MyReports />} />
          <Route path="claims" element={<MyClaims />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="profile" element={<StudentProfile />} />
          {/* Fallback under /student */}
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Admin Module (Protected by AdminLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="lost" element={<AdminLostReports />} />
          <Route path="found" element={<AdminFoundReports />} />
          <Route path="claims" element={<AdminClaims />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="items" element={<AdminItems />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* Fallback under /admin */}
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
