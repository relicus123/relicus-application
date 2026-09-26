import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Shield,
  FileText,
  ExternalLink,
  Trash2,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "../../store/auth.store";

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">("privacy");

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure you want to delete your Relicus account? All your personal records, mock test progress, and coaching data will be permanently erased. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            try {
              await useAuthStore.getState().deleteAccount();
              Alert.alert(
                "Account Deleted",
                "Your account and data have been permanently removed."
              );
              router.replace("/landing" as any);
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.message || "Failed to delete account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header Gradient */}
      <LinearGradient
        colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-6 pt-4 rounded-b-[32px]"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center gap-4 mb-4 mt-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/80 items-center justify-center border border-black/5 shadow-sm"
              activeOpacity={0.7}
            >
              <ArrowLeft color="#1C4966" size={22} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-[#1C4966]">
                Legal & Policies
              </Text>
              <Text className="text-xs text-[#71818B]">
                Last updated: March 2026
              </Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-[#1C4966]/10 items-center justify-center">
              <Shield color="#1C4966" size={20} />
            </View>
          </View>

          {/* Tab Selector */}
          <View className="flex-row bg-white/80 p-1 rounded-2xl border border-black/5">
            <TouchableOpacity
              onPress={() => setActiveTab("privacy")}
              className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-2 ${
                activeTab === "privacy" ? "bg-[#1C4966] shadow-sm" : ""
              }`}
              activeOpacity={0.8}
            >
              <Shield
                size={16}
                color={activeTab === "privacy" ? "#FFFFFF" : "#71818B"}
              />
              <Text
                className={`text-xs font-bold ${
                  activeTab === "privacy" ? "text-white" : "text-[#71818B]"
                }`}
              >
                Privacy Policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("terms")}
              className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-2 ${
                activeTab === "terms" ? "bg-[#1C4966] shadow-sm" : ""
              }`}
              activeOpacity={0.8}
            >
              <FileText
                size={16}
                color={activeTab === "terms" ? "#FFFFFF" : "#71818B"}
              />
              <Text
                className={`text-xs font-bold ${
                  activeTab === "terms" ? "text-white" : "text-[#71818B]"
                }`}
              >
                Terms of Service
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content Scroll */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "privacy" ? (
          <View className="gap-4">
            {/* Security Banner */}
            <LinearGradient
              colors={["#1C4966", "#2D688D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5 rounded-2xl shadow-sm"
            >
              <View className="flex-row items-center gap-3 mb-2">
                <View className="w-10 h-10 rounded-xl bg-white/15 items-center justify-center">
                  <Shield color="#FFFFFF" size={22} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-white">
                    Your Privacy is Protected
                  </Text>
                  <Text className="text-xs text-white/80">
                    End-to-end encryption & strict access control
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-white/90 leading-5">
                Relicus adheres to strict student confidentiality guidelines. We never sell, rent, or monetize personal student learning records or test data.
              </Text>
            </LinearGradient>

            {/* Section 1 */}
            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-2">
              <Text className="text-sm font-bold text-[#1C4966]">
                1. Information We Collect
              </Text>
              <Text className="text-xs text-[#475569] leading-5">
                • <Text className="font-semibold text-[#0F172A]">Student Profile:</Text> Name, email address, contact phone, and target entrance exam preferences (e.g. JEE, NEET, CUET).{"\n"}
                • <Text className="font-semibold text-[#0F172A]">Academic & Performance Data:</Text> Completed mock tests, accuracy, time per question, doubt queries, and study streaks.{"\n"}
                • <Text className="font-semibold text-[#0F172A]">Counseling Logs:</Text> Confidential mentorship requests and faculty session feedback.
              </Text>
            </View>

            {/* Section 2 */}
            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-2">
              <Text className="text-sm font-bold text-[#1C4966]">
                2. How We Use Your Data
              </Text>
              <Text className="text-xs text-[#475569] leading-5">
                • Delivering tailored syllabus roadmaps, video modules, and adaptive practice tests.{"\n"}
                • Computing instant percentiles, rankings, and learning streaks.{"\n"}
                • Communicating faculty announcements, live sessions, and syllabus updates.
              </Text>
            </View>

            {/* Section 3 */}
            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-2">
              <Text className="text-sm font-bold text-[#1C4966]">
                3. Encryption & Row-Level Security
              </Text>
              <Text className="text-xs text-[#475569] leading-5">
                All network communication is secured over TLS 1.3 encryption. In our database, Row-Level Security (RLS) guarantees that only you can view or modify your personal mock test attempts and study history.
              </Text>
            </View>

            {/* Section 4 */}
            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-2">
              <Text className="text-sm font-bold text-[#1C4966]">
                4. Data Rights & Account Deletion
              </Text>
              <Text className="text-xs text-[#475569] leading-5">
                You maintain complete ownership of your personal data. In compliance with Google Play Store policies, you may permanently delete your account and all associated test, journal, and coaching records directly using the Danger Zone below, or request external deletion without installing the app by visiting our web portal.
              </Text>
            </View>

            {/* External Links */}
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.relicus.in/privacy-policy#rights")}
              className="bg-white border border-[#1C4966]/20 p-4 rounded-2xl flex-row items-center justify-between shadow-sm mb-1"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-[#1C4966]/5 items-center justify-center">
                  <ExternalLink color="#1C4966" size={18} />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#1C4966]">
                    Online Account & Data Deletion Request
                  </Text>
                  <Text className="text-[11px] text-[#64748B]">
                    relicus.in/privacy-policy#rights
                  </Text>
                </View>
              </View>
              <ArrowLeft
                color="#71818B"
                size={16}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.relicus.in/privacy-policy")}
              className="bg-white border border-[#1C4966]/20 p-4 rounded-2xl flex-row items-center justify-between shadow-sm"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-[#1C4966]/5 items-center justify-center">
                  <ExternalLink color="#1C4966" size={18} />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#1C4966]">
                    View Official Privacy Policy Webpage
                  </Text>
                  <Text className="text-[11px] text-[#64748B]">
                    relicus.in/privacy-policy
                  </Text>
                </View>
              </View>
              <ArrowLeft
                color="#71818B"
                size={16}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-4">
            {/* Terms Content */}
            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-2">
              <Text className="text-sm font-bold text-[#1C4966]">
                1. Acceptance of Terms
              </Text>
              <Text className="text-xs text-[#475569] leading-5">
                By creating an account on Relicus, you agree to these student terms of service. Our platform provides structured entrance coaching, educational resources, and career guidance tools.
              </Text>
            </View>

            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-2">
              <Text className="text-sm font-bold text-[#1C4966]">
                2. Academic Code of Conduct
              </Text>
              <Text className="text-xs text-[#475569] leading-5">
                • Students are expected to maintain respectful, constructive conduct on Doubt Desks and mentorship channels.{"\n"}
                • Relicus learning materials, practice questions, and notes are protected by intellectual property laws and may not be copied or distributed.
              </Text>
            </View>

            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-2">
              <Text className="text-sm font-bold text-[#1C4966]">
                3. Mock Tests & Evaluations
              </Text>
              <Text className="text-xs text-[#475569] leading-5">
                Mock tests and estimated percentiles are designed to aid competitive preparation according to official syllabus blueprints. Faculty regularly review and calibrate question banks.
              </Text>
            </View>

            {/* External Link */}
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.relicus.in/terms-conditions")}
              className="bg-white border border-[#1C4966]/20 p-4 rounded-2xl flex-row items-center justify-between shadow-sm"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-[#1C4966]/5 items-center justify-center">
                  <ExternalLink color="#1C4966" size={18} />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#1C4966]">
                    View Official Terms & Conditions Webpage
                  </Text>
                  <Text className="text-[11px] text-[#64748B]">
                    relicus.in/terms-conditions
                  </Text>
                </View>
              </View>
              <ArrowLeft
                color="#71818B"
                size={16}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Danger Zone */}
        <View className="mt-6 pt-4 border-t border-slate-200">
          <Text className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
            Danger Zone
          </Text>
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-red-500/15 items-center justify-center">
                <Trash2 color="#DC2626" size={20} />
              </View>
              <View>
                <Text className="text-sm font-bold text-red-600">
                  Delete Account
                </Text>
                <Text className="text-xs text-red-500/80">
                  Permanently erase your account and test history
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
