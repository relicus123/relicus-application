import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield, Eye, Database, Trash2, Key } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [biometrics, setBiometrics] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure you want to delete your Relicus account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanent",
          style: "destructive",
          onPress: () => {
            Alert.alert("Account Deleted", "Your data has been successfully queued for deletion.");
            router.replace("/landing" as any);
          },
        },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      "Download Data Request",
      "A request to compile your personal information, consultation records, and performance scores has been submitted. We will email the archive to you within 24 hours."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#1C4966" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Shield banner */}
        <LinearGradient
          colors={["#1C4966", "#5F8B70"]}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Shield color="white" size={48} strokeWidth={1.5} />
          <Text style={styles.bannerTitle}>Your Security is Our Priority</Text>
          <Text style={styles.bannerDesc}>
            All consultations, chats, and personal data are encrypted end-to-end to guarantee absolute confidentiality.
          </Text>
        </LinearGradient>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Access & Protection</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Key color="#1C4966" size={20} style={styles.settingIcon} />
              <View style={styles.textWrapper}>
                <Text style={styles.settingLabel}>Biometric Login</Text>
                <Text style={styles.settingDesc}>Use FaceID / TouchID to unlock app</Text>
              </View>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: "#8FBDD7", true: "#5F8B70" }}
              thumbColor={biometrics ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Eye color="#1C4966" size={20} style={styles.settingIcon} />
              <View style={styles.textWrapper}>
                <Text style={styles.settingLabel}>Private Profile</Text>
                <Text style={styles.settingDesc}>Hide counseling session logs from teachers</Text>
              </View>
            </View>
            <Switch
              value={privateAccount}
              onValueChange={setPrivateAccount}
              trackColor={{ false: "#8FBDD7", true: "#5F8B70" }}
              thumbColor={privateAccount ? "#ffffff" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Data Management</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Shield color="#1C4966" size={20} style={styles.settingIcon} />
              <View style={styles.textWrapper}>
                <Text style={styles.settingLabel}>Share Crash Analytics</Text>
                <Text style={styles.settingDesc}>Help us fix bugs anonymously</Text>
              </View>
            </View>
            <Switch
              value={shareAnalytics}
              onValueChange={setShareAnalytics}
              trackColor={{ false: "#8FBDD7", true: "#5F8B70" }}
              thumbColor={shareAnalytics ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity style={styles.actionCard} onPress={handleDownloadData} activeOpacity={0.7}>
            <Database color="#1C4966" size={20} style={styles.settingIcon} />
            <View style={styles.actionTextWrapper}>
              <Text style={styles.actionLabel}>Download Personal Archive</Text>
              <Text style={styles.actionDesc}>Get a copy of all your Relicus records</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.dangerGroup}>
          <Text style={styles.dangerGroupTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.dangerCard} onPress={handleDeleteAccount} activeOpacity={0.7}>
            <Trash2 color="#D9534F" size={20} style={styles.settingIcon} />
            <View style={styles.actionTextWrapper}>
              <Text style={styles.dangerLabel}>Delete Account</Text>
              <Text style={styles.dangerDesc}>Permanently wipe your data from Relicus</Text>
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  banner: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    elevation: 4,
    shadowColor: "#1C4966",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 12,
    marginBottom: 6,
    textAlign: "center",
  },
  bannerDesc: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 18,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#5F8B70",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  settingIcon: {
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: "#8FBDD7",
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  actionTextWrapper: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: "#8FBDD7",
  },
  dangerGroup: {
    marginTop: 8,
    marginBottom: 24,
  },
  dangerGroupTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D9534F",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  dangerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(217, 83, 79, 0.03)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(217, 83, 79, 0.1)",
  },
  dangerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D9534F",
    marginBottom: 2,
  },
  dangerDesc: {
    fontSize: 12,
    color: "rgba(217, 83, 79, 0.6)",
  },
});
