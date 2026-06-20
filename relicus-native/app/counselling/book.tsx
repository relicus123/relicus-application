import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { ArrowLeft, Check, Video, MessageSquare, Phone } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { useAppContext } from "../../components/AppContext";

const { width } = Dimensions.get("window");

export default function SessionBooking() {
  const router = useRouter();
  const { id, fee = "₹1,500", name = "Dr. Sarah Johnson" } = useLocalSearchParams();
  const { addBooking } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<"video" | "chat" | "phone">("video");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const dates = [
    { day: "Mon", date: 15 },
    { day: "Tue", date: 16 },
    { day: "Wed", date: 17 },
    { day: "Thu", date: 18 },
    { day: "Fri", date: 19 },
    { day: "Sat", date: 20 },
  ];

  const times = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM"
  ];

  const sessionTypes = [
    { type: "video" as const, label: "Video Call", icon: Video },
    { type: "chat" as const, label: "Chat", icon: MessageSquare },
    { type: "phone" as const, label: "Phone Call", icon: Phone },
  ];

  const numericFee = parseInt(String(fee).replace(/[^\d]/g, ""), 10) || 1500;
  const platformFee = 50;
  const totalAmount = numericFee + platformFee;

  const handleBooking = () => {
    addBooking({
      practitioner: String(name),
      specialty: "Mental Health Support",
      date: selectedDate ? `May ${selectedDate}, 2026` : "Today",
      time: selectedTime || "3:00 PM",
      mode: sessionType === "video" ? "Video Session" : sessionType === "chat" ? "Chat Session" : "Phone Session",
      type: "counselling"
    });
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      // Navigate to sessions tab
      router.replace("/(tabs)/sessions");
    }, 2500);
  };

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
            <Text style={styles.headerTitle}>Book Session</Text>
          </View>
          <Text style={styles.headerSubtitle}>Booking with {name}</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          {/* Select Date */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Select Date</Text>
            <View style={styles.gridDates}>
              {dates.map((item) => {
                const isSelected = selectedDate === item.date;
                return (
                  <TouchableOpacity
                    key={item.date}
                    onPress={() => setSelectedDate(item.date)}
                    style={[
                      styles.dateBtn,
                      isSelected ? styles.dateBtnSelected : styles.dateBtnUnselected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateDayText, isSelected ? styles.textWhite : styles.textSecondary]}>
                      {item.day}
                    </Text>
                    <Text style={[styles.dateNumberText, isSelected ? styles.textWhite : styles.textPrimary]}>
                      {item.date}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </MotiView>

          {/* Select Time */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Select Time</Text>
            <View style={styles.gridTimes}>
              {times.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    style={[
                      styles.timeBtn,
                      isSelected ? styles.timeBtnSelected : styles.timeBtnUnselected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.timeText, isSelected ? styles.textWhite : styles.textPrimary]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </MotiView>

          {/* Session Type */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Session Type</Text>
            <View style={styles.gridTypes}>
              {sessionTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = sessionType === item.type;
                return (
                  <TouchableOpacity
                    key={item.type}
                    onPress={() => setSessionType(item.type)}
                    style={[
                      styles.typeBtn,
                      isSelected ? styles.typeBtnSelected : styles.typeBtnUnselected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Icon color={isSelected ? "#1C4966" : "#5F8B70"} size={24} />
                    <Text style={[styles.typeText, isSelected ? styles.typeTextSelected : styles.typeTextUnselected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </MotiView>

          {/* Payment Summary */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={[styles.card, styles.paymentCard]}
          >
            <Text style={styles.cardTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Session Fee</Text>
              <Text style={styles.summaryValue}>₹{numericFee.toLocaleString()}</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 8 }]}>
              <Text style={styles.summaryLabel}>Platform Fee</Text>
              <Text style={styles.summaryValue}>₹{platformFee}</Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.summaryRow, { marginTop: 12 }]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
            </View>
          </MotiView>

          <Button
            onPress={handleBooking}
            disabled={!selectedDate || !selectedTime}
            style={styles.submitBtn}
            size="lg"
          >
            Book Appointment
          </Button>
        </View>
      </ScrollView>

      {/* Confirmation Overlay Modal */}
      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={styles.modalContainer}
          >
            <View style={styles.checkCircle}>
              <Check color="white" size={40} strokeWidth={3} />
            </View>
            <Text style={styles.modalTitle}>Booking Confirmed!</Text>
            <Text style={styles.modalDesc}>
              Your session has been successfully booked. You'll receive a confirmation shortly.
            </Text>
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
  formContainer: {
    padding: 24,
    marginTop: -20,
    gap: 16,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 16,
  },
  gridDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  dateBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dateBtnSelected: {
    backgroundColor: "#1C4966",
  },
  dateBtnUnselected: {
    backgroundColor: "#F5F7FA",
  },
  dateDayText: {
    fontSize: 10,
    marginBottom: 4,
    fontWeight: "500",
  },
  dateNumberText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textWhite: {
    color: "white",
  },
  textSecondary: {
    color: "#5F8B70",
  },
  textPrimary: {
    color: "#1C4966",
  },
  gridTimes: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  timeBtn: {
    width: "30%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  timeBtnSelected: {
    backgroundColor: "#5F8B70",
  },
  timeBtnUnselected: {
    backgroundColor: "#F5F7FA",
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  gridTypes: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
  },
  typeBtnSelected: {
    backgroundColor: "rgba(143, 189, 215, 0.15)",
    borderColor: "#1C4966",
  },
  typeBtnUnselected: {
    backgroundColor: "#F5F7FA",
    borderColor: "transparent",
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  typeTextSelected: {
    color: "#1C4966",
  },
  typeTextUnselected: {
    color: "#5F8B70",
  },
  paymentCard: {
    backgroundColor: "rgba(28, 73, 102, 0.02)",
    borderColor: "rgba(28, 73, 102, 0.1)",
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#5F8B70",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C4966",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(28, 73, 102, 0.1)",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C4966",
  },
  submitBtn: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  checkCircle: {
    width: 72,
    height: 72,
    backgroundColor: "#5CB85C",
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDesc: {
    fontSize: 14,
    color: "#5F8B70",
    textAlign: "center",
    lineHeight: 20,
  },
});
