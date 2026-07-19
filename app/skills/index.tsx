import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import {
  ArrowLeft,
  Flame,
  Award,
  BookOpen,
  Star,
  Clock,
  Users,
  Activity,
  Download,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Typography } from "../../components/Typography";
import { BentoCard } from "../../components/BentoCard";
import { Button } from "../../components/Button";
import { useSkillsStore } from "../../store/skills.store";
import { useAuthStore } from "../../store/auth.store";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function SkillEnhancementLanding() {
  const router = useRouter();
  const store = useSkillsStore();
  const authStore = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const userId = authStore.currentUser?.id;

  useFocusEffect(
    useCallback(() => {
      store.fetchCourses();
      store.fetchCertificateRequests();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await store.fetchCourses();
    await store.fetchCertificateRequests();
    setRefreshing(false);
  };

  const categories = useMemo(() => {
    const cats = new Set(store.courses.map((c) => c.category));
    return ["All", ...Array.from(cats)];
  }, [store.courses]);

  const filteredCourses = useMemo(() => {
    return store.courses.filter(
      (c) => selectedCategory === "All" || c.category === selectedCategory
    );
  }, [selectedCategory, store.courses]);

  const enrolledCourses = useMemo(() => {
    const userEnrolledIds = userId ? store.enrolledCourseIds[userId] || [] : [];
    return store.courses.filter((c) => userEnrolledIds.includes(c.id));
  }, [store.enrolledCourseIds, store.courses, userId]);

  const earnedCertificates = useMemo(() => {
    return userId ? store.certificates[userId] || [] : [];
  }, [store.certificates, userId]);

  const handleBack = () => {
    router.replace("/(tabs)/home");
  };

  const handleEnroll = (courseId: string) => {
    store.enrollInCourse(courseId);
    alert("Successfully enrolled in course!");
  };

  const handleOpenCourse = (courseId: string) => {
    store.selectCourse(courseId);
    router.push({
      pathname: "/skills/course-dashboard" as any,
      params: { courseId },
    });
  };

  const handleDownloadCertificate = async (cert: any) => {
    try {
      const html = `
        <html>
          <body style="padding: 40px; font-family: sans-serif; text-align: center; border: 15px solid #4f378a; box-sizing: border-box; min-height: 90vh;">
            <div style="margin-top: 50px;">
              <h1 style="color: #4f378a; font-size: 50px;">Certificate of Completion</h1>
              <p style="font-size: 24px; margin-top: 40px;">This is to certify that</p>
              <h2 style="font-size: 40px; color: #6b4fa3; margin-top: 20px; text-decoration: underline;">${cert.recipientName}</h2>
              <p style="font-size: 24px; margin-top: 20px;">has successfully completed the course</p>
              <h2 style="font-size: 40px; color: #F59E0B; margin-top: 20px;">${cert.courseTitle}</h2>
              <p style="font-size: 20px; margin-top: 80px;">Issued on: ${new Date(cert.date).toLocaleDateString()}</p>
              <p style="font-size: 20px; margin-top: 10px; color: gray;">Credential ID: ${cert.id}</p>
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error generating certificate", error);
      alert("Failed to download certificate.");
    }
  };

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-6 pt-10"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white/40 items-center justify-center border border-white/50"
              activeOpacity={0.7}
            >
              <ArrowLeft color="#4f378a" size={20} />
            </TouchableOpacity>
            <View className="flex-1">
              <Typography variant="caption" color="secondary" className="mb-0.5">Relicus Skills Academy</Typography>
              <Typography variant="heading" weight="bold" color="primary">Skill Enhancement</Typography>
            </View>
            <View className="flex-row items-center gap-1.5 bg-white/40 px-3 py-1.5 rounded-full border border-white/50">
              <Flame size={16} color="#F59E0B" fill="#F59E0B" />
              <Typography variant="caption" weight="bold" color="primary">
                {(userId ? store.streakCount[userId] : 0) || 0} Days
              </Typography>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Tab Segmented Controller */}
      <View className="flex-row border-b border-border-subtle bg-white">
        {[
          { id: "catalog", label: "Catalog" },
          { id: "my-courses", label: "My Learning" },
          { id: "certificates", label: "Certificates" },
          { id: "analytics", label: "Analytics" },
        ].map((tab) => {
          const active = store.activeLandingTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => store.setActiveLandingTab(tab.id as any)}
              className={twMerge(clsx(
                "flex-1 py-4 items-center border-b-2",
                active ? "border-primary" : "border-transparent"
              ))}
            >
              <Typography 
                variant="caption" 
                weight={active ? "bold" : "medium"} 
                color={active ? "primary" : "secondary"}
                className={active ? "" : "opacity-70"}
              >
                {tab.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f378a" />
        }
      >
        {/* TAB 1: CATALOG */}
        {store.activeLandingTab === "catalog" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Category horizontal scrolling selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5" contentContainerStyle={{ paddingRight: 24 }}>
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={twMerge(clsx(
                      "px-4 py-2 rounded-full border mr-2",
                      active 
                        ? "bg-primary border-primary" 
                        : "bg-surface-secondary border-border-subtle"
                    ))}
                  >
                    <Typography 
                      variant="caption" 
                      weight="bold" 
                      color={active ? "white" : "primary"}
                    >
                      {cat}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Typography variant="body" weight="bold" color="primary" className="mb-4">
              {filteredCourses.length} courses available
            </Typography>

            {filteredCourses.map((course) => {
              const isEnrolled = userId ? (store.enrolledCourseIds[userId] || []).includes(course.id) : false;
              return (
                <TouchableOpacity
                  key={course.id}
                  activeOpacity={0.9}
                  onPress={() => handleOpenCourse(course.id)}
                  className="bg-white rounded-3xl p-4 mb-5 border border-border-subtle shadow-sm"
                >
                  {/* Premium Image Header */}
                  <View className="w-full h-40 rounded-2xl overflow-hidden relative mb-3">
                    {course.thumbnail && String(course.thumbnail).trim().startsWith('http') ? (
                      <Image source={{ uri: String(course.thumbnail).trim() }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="w-full h-full bg-primary/10 items-center justify-center">
                        <Typography className="text-5xl">{course.thumbnail || "📚"}</Typography>
                      </View>
                    )}
                    <View className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-lg">
                      <Typography variant="caption" weight="bold" color="primary" className="text-[10px]">
                        {course.category} • {course.level}
                      </Typography>
                    </View>
                  </View>

                  <View className="mb-3">
                    <Typography variant="title" weight="bold" color="primary" className="mb-1">{course.title}</Typography>
                    <Typography variant="caption" color="secondary">Instructor: {course.instructor}</Typography>
                  </View>

                  {/* Skills tags */}
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {course.skillsLearned.slice(0, 3).map((skill) => (
                      <View key={skill} className="bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
                        <Typography variant="caption" weight="bold" color="primary" className="text-[11px] text-[#6b4fa3]">
                          {skill}
                        </Typography>
                      </View>
                    ))}
                    {course.skillsLearned.length > 3 && (
                      <View className="bg-surface-secondary px-2.5 py-1.5 rounded-lg">
                        <Typography variant="caption" color="secondary" className="text-[11px]">
                          +{course.skillsLearned.length - 3} more
                        </Typography>
                      </View>
                    )}
                  </View>

                  <View className="h-[1px] bg-border-subtle my-3" />

                  {/* Dynamically calculate live metrics */}
                  {(() => {
                    const totalLessons = course.modules.flatMap(m => m.lessons).length;
                    const liveDuration = Math.max(1, Math.ceil(totalLessons / 3)) + " weeks";
                    const courseReviews = store.reviews.filter(r => r.courseId === course.id);
                    const liveRating = courseReviews.length > 0 
                      ? (courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length).toFixed(1)
                      : course.rating;
                    const liveLearnersCount = course.learnersCount + (isEnrolled ? 1 : 0);

                    return (
                      <View className="flex-row justify-between mb-4 px-1">
                        <View className="flex-row items-center gap-1.5">
                          <Clock size={14} color="#79747e" />
                          <Typography variant="caption" weight="bold" color="secondary" className="text-[11px]">{liveDuration}</Typography>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <Star size={14} color="#F1C40F" fill="#F1C40F" />
                          <Typography variant="caption" weight="bold" color="secondary" className="text-[11px]">{liveRating}</Typography>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <Users size={14} color="#79747e" />
                          <Typography variant="caption" weight="bold" color="secondary" className="text-[11px]">{liveLearnersCount} Enrolled</Typography>
                        </View>
                      </View>
                    );
                  })()}

                  <Button
                    onPress={() => isEnrolled ? handleOpenCourse(course.id) : handleEnroll(course.id)}
                    variant={isEnrolled ? "outline" : "primary"}
                    className="w-full"
                  >
                    {isEnrolled ? "Open Dashboard" : "Enroll Now"}
                  </Button>
                </TouchableOpacity>
              );
            })}
          </MotiView>
        )}

        {/* TAB 2: MY LEARNING */}
        {store.activeLandingTab === "my-courses" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography variant="body" weight="bold" color="primary" className="mb-4">
              Enrolled Courses ({enrolledCourses.length})
            </Typography>

            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => {
                const allLessons = course.modules.flatMap((m) => m.lessons);
                const totalLessons = allLessons.length;
                let totalProgressSum = 0;
                allLessons.forEach(lesson => {
                  const key = `${userId}_${course.id}_${lesson.id}`;
                  totalProgressSum += store.lessonProgress[key]?.progress || 0;
                });
                const progressPercent = totalLessons > 0 ? Math.round(totalProgressSum / totalLessons) : 0;
                const completedLessons = Object.keys(store.lessonProgress).filter(
                  (key) => key.startsWith(`${userId}_${course.id}_`) && store.lessonProgress[key].completed
                ).length;

                return (
                  <TouchableOpacity
                    key={course.id}
                    onPress={() => handleOpenCourse(course.id)}
                    className="bg-white rounded-3xl p-4 mb-5 border border-border-subtle shadow-sm"
                  >
                    {/* Premium Image Header */}
                    <View className="w-full h-32 rounded-2xl overflow-hidden relative mb-3">
                      {course.thumbnail && String(course.thumbnail).trim().startsWith('http') ? (
                        <Image source={{ uri: String(course.thumbnail).trim() }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <View className="w-full h-full bg-primary/10 items-center justify-center">
                          <Typography className="text-5xl">{course.thumbnail || "📚"}</Typography>
                        </View>
                      )}
                      <View className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-lg">
                        <Typography variant="caption" weight="bold" color="primary" className="text-[10px]">
                          {course.category}
                        </Typography>
                      </View>
                    </View>

                    <View className="mb-3">
                      <Typography variant="title" weight="bold" color="primary" className="mb-1">{course.title}</Typography>
                      <Typography variant="caption" color="secondary">
                        {completedLessons} of {totalLessons} lessons completed
                      </Typography>
                    </View>

                    <View className="mt-3 pt-3 border-t border-border-subtle">
                      <View className="flex-row justify-between mb-2">
                        <Typography variant="caption" color="secondary">Course Progress</Typography>
                        <Typography variant="caption" weight="bold" color="primary">{progressPercent}%</Typography>
                      </View>
                      <View className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                        <View className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })
            ) : (
              <View className="items-center justify-center p-8 gap-3">
                <BookOpen size={48} color="#4f378a" className="opacity-50" />
                <Typography variant="body" color="secondary" className="text-center mb-2">
                  You are not enrolled in any courses yet.
                </Typography>
                <Button onPress={() => store.setActiveLandingTab("catalog")} variant="primary">
                  Browse Catalog
                </Button>
              </View>
            )}
          </MotiView>
        )}

        {/* TAB 3: CERTIFICATES */}
        {store.activeLandingTab === "certificates" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography variant="body" weight="bold" color="primary" className="mb-4">
              Earned Credentials ({earnedCertificates.length})
            </Typography>
            {earnedCertificates.length > 0 ? (
              earnedCertificates.map((cert) => (
                <View key={cert.id} className="flex-row items-center bg-white rounded-2xl p-4 border border-border-subtle mb-3 shadow-sm">
                  <Award size={36} color="#F1C40F" className="mr-3" />
                  <View className="flex-1">
                    <Typography variant="caption" weight="bold" color="secondary" className="text-[9px] mb-1">
                      PROFESSIONAL CREDENTIAL
                    </Typography>
                    <Typography variant="body" weight="bold" color="primary" className="mb-1">
                      {cert.courseTitle}
                    </Typography>
                    <Typography variant="caption" color="secondary" className="text-[10px]">
                      Issued to {cert.recipientName} on {new Date(cert.date).toLocaleDateString()}
                    </Typography>
                  </View>
                  <TouchableOpacity onPress={() => handleDownloadCertificate(cert)} className="p-2.5 bg-surface-secondary rounded-full ml-2">
                    <Download size={20} color="#4f378a" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View className="items-center justify-center p-8 gap-3">
                <Award size={48} color="#4f378a" className="opacity-50" />
                <Typography variant="body" color="secondary" className="text-center">
                  No certificates earned yet.
                </Typography>
              </View>
            )}

            <View className="h-[1px] bg-border-subtle my-6" />
            
            <Typography variant="body" weight="bold" color="primary" className="mb-1">
              Available for Certification
            </Typography>
            <Typography variant="caption" color="secondary" className="mb-4">
              Request a certificate for courses you've completed.
            </Typography>
            
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((c) => {
                const request = store.certificateRequests.find(r => r.courseId === c.id);
                const isEarned = earnedCertificates.some(cert => cert.courseId === c.id);
                
                if (isEarned) return null; // Don't show if already earned

                // Calculate progress
                const allLessons = c.modules.flatMap((m) => m.lessons);
                const totalLessons = allLessons.length;
                let totalProgressSum = 0;
                allLessons.forEach(lesson => {
                  const key = `${userId}_${c.id}_${lesson.id}`;
                  totalProgressSum += store.lessonProgress[key]?.progress || 0;
                });
                const progressPercent = totalLessons > 0 ? Math.round(totalProgressSum / totalLessons) : 0;
                
                return (
                  <View key={c.id} className="flex-row items-center bg-white rounded-2xl p-4 border border-border-subtle mb-3 shadow-sm">
                    <View className="flex-1">
                      <Typography variant="body" weight="bold" color="primary" className="mb-1">
                        {c.title}
                      </Typography>
                      {request ? (
                        <Typography variant="caption" weight="bold" className="text-[#F59E0B]">
                          Status: {request.status}
                        </Typography>
                      ) : (
                        <Typography variant="caption" className={progressPercent >= 100 ? "text-[#10B981]" : "text-[#79747e]"}>
                          {progressPercent >= 100 ? "Ready to claim!" : `Course Progress: ${progressPercent}%`}
                        </Typography>
                      )}
                    </View>
                    {!request && (
                      <TouchableOpacity 
                        onPress={() => progressPercent >= 100 ? store.requestCertificate(c.id, c.title, authStore.currentUser?.username || authStore.currentUser?.email || "Student") : alert("Please complete the course 100% to request a certificate.")}
                        className={twMerge(clsx(
                          "px-4 py-2 rounded-xl ml-2",
                          progressPercent >= 100 ? "bg-primary" : "bg-surface-secondary border border-border-subtle"
                        ))}
                        activeOpacity={progressPercent >= 100 ? 0.8 : 1}
                      >
                        <Typography variant="caption" weight="bold" color={progressPercent >= 100 ? "white" : "secondary"}>
                          Request
                        </Typography>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            ) : (
              <Typography variant="caption" color="secondary" className="text-center">
                Enroll in courses to request certificates.
              </Typography>
            )}
          </MotiView>
        )}

        {/* TAB 4: ANALYTICS */}
        {store.activeLandingTab === "analytics" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View className="flex-row gap-3 mb-5">
              <BentoCard variant="secondary" padding="lg" className="flex-1 bg-white border border-border-subtle shadow-sm items-center">
                <Typography variant="caption" weight="bold" color="secondary" className="mb-2">Study Duration</Typography>
                <Typography variant="title" weight="bold" color="primary" className="mb-1">
                  {userId ? (store.learningHours[userId] || 0).toFixed(1) : "0.0"} hrs
                </Typography>
                <Typography variant="caption" color="secondary" className="text-[10px]">Total hours spent</Typography>
              </BentoCard>

              <BentoCard variant="secondary" padding="lg" className="flex-1 bg-white border border-border-subtle shadow-sm items-center">
                <Typography variant="caption" weight="bold" color="secondary" className="mb-2">Weekly Streak</Typography>
                <Typography variant="title" weight="bold" color="primary" className="mb-1">
                  {userId ? (store.streakCount[userId] || 0) : 0} days
                </Typography>
                <Typography variant="caption" color="secondary" className="text-[10px]">Daily consistency</Typography>
              </BentoCard>
            </View>

            {/* Recent Activities */}
            <BentoCard variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm">
              <View className="flex-row items-center gap-2 mb-4">
                <Activity size={18} color="#4f378a" />
                <Typography variant="body" weight="bold" color="primary">Learning History Log</Typography>
              </View>
              <View>
                {store.activityFeed.slice(0, 8).map((activity, idx) => (
                  <View 
                    key={activity.id} 
                    className={twMerge(clsx(
                      "flex-row items-center gap-3 py-3",
                      idx !== Math.min(store.activityFeed.length, 8) - 1 && "border-b border-border-subtle"
                    ))}
                  >
                    <Typography variant="body" weight="bold" className="text-[#10B981]">✓</Typography>
                    <View className="flex-1">
                      <Typography variant="caption" weight="bold" color="primary" className="mb-0.5">
                        {activity.title}
                      </Typography>
                      <Typography variant="caption" color="secondary" className="text-[10px]">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </Typography>
                    </View>
                  </View>
                ))}
              </View>
            </BentoCard>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}
