import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { ArrowLeft } from "lucide-react";

export default function StudentSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");


  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !studentId.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await authService.signup(
      name.trim(),
      email.trim(),
      studentId.trim(),
      password
    );

    if (result.success) {
      navigate("/student/dashboard");
    } else {
      setError(result.message || "Account registration failed.");
    }
  };


  return (
    <div className="min-h-screen bg-main-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/student/login" className="inline-flex items-center gap-1 text-xs font-semibold text-dusty-blue hover:text-terracotta mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
        <h2 className="text-center font-sans font-extrabold text-3xl text-charcoal">
          Create Account
        </h2>
        <p className="mt-2 text-center text-xs text-dusty-blue">
          Register to report and claim lost belongings on campus.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-white py-8 px-4 border border-subtle sm:rounded-card sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs font-medium text-red-700 rounded-btn">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sam Walker"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-blue/50 rounded-btn placeholder-slate-blue text-charcoal focus:outline-none focus:ring-terracotta focus:border-terracotta text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                University Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sam.walker@university.edu"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-blue/50 rounded-btn placeholder-slate-blue text-charcoal focus:outline-none focus:ring-terracotta focus:border-terracotta text-sm"
              />
            </div>

            <div>
              <label htmlFor="studentId" className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                Student ID
              </label>
              <input
                id="studentId"
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. S10023"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-blue/50 rounded-btn placeholder-slate-blue text-charcoal focus:outline-none focus:ring-terracotta focus:border-terracotta text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-blue/50 rounded-btn placeholder-slate-blue text-charcoal focus:outline-none focus:ring-terracotta focus:border-terracotta text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-blue/50 rounded-btn placeholder-slate-blue text-charcoal focus:outline-none focus:ring-terracotta focus:border-terracotta text-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-btn text-sm font-bold text-surface-white bg-terracotta hover:bg-terracotta/90 focus:outline-none transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs text-charcoal/70">Already have an account? </span>
            <Link to="/student/login" className="text-xs font-bold text-terracotta hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
