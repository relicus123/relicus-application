import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, GraduationCap, Compass, HelpCircle, ShieldCheck, Heart, Users } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

export function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    courses: 3,
    exams: 7,
    careers: 6,
    colleges: 4,
    scholarships: 4,
    mockTests: 12,
    tuitionClasses: 5,
    mindfulnessActivities: 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        if (!supabase || !supabase.auth || !import.meta.env.VITE_SUPABASE_URL) {
          // Keep defaults if not connected
          setLoading(false);
          return;
        }

        const [
          { count: courseCount },
          { count: examCount },
          { count: careerCount },
          { count: collegeCount },
          { count: scholarshipCount },
          { count: mockTestCount },
          { count: tuitionCount },
          { count: mindfulnessCount }
        ] = await Promise.all([
          supabase.from("skills_courses").select("*", { count: "exact", head: true }),
          supabase.from("coaching_exams").select("*", { count: "exact", head: true }),
          supabase.from("knownext_careers").select("*", { count: "exact", head: true }),
          supabase.from("knownext_colleges").select("*", { count: "exact", head: true }),
          supabase.from("knownext_scholarships").select("*", { count: "exact", head: true }),
          supabase.from("coaching_mock_tests").select("*", { count: "exact", head: true }),
          supabase.from("tuition_classes").select("*", { count: "exact", head: true }),
          supabase.from("mindfulness_activities").select("*", { count: "exact", head: true }),
        ]);

        setStats({
          courses: courseCount || 0,
          exams: examCount || 0,
          careers: careerCount || 0,
          colleges: collegeCount || 0,
          scholarships: scholarshipCount || 0,
          mockTests: mockTestCount || 0,
          tuitionClasses: tuitionCount || 0,
          mindfulnessActivities: mindfulnessCount || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    {
      title: "Skills Academy",
      desc: "Courses, Modules, Lessons, Resources, & Quizzes",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600",
      path: "/admin/skills",
      stats: `${stats.courses} Courses Active`,
    },
    {
      title: "Entrance Coaching",
      desc: "Exams (CUET/JEE/NEET), Chapters, Mock Tests, Questions",
      icon: GraduationCap,
      color: "from-teal-500 to-emerald-600",
      path: "/admin/coaching",
      stats: `${stats.exams} Exams | ${stats.mockTests} Mock Tests`,
    },
    {
      title: "KnowNext Guidance",
      desc: "Careers list, roadmaps, colleges comparison, scholarships",
      icon: Compass,
      color: "from-amber-500 to-orange-600",
      path: "/admin/knownext",
      stats: `${stats.careers} Careers | ${stats.colleges} Colleges`,
    },
    {
      title: "Tuition Classes",
      desc: "Manage classes, students, assignments, and analytics",
      icon: Users,
      color: "from-rose-500 to-pink-600",
      path: "/admin/tuition",
      stats: `${stats.tuitionClasses} Classes Active`,
    },
    {
      title: "Mindfulness",
      desc: "Manage meditation, breathing exercises, and affirmations",
      icon: Heart,
      color: "from-purple-500 to-fuchsia-600",
      path: "/admin/mindfulness",
      stats: `${stats.mindfulnessActivities} Activities`,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1C4966] to-[#2A6E99] p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 bg-radial-gradient"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> Core Database Connected
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Welcome to Relicus Admin
          </h1>
          <p className="mt-2 text-base text-[#FFFFF0]/80">
            Easily manage all course content, videos, documents, mock tests, and career metrics. Changes reflect in real-time on both the mobile app and Web client.
          </p>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${card.color} text-white shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-500 dark:text-slate-500">
                  {card.stats}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1C4966] dark:group-hover:text-[#8FBDD7] transition">
                {card.title}
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Database Checklist */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-500" /> Database Administration Quick Tips
        </h3>
        <div className="grid gap-4 md:grid-cols-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <div className="space-y-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300">📹 Video Upload Flow (YouTube Unlisted):</p>
            <p>Upload your videos as unlisted to YouTube. Copy the video ID (e.g. <code>dQw4w9WgXcQ</code>) and paste it into the video fields. Our player handles responsive, borderless embeds automatically.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300">📄 PDF / Image Upload (Cloudinary):</p>
            <p>You can use the upload interface to host course thumbnails, certification templates, and study sheets in Cloudinary. Copy the secure URL and paste it into the media fields.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
