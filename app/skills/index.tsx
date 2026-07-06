import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
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
  ChevronRight,
  TrendingUp,
  Activity,
  Trophy,
  CheckCircle,
} from "lucide-react-native";

import { useSkillsStore, Course } from "../../store/skills.store";
import { useAuthStore } from "../../store/auth.store";

const { width } = Dimensions.get("window");

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
    }, [])
  );

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
          <body style="padding: 40px; font-family: sans-serif; text-align: center; border: 15px solid #1C4966; box-sizing: border-box; min-height: 90vh;">
            <div style="margin-top: 50px;">
              <h1 style="color: #1C4966; font-size: 50px;">Certificate of Completion</h1>
              <p style="font-size: 24px; margin-top: 40px;">This is to certify that</p>
              <h2 style="font-size: 40px; color: #5F8B70; margin-top: 20px; text-decoration: underline;">${cert.recipientName}</h2>
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
    <View style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
      <LinearGradient
        colors={["#1C4966", "#5F8B70"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSubtitle}>Relicus Skills Academy</Text>
            <Text style={styles.headerTitle}>Skill Enhancement</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.streakBadgeText}>{(userId ? store.streakCount[userId] : 0) || 0} Days</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Tab Segmented Controller */}
      <View style={styles.tabsContainer}>
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
              style={[styles.tabButton, active && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5F8B70" />
        }
      >
        {/* TAB 1: CATALOG */}
        {store.activeLandingTab === "catalog" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Category horizontal scrolling selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                  >
                    <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.resultsText}>{filteredCourses.length} courses available</Text>

            {filteredCourses.map((course) => {
              const isEnrolled = userId ? (store.enrolledCourseIds[userId] || []).includes(course.id) : false;
              return (
                <TouchableOpacity
                  key={course.id}
                  activeOpacity={0.9}
                  onPress={() => handleOpenCourse(course.id)}
                  style={styles.courseCard}
                >
                  {/* Premium Image Header */}
                  <View style={styles.premiumThumbnailContainer}>
                    {course.thumbnail && String(course.thumbnail).trim().startsWith('http') ? (
                      <Image source={{ uri: String(course.thumbnail).trim() }} style={styles.premiumImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.premiumPlaceholder}>
                        <Text style={styles.premiumPlaceholderText}>{course.thumbnail || "📚"}</Text>
                      </View>
                    )}
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumBadgeText}>{course.category} • {course.level}</Text>
                    </View>
                  </View>

                  <View style={{ marginTop: 4, marginBottom: 12 }}>
                    <Text style={styles.premiumTitle}>{course.title}</Text>
                    <Text style={styles.courseInstructor}>Instructor: {course.instructor}</Text>
                  </View>

                  {/* Skills tags */}
                  <View style={styles.skillsTagsRow}>
                    {course.skillsLearned.slice(0, 3).map((skill) => (
                      <View key={skill} style={styles.skillTag}>
                        <Text style={styles.skillTagText}>{skill}</Text>
                      </View>
                    ))}
                    {course.skillsLearned.length > 3 && (
                      <View style={[styles.skillTag, { backgroundColor: "#F5F7FA", borderWidth: 0 }]}>
                        <Text style={[styles.skillTagText, { color: "#8FBDD7" }]}>+{course.skillsLearned.length - 3} more</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardDivider} />

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
                      <View style={styles.courseStatsRow}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Clock size={12} color="#8FBDD7" />
                          <Text style={styles.courseStatsText}>{liveDuration}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Star size={12} color="#F1C40F" fill="#F1C40F" />
                          <Text style={styles.courseStatsText}>{liveRating}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Users size={12} color="#8FBDD7" />
                          <Text style={styles.courseStatsText}>{liveLearnersCount} Enrolled</Text>
                        </View>
                      </View>
                    );
                  })()}

                  <TouchableOpacity
                    onPress={() => isEnrolled ? handleOpenCourse(course.id) : handleEnroll(course.id)}
                    style={[styles.btn, isEnrolled && { backgroundColor: "rgba(95, 139, 112, 0.1)" }]}
                  >
                    <Text style={[styles.btnText, isEnrolled && { color: "#5F8B70" }]}>
                      {isEnrolled ? "Open Dashboard" : "Enroll Now"}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </MotiView>
        )}

        {/* TAB 2: MY LEARNING */}
        {store.activeLandingTab === "my-courses" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Text style={styles.resultsText}>Enrolled Courses ({enrolledCourses.length})</Text>

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
                    style={styles.courseCard}
                  >
                    {/* Premium Image Header */}
                    <View style={styles.premiumThumbnailContainer}>
                      {course.thumbnail && String(course.thumbnail).trim().startsWith('http') ? (
                        <Image source={{ uri: String(course.thumbnail).trim() }} style={styles.premiumImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.premiumPlaceholder}>
                          <Text style={styles.premiumPlaceholderText}>{course.thumbnail || "📚"}</Text>
                        </View>
                      )}
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumBadgeText}>{course.category}</Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 4, marginBottom: 12 }}>
                      <Text style={styles.premiumTitle}>{course.title}</Text>
                      <Text style={styles.courseInstructor}>{completedLessons} of {totalLessons} lessons completed</Text>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressLabels}>
                        <Text style={styles.progressLabelText}>Course Progress</Text>
                        <Text style={styles.progressPercentText}>{progressPercent}%</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })
            ) : (
              <View style={styles.emptyContainer}>
                <BookOpen size={40} color="#8FBDD7" />
                <Text style={styles.emptyText}>You are not enrolled in any courses yet.</Text>
                <TouchableOpacity onPress={() => store.setActiveLandingTab("catalog")} style={styles.btn}>
                  <Text style={styles.btnText}>Browse Catalog</Text>
                </TouchableOpacity>
              </View>
            )}
          </MotiView>
        )}

        {/* TAB 3: CERTIFICATES */}
        {store.activeLandingTab === "certificates" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Text style={styles.resultsText}>Earned Credentials ({earnedCertificates.length})</Text>
            {earnedCertificates.length > 0 ? (
              earnedCertificates.map((cert) => (
                <View key={cert.id} style={styles.certCard}>
                  <Award size={36} color="#F1C40F" style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.certCategory}>PROFESSIONAL CREDENTIAL</Text>
                    <Text style={styles.certTitle}>{cert.courseTitle}</Text>
                    <Text style={styles.certDate}>Issued to {cert.recipientName} on {new Date(cert.date).toLocaleDateString()}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDownloadCertificate(cert)} style={{ padding: 8, backgroundColor: '#f1f5f9', borderRadius: 50 }}>
                    <Download size={20} color="#1C4966" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Award size={40} color="#8FBDD7" />
                <Text style={styles.emptyText}>No certificates earned yet.</Text>
              </View>
            )}

            <View style={{ height: 1, backgroundColor: 'rgba(28, 73, 102, 0.1)', marginVertical: 20 }} />
            
            <Text style={styles.resultsText}>Available for Certification</Text>
            <Text style={[styles.emptyText, { textAlign: 'left', marginBottom: 16, marginTop: -8 }]}>Request a certificate for courses you've completed.</Text>
            
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
                  <View key={c.id} style={[styles.certCard, { alignItems: 'center' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.certTitle}>{c.title}</Text>
                      {request ? (
                        <Text style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: 12, marginTop: 4 }}>Status: {request.status}</Text>
                      ) : (
                        <Text style={{ color: progressPercent >= 100 ? '#8FBDD7' : '#94a3b8', fontSize: 12, marginTop: 4 }}>
                          {progressPercent >= 100 ? "Ready to claim!" : `Course Progress: ${progressPercent}%`}
                        </Text>
                      )}
                    </View>
                    {!request && (
                      <TouchableOpacity 
                        onPress={() => progressPercent >= 100 ? store.requestCertificate(c.id, c.title, authStore.currentUser?.name || "Student") : alert("Please complete the course 100% to request a certificate.")}
                        style={[styles.btn, { paddingHorizontal: 16, paddingVertical: 8, minWidth: 100, backgroundColor: progressPercent >= 100 ? "#1C4966" : "#cbd5e1" }]}
                        activeOpacity={progressPercent >= 100 ? 0.8 : 1}
                      >
                        <Text style={[styles.btnText, { fontSize: 13, color: progressPercent >= 100 ? "white" : "#64748b" }]}>Request</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Enroll in courses to request certificates.</Text>
            )}
          </MotiView>
        )}

        {/* TAB 4: ANALYTICS */}
        {store.activeLandingTab === "analytics" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.analyticsRow}>
              <View style={styles.analyticsBox}>
                <Text style={styles.analyticsTitle}>Study Duration</Text>
                <Text style={styles.analyticsVal}>{userId ? (store.learningHours[userId] || 0).toFixed(1) : 0} hrs</Text>
                <Text style={styles.analyticsSub}>Total hours spent</Text>
              </View>

              <View style={styles.analyticsBox}>
                <Text style={styles.analyticsTitle}>Weekly Streak</Text>
                <Text style={styles.analyticsVal}>{userId ? (store.streakCount[userId] || 0) : 0} days</Text>
                <Text style={styles.analyticsSub}>Daily consistency</Text>
              </View>
            </View>

            {/* Recent Activities */}
            <View style={styles.activitiesCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Activity size={18} color="#1C4966" />
                <Text style={styles.cardHeaderTitle}>Learning History Log</Text>
              </View>
              {store.activityFeed.slice(0, 8).map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <Text style={styles.activityDot}>✓</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitleText}>{activity.title}</Text>
                    <Text style={styles.activityDateText}>{new Date(activity.timestamp).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    padding: 20,
    paddingTop: 44,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.08)",
    backgroundColor: "white",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabButtonActive: {
    borderColor: "#1C4966",
  },
  tabButtonText: {
    fontSize: 11,
    color: "#8FBDD7",
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: "#1C4966",
    fontWeight: "bold",
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDEEE3",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#1C4966",
    borderColor: "#1C4966",
  },
  categoryChipText: {
    fontSize: 12,
    color: "#1C4966",
    fontWeight: "bold",
  },
  categoryChipTextActive: {
    color: "white",
  },
  resultsText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  premiumThumbnailContainer: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  premiumImage: {
    width: '100%',
    height: '100%',
  },
  premiumPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: "rgba(143, 189, 215, 0.15)",
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumPlaceholderText: {
    fontSize: 48,
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    color: "#1C4966",
    fontWeight: "bold",
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 12,
    color: "#8FBDD7",
    marginTop: 2,
  },
  skillsTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: "rgba(95, 139, 112, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(95, 139, 112, 0.15)",
  },
  skillTagText: {
    fontSize: 11,
    color: "#5F8B70",
    fontWeight: "600",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F5F7FA",
    marginVertical: 12,
  },
  courseStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  courseStatsText: {
    fontSize: 11,
    color: "#8FBDD7",
    fontWeight: "600",
  },
  btn: {
    backgroundColor: "#1C4966",
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#F5F7FA",
    paddingTop: 12,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabelText: {
    fontSize: 11,
    color: "#5F8B70",
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1C4966",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F5F7FA",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C4966",
    borderRadius: 3,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: "#8FBDD7",
    textAlign: "center",
  },
  certCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    marginBottom: 12,
  },
  certCategory: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#8FBDD7",
  },
  certTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 2,
  },
  certDate: {
    fontSize: 11,
    color: "#5F8B70",
    marginTop: 4,
  },
  analyticsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  analyticsBox: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  analyticsTitle: {
    fontSize: 11,
    color: "#8FBDD7",
    fontWeight: "bold",
  },
  analyticsVal: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 8,
  },
  analyticsSub: {
    fontSize: 10,
    color: "#5F8B70",
    marginTop: 4,
  },
  activitiesCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#F5F7FA",
  },
  activityDot: {
    color: "#5F8B70",
    fontWeight: "bold",
  },
  activityTitleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C4966",
  },
  activityDateText: {
    fontSize: 10,
    color: "#8FBDD7",
    marginTop: 2,
  },
});
