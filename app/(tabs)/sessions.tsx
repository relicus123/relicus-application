import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Globe,
  ExternalLink,
  RotateCw,
  X,
  Sparkles,
} from "lucide-react-native";
import { WebView } from "react-native-webview";

const RELICUS_PORTAL_URL = "https://www.relicus.in/";

export default function SessionsScreen() {
  const [showPopup, setShowPopup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);
  const webViewRef = useRef<WebView>(null);

  const handleOpenInChrome = async () => {
    try {
      await Linking.openURL(RELICUS_PORTAL_URL);
    } catch (err) {
      console.error("Failed to open URL in browser:", err);
    }
  };

  const handleReload = () => {
    if (Platform.OS === "web") {
      setKey((prev) => prev + 1);
    } else {
      webViewRef.current?.reload();
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* Full Page Web View */}
      <View style={styles.webContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#1C4966" />
            <Text style={styles.loadingText}>Loading Relicus Portal...</Text>
          </View>
        )}

        {Platform.OS === "web" ? (
          <iframe
            key={key}
            src={RELICUS_PORTAL_URL}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="Relicus In-App Portal"
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <WebView
            ref={webViewRef}
            key={key}
            source={{ uri: RELICUS_PORTAL_URL }}
            style={styles.webView}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState={false}
          />
        )}

        {/* Discreet Floating Bar (Top Right) */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={styles.floatingPill}
            onPress={handleOpenInChrome}
            activeOpacity={0.85}
            accessibilityLabel="Open in Google Chrome"
          >
            <Globe size={13} color="#FFFFFF" />
            <Text style={styles.floatingPillText}>Open in Chrome</Text>
            <ExternalLink size={12} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.floatingIconBtn}
            onPress={handleReload}
            activeOpacity={0.85}
            accessibilityLabel="Reload page"
          >
            <RotateCw size={13} color="#1C4966" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chrome Recommended Pop-Up Modal */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowPopup(false)}
              activeOpacity={0.7}
              accessibilityLabel="Close popup"
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>

            {/* Icon & Badge */}
            <View style={styles.modalIconBox}>
              <Globe size={28} color="#1C4966" />
            </View>

            <View style={styles.modalBadge}>
              <Sparkles size={12} color="#15803D" />
              <Text style={styles.modalBadgeText}>Best Experience</Text>
            </View>

            {/* Content */}
            <Text style={styles.modalTitle}>Google Chrome Recommended</Text>
            <Text style={styles.modalMessage}>
              For the best and most convenient experience, please open and use in Google Chrome:
            </Text>

            {/* URL Chip */}
            <TouchableOpacity
              style={styles.urlChip}
              onPress={handleOpenInChrome}
              activeOpacity={0.7}
            >
              <Text style={styles.urlChipText}>{RELICUS_PORTAL_URL}</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.primaryModalBtn}
                onPress={() => {
                  setShowPopup(false);
                  handleOpenInChrome();
                }}
                activeOpacity={0.85}
              >
                <ExternalLink size={16} color="#FFFFFF" />
                <Text style={styles.primaryModalBtnText}>Open in Chrome</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryModalBtn}
                onPress={() => setShowPopup(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryModalBtnText}>Continue in App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  webContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  loadingText: {
    fontSize: 12,
    color: "#1C4966",
    fontWeight: "500",
  },
  floatingControls: {
    position: "absolute",
    top: 10,
    right: 12,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  floatingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1C4966",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  floatingIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  /* Modal Pop-up Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalIconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  modalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalBadgeText: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "700",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 12,
  },
  urlChip: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  urlChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1C4966",
  },
  modalActions: {
    width: "100%",
    gap: 10,
  },
  primaryModalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1C4966",
    paddingVertical: 13,
    borderRadius: 14,
    width: "100%",
  },
  primaryModalBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryModalBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    width: "100%",
  },
  secondaryModalBtnText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
});
