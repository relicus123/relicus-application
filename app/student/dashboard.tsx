import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Calendar, FileText, Download, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { useAppContext } from "../../components/AppContext";

const { width } = Dimensions.get("window");

export default function StudentDashboard() {
  const router = useRouter();
  const { bookings } = useAppContext();

  const attendance = {
    present: 45,
    total: 50,
    percentage: 90,
  };

  const upcomingTuitions = bookings.filter((b) => b.type === "tuition" && b.status === "Upcoming");
  const formattedClasses = upcomingTuitions.map((b) => ({
    subject: b.specialty.replace(" Tuition", ""), 
    teacher: b.practitioner,
    time: `${b.date}, ${b.time}`
  }));

  const upcomingClasses = formattedClasses.length > 0 ? formattedClasses : [
    { subject: "Mathematics", teacher: "Mr. John Smith", time: "Today, 10:00 AM" },
    { subject: "Physics", teacher: "Dr. Sarah Johnson", time: "Today, 2:00 PM" },
  ];

  const homework = [
    { subject: "Mathematics", title: "Algebra Practice Set", dueDate: "Tomorrow", submitted: false },
    { subject: "Chemistry", title: "Chemical Reactions Lab", dueDate: "In 3 days", submitted: false },
    { subject: "English", title: "Essay on Shakespeare", dueDate: "Next Week", submitted: true },
  ];

  const subjects = [
    { name: "Mathematics", grade: "A", progress: 85 },
    { name: "Physics", grade: "B+", progress: 78 },
    { name: "Chemistry", grade: "A-", progress: 82 },
    { name: "English", grade: "A", progress: 88 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#1C4966", "#5F8B70"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerBar}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <ArrowLeft color="white" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Student Panel</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/student/find-teacher" as any)}
              style={styles.journeyBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.journeyBtnText}>Find Tutors</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Welcome back, Student</Text>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Attendance and Grade Cards */}
          <View style={styles.topCardsRow}>
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.statCard}
            >
              <LinearGradient colors={["#1C4966", "#5F8B70"]} style={styles.statGradient}>
                <Text style={styles.statLabel}>Attendance</Text>
                <Text style={styles.statValue}>{attendance.percentage}%</Text>
                <Text style={styles.statMeta}>{attendance.present}/{attendance.total} days</Text>
              </LinearGradient>
            </MotiView>

            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 100 }}
              style={styles.statCard}
            >
              <LinearGradient colors={["#5F8B70", "#8FBDD7"]} style={styles.statGradient}>
                <Text style={styles.statLabel}>Overall Grade</Text>
                <Text style={styles.statValue}>A-</Text>
                <Text style={styles.statMeta}>Top 10% of class</Text>
              </LinearGradient>
            </MotiView>
          </View>

          {/* Upcoming Classes */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Upcoming Classes</Text>
            <View style={styles.classesList}>
              {upcomingClasses.map((cls, index) => (
                <View key={index} style={styles.classItem}>
                  <View style={styles.classAvatar}>
                    <Text style={styles.classAvatarText}>{cls.subject[0] || "T"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.classSubject}>{cls.subject}</Text>
                    <Text style={styles.classTeacher}>{cls.teacher}</Text>
                  </View>
                  <View style={styles.classTime}>
                    <Clock color="#1C4966" size={14} />
                    <Text style={styles.classTimeText}>
                      {cls.time.includes(", ") ? cls.time.split(", ")[1] : cls.time}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </MotiView>

          {/* Homework Tracker */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Homework Tasks</Text>
              <Text style={styles.cardMeta}>
                {homework.filter((h) => !h.submitted).length} pending
              </Text>
            </View>

            <View style={styles.homeworkList}>
              {homework.map((item, index) => {
                const isSubmitted = item.submitted;
                return (
                  <MotiView
                    key={index}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: index * 100 }}
                    style={[
                      styles.homeworkItem,
                      isSubmitted ? styles.homeworkSubmitted : styles.homeworkPending,
                    ]}
                  >
                    <View style={styles.homeworkRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.homeworkTitle}>{item.title}</Text>
                        <Text style={styles.homeworkSubject}>{item.subject}</Text>
                      </View>
                      {isSubmitted ? (
                        <View style={styles.badgeSubmitted}>
                          <CheckCircle color="#5CB85C" size={16} />
                          <Text style={styles.badgeSubmittedText}>Submitted</Text>
                        </View>
                      ) : (
                        <View style={styles.badgePending}>
                          <AlertCircle color="#F0AD4E" size={16} />
                          <Text style={styles.badgePendingText}>{item.dueDate}</Text>
                        </View>
                      )}
                    </View>
                    {!isSubmitted && (
                      <Button size="sm" onPress={() => {}} style={{ marginTop: 12 }}>
                        Submit Assignment
                      </Button>
                    )}
                  </MotiView>
                );
              })}
            </View>
          </MotiView>

          {/* Subject Progress */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Subject Grades & Progress</Text>
            <View style={styles.subjectList}>
              {subjects.map((subject, index) => (
                <View key={subject.name} style={styles.subjectItem}>
                  <View style={styles.subjectRow}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <View style={styles.gradeContainer}>
                      <Text style={styles.gradePercent}>{subject.progress}%</Text>
                      <View style={styles.gradeBadge}>
                        <Text style={styles.gradeBadgeText}>{subject.grade}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${subject.progress}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </MotiView>

          {/* Study Materials */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            style={styles.bannerAlert}
          >
            <View style={styles.alertIconBox}>
              <FileText color="white" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Study Materials</Text>
              <Text style={styles.alertDesc}>Download curriculum notes</Text>
            </View>
            <TouchableOpacity style={styles.downloadButton} activeOpacity={0.7}>
              <Download color="white" size={18} />
            </TouchableOpacity>
          </MotiView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  journeyBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  journeyBtnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    marginLeft: 60,
  },
  contentContainer: {
    padding: 24,
    marginTop: -20,
    gap: 16,
  },
  topCardsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  statGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 4,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  statMeta: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 16,
  },
  cardMeta: {
    fontSize: 12,
    color: "#8FBDD7",
    fontWeight: "500",
  },
  classesList: {
    gap: 12,
  },
  classItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(143, 189, 215, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.2)",
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  classAvatar: {
    width: 44,
    height: 44,
    backgroundColor: "#1C4966",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  classAvatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  classSubject: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  classTeacher: {
    fontSize: 13,
    color: "#5F8B70",
    marginTop: 2,
  },
  classTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  classTimeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
  },
  homeworkList: {
    gap: 12,
  },
  homeworkItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  homeworkSubmitted: {
    backgroundColor: "#F5F7FA",
    borderColor: "transparent",
    opacity: 0.7,
  },
  homeworkPending: {
    backgroundColor: "rgba(143, 189, 215, 0.05)",
    borderColor: "rgba(143, 189, 215, 0.2)",
  },
  homeworkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  homeworkTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  homeworkSubject: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 2,
  },
  badgeSubmitted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(92, 184, 92, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSubmittedText: {
    color: "#5CB85C",
    fontSize: 10,
    fontWeight: "bold",
  },
  badgePending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(240, 173, 78, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePendingText: {
    color: "#F0AD4E",
    fontSize: 10,
    fontWeight: "bold",
  },
  subjectList: {
    gap: 16,
  },
  subjectItem: {
    gap: 8,
  },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  gradeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gradePercent: {
    fontSize: 13,
    color: "#8FBDD7",
    fontWeight: "500",
  },
  gradeBadge: {
    backgroundColor: "rgba(92, 184, 92, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeBadgeText: {
    color: "#5CB85C",
    fontWeight: "bold",
    fontSize: 12,
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
  bannerAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(28, 73, 102, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.1)",
    borderRadius: 20,
    padding: 16,
  },
  alertIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#1C4966",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  alertDesc: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 2,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1C4966",
    alignItems: "center",
    justifyContent: "center",
  },
});
