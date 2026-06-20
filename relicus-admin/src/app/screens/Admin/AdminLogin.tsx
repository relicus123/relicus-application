import React, { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../services/supabaseClient";
import { ShieldCheck, Mail, Lock, AlertCircle, Sparkles } from "lucide-react";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("1. Checking Supabase config...", { 
        url: import.meta.env.VITE_SUPABASE_URL, 
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY 
      });

      if (!supabase || !supabase.auth || !import.meta.env.VITE_SUPABASE_URL) {
        setError("Supabase not fully configured yet.");
        return;
      }

      console.log("2. Signing in...", email);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      console.log("3. Signed in successfully!", { user: data.user });

      // Verify the user role is admin
      console.log("4. Fetching profile for user ID:", data.user?.id);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, id, email")
        .eq("id", data.user?.id)
        .single();

      console.log("5. Profile query result:", { profile, profileError });
      console.log("Profile error details:", JSON.stringify(profileError, null, 2));

      if (profileError || !profile || profile.role !== "admin") {
        throw new Error("Access Denied: Account does not have administrative privileges.");
      }

      console.log("6. User is admin! Navigating...");
      navigate("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-gradient-to-tr from-[#1C4966] via-[#2A6E99] to-[#8FBDD7] px-4">
      {/* Decorative floating blurred blobs for premium styling */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-[#FFFFF0]/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#5F8B70]/20 blur-3xl" />

      {/* Main card */}
      <div className="relative w-full max-w-md rounded-3xl border border-[#FFFFF0]/20 bg-white/80 p-8 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1C4966] to-[#8FBDD7] text-white shadow-lg shadow-[#1C4966]/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C4966] dark:text-[#8FBDD7]">
            Relicus Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Sign in to manage courses, exams, & guidance systems.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-xs font-medium text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-950">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@relicus.com"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#1C4966] focus:ring-1 focus:ring-[#1C4966] outline-none transition dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#1C4966] focus:ring-1 focus:ring-[#1C4966] outline-none transition dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#1C4966] to-[#2A6E99] py-3.5 font-semibold text-white shadow-lg shadow-[#1C4966]/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Access Admin Console"}
          </button>
        </form>

      </div>
    </div>
  );
}
