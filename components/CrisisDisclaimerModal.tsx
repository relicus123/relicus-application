import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from "react-native";
import {
  AlertTriangle,
  Phone,
  Globe,
  X,
  HeartHandshake,
  ShieldAlert,
} from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";

interface CrisisDisclaimerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CrisisDisclaimerModal({
  visible,
  onClose,
}: CrisisDisclaimerModalProps) {
  const handleDial = (number: string, label: string) => {
    const cleanNumber = number.replace(/[\s-]/g, "");
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert(
        "Helpline Contact",
        `Please dial ${number} directly on your device keypad for ${label}.`
      );
    });
  };

  const handleOpenDirectory = async () => {
    try {
      await WebBrowser.openBrowserAsync("https://findahelpline.com/");
    } catch {
      Linking.openURL("https://findahelpline.com/").catch((err) => {
        console.warn("Could not open helpline directory:", err);
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <ShieldAlert color="#DC2626" size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Emergency & Crisis Support</Text>
                <Text style={styles.subtitle}>Confidential 24/7 Assistance</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close modal"
            >
              <X color="#64748B" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Medical Disclaimer Alert Box */}
            <View style={styles.disclaimerBox}>
              <AlertTriangle color="#B45309" size={20} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.disclaimerHeading}>Medical & Crisis Disclaimer</Text>
                <Text style={styles.disclaimerText}>
                  Relicus offers wellness resources, mindfulness practices, and academic guidance. Relicus is{" "}
                  <Text style={{ fontWeight: "700" }}>not an emergency medical provider or crisis intervention service</Text>.
                  If you or someone you care about is facing an acute crisis, distress, or self-harm emergency, please
                  contact emergency services or a dedicated helpline immediately.
                </Text>
              </View>
            </View>

            {/* Indian Helplines */}
            <Text style={styles.sectionHeader}>India Helplines (Toll-Free & 24/7)</Text>

            <TouchableOpacity
              style={styles.helplineCard}
              activeOpacity={0.7}
              onPress={() => handleDial("14416", "Tele-MANAS")}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.phoneBadge, { backgroundColor: "#DCFCE7" }]}>
                  <Phone color="#15803D" size={18} />
                </View>
                <View>
                  <Text style={styles.helplineName}>Tele-MANAS (Govt of India)</Text>
                  <Text style={styles.helplineDesc}>National Tele Mental Health • Multi-lingual</Text>
                </View>
              </View>
              <View style={styles.callPill}>
                <Text style={styles.callPillText}>14416</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineCard}
              activeOpacity={0.7}
              onPress={() => handleDial("18005990019", "KIRAN Helpline")}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.phoneBadge, { backgroundColor: "#EFF6FF" }]}>
                  <Phone color="#2563EB" size={18} />
                </View>
                <View>
                  <Text style={styles.helplineName}>KIRAN Mental Health</Text>
                  <Text style={styles.helplineDesc}>Ministry of Social Justice & Empowerment</Text>
                </View>
              </View>
              <View style={styles.callPill}>
                <Text style={styles.callPillText}>1800-599-0019</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineCard}
              activeOpacity={0.7}
              onPress={() => handleDial("9999666555", "Vandrevala Foundation")}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.phoneBadge, { backgroundColor: "#FDF2F8" }]}>
                  <HeartHandshake color="#DB2777" size={18} />
                </View>
                <View>
                  <Text style={styles.helplineName}>Vandrevala Foundation</Text>
                  <Text style={styles.helplineDesc}>Free 24/7 Crisis Counseling</Text>
                </View>
              </View>
              <View style={styles.callPill}>
                <Text style={styles.callPillText}>9999 666 555</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineCard}
              activeOpacity={0.7}
              onPress={() => handleDial("112", "National Emergency Services")}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.phoneBadge, { backgroundColor: "#FEE2E2" }]}>
                  <Phone color="#DC2626" size={18} />
                </View>
                <View>
                  <Text style={styles.helplineName}>Emergency Services (India)</Text>
                  <Text style={styles.helplineDesc}>Police, Ambulance & Fire Services</Text>
                </View>
              </View>
              <View style={[styles.callPill, { backgroundColor: "#DC2626" }]}>
                <Text style={[styles.callPillText, { color: "#FFFFFF" }]}>112</Text>
              </View>
            </TouchableOpacity>

            {/* International Helplines */}
            <Text style={[styles.sectionHeader, { marginTop: 16 }]}>International Helplines</Text>

            <TouchableOpacity
              style={styles.helplineCard}
              activeOpacity={0.7}
              onPress={() => handleDial("988", "USA/Canada Suicide & Crisis Lifeline")}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.phoneBadge, { backgroundColor: "#FEF3C7" }]}>
                  <Phone color="#D97706" size={18} />
                </View>
                <View>
                  <Text style={styles.helplineName}>USA & Canada</Text>
                  <Text style={styles.helplineDesc}>Suicide & Crisis Lifeline (Call or Text)</Text>
                </View>
              </View>
              <View style={styles.callPill}>
                <Text style={styles.callPillText}>988</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineCard}
              activeOpacity={0.7}
              onPress={() => handleDial("111", "NHS UK Mental Health Services")}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.phoneBadge, { backgroundColor: "#E0E7FF" }]}>
                  <Phone color="#4F46E5" size={18} />
                </View>
                <View>
                  <Text style={styles.helplineName}>United Kingdom</Text>
                  <Text style={styles.helplineDesc}>NHS Urgent Mental Health (or 999)</Text>
                </View>
              </View>
              <View style={styles.callPill}>
                <Text style={styles.callPillText}>111</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineCard}
              activeOpacity={0.7}
              onPress={() => handleDial("131114", "Australia Lifeline")}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.phoneBadge, { backgroundColor: "#CCFBF1" }]}>
                  <Phone color="#0D9488" size={18} />
                </View>
                <View>
                  <Text style={styles.helplineName}>Australia Lifeline</Text>
                  <Text style={styles.helplineDesc}>24-Hour Crisis Support (or 000)</Text>
                </View>
              </View>
              <View style={styles.callPill}>
                <Text style={styles.callPillText}>13 11 14</Text>
              </View>
            </TouchableOpacity>

            {/* Global Directory Button */}
            <TouchableOpacity
              style={styles.globalBtn}
              activeOpacity={0.85}
              onPress={handleOpenDirectory}
            >
              <Globe color="#FFFFFF" size={18} />
              <Text style={styles.globalBtnText}>Find a Helpline Worldwide (130+ Countries)</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.dismissBtn}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text style={styles.dismissBtnText}>Close & Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  container: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  scrollArea: {
    flexGrow: 1,
  },
  scrollContent: {
    padding: 20,
  },
  disclaimerBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  disclaimerHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 17,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  helplineCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  phoneBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  helplineName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  helplineDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  callPill: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  callPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  globalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1C4966",
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 10,
  },
  globalBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  dismissBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 14,
  },
  dismissBtnText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 13,
  },
});
