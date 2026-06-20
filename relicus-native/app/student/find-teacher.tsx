import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { ArrowLeft, Search, Star, BookOpen, Clock, Calendar, CheckCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { useAppContext } from "../../components/AppContext";

const { width } = Dimensions.get("window");

export default function FindTeacherScreen() {
  const router = useRouter();
  const { addBooking } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [bookingTeacher, setBookingTeacher] = useState<any>(null);
  
  // Booking Form State
  const [selectedGrade, setSelectedGrade] = useState("Grade 10");
  const [sessionFrequency, setSessionFrequency] = useState("Weekly");
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [selectedTime, setSelectedTime] = useState("4:00 PM");
  const [showSuccess, setShowSuccess] = useState(false);

  const subjectsFilter = ["All", "Math", "Physics", "Chemistry", "Biology"];

  const teachers = [
    {
      id: 1,
      name: "Mr. John Smith",
      initials: "JS",
      subject: "Math",
      rating: 4.9,
      experience: "8 years",
      fee: "₹800/hr",
      bio: "IIT Graduate. Specialized in Algebra, Calculus, and JEE entrance preparation.",
      days: ["Mon", "Wed", "Fri"],
      times: ["4:00 PM", "6:00 PM"],
    },
    {
      id: 2,
      name: "Dr. Sarah Johnson",
      initials: "SJ",
      subject: "Physics",
      rating: 5.0,
      experience: "12 years",
      fee: "₹1,000/hr",
      bio: "Ph.D. in Physics. Patient teacher focusing on conceptual clarity and numerical problems.",
      days: ["Tue", "Thu", "Sat"],
      times: ["2:00 PM", "5:00 PM"],
    },
    {
      id: 3,
      name: "Mrs. Priya Sharma",
      initials: "PS",
      subject: "Chemistry",
      rating: 4.8,
      experience: "6 years",
      fee: "₹750/hr",
      bio: "Organic Chemistry expert. Fun, interactive online lessons with visual experiments.",
      days: ["Mon", "Thu", "Sat"],
      times: ["3:00 PM", "6:00 PM"],
    },
    {
      id: 4,
      name: "Mr. Amit Patel",
      initials: "AP",
      subject: "Biology",
      rating: 4.7,
      experience: "5 years",
      fee: "₹700/hr",
      bio: "NEET preparation expert. Focuses on anatomy, botany, and diagram-based questions.",
      days: ["Tue", "Wed", "Fri"],
      times: ["11:00 AM", "4:00 PM"],
    },
  ];

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || t.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleBook = (teacher: any) => {
    setBookingTeacher(teacher);
    setSelectedDay(teacher.days[0]);
    setSelectedTime(teacher.times[0]);
  };

  const confirmBooking = () => {
    addBooking({
      practitioner: bookingTeacher.name,
      specialty: `${bookingTeacher.subject} Tuition`,
      date: `${selectedDay}, May 2026`,
      time: selectedTime,
      mode: "1-to-1 Tuition",
      type: "tuition"
    });
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setBookingTeacher(null);
    router.replace("/student/dashboard" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#1C4966" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Tutor</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search color="#8FBDD7" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Search subjects or teachers..."
            placeholderTextColor="#8FBDD7"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {subjectsFilter.map((subj) => (
            <TouchableOpacity
              key={subj}
              onPress={() => setSelectedSubject(subj)}
              style={[
                styles.filterPill,
                selectedSubject === subj ? styles.activePill : styles.inactivePill,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedSubject === subj ? styles.activePillText : styles.inactivePillText,
                ]}
              >
                {subj}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Teachers List */}
        <View style={styles.listContainer}>
          {filteredTeachers.map((teacher, index) => (
            <MotiView
              key={teacher.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
              style={styles.teacherCard}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{teacher.initials}</Text>
                </View>
                <View style={styles.teacherDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.teacherName}>{teacher.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Star color="#F1C40F" size={12} fill="#F1C40F" />
                      <Text style={styles.ratingText}>{teacher.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.subjectTag}>{teacher.subject} Tutor • {teacher.experience} exp</Text>
                </View>
              </View>

              <Text style={styles.bioText} numberOfLines={2}>{teacher.bio}</Text>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.feeLabel}>Hourly Rate</Text>
                  <Text style={styles.feeValue}>{teacher.fee}</Text>
                </View>
                <Button size="sm" onPress={() => handleBook(teacher)}>Book Session</Button>
              </View>
            </MotiView>
          ))}
          {filteredTeachers.length === 0 && (
            <Text style={styles.emptyText}>No tutors found matching your filters.</Text>
          )}
        </View>
      </ScrollView>

      {/* Booking Form Modal */}
      <Modal
        visible={bookingTeacher !== null && !showSuccess}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingTeacher(null)}
      >
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Tuition</Text>
              <TouchableOpacity onPress={() => setBookingTeacher(null)}>
                <Text style={styles.closeBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {bookingTeacher && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: "80%" }}>
                <Text style={styles.modalSub}>Tutor: {bookingTeacher.name} ({bookingTeacher.subject})</Text>

                {/* Grade Selector */}
                <Text style={styles.sectionLabel}>Select Class / Grade</Text>
                <View style={styles.selectorRow}>
                  {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      onPress={() => setSelectedGrade(grade)}
                      style={[styles.selectorBtn, selectedGrade === grade && styles.activeSelectBtn]}
                    >
                      <Text style={[styles.selectorText, selectedGrade === grade && styles.activeSelectText]}>
                        {grade}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Frequency Selector */}
                <Text style={styles.sectionLabel}>Frequency</Text>
                <View style={styles.selectorRow}>
                  {["Single Session", "Weekly", "Monthly"].map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      onPress={() => setSessionFrequency(freq)}
                      style={[styles.selectorBtn, sessionFrequency === freq && styles.activeSelectBtn]}
                    >
                      <Text style={[styles.selectorText, sessionFrequency === freq && styles.activeSelectText]}>
                        {freq}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Available Days */}
                <Text style={styles.sectionLabel}>Select Day</Text>
                <View style={styles.selectorRow}>
                  {bookingTeacher.days.map((day: string) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setSelectedDay(day)}
                      style={[styles.selectorBtn, selectedDay === day && styles.activeSelectBtn]}
                    >
                      <Text style={[styles.selectorText, selectedDay === day && styles.activeSelectText]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Available Times */}
                <Text style={styles.sectionLabel}>Select Time</Text>
                <View style={styles.selectorRow}>
                  {bookingTeacher.times.map((time: string) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => setSelectedTime(time)}
                      style={[styles.selectorBtn, selectedTime === time && styles.activeSelectBtn]}
                    >
                      <Text style={[styles.selectorText, selectedTime === time && styles.activeSelectText]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Price Box */}
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Total Fee ({sessionFrequency === "Monthly" ? "4 sessions" : "1 session"})</Text>
                  <Text style={styles.priceValue}>
                    {sessionFrequency === "Monthly"
                      ? `₹${parseInt(bookingTeacher.fee.replace(/\D/g, "")) * 4}`
                      : bookingTeacher.fee.split("/")[0]}
                  </Text>
                </View>

                <Button style={{ marginTop: 24 }} onPress={confirmBooking}>Confirm Booking</Button>
              </ScrollView>
            )}
          </MotiView>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.successContent}
          >
            <CheckCircle color="#5F8B70" size={60} style={{ marginBottom: 16 }} />
            <Text style={styles.successTitle}>Booking Successful!</Text>
            <Text style={styles.successDesc}>
              Your {sessionFrequency.toLowerCase()} class with {bookingTeacher?.name} has been scheduled.
            </Text>
            <Button style={{ width: "100%", marginTop: 20 }} onPress={handleSuccessClose}>
              Back to Dashboard
            </Button>
          </MotiView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "white",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C4966",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: "row",
    height: 52,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 24,
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1C4966",
  },
  filterScroll: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
  },
  activePill: {
    backgroundColor: "#1C4966",
    borderColor: "#1C4966",
  },
  inactivePill: {
    backgroundColor: "white",
    borderColor: "rgba(28, 73, 102, 0.1)",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activePillText: {
    color: "white",
  },
  inactivePillText: {
    color: "#1C4966",
  },
  listContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  teacherCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    backgroundColor: "#5F8B70",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  teacherDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(241, 196, 15, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#F1C40F",
  },
  subjectTag: {
    fontSize: 13,
    color: "#8FBDD7",
    marginTop: 2,
  },
  bioText: {
    fontSize: 14,
    color: "#5F8B70",
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(28, 73, 102, 0.05)",
    paddingTop: 12,
  },
  feeLabel: {
    fontSize: 11,
    color: "#8FBDD7",
  },
  feeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  emptyText: {
    textAlign: "center",
    color: "#8FBDD7",
    marginTop: 40,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(28, 73, 102, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFF0",
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C4966",
  },
  closeBtn: {
    color: "#D9534F",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalSub: {
    fontSize: 16,
    color: "#5F8B70",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 12,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  selectorBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.1)",
    borderRadius: 12,
  },
  activeSelectBtn: {
    backgroundColor: "#1C4966",
    borderColor: "#1C4966",
  },
  selectorText: {
    fontSize: 13,
    color: "#1C4966",
    fontWeight: "500",
  },
  activeSelectText: {
    color: "white",
  },
  priceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(28, 73, 102, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  priceLabel: {
    fontSize: 14,
    color: "#1C4966",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C4966",
  },
  successContent: {
    width: "90%",
    backgroundColor: "#FFFFF0",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    color: "#5F8B70",
    textAlign: "center",
    lineHeight: 20,
  },
});
