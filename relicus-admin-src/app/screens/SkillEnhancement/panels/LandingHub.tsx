import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Flame, Award, BookOpen, Star, Clock, Users, ArrowRight, Bookmark, Trophy, CheckCircle, ChevronRight, Activity, Calendar, Play, Bell } from "lucide-react";
import { useSkillsStore, Course } from "../store/skills.store";
import { courseService, SearchResult } from "../services/course.service";
import { enrollmentService } from "../services/enrollment.service";
import { analyticsService } from "../services/analytics.service";
import { progressService } from "../services/progress.service";
import { certificateService } from "../services/certificate.service";
import { EmptyState } from "../components/EmptyState";
import { DynamicCertificate } from "../components/DynamicCertificate";
import { NotificationCenter } from "../components/NotificationCenter";
import { ContinueLearningWidget } from "../components/ContinueLearningWidget";
import { Button } from "../../../components/Button";

interface LandingHubProps {
  onOpenVideo: (courseId: string, moduleId: string, lessonId: string, title: string, url: string) => void;
}

export const LandingHub: React.FC<LandingHubProps> = ({ onOpenVideo }) => {
  const store = useSkillsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Overlay States
  const [activeCertificate, setActiveCertificate] = useState<any | null>(null);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Bookmarks filter state
  const [bookmarkFilter, setBookmarkFilter] = useState<"all" | "video" | "note" | "assignment">("all");

  const unreadNotificationsCount = useMemo(() => {
    return store.notifications.filter((n) => !n.isRead).length;
  }, [store.notifications]);

  // Get dynamic state from services
  const courses = useMemo(() => {
    return courseService.getCoursesByCategory(selectedCategory);
  }, [selectedCategory, store.courses]);

  const categories = useMemo(() => {
    return courseService.getCategories();
  }, [store.courses]);

  const enrolledCourses = useMemo(() => {
    return enrollmentService.getEnrolledCourses();
  }, [store.enrolledCourseIds, store.courses]);

  const earnedCertificates = useMemo(() => {
    return certificateService.getAllCertificates();
  }, [store.certificates]);

  const streak = useMemo(() => {
    return analyticsService.getStreakCount();
  }, [store.streakCount]);

  const hours = useMemo(() => {
    return analyticsService.getLearningHours();
  }, [store.learningHours]);

  const achievements = useMemo(() => {
    return analyticsService.getAchievements();
  }, [store.submissions, store.certificates, store.lessonProgress, store.streakCount]);

  const avgScore = useMemo(() => {
    return analyticsService.getAverageQuizScore();
  }, [store.submissions, store.certificates]);

  // Global search results
  const searchResults = useMemo(() => {
    return courseService.globalSearch(searchQuery);
  }, [searchQuery, store.courses]);

  // Recommended Next Courses
  const recommendedCourses = useMemo(() => {
    return courseService.getRecommendations(null).slice(0, 2);
  }, [store.enrolledCourseIds]);

  const handleEnroll = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    enrollmentService.enroll(courseId);
  };

  const handleCourseClick = (courseId: string) => {
    enrollmentService.selectCourse(courseId);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery(""); // Clear search
    
    if (!enrollmentService.isEnrolled(result.courseId)) {
      enrollmentService.enroll(result.courseId);
    }
    
    enrollmentService.selectCourse(result.courseId);

    if (result.type === "lesson" && result.itemId && result.moduleId) {
      const courseObj = courseService.getCourseById(result.courseId);
      const mod = courseObj?.modules.find((m) => m.id === result.moduleId);
      const les = mod?.lessons.find((l) => l.id === result.itemId);
      if (les) {
        store.setActiveDashboardTab("curriculum");
        onOpenVideo(result.courseId, result.moduleId, result.itemId, les.title, les.videoUrl);
      }
    } else if (result.type === "note" || result.type === "assignment") {
      store.setActiveDashboardTab(result.type === "note" ? "curriculum" : "assignments");
    }
  };

  const filteredBookmarks = useMemo(() => {
    if (bookmarkFilter === "all") return store.bookmarks;
    return store.bookmarks.filter((b) => b.type === bookmarkFilter);
  }, [store.bookmarks, bookmarkFilter]);

  return (
    <div className="space-y-6">
      {/* Search & Header Section */}
      <div className="bg-gradient-to-br from-[#1C4966] to-[#5F8B70] p-6 pb-8 rounded-b-[2rem] text-white space-y-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">Skill Enhancement</h1>
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1">
              Relicus Learning Academy
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Notification Tray Button */}
            <button
              onClick={() => setShowNotificationDrawer(true)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative border border-white/10 shrink-0 cursor-pointer transition-all"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black flex items-center justify-center text-white border border-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            
            <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full text-xs font-bold border border-white/10">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{streak} Days</span>
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, modules, lessons, notes..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 text-xs font-medium placeholder-white/50 text-white outline-none focus:bg-white focus:text-foreground focus:placeholder-neutral-400 transition-all shadow-inner"
          />

          {/* Search dropdown results */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 top-14 bg-white rounded-[2rem] border border-neutral-100 shadow-2xl p-4 z-40 max-h-[300px] overflow-y-auto space-y-3"
              >
                <div className="flex justify-between items-center border-b border-neutral-100 pb-2 mb-1">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">
                    Search Results ({searchResults.length})
                  </span>
                  <button onClick={() => setSearchQuery("")} className="text-[9px] text-[#1C4966] font-extrabold uppercase hover:underline">
                    Clear
                  </button>
                </div>

                {searchResults.length > 0 ? (
                  searchResults.map((res, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(res)}
                      className="w-full text-left p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all flex items-start gap-3"
                    >
                      <span className="text-lg shrink-0 mt-0.5">
                        {res.type === "course" ? "🎓" : res.type === "module" ? "📦" : res.type === "lesson" ? "🎥" : res.type === "note" ? "📄" : "📝"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-black text-[#5F8B70] uppercase tracking-wider block leading-none mb-0.5">
                          {res.type}
                        </span>
                        <h6 className="text-xs font-bold text-foreground truncate">{res.title}</h6>
                        <p className="text-[9px] text-neutral-400 truncate mt-0.5">{res.subtitle}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0 self-center" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-neutral-400 font-medium">
                    No matching courses or curriculum files found.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Tab Segmented Controller */}
      <div className="px-6 space-y-6">
        <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1 shadow-inner">
          {([
            { id: "catalog", label: "Catalog" },
            { id: "my-courses", label: "My Learning" },
            { id: "certificates", label: "Certificates" },
            { id: "analytics", label: "Analytics" }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => store.setActiveLandingTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                store.activeLandingTab === tab.id
                  ? "bg-white text-[#1C4966] shadow-md border border-neutral-100 font-extrabold"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panel Content */}
        <div>
          {/* TAB 1: CATALOG */}
          {store.activeLandingTab === "catalog" && (
            <div className="space-y-6">
              {/* Category selector row */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-[#1C4966] text-white border-transparent shadow-xs"
                        : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Catalog Courses List */}
              <div className="grid grid-cols-1 gap-5">
                {courses.length > 0 ? (
                  courses.map((course) => {
                    const isEnrolled = enrollmentService.isEnrolled(course.id);
                    return (
                      <div
                        key={course.id}
                        onClick={() => handleCourseClick(course.id)}
                        className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs hover:border-[#1C4966]/20 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[195px]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#8FBDD7]/10 to-[#1C4966]/10 border border-[#8FBDD7]/20 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-all">
                            {course.thumbnail}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              <span className="text-[7.5px] font-black uppercase bg-[#8FBDD7]/20 text-[#1C4966] px-2 py-0.5 rounded-full">
                                {course.category}
                              </span>
                              <span className="text-[7.5px] font-black uppercase bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                                {course.level}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-foreground text-sm leading-snug group-hover:text-[#1C4966] transition-colors">
                              {course.title}
                            </h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">By {course.instructor}</p>
                          </div>
                        </div>

                        {/* SKILLS OUTCOME SECTION (Skills gained outcomes) */}
                        <div className="mt-3.5 space-y-1.5 bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100">
                          <span className="text-[8px] font-black uppercase text-[#1C4966] tracking-wider block">
                            Skills Gained Outcomes
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {course.skillsLearned.map((skill, idx) => (
                              <span key={idx} className="text-[8px] font-bold bg-[#8FBDD7]/10 text-[#1C4966] px-2 py-0.5 rounded-full">
                                ✓ {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Middle stats */}
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold border-t border-b border-neutral-50 py-3 my-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-neutral-300" /> {course.duration}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {course.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-neutral-300" /> {course.learnersCount} Learners
                          </span>
                        </div>

                        {/* Enroll Button */}
                        <div className="flex gap-2 shrink-0">
                          {isEnrolled ? (
                            <button className="w-full py-2.5 bg-neutral-100 text-neutral-600 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1">
                              Already Enrolled • Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleEnroll(course.id, e)}
                              className="w-full py-2.5 bg-[#1C4966] hover:bg-[#1C4966]/95 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                            >
                              Enroll Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState
                    title="No Courses Found"
                    description="No courses matching this category. Please check back later."
                    icon={BookOpen}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY COURSES */}
          {store.activeLandingTab === "my-courses" && (
            <div className="space-y-6">
              {/* Continue Learning Widget */}
              <ContinueLearningWidget onOpenVideo={onOpenVideo} />

              {/* Enrolled Courses list */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider px-1">
                  Enrolled Courses ({enrolledCourses.length})
                </h5>

                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((course) => {
                    const percent = progressService.getCourseCompletionPercentage(course.id);
                    const { completed, total } = progressService.getCompletedModulesCount(course.id);
                    return (
                      <div
                        key={course.id}
                        onClick={() => handleCourseClick(course.id)}
                        className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs hover:border-[#1C4966]/20 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                            {course.thumbnail}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-foreground text-xs leading-snug">{course.title}</h4>
                            <p className="text-[9px] text-neutral-400 mt-0.5">
                              {completed} of {total} Modules Completed
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar widget */}
                        <div className="space-y-1.5 border-t border-neutral-50 pt-3">
                          <div className="flex justify-between items-center text-[9px] font-bold text-neutral-400">
                            <span>Course Progress</span>
                            <span className="text-[#1C4966]">{percent}%</span>
                          </div>
                          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#1C4966] to-[#5F8B70] transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState
                    title="No Enrolled Courses"
                    description="You are not enrolled in any skill courses. Browse our Catalog to find your next skill path."
                    icon={BookOpen}
                    action={
                      <Button onClick={() => store.setActiveLandingTab("catalog")} size="sm" className="rounded-full">
                        Browse Catalog
                      </Button>
                    }
                  />
                )}
              </div>

              {/* Recommended Next Courses */}
              <div className="space-y-4 border-t border-neutral-100 pt-5">
                <h5 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider px-1">
                  Recommended Next Courses
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  {recommendedCourses.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => handleCourseClick(rec.id)}
                      className="p-4 bg-white hover:bg-[#1C4966]/5 rounded-3xl border border-neutral-100 cursor-pointer shadow-xs transition-all flex flex-col justify-between min-h-[120px]"
                    >
                      <div>
                        <span className="text-[7.5px] font-black bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full uppercase">
                          {rec.category}
                        </span>
                        <h5 className="font-extrabold text-foreground text-[10.5px] leading-snug mt-2 truncate">
                          {rec.title}
                        </h5>
                      </div>
                      <span className="text-[9px] font-black text-[#1C4966] uppercase tracking-wider block mt-2">
                        View Details →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFICATES */}
          {store.activeLandingTab === "certificates" && (
            <div className="space-y-4">
              <h5 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider px-1">
                Your Credentials ({earnedCertificates.length})
              </h5>

              {earnedCertificates.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {earnedCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      onClick={() => setActiveCertificate(cert)}
                      className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#1C4966]/20 transition-all group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                        <div className="w-12 h-12 bg-amber-50 border border-amber-100 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block leading-none mb-1">
                            Certificate Credentials
                          </span>
                          <h5 className="text-xs font-bold text-foreground truncate group-hover:text-[#1C4966]">
                            {cert.courseTitle}
                          </h5>
                          <p className="text-[9px] text-neutral-400 mt-0.5">Completed on {cert.date}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Certificates Unlocked"
                  description="Complete a course curriculum to 100% and finish your assignments/quizzes to unlock professional credentials."
                  icon={Award}
                />
              )}
            </div>
          )}

          {/* TAB 4: ANALYTICS & ACTIVITY FEED */}
          {store.activeLandingTab === "analytics" && (
            <div className="space-y-6">
              {/* Performance Metrics Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-neutral-100 rounded-[2rem] p-5 flex flex-col justify-between shadow-xs min-h-[120px]">
                  <span className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">
                    Study Hours
                  </span>
                  <div>
                    <h3 className="text-2xl font-black text-[#1C4966]">{hours} hrs</h3>
                    <p className="text-[9px] text-muted-foreground mt-1">Total learning duration</p>
                  </div>
                </div>

                <div className="bg-white border border-neutral-100 rounded-[2rem] p-5 flex flex-col justify-between shadow-xs min-h-[120px]">
                  <span className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">
                    Quiz Avg Accuracy
                  </span>
                  <div>
                    <h3 className="text-2xl font-black text-[#5F8B70]">{avgScore}%</h3>
                    <p className="text-[9px] text-muted-foreground mt-1">Calculated across attempts</p>
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITY FEED */}
              <div className="bg-white border border-neutral-100 rounded-[2.25rem] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Activity className="w-4.5 h-4.5 text-[#1C4966]" />
                  <h5 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
                    Recent Activity Feed
                  </h5>
                </div>

                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
                  {store.activityFeed.length > 0 ? (
                    store.activityFeed.map((act) => (
                      <div key={act.id} className="flex gap-3 text-xs leading-relaxed border-b border-neutral-50 pb-2.5">
                        <span className="text-sm shrink-0">✓</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-neutral-700 leading-snug">{act.title}</p>
                          <span className="text-[8px] text-neutral-400 font-bold block mt-0.5">
                            {new Date(act.timestamp).toLocaleDateString()} at {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-neutral-400">
                      No recent actions logged.
                    </div>
                  )}
                </div>
              </div>

              {/* Achievements Dashboard Section */}
              <div className="bg-white border border-neutral-100 rounded-[2.25rem] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Trophy className="w-4.5 h-4.5 text-amber-500" />
                  <h5 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
                    Academy Achievements
                  </h5>
                </div>

                <div className="space-y-3">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`flex items-center gap-3.5 p-3.5 border rounded-2xl transition-all ${
                        ach.unlocked
                          ? "bg-[#5F8B70]/5 border-[#5F8B70]/20 text-foreground"
                          : "bg-neutral-50/50 border-neutral-100 text-neutral-400 opacity-60"
                      }`}
                    >
                      <div className="text-2xl shrink-0">{ach.icon}</div>
                      <div className="min-w-0 flex-1">
                        <h6 className="text-xs font-bold leading-snug">{ach.title}</h6>
                        <p className="text-[9.5px] text-neutral-400 leading-snug mt-0.5">
                          {ach.description}
                        </p>
                      </div>
                      {ach.unlocked && (
                        <CheckCircle className="w-4 h-4 text-[#5F8B70] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Certificate Modal rendering */}
      {activeCertificate && (
        <DynamicCertificate
          certificate={activeCertificate}
          onClose={() => setActiveCertificate(null)}
        />
      )}

      {/* Notification Center overlay drawer */}
      {showNotificationDrawer && (
        <NotificationCenter
          onClose={() => setShowNotificationDrawer(false)}
        />
      )}
    </div>
  );
};
