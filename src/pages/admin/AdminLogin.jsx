import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { ArrowLeft, Lock } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const result = await authService.login(email.trim(), password);

    if (!result.success) {
      setError(result.message || "Invalid administrator credentials.");
      return;
    }

    if (result.user.role !== "admin") {
      authService.logout();
      setError("Access denied. Please use a student login.");
      return;
    }

    navigate("/admin/dashboard");
  };


  return (
    <div className="min-h-screen bg-main-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-dusty-blue hover:text-terracotta mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to TraceIt</span>
        </Link>

        <div className="flex justify-center mb-2">
          <div className="p-3 bg-deep-slate text-surface-white rounded-btn">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-center font-sans font-extrabold text-3xl text-charcoal">
          TraceIt Admin Portal
        </h2>
        <p className="mt-2 text-center text-xs text-dusty-blue">
          Campus Lost & Found Administrative Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-white py-8 px-4 border border-subtle sm:rounded-card sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs font-medium text-red-700 rounded-btn">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                Admin Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@traceit.demo"
                  className="appearance-none block w-full px-3 py-2 border border-slate-blue/50 rounded-btn placeholder-slate-blue text-charcoal focus:outline-none focus:ring-deep-slate focus:border-deep-slate text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                Administrator Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2 border border-slate-blue/50 rounded-btn placeholder-slate-blue text-charcoal focus:outline-none focus:ring-deep-slate focus:border-deep-slate text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-btn text-sm font-bold text-surface-white bg-deep-slate hover:bg-deep-slate/90 focus:outline-none transition-colors"
              >
                Admin Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
