import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { supabase } from "../services/supabaseClient";
import { LayoutDashboard, BookOpen, GraduationCap, Compass, LogOut, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        if (!supabase || !supabase.auth) {
          console.error("Supabase not fully configured.");
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {

          navigate("/admin/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error || !profile || profile.role !== "admin") {
          // Not an admin
          setAuthorized(false);
        } else {
          setAuthorized(true);
          setUserEmail(session.user.email ?? null);
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {

    if (supabase && supabase.auth) {
      await supabase.auth.signOut();
    }
    navigate("/admin/login");
  };

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Overview" },
    { path: "/admin/skills", icon: BookOpen, label: "Skills Academy" },
    { path: "/admin/coaching", icon: GraduationCap, label: "Entrance Coaching" },
    { path: "/admin/knownext", icon: Compass, label: "KnowNext Guidance" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#1C4966]/5 dark:bg-[#030213]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#1C4966]" />
          <p className="text-sm font-medium text-slate-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#1C4966]/5 px-4 dark:bg-[#030213]">
        <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-xl dark:border-rose-950 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/30">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">Access Denied</h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            You do not have administrative privileges to access this dashboard. If you believe this is an error, please contact your database administrator.
          </p>
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl bg-slate-800 py-3 font-semibold text-white hover:bg-slate-700 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="relative flex h-full w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1C4966] to-[#8FBDD7] text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight text-[#1C4966] dark:text-[#8FBDD7]">
                Relicus
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#1C4966]/10 text-[#1C4966] dark:bg-[#8FBDD7]/10 dark:text-[#8FBDD7] font-semibold"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
            <div className="overflow-hidden">
              <span className="block text-xs font-semibold text-slate-400">LOGGED IN AS</span>
              <span className="block truncate text-sm font-medium text-slate-600 dark:text-slate-300">
                {userEmail}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content viewport */}
      <main className="flex-1 overflow-y-auto px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
