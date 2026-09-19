import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import YoutubePlayer from "react-native-youtube-iframe";
import { WebView } from "react-native-webview";
import * as ScreenCapture from "expo-screen-capture";
import {
  ArrowLeft,
  ShieldCheck,
  Play,
  CheckCircle,
  Eye,
  Clock,
  BookOpen,
  Sparkles,
} from "lucide-react-native";

import { Typography } from "../Typography";
import { useAuthStore } from "../../store/auth.store";
import { useCoachingStore } from "../../store/coaching.store";
import { supabase } from "../../lib/supabase";

interface CoachingVideoPlayerModalProps {
  visible: boolean;
  video: {
    id: string;
    chapter_id?: string;
    title: string;
    duration?: string;
    url: string;
    is_watched?: boolean;
    is_free_preview?: boolean;
  } | null;
  chapter: {
    id: string;
    name: string;
    progress?: number;
    videos?: any[];
  } | null;
  isFreePreviewMode?: boolean;
  onRequestAccess?: () => void;
  onClose: () => void;
  onVideoWatched?: (videoId: string, newWatched: boolean, chapterProgress: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Leave small horizontal margin so the video has elegant rounded corners matching Relicus theme
const PLAYER_WIDTH = SCREEN_WIDTH - 32;
const PLAYER_HEIGHT = Math.round(PLAYER_WIDTH * (9 / 16));

export const CoachingVideoPlayerModal: React.FC<CoachingVideoPlayerModalProps> = ({
  visible,
  video,
  chapter,
  isFreePreviewMode = false,
  onRequestAccess,
  onClose,
  onVideoWatched,
}) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const recordDailyActivity = useCoachingStore((s) => s.recordDailyActivity);

  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isWatched, setIsWatched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [videoType, setVideoType] = useState<"youtube" | "direct">("youtube");
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  const youtubePlayerRef = useRef<any>(null);
  const webViewRef = useRef<any>(null);
  const watchTimeSecondsRef = useRef<number>(0);
  const screenshotSubRef = useRef<any>(null);

  // Extract YouTube ID helper
  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 1. Strictly Disable Screenshots and Screen Recording
  useEffect(() => {
    if (!visible) return;

    let isSubscribed = true;

    const enableProtection = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync("coaching_video_player");
      } catch (e) {
        console.warn("Screen capture prevention not supported on this platform:", e);
      }

      try {
        screenshotSubRef.current = ScreenCapture.addScreenshotListener(() => {
          if (isSubscribed) {
            Alert.alert(
              "Security Policy Notice 🔒",
              "Screenshots and screen recordings are strictly disabled to protect course content and student security.",
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
        ScreenCapture.allowScreenCaptureAsync("coaching_video_player");
      } catch (e) {}
    };
  }, [visible]);

  // 2. Parse Video URL & Set Initial State
  useEffect(() => {
    if (!visible || !video) return;

    setIsWatched(Boolean(video.is_watched));
    setCurrentTime(0);
    watchTimeSecondsRef.current = 0;

    const ytId = extractYoutubeId(video.url);
    if (ytId) {
      setVideoType("youtube");
      setYoutubeVideoId(ytId);
    } else {
      setVideoType("direct");
      setYoutubeVideoId(null);
    }
    setPlaying(true);
  }, [visible, video]);

  // 3. Mark As Watched and Update Database & Progress
  const handleMarkAsWatched = useCallback(
    async (manualToggle = false) => {
      if (!video) return;

      const targetWatched = manualToggle ? !isWatched : true;
      setIsWatched(targetWatched);
      setIsSaving(true);

      try {
        await supabase
          .from("coaching_videos")
          .update({ is_watched: targetWatched })
          .eq("id", video.id);

        try {
          await recordDailyActivity();
        } catch (_) {}

        let updatedChapterProgress = chapter?.progress || 0;
        if (chapter && chapter.id) {
          const { data: allVideos } = await supabase
            .from("coaching_videos")
            .select("id, is_watched")
            .eq("chapter_id", chapter.id);

          if (allVideos && allVideos.length > 0) {
            const watchedCount = allVideos.filter(
              (v) => (v.id === video.id ? targetWatched : v.is_watched)
            ).length;
            updatedChapterProgress = Math.round((watchedCount / allVideos.length) * 100);

            await supabase
              .from("coaching_chapters")
              .update({ progress: updatedChapterProgress })
              .eq("id", chapter.id);
          }
        }

        if (onVideoWatched) {
          onVideoWatched(video.id, targetWatched, updatedChapterProgress);
        }
      } catch (err: any) {
        console.error("Error updating watch activity:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [video, chapter, isWatched, recordDailyActivity, onVideoWatched]
  );

  // 4. YouTube Player State and Progress Tracking
  const onYoutubeStateChange = useCallback(
    (state: string) => {
      if (state === "ended") {
        setPlaying(false);
        handleMarkAsWatched(false);
      } else if (state === "playing") {
        setPlaying(true);
      } else if (state === "paused") {
        setPlaying(false);
      }
    },
    [handleMarkAsWatched]
  );

  useEffect(() => {
    if (!visible || videoType !== "youtube" || !playing) return;

    const interval = setInterval(async () => {
      if (youtubePlayerRef.current) {
        try {
          const current = await youtubePlayerRef.current.getCurrentTime();
          const dur = await youtubePlayerRef.current.getDuration();
          if (dur > 0) {
            setDuration(dur);
            setCurrentTime(current);
            watchTimeSecondsRef.current += 1;

            if (!isWatched && current / dur >= 0.8) {
              handleMarkAsWatched(false);
            }
          }
        } catch (_) {}
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, videoType, playing, isWatched, handleMarkAsWatched]);

  // 5. HTML5 WebView Player for Direct MP4 / Web Videos
  const directVideoHtml = video
    ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body, html { width: 100%; height: 100%; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; border-radius: 16px; }
          video { width: 100%; max-height: 100%; object-fit: contain; }
        </style>
      </head>
      <body>
        <video id="player" playsinline controls autoplay>
          <source src="${video.url}" type="video/mp4">
          Your browser does not support HTML5 video.
        </video>
        <script>
          const v = document.getElementById('player');
          v.addEventListener('timeupdate', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'timeupdate',
              currentTime: v.currentTime,
              duration: v.duration
            }));
          });
          v.addEventListener('ended', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ended' }));
          });
        </script>
      </body>
    </html>
  `
    : "";

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "timeupdate") {
        setCurrentTime(data.currentTime || 0);
        if (data.duration && data.duration > 0) {
          setDuration(data.duration);
          if (!isWatched && data.currentTime / data.duration >= 0.8) {
            handleMarkAsWatched(false);
          }
        }
      } else if (data.type === "ended") {
        setPlaying(false);
        handleMarkAsWatched(false);
      }
    } catch (_) {}
  };

  const progressPercent =
    duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;

  const studentWatermark = `${currentUser?.username || currentUser?.email || "STUDENT"} • RELICUS PROTECTED • ${(
    currentUser?.id || "USER"
  ).slice(0, 8)}`;

  if (!video) return null;

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
          className="px-5 pb-4 pt-2 border-b border-border-subtle shadow-xs"
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
                      Protected Lesson
                    </Typography>
                  </View>
                  {isWatched && (
                    <View className="bg-[#E8F4EE] px-2.5 py-0.5 rounded-md border border-[#287A5A]/25 flex-row items-center gap-1">
                      <CheckCircle color="#287A5A" size={11} />
                      <Typography variant="caption" weight="bold" className="text-[#287A5A] text-[11px]">
                        Completed
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
                  {video.title}
                </Typography>
                <Typography variant="caption" color="secondary" className="text-xs mt-0.5">
                  {chapter?.name || "Chapter Lesson"} • {video.duration || "Video Lesson"}
                </Typography>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Refined Video Frame with Smooth Rounded Corners and Elevation */}
          <View className="mx-4 mt-4 mb-3 rounded-2xl overflow-hidden shadow-sm border border-border-strong bg-black relative">
            <View style={{ height: PLAYER_HEIGHT, width: PLAYER_WIDTH }}>
              {videoType === "youtube" && youtubeVideoId ? (
                <YoutubePlayer
                  ref={youtubePlayerRef}
                  height={PLAYER_HEIGHT}
                  width={PLAYER_WIDTH}
                  play={playing}
                  videoId={youtubeVideoId}
                  onChangeState={onYoutubeStateChange}
                  initialPlayerParams={{
                    preventFullScreen: false,
                    controls: true,
                    rel: false,
                    iv_load_policy: 3,
                  }}
                />
              ) : (
                <WebView
                  ref={webViewRef}
                  source={{ html: directVideoHtml }}
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  javaScriptEnabled
                  domStorageEnabled
                  onMessage={handleWebViewMessage}
                  style={{ width: PLAYER_WIDTH, height: PLAYER_HEIGHT, backgroundColor: "black" }}
                />
              )}
            </View>

            {/* Subtle Dynamic Watermark */}
            <View
              pointerEvents="none"
              className="absolute bottom-2 right-2 bg-black/40 px-2 py-0.5 rounded border border-white/10"
            >
              <Typography variant="caption" className="text-white/50 text-[9px] tracking-wider">
                {studentWatermark}
              </Typography>
            </View>
          </View>

          {/* Relicus Theme White Cards Container */}
          <View className="px-4 gap-3">
            {/* Card 1: Watch Activity Tracker */}
            <View className="bg-white rounded-2xl p-4 border border-border-subtle shadow-xs">
              <View className="flex-row items-center justify-between mb-2.5">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <Eye color="#1C4966" size={16} />
                  </View>
                  <View>
                    <Typography weight="bold" color="primary" className="text-sm">
                      Learning Activity
                    </Typography>
                    <Typography variant="caption" color="secondary" className="text-[10px]">
                      Real-time watch progress
                    </Typography>
                  </View>
                </View>

                {isWatched ? (
                  <View className="flex-row items-center gap-1.5 bg-[#E8F4EE] px-3 py-1 rounded-full border border-[#287A5A]/30">
                    <CheckCircle color="#287A5A" size={13} />
                    <Typography weight="bold" className="text-[#287A5A] text-xs">
                      Completed
                    </Typography>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1.5 bg-[#FBF1DF] px-3 py-1 rounded-full border border-[#C99545]/30">
                    <Clock color="#9A6C2D" size={13} />
                    <Typography weight="bold" className="text-[#9A6C2D] text-xs">
                      {progressPercent >= 80 ? "Almost Done" : "In Progress"}
                    </Typography>
                  </View>
                )}
              </View>

              {/* Progress Bar in Relicus Primary Style */}
              <View className="h-2.5 bg-surface-secondary rounded-full overflow-hidden my-2">
                <View
                  style={{ width: `${progressPercent}%` }}
                  className={`h-full rounded-full ${
                    isWatched ? "bg-[#287A5A]" : "bg-primary"
                  }`}
                />
              </View>

              <View className="flex-row items-center justify-between mt-1">
                <Typography variant="caption" color="secondary" className="text-xs">
                  {duration > 0
                    ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                    : video.duration || "Video Lesson"}
                </Typography>
                <Typography variant="caption" weight="bold" color="primary" className="text-xs">
                  {progressPercent}% Watched
                </Typography>
              </View>
            </View>

            {/* Card 2: Chapter Details */}
            {chapter && (
              <View className="bg-white rounded-2xl p-4 border border-border-subtle shadow-xs">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                      <BookOpen color="#1C4966" size={16} />
                    </View>
                    <View>
                      <Typography weight="bold" color="primary" className="text-sm">
                        {chapter.name}
                      </Typography>
                      <Typography variant="caption" color="secondary" className="text-[10px]">
                        Chapter Progress: {chapter.progress || 0}% Done
                      </Typography>
                    </View>
                  </View>
                </View>
                <View className="h-2 bg-surface-secondary rounded-full overflow-hidden mt-1">
                  <View
                    style={{ width: `${chapter.progress || 0}%` }}
                    className="h-full rounded-full bg-emerald-600"
                  />
                </View>
              </View>
            )}

            {/* Mark as Completed Button */}
            <TouchableOpacity
              onPress={() => handleMarkAsWatched(true)}
              disabled={isSaving}
              activeOpacity={0.8}
              className={`flex-row items-center justify-center gap-2 p-3.5 rounded-xl shadow-xs border ${
                isWatched
                  ? "bg-[#E8F4EE] border-[#287A5A]/30"
                  : "bg-primary border-primary"
              }`}
            >
              {isSaving ? (
                <ActivityIndicator color={isWatched ? "#287A5A" : "white"} size="small" />
              ) : isWatched ? (
                <>
                  <CheckCircle color="#287A5A" size={17} />
                  <Typography weight="bold" className="text-[#287A5A] text-sm">
                    Marked as Completed (Tap to Unmark)
                  </Typography>
                </>
              ) : (
                <>
                  <CheckCircle color="white" size={17} />
                  <Typography weight="bold" color="inverse" className="text-sm">
                    Mark as Completed
                  </Typography>
                </>
              )}
            </TouchableOpacity>

            {/* Free Preview Banner & CTA */}
            {isFreePreviewMode && (
              <View className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-400/30 gap-2">
                <View className="flex-row items-center gap-2">
                  <Sparkles size={16} color="#D97706" />
                  <Typography weight="bold" color="primary" className="text-xs">
                    Free Demo Lecture 🎓
                  </Typography>
                </View>
                <Typography variant="caption" color="secondary" className="text-[11px] leading-relaxed">
                  Enjoying this lesson? Request full course access from the admin to unlock all remaining lectures, revision notes, and mock tests!
                </Typography>
                {onRequestAccess && (
                  <TouchableOpacity
                    onPress={onRequestAccess}
                    className="bg-primary py-2.5 rounded-xl items-center justify-center mt-1 active:opacity-90"
                    activeOpacity={0.8}
                  >
                    <Typography weight="bold" color="inverse" className="text-xs">
                      Request Full Course Access 🚀
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Security Notice matching Relicus Theme */}
            <View className="bg-surface-secondary/80 p-3.5 rounded-xl border border-border-subtle flex-row items-start gap-2.5">
              <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center mt-0.5">
                <ShieldCheck color="#1C4966" size={13} />
              </View>
              <View className="flex-1">
                <Typography weight="bold" color="primary" className="text-xs mb-0.5">
                  Content Security & Anti-Capture
                </Typography>
                <Typography variant="caption" color="secondary" className="text-[11px] leading-relaxed">
                  Screenshots and screen recordings are strictly disabled. Your watch hours and course
                  progress are automatically recorded to your verified student profile.
                </Typography>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
