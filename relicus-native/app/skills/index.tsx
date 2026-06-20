import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
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

const { width } = Dimensions.get("window");

export default function SkillEnhancementLanding() {
  const router = useRouter();
  const store = useSkillsStore();
  const [selectedCategory, setSelectedCategory] = useState("All");

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
    return store.courses.filter((c) => store.enrolledCourseIds.includes(c.id));
  }, [store.enrolledCourseIds, store.courses]);

  const earnedCertificates = useMemo(() => {
    return store.certificates;
  }, [store.certificates]);

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
            <Text style={styles.streakBadgeText}>{store.streakCount} Days</Text>
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              const isEnrolled = store.enrolledCourseIds.includes(course.id);
              return (
                <TouchableOpacity
                  key={course.id}
                  activeOpacity={0.9}
                  onPress={() => handleOpenCourse(course.id)}
                  style={styles.courseCard}
                >
                  <View style={styles.courseCardTop}>
                    <View style={styles.thumbnailBox}>
                      <Text style={styles.thumbnailText}>{course.thumbnail}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseCategory}>{course.category} • {course.level}</Text>
                      <Text style={styles.courseTitle}>{course.title}</Text>
                      <Text style={styles.courseInstructor}>Instructor: {course.instructor}</Text>
                    </View>
                  </View>

                  {/* Skills tags */}
                  <View style={styles.skillsTagsRow}>
                    {course.skillsLearned.map((skill) => (
                      <View key={skill} style={styles.skillTag}>
                        <Text style={styles.skillTagText}>✓ {skill}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.courseStatsRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Clock size={12} color="#8FBDD7" />
                      <Text style={styles.courseStatsText}>{course.duration}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Star size={12} color="#F1C40F" fill="#F1C40F" />
                      <Text style={styles.courseStatsText}>{course.rating}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Users size={12} color="#8FBDD7" />
                      <Text style={styles.courseStatsText}>{course.learnersCount} Enrolled</Text>
                    </View>
                  </View>

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
                const completedLessons = Object.keys(store.lessonProgress).filter(
                  (key) => key.startsWith(`${course.id}_`) && store.lessonProgress[key].completed
                ).length;
                const totalLessons = course.modules.flatMap((m) => m.lessons).length;
                const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

                return (
                  <TouchableOpacity
                    key={course.id}
                    onPress={() => handleOpenCourse(course.id)}
                    style={styles.courseCard}
                  >
                    <View style={styles.courseCardTop}>
                      <View style={styles.thumbnailBox}>
                        <Text style={styles.thumbnailText}>{course.thumbnail}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.courseCategory}>{course.category}</Text>
                        <Text style={styles.courseTitle}>{course.title}</Text>
                        <Text style={styles.courseInstructor}>{completedLessons} of {totalLessons} lessons completed</Text>
                      </View>
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
                    <Text style={styles.certDate}>Issued to {cert.recipientName} on {cert.date}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Award size={40} color="#8FBDD7" />
                <Text style={styles.emptyText}>No certificates earned yet. Complete all lessons & quizzes in a course to earn a certificate.</Text>
              </View>
            )}
          </MotiView>
        )}

        {/* TAB 4: ANALYTICS */}
        {store.activeLandingTab === "analytics" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.analyticsRow}>
              <View style={styles.analyticsBox}>
                <Text style={styles.analyticsTitle}>Study Duration</Text>
                <Text style={styles.analyticsVal}>{store.learningHours} hrs</Text>
                <Text style={styles.analyticsSub}>Total hours spent</Text>
              </View>

              <View style={styles.analyticsBox}>
                <Text style={styles.analyticsTitle}>Weekly Streak</Text>
                <Text style={styles.analyticsVal}>{store.streakCount} days</Text>
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
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  courseCardTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  thumbnailBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(143, 189, 215, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailText: {
    fontSize: 26,
  },
  courseCategory: {
    fontSize: 10,
    color: "#5F8B70",
    fontWeight: "bold",
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 2,
  },
  courseInstructor: {
    fontSize: 12,
    color: "#8FBDD7",
    marginTop: 2,
  },
  skillsTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  skillTag: {
    backgroundColor: "rgba(143, 189, 215, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillTagText: {
    fontSize: 10,
    color: "#1C4966",
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
