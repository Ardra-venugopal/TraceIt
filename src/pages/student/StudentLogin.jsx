import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";

export default function StudentLogin() {
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

    if (result.success) {
      if (result.user.role === "admin") {
        setError("Please use the Admin Portal to sign in.");
        authService.logout();
        return;
      }

      navigate("/student/dashboard");
    } else {
      setError(result.message || "Invalid credentials.");
    }
  };


  return (
    <div className="min-h-screen bg-main-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-dusty-blue hover:text-terracotta mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to TraceIt</span>
        </Link>
        <h2 className="text-center font-sans font-extrabold text-3xl text-charcoal">
          Student Portal
        </h2>
        <p className="mt-2 text-center text-xs text-dusty-blue">
          Find it. Claim it. Trace it.
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
                University Email / ID
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your university email or Student ID"
                  className="appearance-none block w-full px-3 py-2 border border-slate-blue /50 rounded-btn placeholder-slate-blue text-charcoal focus:outline-none focus:ring-terracotta focus:border-terracotta text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2 border border-slate-blue/50 rounded-btn placeholder-slate-blue text-charcoal focus:outline-none focus:ring-terracotta focus:border-terracotta text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-btn text-sm font-bold text-surface-white bg-terracotta hover:bg-terracotta/90 focus:outline-none transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/student/signup"
              className="w-full flex justify-center py-2.5 px-4 border border-deep-slate rounded-btn text-sm font-bold text-deep-slate hover:bg-deep-slate hover:text-surface-white focus:outline-none transition-all duration-150 text-center"
            >
              Create Student Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
