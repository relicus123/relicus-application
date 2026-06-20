import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function VideoCall() {
  const router = useRouter();
  const { id, name = "Dr. Sarah Johnson" } = useLocalSearchParams();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [duration, setDuration] = useState("12:34");

  const initials = String(name)
    .split(" ")
    .filter((n) => n !== "Dr.")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const handleEndCall = () => {
    // Navigate back to the sessions list
    router.replace("/(tabs)/sessions");
  };

  return (
    <View style={styles.container}>
      {/* Background peer stream placeholder */}
      <LinearGradient
        colors={["#1C4966", "#5F8B70"]}
        style={styles.peerStream}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.overlayArea} edges={["top", "bottom"]}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.timerBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.timerText}>{duration}</Text>
            </View>
            <View style={styles.encryptedBadge}>
              <ShieldCheck color="#5CB85C" size={16} />
              <Text style={styles.encryptedText}>Encrypted</Text>
            </View>
          </View>

          {/* Therapist Info / Mid Screen Call State */}
          <View style={styles.centerContainer}>
            {!isVideoOn ? (
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarTextLarge}>{initials || "SJ"}</Text>
              </View>
            ) : null}
            <Text style={styles.therapistName}>{name}</Text>
            <Text style={styles.callState}>
              {isVideoOn ? "Video Connected" : "Audio Only Mode"}
            </Text>
          </View>

          {/* Local User Stream (Picture in Picture) */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.localStream}
          >
            <LinearGradient
              colors={["#5F8B70", "#8FBDD7"]}
              style={styles.localStreamGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.localUserText}>You</Text>
            </LinearGradient>
          </MotiView>

          {/* Bottom Call Controls Panel */}
          <View style={styles.bottomPanel}>
            <View style={styles.controlsRow}>
              {/* Mute Button */}
              <TouchableOpacity
                onPress={() => setIsMuted(!isMuted)}
                style={[styles.controlBtn, isMuted ? styles.controlBtnAlert : styles.controlBtnNormal]}
                activeOpacity={0.8}
              >
                {isMuted ? (
                  <MicOff color="white" size={24} />
                ) : (
                  <Mic color="white" size={24} />
                )}
              </TouchableOpacity>

              {/* Video Toggle Button */}
              <TouchableOpacity
                onPress={() => setIsVideoOn(!isVideoOn)}
                style={[styles.controlBtn, !isVideoOn ? styles.controlBtnAlert : styles.controlBtnNormal]}
                activeOpacity={0.8}
              >
                {isVideoOn ? (
                  <Video color="white" size={24} />
                ) : (
                  <VideoOff color="white" size={24} />
                )}
              </TouchableOpacity>

              {/* End Call Button */}
              <TouchableOpacity
                onPress={handleEndCall}
                style={[styles.controlBtn, styles.endCallBtn]}
                activeOpacity={0.8}
              >
                <PhoneOff color="white" size={28} />
              </TouchableOpacity>

              {/* Chat Panel Button */}
              <TouchableOpacity
                style={[styles.controlBtn, styles.controlBtnNormal]}
                activeOpacity={0.8}
              >
                <MessageSquare color="white" size={24} />
              </TouchableOpacity>
            </View>

            {/* Note prompt card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Session Notes</Text>
              <Text style={styles.infoCardDesc}>
                Your therapist may take notes during the session to provide better care.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  peerStream: {
    flex: 1,
  },
  overlayArea: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: "#D9534F",
    borderRadius: 4,
  },
  timerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  encryptedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  encryptedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarTextLarge: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
  },
  therapistName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  callState: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.75)",
  },
  localStream: {
    position: "absolute",
    bottom: 240,
    right: 24,
    width: 100,
    height: 140,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  localStreamGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  localUserText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomPanel: {
    gap: 16,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  controlBtn: {
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnNormal: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  controlBtnAlert: {
    width: 56,
    height: 56,
    backgroundColor: "#D9534F",
  },
  endCallBtn: {
    width: 72,
    height: 72,
    backgroundColor: "#D9534F",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  infoCardDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 18,
  },
});
