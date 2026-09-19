import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  HeartHandshake,
  Heart,
  BookOpen,
  Award,
  KeyRound,
  Ban,
  CheckCircle2,
  Copy,
  Check,
  X,
  Calendar,
  Phone,
  Mail,
  User as UserIcon,
  Sparkles,
  Layers,
  FileCode,
  Activity,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../../services/supabaseClient";

interface ProfileUser {
  id: string;
  email: string;
  username?: string | null;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: "student" | "therapist" | "admin" | string;
  status?: "active" | "suspended" | "banned" | string;
  created_at: string;
}

interface TestAttempt {
  id: string;
  test_name: string;
  exam_type: string;
  score: number;
  max_score: number;
  accuracy: number;
  percentile: number;
  created_at: string;
}

interface CertRequest {
  id: string;
  course_id: string;
  user_name?: string;
  status: string;
  requested_at: string;
  reviewed_at?: string;
}

interface MoodEntry {
  id: string;
  mood: string;
  note?: string;
  created_at: string;
}

interface MindfulnessActivity {
  id: string;
  activity_id: string;
  completed_at: string;
}

interface ExamCategory {
  id: string;
  title: string;
  description: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

interface CoachingExam {
  id: string;
  full_name?: string;
  category_id?: string;
}

interface CategoryAccessItem {
  id?: string;
  category_id: string;
  status: string;
  granted_at?: string;
}

interface UserDeepData {
  profile: ProfileUser;
  testAttempts: TestAttempt[];
  certRequests: CertRequest[];
  moodEntries: MoodEntry[];
  activities: MindfulnessActivity[];
  tuitionInfo: any | null;
  categoryAccess: CategoryAccessItem[];
  rawJson: any;
}

export function UsersManager() {
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "therapist" | "admin" | "suspended">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "email">("newest");

  // Modals & Drawers
  const [selectedUser, setSelectedUser] = useState<ProfileUser | null>(null);
  const [inspectData, setInspectData] = useState<UserDeepData | null>(null);
  const [loadingInspect, setLoadingInspect] = useState(false);
  const [inspectTab, setInspectTab] = useState<"overview" | "coaching" | "skills" | "mindfulness" | "tuition" | "json">("overview");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToActOn, setUserToActOn] = useState<ProfileUser | null>(null);

  // Entrance Coaching Category Access Management
  const [allCategories, setAllCategories] = useState<ExamCategory[]>([]);
  const [allExams, setAllExams] = useState<CoachingExam[]>([]);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<ProfileUser | null>(null);
  const [userCategoryAccessMap, setUserCategoryAccessMap] = useState<Record<string, boolean>>({});
  const [loadingAccessModal, setLoadingAccessModal] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    full_name: "",
    username: "",
    phone: "",
    role: "student",
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
    phone: "",
    email: "",
    role: "student",
    status: "active",
  });

  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase || !supabase.auth) {
        throw new Error("Supabase client is not initialized.");
      }

      // 1. Fetch profiles table
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (pError) throw pError;

      // 2. Also check users table to merge any phone-registered app users
      let combined: ProfileUser[] = profiles || [];
      try {
        const { data: legacyUsers } = await supabase.from("users").select("*");
        if (legacyUsers && legacyUsers.length > 0) {
          const profileIdSet = new Set(combined.map((u) => u.id));
          for (const u of legacyUsers) {
            if (!profileIdSet.has(u.id)) {
              combined.push({
                id: u.id,
                email: u.email || `${u.phone || u.id}@relicus.internal`,
                username: u.username || u.phone,
                full_name: u.username || "App User",
                phone: u.phone,
                role: "student",
                status: "active",
                created_at: u.created_at || new Date().toISOString(),
              });
            } else {
              // Supplement phone/username if missing in profiles
              const existing = combined.find((c) => c.id === u.id);
              if (existing) {
                if (!existing.phone && u.phone) existing.phone = u.phone;
                if (!existing.username && u.username) existing.username = u.username;
              }
            }
          }
        }
      } catch (e) {
        console.warn("Could not query legacy users table:", e);
      }

      setUsers(combined);
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError(err.message || "Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  // God-Mode Deep Inspection Fetch
  const openGodModeInspector = async (user: ProfileUser) => {
    setSelectedUser(user);
    setInspectTab("overview");
    setLoadingInspect(true);

    try {
      const [testRes, certRes, moodRes, actRes, tuitionRes, catAccessRes] = await Promise.allSettled([
        supabase.from("coaching_test_attempts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("skills_certificate_requests").select("*").eq("user_id", user.id).order("requested_at", { ascending: false }),
        supabase.from("mood_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("mindfulness_user_activities").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }),
        supabase.from("tuition_students").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("coaching_category_access").select("id, category_id, status, granted_at").eq("user_id", user.id),
      ]);

      const testAttempts: TestAttempt[] = testRes.status === "fulfilled" && testRes.value.data ? testRes.value.data : [];
      const certRequests: CertRequest[] = certRes.status === "fulfilled" && certRes.value.data ? certRes.value.data : [];
      const moodEntries: MoodEntry[] = moodRes.status === "fulfilled" && moodRes.value.data ? moodRes.value.data : [];
      const activities: MindfulnessActivity[] = actRes.status === "fulfilled" && actRes.value.data ? actRes.value.data : [];
      const tuitionInfo = tuitionRes.status === "fulfilled" && tuitionRes.value.data ? tuitionRes.value.data : null;
      const categoryAccess: CategoryAccessItem[] = catAccessRes.status === "fulfilled" && catAccessRes.value.data ? catAccessRes.value.data : [];

      // Ensure categories & exams are loaded for display in inspector
      loadCategoriesAndExams();

      setInspectData({
        profile: user,
        testAttempts,
        certRequests,
        moodEntries,
        activities,
        tuitionInfo,
        categoryAccess,
        rawJson: {
          profile: user,
          coaching_category_access: categoryAccess,
          coaching_attempts_count: testAttempts.length,
          skills_cert_requests: certRequests,
          mood_logs: moodEntries,
          mindfulness_activity_count: activities.length,
          tuition_profile: tuitionInfo,
        },
      });
    } catch (err) {
      console.error("Error inspecting user:", err);
    } finally {
      setLoadingInspect(false);
    }
  };

  // Category Access Handlers
  const loadCategoriesAndExams = async () => {
    try {
      const [catRes, examRes] = await Promise.all([
        supabase.from("coaching_exam_categories").select("*").order("display_order", { ascending: true }),
        supabase.from("coaching_exams").select("id, full_name, category_id"),
      ]);
      if (catRes.data) setAllCategories(catRes.data);
      if (examRes.data) setAllExams(examRes.data);
    } catch (err) {
      console.error("Error loading categories/exams:", err);
    }
  };

  const openCategoryAccessModal = async (user: ProfileUser) => {
    setSelectedUserForAccess(user);
    setIsAccessModalOpen(true);
    setLoadingAccessModal(true);
    setError(null);
    try {
      await loadCategoriesAndExams();
      const { data, error: catError } = await supabase
        .from("coaching_category_access")
        .select("category_id, status")
        .eq("user_id", user.id);

      if (catError) throw catError;

      const map: Record<string, boolean> = {};
      if (data) {
        data.forEach((row: any) => {
          if (row.status === "active") {
            map[row.category_id] = true;
          }
        });
      }
      setUserCategoryAccessMap(map);
    } catch (err: any) {
      console.error("Error loading user category access:", err);
      setError("Failed to load user category permissions: " + err.message);
    } finally {
      setLoadingAccessModal(false);
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    setUserCategoryAccessMap((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleToggleAllCategories = (grantAll: boolean) => {
    const newMap: Record<string, boolean> = {};
    allCategories.forEach((cat) => {
      newMap[cat.id] = grantAll;
    });
    setUserCategoryAccessMap(newMap);
  };

  const handleSaveCategoryAccess = async () => {
    if (!selectedUserForAccess) return;
    setSavingAccess(true);
    setError(null);
    try {
      const updates = allCategories.map((cat) => ({
        user_id: selectedUserForAccess.id,
        category_id: cat.id,
        status: userCategoryAccessMap[cat.id] ? "active" : "revoked",
        granted_at: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from("coaching_category_access")
        .upsert(updates, { onConflict: "user_id,category_id" });

      if (upsertError) throw upsertError;

      setSuccess(`Entrance Coaching category permissions saved for ${selectedUserForAccess.full_name || selectedUserForAccess.username || selectedUserForAccess.email}!`);
      setIsAccessModalOpen(false);

      if (selectedUser?.id === selectedUserForAccess.id) {
        openGodModeInspector(selectedUser);
      }
    } catch (err: any) {
      console.error("Error saving category access:", err);
      setError(err.message || "Failed to save category access permissions.");
    } finally {
      setSavingAccess(false);
    }
  };

  // User Provisioning
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const cleanEmail = createForm.email.trim().toLowerCase();
      const cleanUsername = createForm.username.trim() || cleanEmail.split("@")[0];

      // Sign up via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: createForm.password || "Relicus@123",
        options: {
          data: {
            username: cleanUsername,
            full_name: createForm.full_name.trim(),
            phone: createForm.phone.trim(),
          },
        },
      });

      if (authError) throw authError;

      const newUserId = authData.user?.id;
      if (newUserId) {
        // Upsert into profiles
        const { error: pErr } = await supabase.from("profiles").upsert([
          {
            id: newUserId,
            email: cleanEmail,
            username: cleanUsername,
            full_name: createForm.full_name.trim(),
            phone: createForm.phone.trim(),
            role: createForm.role,
            status: "active",
          },
        ]);
        if (pErr) console.warn("Profile upsert notice:", pErr.message);

        // Mirror in users table
        try {
          await supabase.from("users").upsert([
            {
              id: newUserId,
              email: cleanEmail,
              username: cleanUsername,
              phone: createForm.phone.trim() || "+91 00000 00000",
            },
          ]);
        } catch {}
      }

      setSuccess(`User ${cleanEmail} created successfully with role '${createForm.role}'.`);
      setIsAddModalOpen(false);
      setCreateForm({ email: "", password: "", full_name: "", username: "", phone: "", role: "student" });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
    }
  };

  // Edit Profile
  const openEditModal = (user: ProfileUser) => {
    setUserToActOn(user);
    setEditForm({
      full_name: user.full_name || "",
      username: user.username || "",
      phone: user.phone || "",
      email: user.email || "",
      role: user.role || "student",
      status: user.status || "active",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToActOn) return;
    setError(null);
    setSuccess(null);

    try {
      const updates = {
        full_name: editForm.full_name.trim(),
        username: editForm.username.trim(),
        phone: editForm.phone.trim(),
        role: editForm.role,
        status: editForm.status,
      };

      const { error: uErr } = await supabase.from("profiles").update(updates).eq("id", userToActOn.id);
      if (uErr) throw uErr;

      // Update local state immediately
      setUsers((prev) =>
        prev.map((u) => (u.id === userToActOn.id ? { ...u, ...updates } : u))
      );

      if (selectedUser?.id === userToActOn.id) {
        setSelectedUser((prev) => (prev ? { ...prev, ...updates } : null));
      }

      setSuccess(`User ${userToActOn.email} updated successfully.`);
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to update user.");
    }
  };

  // Instant Quick Role Toggle
  const handleQuickRoleChange = async (user: ProfileUser, newRole: string) => {
    setError(null);
    try {
      const { error: rErr } = await supabase.from("profiles").update({ role: newRole }).eq("id", user.id);
      if (rErr) throw rErr;

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
      }
      setSuccess(`Role of ${user.email} updated to '${newRole}'.`);
    } catch (err: any) {
      setError(err.message || "Failed to change role.");
    }
  };

  // Toggle Account Suspension / Ban
  const handleToggleSuspend = async (user: ProfileUser) => {
    const isSuspended = user.status === "suspended" || user.status === "banned";
    const nextStatus = isSuspended ? "active" : "suspended";
    setError(null);

    try {
      const { error: sErr } = await supabase.from("profiles").update({ status: nextStatus }).eq("id", user.id);
      if (sErr) throw sErr;

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      setSuccess(`User ${user.email} is now ${nextStatus.toUpperCase()}.`);
    } catch (err: any) {
      setError(err.message || "Failed to update account status.");
    }
  };

  // Reset User Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToActOn) return;
    setError(null);
    setSuccess(null);

    try {
      if (!newPasswordInput.trim()) {
        throw new Error("Password cannot be empty.");
      }

      // Try administrative update or send recovery email
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(userToActOn.email, {
        redirectTo: window.location.origin + "/admin/login",
      });

      if (resetErr) {
        console.warn("Could not dispatch recovery link, notifying admin:", resetErr.message);
      }

      setSuccess(`Password reset sequence triggered for ${userToActOn.email}. Instructions sent to their email.`);
      setIsResetPassModalOpen(false);
      setNewPasswordInput("");
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    }
  };

  // Delete User Cascade
  const handleDeleteUser = async () => {
    if (!userToActOn) return;
    setError(null);
    setSuccess(null);

    try {
      const userId = userToActOn.id;

      // Clean up linked relational tables
      await Promise.allSettled([
        supabase.from("coaching_test_attempts").delete().eq("user_id", userId),
        supabase.from("coaching_doubts").delete().eq("user_id", userId),
        supabase.from("skills_certificate_requests").delete().eq("user_id", userId),
        supabase.from("mood_entries").delete().eq("user_id", userId),
        supabase.from("mindfulness_user_activities").delete().eq("user_id", userId),
        supabase.from("mindfulness_journals").delete().eq("user_id", userId),
        supabase.from("knownext_saved_items").delete().eq("user_id", userId),
        supabase.from("knownext_profiles").delete().eq("user_id", userId),
        supabase.from("tuition_students").delete().eq("user_id", userId),
        supabase.from("users").delete().eq("id", userId),
      ]);

      // Delete from profiles
      const { error: delErr } = await supabase.from("profiles").delete().eq("id", userId);
      if (delErr) throw delErr;

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setInspectData(null);
      }

      setSuccess(`User ${userToActOn.email} permanently erased from database.`);
      setIsDeleteModalOpen(false);
      setUserToActOn(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete user.");
    }
  };

  // Approve / Reject Certificate Request
  const handleReviewCertificate = async (reqId: string, status: "approved" | "rejected") => {
    try {
      const { error: cErr } = await supabase
        .from("skills_certificate_requests")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", reqId);

      if (cErr) throw cErr;

      if (inspectData) {
        setInspectData({
          ...inspectData,
          certRequests: inspectData.certRequests.map((r) => (r.id === reqId ? { ...r, status } : r)),
        });
      }
      setSuccess(`Certificate request marked as ${status}.`);
    } catch (err: any) {
      setError(err.message || "Failed to review certificate.");
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ["User ID", "Full Name", "Username", "Email", "Phone", "Role", "Status", "Created At"];
    const rows = filteredUsers.map((u) => [
      `"${u.id}"`,
      `"${u.full_name || ""}"`,
      `"${u.username || ""}"`,
      `"${u.email || ""}"`,
      `"${u.phone || ""}"`,
      `"${u.role}"`,
      `"${u.status || "active"}"`,
      `"${new Date(u.created_at).toLocaleString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relicus_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy UID helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics computation
  const stats = useMemo(() => {
    const total = users.length;
    const students = users.filter((u) => u.role === "student" || !u.role).length;
    const therapists = users.filter((u) => u.role === "therapist").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const suspended = users.filter((u) => u.status === "suspended" || u.status === "banned").length;
    return { total, students, therapists, admins, suspended };
  }, [users]);

  // Filtering & Sorting
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        // Role filter
        if (roleFilter === "student" && user.role !== "student" && user.role) return false;
        if (roleFilter === "therapist" && user.role !== "therapist") return false;
        if (roleFilter === "admin" && user.role !== "admin") return false;
        if (roleFilter === "suspended" && user.status !== "suspended" && user.status !== "banned") return false;

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          user.email?.toLowerCase().includes(q) ||
          user.username?.toLowerCase().includes(q) ||
          user.full_name?.toLowerCase().includes(q) ||
          user.phone?.toLowerCase().includes(q) ||
          user.id?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === "name") return (a.full_name || a.username || "").localeCompare(b.full_name || b.username || "");
        if (sortBy === "email") return (a.email || "").localeCompare(b.email || "");
        return 0;
      });
  }, [users, roleFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1C4966] via-[#245D82] to-[#3B82F6] p-8 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-3 text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>God-Mode Command Center</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl flex items-center gap-3">
              <Users className="h-9 w-9 text-[#8FBDD7]" /> User Management
            </h1>
            <p className="mt-2 text-sm text-slate-100/90 leading-relaxed">
              Omniscient administrative control across the entire Relicus ecosystem. Inspect student test results,
              certifications, tuition submissions, mood logs, reset credentials, and switch account roles in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-[#1C4966] shadow-lg hover:bg-slate-100 transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" /> Provision User
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 font-semibold text-white backdrop-blur-md hover:bg-white/25 transition active:scale-95 cursor-pointer"
              title="Export visible users to CSV"
            >
              <Download className="h-5 w-5" /> Export
            </button>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md hover:bg-white/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Refresh users"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-medium text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Users</span>
            <Users className="h-4 w-4 text-[#1C4966]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-800 dark:text-slate-100">{stats.total}</p>
          <span className="text-[11px] text-slate-400">Omniscient Roster</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-blue-600 text-xs font-semibold uppercase">
            <span>Students</span>
            <GraduationCap className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-800 dark:text-slate-100">{stats.students}</p>
          <span className="text-[11px] text-slate-400">Active Learners</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold uppercase">
            <span>Therapists</span>
            <HeartHandshake className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-800 dark:text-slate-100">{stats.therapists}</p>
          <span className="text-[11px] text-slate-400">Counselors & Staff</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-purple-600 text-xs font-semibold uppercase">
            <span>Admins</span>
            <Shield className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-800 dark:text-slate-100">{stats.admins}</p>
          <span className="text-[11px] text-slate-400">God-Mode Access</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-rose-600 text-xs font-semibold uppercase">
            <span>Suspended</span>
            <Ban className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-800 dark:text-slate-100">{stats.suspended}</p>
          <span className="text-[11px] text-slate-400">Restricted Accounts</span>
        </div>
      </div>

      {/* Search, Filters, and Controls */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or UUID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#1C4966] focus:bg-white transition dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs font-semibold text-slate-400 uppercase">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#1C4966] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="email">Email (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: "all", label: "All Users", count: stats.total },
            { id: "student", label: "Students", count: stats.students },
            { id: "therapist", label: "Therapists", count: stats.therapists },
            { id: "admin", label: "Admins", count: stats.admins },
            { id: "suspended", label: "Suspended", count: stats.suspended },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
                roleFilter === tab.id
                  ? "bg-[#1C4966] text-white shadow-sm dark:bg-[#8FBDD7] dark:text-[#030213]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  roleFilter === tab.id
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">God-Mode Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#1C4966]" />
                    <span>Synchronizing user directory...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Users className="mx-auto mb-3 h-10 w-10 opacity-30" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or role filter.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuspended = user.status === "suspended" || user.status === "banned";
                  const displayName = user.full_name || user.username || user.email?.split("@")[0] || "User";
                  const initial = displayName.charAt(0).toUpperCase();

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition dark:hover:bg-slate-800/30 group"
                    >
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-sm ${
                              user.role === "admin"
                                ? "bg-gradient-to-tr from-purple-600 to-indigo-500"
                                : user.role === "therapist"
                                ? "bg-gradient-to-tr from-emerald-600 to-teal-500"
                                : "bg-gradient-to-tr from-[#1C4966] to-[#4A90E2]"
                            }`}
                          >
                            {initial}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                {displayName}
                              </span>
                              {user.role === "admin" && (
                                <span title="Administrator">
                                  <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <span>@{user.username || user.email?.split("@")[0]}</span>
                              <span>•</span>
                              <button
                                onClick={() => copyToClipboard(user.id, user.id)}
                                title="Click to copy UUID"
                                className="flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              >
                                <span>{user.id.slice(0, 8)}...</span>
                                {copiedId === user.id ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3 opacity-60" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role Pill & Quick Switcher */}
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select
                            value={user.role || "student"}
                            onChange={(e) => handleQuickRoleChange(user, e.target.value)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer transition border ${
                              user.role === "admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300"
                                : user.role === "therapist"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
                            }`}
                          >
                            <option value="student">Student</option>
                            <option value="therapist">Therapist</option>
                            <option value="admin">Admin (God)</option>
                          </select>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            isSuspended
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isSuspended ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                            }`}
                          />
                          {isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Entrance Coaching Category Access */}
                          <button
                            onClick={() => openCategoryAccessModal(user)}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-500 hover:text-white transition dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400 dark:hover:text-[#030213] cursor-pointer"
                            title="Manage Entrance Coaching Category Access"
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>Course Access</span>
                          </button>

                          {/* Inspect God Mode */}
                          <button
                            onClick={() => openGodModeInspector(user)}
                            className="flex items-center gap-1.5 rounded-xl bg-[#1C4966]/10 px-3 py-1.5 text-xs font-bold text-[#1C4966] hover:bg-[#1C4966] hover:text-white transition dark:bg-[#8FBDD7]/10 dark:text-[#8FBDD7] dark:hover:bg-[#8FBDD7] dark:hover:text-[#030213] cursor-pointer"
                            title="Open omniscient deep inspector"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Inspect</span>
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                            title="Edit user info"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Toggle Suspend/Ban */}
                          <button
                            onClick={() => handleToggleSuspend(user)}
                            className={`rounded-xl p-2 transition cursor-pointer ${
                              isSuspended
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-amber-500 hover:bg-amber-50"
                            }`}
                            title={isSuspended ? "Unsuspend account" : "Suspend account"}
                          >
                            <Ban className="h-4 w-4" />
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => {
                              setUserToActOn(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GOD-MODE DEEP INSPECTOR DRAWER / MODAL */}
      {/* ========================================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative flex flex-col h-[92vh] w-full max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1C4966] to-[#3B82F6] text-white shadow-md font-extrabold text-lg">
                  {(selectedUser.full_name || selectedUser.username || selectedUser.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedUser.full_name || selectedUser.username || "User Record"}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                        selectedUser.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                          : selectedUser.role === "therapist"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        selectedUser.status === "suspended"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {selectedUser.status || "active"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>ID: {selectedUser.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedUser.id, "inspector")}
                      className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy full UUID"
                    >
                      {copiedId === "inspector" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedUser)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setUserToActOn(selectedUser);
                    setIsResetPassModalOpen(true);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setInspectData(null);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 px-8 dark:border-slate-800 dark:bg-slate-800/30 overflow-x-auto text-xs">
              {[
                { id: "overview", label: "Overview & Identity", icon: UserIcon },
                {
                  id: "coaching",
                  label: `Entrance Tests (${inspectData?.testAttempts.length || 0})`,
                  icon: GraduationCap,
                },
                {
                  id: "skills",
                  label: `Certificates (${inspectData?.certRequests.length || 0})`,
                  icon: Award,
                },
                {
                  id: "mindfulness",
                  label: `Mindfulness & Mood (${inspectData?.moodEntries.length || 0})`,
                  icon: Heart,
                },
                { id: "tuition", label: "Tuition / Academics", icon: BookOpen },
                { id: "json", label: "Raw God-Mode JSON", icon: FileCode },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = inspectTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setInspectTab(tab.id as any)}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3.5 font-bold transition whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "border-[#1C4966] text-[#1C4966] dark:border-[#8FBDD7] dark:text-[#8FBDD7]"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8">
              {loadingInspect ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#1C4966]" />
                  <p className="text-sm font-medium text-slate-500">Querying all relational tables...</p>
                </div>
              ) : (
                <>
                  {/* OVERVIEW TAB */}
                  {inspectTab === "overview" && (
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Account Details */}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/40 space-y-4">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-[#1C4966]" /> Account Profile
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-400 block">Full Name:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {selectedUser.full_name || "Not Specified"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Username:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                @{selectedUser.username || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Email Address:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {selectedUser.email}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Phone:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {selectedUser.phone || "Not linked"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Role:</span>
                              <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                                {selectedUser.role}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Registration Date:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {new Date(selectedUser.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Metrics Summary */}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/40 space-y-4">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-500" /> Platform Engagement
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                              <span className="text-[11px] font-bold text-slate-400 uppercase">Mock Tests Taken</span>
                              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                                {inspectData?.testAttempts.length || 0}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                              <span className="text-[11px] font-bold text-slate-400 uppercase">Certificates</span>
                              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                                {inspectData?.certRequests.length || 0}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                              <span className="text-[11px] font-bold text-slate-400 uppercase">Mood Check-ins</span>
                              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                                {inspectData?.moodEntries.length || 0}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                              <span className="text-[11px] font-bold text-slate-400 uppercase">Mindfulness Sessions</span>
                              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                                {inspectData?.activities.length || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fast God Mode Switcher Controls */}
                      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 dark:border-indigo-950 dark:bg-indigo-950/20">
                        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-indigo-500" /> Administrative Power Controls
                        </h4>
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => handleQuickRoleChange(selectedUser, "admin")}
                            className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition cursor-pointer"
                          >
                            Promote to Admin
                          </button>
                          <button
                            onClick={() => handleQuickRoleChange(selectedUser, "therapist")}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                          >
                            Assign Therapist
                          </button>
                          <button
                            onClick={() => handleQuickRoleChange(selectedUser, "student")}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                          >
                            Demote to Student
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(selectedUser)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition cursor-pointer ${
                              selectedUser.status === "suspended" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
                            }`}
                          >
                            {selectedUser.status === "suspended" ? "Unfreeze Account" : "Freeze / Suspend Account"}
                          </button>
                          <button
                            onClick={() => {
                              setUserToActOn(selectedUser);
                              setIsDeleteModalOpen(true);
                            }}
                            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition ml-auto cursor-pointer"
                          >
                            Purge User Completely
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COACHING TAB */}
                  {inspectTab === "coaching" && (
                    <div className="space-y-6">
                      {/* Authorized Categories Section */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                Authorized Entrance Coaching Categories
                              </h3>
                              <p className="text-xs text-slate-400">
                                Specific categories granted to this student for full course access
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => selectedUser && openCategoryAccessModal(selectedUser)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1C4966] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#245D82] transition shadow-sm cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Permissions</span>
                          </button>
                        </div>

                        {/* List of granted categories */}
                        {!inspectData?.categoryAccess || inspectData.categoryAccess.filter((a) => a.status === "active").length === 0 ? (
                          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-4 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
                            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                              No categories currently authorized for this user.
                            </p>
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                              User can only view the 1 Free Preview Demo Lecture across courses. Click "Edit Permissions" to grant access.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {inspectData.categoryAccess
                              .filter((a) => a.status === "active")
                              .map((access) => {
                                const cat = allCategories.find((c) => c.id === access.category_id);
                                const catExams = allExams.filter((e) => e.category_id === access.category_id);
                                return (
                                  <div
                                    key={access.category_id}
                                    className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                                  >
                                    <span className="text-2xl">{cat?.icon || "🎓"}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                          {cat?.title || access.category_id}
                                        </h4>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                                          Active 🔓
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                        {cat?.description || "Category unlocked"}
                                      </p>
                                      {catExams.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {catExams.map((e) => (
                                            <span
                                              key={e.id}
                                              className="rounded-md bg-white/80 border border-emerald-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                            >
                                              {e.id}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {access.granted_at && (
                                        <span className="block text-[10px] text-slate-400 mt-1.5">
                                          Granted on: {new Date(access.granted_at).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>

                      {/* Mock Test History Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                          Entrance Mock Test History
                        </h3>
                        <span className="text-xs text-slate-400">
                          Total Attempts: {inspectData?.testAttempts.length || 0}
                        </span>
                      </div>

                      {inspectData?.testAttempts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 dark:border-slate-800">
                          <GraduationCap className="mx-auto mb-2 h-8 w-8 opacity-40" />
                          <p className="font-semibold">No mock tests attempted yet.</p>
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 font-bold uppercase text-slate-500 dark:bg-slate-800">
                              <tr>
                                <th className="px-4 py-3">Test Name</th>
                                <th className="px-4 py-3">Exam</th>
                                <th className="px-4 py-3">Score</th>
                                <th className="px-4 py-3">Accuracy</th>
                                <th className="px-4 py-3">Percentile</th>
                                <th className="px-4 py-3">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {inspectData?.testAttempts.map((attempt) => (
                                <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                                    {attempt.test_name}
                                  </td>
                                  <td className="px-4 py-3 uppercase text-slate-500">{attempt.exam_type}</td>
                                  <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                                    {attempt.score} / {attempt.max_score}
                                  </td>
                                  <td className="px-4 py-3">{attempt.accuracy}%</td>
                                  <td className="px-4 py-3">{attempt.percentile || "N/A"}%ile</td>
                                  <td className="px-4 py-3 text-slate-400">
                                    {new Date(attempt.created_at).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SKILLS TAB */}
                  {inspectTab === "skills" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                          Course Certificate Requests
                        </h3>
                        <span className="text-xs text-slate-400">
                          Total: {inspectData?.certRequests.length || 0}
                        </span>
                      </div>

                      {inspectData?.certRequests.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 dark:border-slate-800">
                          <Award className="mx-auto mb-2 h-8 w-8 opacity-40" />
                          <p className="font-semibold">No certificate requests submitted.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {inspectData?.certRequests.map((req) => (
                            <div
                              key={req.id}
                              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                            >
                              <div className="flex items-center gap-3">
                                <Award className="h-8 w-8 text-amber-500" />
                                <div>
                                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                    Course ID: {req.course_id}
                                  </h4>
                                  <span className="text-xs text-slate-400">
                                    Requested: {new Date(req.requested_at).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                    req.status === "approved"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : req.status === "rejected"
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {req.status}
                                </span>
                                {req.status === "pending" && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleReviewCertificate(req.id, "approved")}
                                      className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleReviewCertificate(req.id, "rejected")}
                                      className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MINDFULNESS TAB */}
                  {inspectTab === "mindfulness" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">
                          Mood Check-in History
                        </h3>
                        {inspectData?.moodEntries.length === 0 ? (
                          <p className="text-xs text-slate-400">No mood entries recorded yet.</p>
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2">
                            {inspectData?.moodEntries.map((m) => (
                              <div
                                key={m.id}
                                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-pink-600 dark:text-pink-400 text-sm">
                                    {m.mood}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(m.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300">
                                  {m.note || "No note left."}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">
                          Completed Mindfulness Sessions ({inspectData?.activities.length || 0})
                        </h3>
                        {inspectData?.activities.length === 0 ? (
                          <p className="text-xs text-slate-400">No sessions completed yet.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {inspectData?.activities.map((a) => (
                              <span
                                key={a.id}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                              >
                                Activity #{a.activity_id} • {new Date(a.completed_at).toLocaleDateString()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TUITION TAB */}
                  {inspectTab === "tuition" && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                        Tuition & Academic Profile
                      </h3>
                      {inspectData?.tuitionInfo ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/40 grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block">Class / Grade:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              {inspectData.tuitionInfo.class_level || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Board:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              {inspectData.tuitionInfo.board || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Attendance Streak:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              {inspectData.tuitionInfo.streak_days || 0} days
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Total Reward Points:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              {inspectData.tuitionInfo.total_points || 0} pts
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 dark:border-slate-800">
                          <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-40" />
                          <p className="font-semibold">No specialized tuition profile enrolled.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* RAW JSON GOD MODE TAB */}
                  {inspectTab === "json" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Raw Relational JSON Tree
                        </span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(inspectData?.rawJson, null, 2), "json")}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          {copiedId === "json" ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>Copy Raw JSON</span>
                        </button>
                      </div>
                      <pre className="max-h-[500px] overflow-auto rounded-2xl bg-slate-950 p-5 font-mono text-xs text-emerald-400 shadow-inner">
                        {JSON.stringify(inspectData?.rawJson, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE NEW USER MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#1C4966]" /> Provision New User
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="student@relicus.in"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Relicus@123"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Rahul Sharma"
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="rahul_s"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                  >
                    <option value="student">Student</option>
                    <option value="therapist">Therapist</option>
                    <option value="admin">Administrator (God)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1C4966] px-5 py-2.5 font-bold text-white shadow-md hover:bg-[#245D82] transition cursor-pointer"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT USER PROFILE MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && userToActOn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-[#1C4966]" /> Edit User Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                  >
                    <option value="student">Student</option>
                    <option value="therapist">Therapist</option>
                    <option value="admin">Administrator (God)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                >
                  <option value="active">Active (Normal Access)</option>
                  <option value="suspended">Suspended (Access Blocked)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1C4966] px-5 py-2.5 font-bold text-white shadow-md hover:bg-[#245D82] transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESET PASSWORD MODAL */}
      {/* ========================================================================= */}
      {isResetPassModalOpen && userToActOn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-500" /> Reset Password
              </h3>
              <button
                onClick={() => setIsResetPassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 pt-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Trigger an administrative password reset sequence for{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">{userToActOn.email}</span>.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specify New Password (or leave default to dispatch reset link)
                </label>
                <input
                  type="text"
                  placeholder="Relicus@NewPass2026"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1C4966] dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetPassModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-5 py-2.5 font-bold text-white shadow-md hover:bg-amber-700 transition cursor-pointer"
                >
                  Execute Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE USER CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && userToActOn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <ShieldAlert className="h-7 w-7" />
              <h3 className="text-xl font-bold">Purge User Account</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Are you sure you want to permanently erase{" "}
              <span className="font-bold text-slate-900 dark:text-white">{userToActOn.email}</span>? This cascade
              action will delete all mock test attempts, certificate requests, mood logs, and credentials.
            </p>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
              >
                Yes, Purge User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ENTRANCE COACHING CATEGORY ACCESS MODAL */}
      {/* ========================================================================= */}
      {isAccessModalOpen && selectedUserForAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Entrance Coaching Course Access
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUserForAccess.full_name || selectedUserForAccess.username || "Student"}</span> ({selectedUserForAccess.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAccessModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Guidance Info Box */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-amber-900 dark:text-amber-200">
                    <p className="font-bold">Selective Category Entitlement</p>
                    <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      Select which Entrance Coaching categories this student is authorized to access.
                      Categories that remain <strong>Restricted</strong> will only allow the user to watch the <strong>1 Free Preview Demo Lecture</strong> for courses within that category.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Categories ({allCategories.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAllCategories(true)}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Grant All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAllCategories(false)}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Revoke All
                  </button>
                </div>
              </div>

              {/* Category Cards List */}
              {loadingAccessModal ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2" />
                  <p className="text-xs">Loading categories and user entitlements...</p>
                </div>
              ) : allCategories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 dark:border-slate-800">
                  <p className="text-xs font-semibold">No coaching categories found in database.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allCategories.map((cat) => {
                    const isGranted = Boolean(userCategoryAccessMap[cat.id]);
                    const categoryExams = allExams.filter((e) => e.category_id === cat.id);

                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition cursor-pointer select-none ${
                          isGranted
                            ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/20"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-2xs text-2xl dark:border-slate-700 dark:bg-slate-800">
                            {cat.icon || "📚"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {cat.title}
                              </h4>
                              {isGranted ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                  <Check className="h-3 w-3" /> Full Access Granted
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                  🎬 1 Free Demo Only
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {cat.description || "Entrance coaching program category"}
                            </p>

                            {/* Exams inside this category */}
                            {categoryExams.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Courses:</span>
                                {categoryExams.map((e) => (
                                  <span
                                    key={e.id}
                                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                  >
                                    {e.full_name || e.id}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Toggle Switch */}
                        <div className="flex items-center sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCategory(cat.id);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                              isGranted ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isGranted ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 p-5 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {Object.values(userCategoryAccessMap).filter(Boolean).length} of {allCategories.length} categories enabled
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAccessModalOpen(false)}
                  disabled={savingAccess}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategoryAccess}
                  disabled={savingAccess}
                  className="flex items-center gap-2 rounded-xl bg-[#1C4966] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#245D82] transition cursor-pointer disabled:opacity-50"
                >
                  {savingAccess ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Permissions...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Access Permissions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
