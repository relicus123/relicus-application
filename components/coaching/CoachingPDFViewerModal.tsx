import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";
import * as ScreenCapture from "expo-screen-capture";
import { ArrowLeft, ShieldCheck, AlertCircle, RefreshCw, ExternalLink } from "lucide-react-native";

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
  const [totalPages, setTotalPages] = useState<number | null>(null);
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
      setTotalPages(null);
    }
  }, [visible, note]);

  if (!note || !note.pdf_url) return null;

  const handleOpenExternal = async () => {
    try {
      const supported = await Linking.canOpenURL(note.pdf_url);
      if (supported) {
        await Linking.openURL(note.pdf_url);
      } else {
        Alert.alert("Error", "Unable to open document in system reader.");
      }
    } catch (e) {
      Alert.alert("Notice", "Opening document link in default reader...");
      Linking.openURL(note.pdf_url);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "FIRST_PAGE_READY" || data.type === "COMPLETE") {
        setLoading(false);
        setError(false);
      } else if (data.type === "TOTAL_PAGES") {
        setTotalPages(data.pages);
      } else if (data.type === "ERROR") {
        console.warn("PDF.js error:", data.message);
        setLoading(false);
        setError(true);
      }
    } catch {
      // ignore
    }
  };

  // Self-contained client-side PDF.js rendering for Android & Web
  // Bypasses Google Docs Viewer (gview) which was causing "No preview is available".
  const pdfJsHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background-color: #F8FAFC;
      color: #1E293B;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      width: 100%;
      min-height: 100%;
    }
    #viewer-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 8px 36px;
      gap: 14px;
      width: 100%;
    }
    .pdf-page {
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
      border-radius: 6px;
      overflow: hidden;
      max-width: 100%;
      display: flex;
      justify-content: center;
    }
    canvas {
      display: block;
      max-width: 100%;
      height: auto !important;
    }
    #status-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #F8FAFC;
      z-index: 10;
      padding: 20px;
      text-align: center;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #CBD5E1;
      border-top-color: #1C4966;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 12px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .status-text {
      font-size: 13px;
      color: #64748B;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div id="status-overlay">
    <div class="spinner"></div>
    <div id="status-msg" class="status-text">Loading document...</div>
  </div>
  <div id="viewer-container"></div>

  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const pdfUrl = ${JSON.stringify(note.pdf_url)};
    
    function notifyRN(data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    async function loadPdf() {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        });

        loadingTask.onProgress = function(p) {
          if (p.total > 0) {
            const percent = Math.round((p.loaded / p.total) * 100);
            const msgEl = document.getElementById('status-msg');
            if (msgEl) msgEl.innerText = 'Downloading ' + percent + '%...';
          }
        };

        const pdf = await loadingTask.promise;
        const container = document.getElementById('viewer-container');
        const statusMsg = document.getElementById('status-msg');
        if (statusMsg) statusMsg.innerText = 'Rendering pages (1 of ' + pdf.numPages + ')...';

        notifyRN({ type: 'TOTAL_PAGES', pages: pdf.numPages });

        const dpr = Math.min(window.devicePixelRatio || 1.5, 2.5);

        for (let num = 1; num <= pdf.numPages; num++) {
          const page = await pdf.getPage(num);
          const baseViewport = page.getViewport({ scale: 1 });
          const clientWidth = window.innerWidth - 16;
          const scale = (clientWidth / baseViewport.width) * dpr;
          const viewport = page.getViewport({ scale: Math.max(scale, 1.2) });

          const pageWrapper = document.createElement('div');
          pageWrapper.className = 'pdf-page';

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = Math.min(clientWidth, baseViewport.width) + 'px';

          pageWrapper.appendChild(canvas);
          container.appendChild(pageWrapper);

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          if (num === 1) {
            const overlay = document.getElementById('status-overlay');
            if (overlay) overlay.style.display = 'none';
            notifyRN({ type: 'FIRST_PAGE_READY' });
          }
        }

        const overlay = document.getElementById('status-overlay');
        if (overlay) overlay.style.display = 'none';
        notifyRN({ type: 'COMPLETE' });
      } catch (err) {
        const overlay = document.getElementById('status-overlay');
        if (overlay) overlay.style.display = 'none';
        notifyRN({ type: 'ERROR', message: err.message || 'Failed to render PDF' });
      }
    }

    loadPdf();
  </script>
</body>
</html>
`;

  // On iOS, native WKWebView renders raw PDF URLs with hardware acceleration.
  // On Android, self-contained PDF.js renders the PDF locally without Google Docs Viewer.
  const webViewSource =
    Platform.OS === "ios"
      ? { uri: note.pdf_url }
      : { html: pdfJsHtml, baseUrl: "https://res.cloudinary.com" };

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
                  {totalPages !== null && (
                    <View className="bg-surface-secondary px-2 py-0.5 rounded-md border border-border-subtle">
                      <Typography variant="caption" className="text-slate-600 text-[10px] font-bold">
                        {totalPages} {totalPages === 1 ? "page" : "pages"}
                      </Typography>
                    </View>
                  )}
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

              {/* Action: Open in Native System PDF Reader */}
              <TouchableOpacity
                onPress={handleOpenExternal}
                className="w-9 h-9 rounded-full bg-white/90 items-center justify-center border border-border-subtle shadow-xs"
                activeOpacity={0.8}
                accessibilityLabel="Open in Device Viewer"
              >
                <ExternalLink color="#1C4966" size={16} />
              </TouchableOpacity>

              {/* Action: Reload Document */}
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
            source={webViewSource}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit
            startInLoadingState={false}
            onMessage={handleWebViewMessage}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              if (Platform.OS === "ios") {
                setLoading(false);
              }
            }}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            style={{ flex: 1, backgroundColor: "#F7F9FB" }}
          />

          {/* Loading Spinner in Relicus Styling */}
          {loading && (
            <View className="absolute inset-0 bg-surface-primary/95 items-center justify-center p-6">
              <ActivityIndicator size="large" color="#1C4966" />
              <Typography weight="bold" color="primary" className="mt-3 text-sm">
                Opening Protected Document...
              </Typography>
              <Typography variant="caption" color="secondary" className="mt-1 text-xs text-center">
                Rendering material directly inside Relicus App
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
                We could not render the preview in-app. You can reload or open it in your device reader.
              </Typography>
              <View className="flex-row items-center gap-3">
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

                <TouchableOpacity
                  onPress={handleOpenExternal}
                  className="flex-row items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200"
                >
                  <ExternalLink size={14} color="#1C4966" />
                  <Typography variant="caption" weight="bold" color="primary">
                    Open in Device Reader
                  </Typography>
                </TouchableOpacity>
              </View>
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
