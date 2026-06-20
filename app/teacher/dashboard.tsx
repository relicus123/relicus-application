import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Upload, Users, FileText, Calendar, Clock, TrendingUp, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";

const { width } = Dimensions.get("window");

export default function TeacherDashboard() {
  const router = useRouter();

  const stats = [
    { label: "Total Students", value: "45", icon: Users, colors: ["#1C4966", "#5F8B70"] },
    { label: "Classes Today", value: "3", icon: Calendar, colors: ["#5F8B70", "#8FBDD7"] },
    { label: "Pending Reviews", value: "12", icon: FileText, colors: ["#8FBDD7", "#DDEEE3"] },
  ];

  const upcomingClasses = [
    { subject: "Mathematics", grade: "Grade 10", time: "10:00 AM", students: 30 },
    { subject: "Physics", grade: "Grade 11", time: "02:00 PM", students: 25 },
  ];

  const assignments = [
    { title: "Algebra Assignment", subject: "Mathematics", submitted: 28, total: 30, pending: 2 },
    { title: "Newton's Laws Essay", subject: "Physics", submitted: 20, total: 25, pending: 5 },
  ];

  const recentStudents = [
    { name: "Alice Johnson", grade: "A", attendance: 95, initials: "AJ" },
    { name: "Bob Smith", grade: "B+", attendance: 88, initials: "BS" },
    { name: "Carol White", grade: "A-", attendance: 92, initials: "CW" },
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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Teacher Panel</Text>
          </View>
          <Text style={styles.headerSubtitle}>Welcome back, Professor</Text>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Stats Grid */}
          <View style={styles.statsRow}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const isDarkText = stat.colors[1] === "#DDEEE3";
              return (
                <MotiView
                  key={stat.label}
                  from={{ opacity: 0, translateY: 15 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 100 }}
                  style={styles.statCol}
                >
                  <LinearGradient
                    colors={stat.colors}
                    style={styles.statGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Icon color={isDarkText ? "#1C4966" : "white"} size={20} style={{ opacity: 0.85 }} />
                    <Text style={[styles.statValue, { color: isDarkText ? "#1C4966" : "white" }]}>
                      {stat.value}
                    </Text>
                    <Text style={[styles.statLabel, { color: isDarkText ? "#1C4966" : "rgba(255,255,255,0.9)" }]}>
                      {stat.label}
                    </Text>
                  </LinearGradient>
                </MotiView>
              );
            })}
          </View>

          {/* Upload Banner */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.bannerAlert}
          >
            <View style={styles.alertIconBox}>
              <Upload color="white" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Upload Content</Text>
              <Text style={styles.alertDesc}>Add curriculum notes or syllabus PDF</Text>
            </View>
            <Button size="sm" onPress={() => {}}>Upload</Button>
          </MotiView>

          {/* Today's Schedule */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Today's Class Schedule</Text>
            <View style={styles.classesList}>
              {upcomingClasses.map((cls, index) => (
                <View key={index} style={styles.classItem}>
                  <View style={styles.classHeader}>
                    <View>
                      <Text style={styles.classSubject}>{cls.subject}</Text>
                      <Text style={styles.classGrade}>
                        {cls.grade} • {cls.students} students enrolled
                      </Text>
                    </View>
                    <View style={styles.classTime}>
                      <Clock color="#1C4966" size={14} />
                      <Text style={styles.classTimeText}>{cls.time}</Text>
                    </View>
                  </View>
                  <View style={styles.classActions}>
                    <Button size="sm" onPress={() => {}} style={{ flex: 1 }}>
                      Start Live Class
                    </Button>
                    <Button size="sm" variant="outline" onPress={() => {}} style={{ flex: 1 }}>
                      Roll Call
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          </MotiView>

          {/* Assignments */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Assignments Tracking</Text>
              <Text style={styles.cardMeta}>
                {assignments.reduce((acc, a) => acc + a.pending, 0)} pending review
              </Text>
            </View>

            <View style={styles.assignmentList}>
              {assignments.map((assignment, index) => {
                const ratio = assignment.submitted / assignment.total;
                const percentage = Math.round(ratio * 100);
                return (
                  <View key={index} style={styles.assignmentItem}>
                    <View style={styles.assignmentTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                        <Text style={styles.assignmentSubject}>{assignment.subject}</Text>
                      </View>
                      <View style={styles.ratioBadge}>
                        <Text style={styles.ratioBadgeText}>
                          {assignment.submitted}/{assignment.total}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressRow}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{percentage}%</Text>
                    </View>

                    {assignment.pending > 0 && (
                      <Button size="sm" variant="outline" onPress={() => {}} style={{ marginTop: 12 }}>
                        Review {assignment.pending} Pending Submission(s)
                      </Button>
                    )}
                  </View>
                );
              })}
            </View>
          </MotiView>

          {/* Student Performance */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recent Student Roster</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.studentList}>
              {recentStudents.map((student, index) => (
                <View key={index} style={styles.studentItem}>
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarMiniText}>{student.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentMeta}>Attendance: {student.attendance}%</Text>
                  </View>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeBadgeText}>{student.grade}</Text>
                  </View>
                </View>
              ))}
            </View>
          </MotiView>

          {/* Class Management Actions */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Class Management Utilities</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.gridBtn} activeOpacity={0.8}>
                <LinearGradient colors={["#1C4966", "#5F8B70"]} style={styles.btnGradient}>
                  <Users color="white" size={24} />
                  <Text style={styles.btnTitle}>Student Roster</Text>
                  <Text style={styles.btnDesc}>View student profiles</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridBtn} activeOpacity={0.8}>
                <LinearGradient colors={["#5F8B70", "#8FBDD7"]} style={styles.btnGradient}>
                  <Calendar color="white" size={24} />
                  <Text style={styles.btnTitle}>Roll Call</Text>
                  <Text style={styles.btnDesc}>Mark logs</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridBtn} activeOpacity={0.8}>
                <LinearGradient colors={["#8FBDD7", "#DDEEE3"]} style={styles.btnGradient}>
                  <FileText color="#1C4966" size={24} />
                  <Text style={[styles.btnTitle, { color: "#1C4966" }]}>Materials Library</Text>
                  <Text style={[styles.btnDesc, { color: "rgba(28, 73, 102, 0.8)" }]}>Course syllabus docs</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridBtn} activeOpacity={0.8}>
                <LinearGradient colors={["#5F8B70", "#1C4966"]} style={styles.btnGradient}>
                  <TrendingUp color="white" size={24} />
                  <Text style={styles.btnTitle}>Performance</Text>
                  <Text style={styles.btnDesc}>Visual grade metrics</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statCol: {
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
    height: 110,
    justifyContent: "space-between",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
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
  },
  cardMeta: {
    fontSize: 12,
    color: "#8FBDD7",
    fontWeight: "500",
  },
  viewAllText: {
    color: "#5F8B70",
    fontWeight: "600",
    fontSize: 14,
  },
  classesList: {
    gap: 12,
  },
  classItem: {
    backgroundColor: "rgba(143, 189, 215, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.2)",
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  classSubject: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  classGrade: {
    fontSize: 13,
    color: "#5F8B70",
    marginTop: 4,
  },
  classTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  classTimeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
  },
  classActions: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(28, 73, 102, 0.05)",
    paddingTop: 12,
    marginTop: 4,
  },
  assignmentList: {
    gap: 12,
  },
  assignmentItem: {
    backgroundColor: "#F5F7FA",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  assignmentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  assignmentSubject: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 2,
  },
  ratioBadge: {
    backgroundColor: "rgba(143, 189, 215, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratioBadgeText: {
    color: "#1C4966",
    fontSize: 11,
    fontWeight: "bold",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(28, 73, 102, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C4966",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#8FBDD7",
    fontWeight: "500",
  },
  studentList: {
    gap: 12,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(143, 189, 215, 0.05)",
    borderRadius: 16,
    gap: 12,
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DDEEE3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMiniText: {
    color: "#1C4966",
    fontWeight: "bold",
    fontSize: 14,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  studentMeta: {
    fontSize: 12,
    color: "#8FBDD7",
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: "rgba(92, 184, 92, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gradeBadgeText: {
    color: "#5CB85C",
    fontWeight: "bold",
    fontSize: 13,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  gridBtn: {
    width: "48%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  btnGradient: {
    padding: 16,
    height: 110,
    justifyContent: "flex-end",
  },
  btnTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
    marginTop: 12,
    marginBottom: 2,
  },
  btnDesc: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
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
});
