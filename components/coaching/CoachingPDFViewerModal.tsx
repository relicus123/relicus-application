import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";
import * as ScreenCapture from "expo-screen-capture";
import { ArrowLeft, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react-native";

import { Typography } from "../Typography";
import { useAuthStore } from "../../store/auth.store";

interface CoachingPDFViewerModalProps {
  visible: boolean;
  note: {
    id: string;
    title: string;
    size?: string;
    pdf_url: string;
    chapter?: any;
  } | null;
  chapterName?: string;
  onClose: () => void;
}

export const CoachingPDFViewerModal: React.FC<CoachingPDFViewerModalProps> = ({
  visible,
  note,
  chapterName,
  onClose,
}) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const screenshotSubRef = useRef<any>(null);

  // 1. Strictly Disable Screenshots & Screen Recording
  useEffect(() => {
    if (!visible) return;

    let isSubscribed = true;

    const enableProtection = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync("coaching_pdf_reader");
      } catch (e) {
        console.warn("Screen capture prevention not supported:", e);
      }

      try {
        screenshotSubRef.current = ScreenCapture.addScreenshotListener(() => {
          if (isSubscribed) {
            Alert.alert(
              "Security Policy Notice 🔒",
              "Capturing or taking screenshots of study materials and revision notes is strictly disabled by institutional security policy.",
              [{ text: "I Understand" }]
            );
          }
        });
      } catch (e) {}
    };

    enableProtection();

    return () => {
      isSubscribed = false;
      if (screenshotSubRef.current) {
        screenshotSubRef.current.remove();
        screenshotSubRef.current = null;
      }
      try {
        ScreenCapture.allowScreenCaptureAsync("coaching_pdf_reader");
      } catch (e) {}
    };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(false);
    }
  }, [visible, note]);

  if (!note || !note.pdf_url) return null;

  const pdfSourceUri =
    Platform.OS === "android"
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(note.pdf_url)}`
      : note.pdf_url;

  const studentWatermark = `${currentUser?.username || currentUser?.email || "STUDENT"} • RELICUS PROTECTED • ${(
    currentUser?.id || "USER"
  ).slice(0, 8)}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View className="flex-1 bg-surface-primary">
        {/* Signature Relicus Header with Soft Gradient */}
        <LinearGradient
          colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-5 pb-3.5 pt-2 border-b border-border-subtle shadow-xs"
        >
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full bg-white/90 items-center justify-center border border-border-subtle shadow-xs"
                activeOpacity={0.8}
              >
                <ArrowLeft color="#1C4966" size={20} />
              </TouchableOpacity>

              <View className="flex-1">
                <View className="flex-row items-center gap-1.5 mb-1 flex-wrap">
                  <View className="bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/15 flex-row items-center gap-1">
                    <ShieldCheck color="#1C4966" size={12} />
                    <Typography variant="caption" weight="bold" color="primary" className="text-[11px]">
                      Protected Reader
                    </Typography>
                  </View>
                </View>
                <Typography
                  variant="heading"
                  weight="bold"
                  color="primary"
                  numberOfLines={1}
                  className="text-base leading-tight"
                >
                  {note.title}
                </Typography>
                <Typography variant="caption" color="secondary" className="text-xs mt-0.5">
                  {chapterName || note.chapter?.name || "Revision Notes"} • {note.size || "PDF Document"}
                </Typography>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setLoading(true);
                  setError(false);
                  webViewRef.current?.reload();
                }}
                className="w-9 h-9 rounded-full bg-white/90 items-center justify-center border border-border-subtle shadow-xs"
                activeOpacity={0.8}
              >
                <RefreshCw color="#1C4966" size={16} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* PDF WebView Viewer Container */}
        <View className="flex-1 relative bg-surface-primary">
          <WebView
            ref={webViewRef}
            source={{ uri: pdfSourceUri }}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit
            startInLoadingState={false}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            style={{ flex: 1, backgroundColor: "#F7F9FB" }}
          />

          {/* Loading Spinner in Relicus Styling */}
          {loading && (
            <View className="absolute inset-0 bg-surface-primary/90 items-center justify-center p-6">
              <ActivityIndicator size="large" color="#1C4966" />
              <Typography weight="bold" color="primary" className="mt-3 text-sm">
                Opening Protected Document...
              </Typography>
              <Typography variant="caption" color="secondary" className="mt-1 text-xs text-center">
                Rendering material securely inside Relicus App
              </Typography>
            </View>
          )}

          {/* Error View in Relicus Styling */}
          {error && !loading && (
            <View className="absolute inset-0 bg-white items-center justify-center p-6">
              <AlertCircle size={44} color="#C45151" />
              <Typography weight="bold" color="primary" className="mt-3 text-base">
                Failed to Load Document
              </Typography>
              <Typography variant="caption" color="secondary" className="mt-1 text-xs text-center mb-4">
                Please check your network connectivity and try reloading the document.
              </Typography>
              <TouchableOpacity
                onPress={() => {
                  setLoading(true);
                  setError(false);
                  webViewRef.current?.reload();
                }}
                className="flex-row items-center gap-2 bg-primary px-4 py-2.5 rounded-xl shadow-xs"
              >
                <RefreshCw size={14} color="white" />
                <Typography variant="caption" weight="bold" color="inverse">
                  Reload Document
                </Typography>
              </TouchableOpacity>
            </View>
          )}

          {/* Persistent Floating Security Watermark */}
          <View
            pointerEvents="none"
            className="absolute bottom-4 right-4 bg-primary/20 px-2.5 py-1 rounded-md border border-primary/30"
          >
            <Typography variant="caption" className="text-primary text-[9px] tracking-wider font-bold">
              {studentWatermark}
            </Typography>
          </View>
        </View>

        {/* Security Footer Notice in Relicus Styling */}
        <SafeAreaView edges={["bottom"]} className="bg-white border-t border-border-subtle">
          <View className="px-4 py-2.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1 mr-2">
              <ShieldCheck color="#1C4966" size={14} />
              <Typography variant="caption" color="secondary" className="text-[11px]">
                Strictly confidential • Anti-capture protection enabled
              </Typography>
            </View>
            <View className="bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              <Typography variant="caption" weight="bold" color="primary" className="text-[9px]">
                SECURE DRM
              </Typography>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};
