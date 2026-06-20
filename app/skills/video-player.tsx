import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, StatusBar, BackHandler } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import YoutubePlayer from "react-native-youtube-iframe";
import { ArrowLeft, Play, Pause, Maximize, Minimize, RotateCcw, RotateCw } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSkillsStore } from "../../store/skills.store";

const { width, height: screenHeight } = Dimensions.get("window");
const VIDEO_HEIGHT = width * (9 / 16);

export default function VideoPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const store = useSkillsStore();
  
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const videoUrl = params.videoUrl as string;
  const lessonTitle = params.lessonTitle as string;

  const [playing, setPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playerRef = useRef<any>(null);
  const sessionHoursRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  
  // Extract YouTube ID
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleBack = () => {
    if (isFullscreen) {
      setIsFullscreen(false);
    } else {
      router.back();
    }
  };

  // Handle hardware back button for fullscreen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isFullscreen) {
        toggleFullscreen();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [isFullscreen]);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
      if (!hasCompleted) {
        setHasCompleted(true);
        useSkillsStore.getState().updateLessonProgress(courseId, lessonId, 100, true);
      }
    } else if (state === "playing" || state === "buffering") {
      setPlaying(true);
    } else if (state === "paused" || state === "unstarted") {
      setPlaying(false);
    }
  }, [courseId, lessonId, hasCompleted]);

  // Handle unmount to save accumulated hours
  useEffect(() => {
    return () => {
      if (sessionHoursRef.current > 0) {
        useSkillsStore.getState().addLearningHours(sessionHoursRef.current);
      }
    };
  }, []);

  const onReady = useCallback(async () => {
    setIsReady(true);
    // Auto-resume logic
    try {
      const duration = await playerRef.current?.getDuration();
      if (duration && duration > 0) {
        setDuration(duration);
        const progressKey = `${useAuthStore.getState().currentUser?.id}_${courseId}_${lessonId}`;
        const savedProgress = useSkillsStore.getState().lessonProgress[progressKey]?.progress || 0;
        if (savedProgress > 0 && savedProgress < 95) {
          const seekTime = (savedProgress / 100) * duration;
          playerRef.current?.seekTo(seekTime, true);
        }
      }
    } catch (e) {}
  }, [courseId, lessonId]);

  // Track progress manually
  useEffect(() => {
    const interval = setInterval(async () => {
      if (playing) {
        // Accumulate 1 second of learning time (in hours)
        sessionHoursRef.current += (1 / 3600);
      }
      
      if (playing && playerRef.current && isReady) {
        try {
          const currentTime = await playerRef.current.getCurrentTime();
          const duration = await playerRef.current.getDuration();
          if (duration > 0) {
            setDuration(duration);
            setProgress(currentTime);
            
            const progressPercent = (currentTime / duration) * 100;
            
            // Throttle store updates to every 5% or 10 seconds to avoid hitting AsyncStorage too heavily
            if (currentTime - lastUpdateRef.current > 5 || progressPercent > 95) {
              lastUpdateRef.current = currentTime;
              useSkillsStore.getState().updateLessonProgress(courseId, lessonId, Math.floor(progressPercent), progressPercent > 95);
            }
          }
        } catch (e) {}
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, isReady, courseId, lessonId]);

  if (!videoId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid video format. Cannot play this video directly.</Text>
        <TouchableOpacity onPress={handleBack} style={styles.btn}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <View style={[styles.container, isFullscreen && styles.containerFullscreen]}>
      <StatusBar hidden={isFullscreen} />
      
      {!isFullscreen && (
        <LinearGradient
          colors={["#1C4966", "#5F8B70"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSubtitle}>Now Playing</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{lessonTitle}</Text>
          </View>
        </LinearGradient>
      )}

      {/* Video Player Container */}
      <View style={[styles.videoWrapper, isFullscreen && styles.videoWrapperFullscreen]}>
        {!isReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#5F8B70" />
            <Text style={styles.loadingText}>Loading Video...</Text>
          </View>
        )}
        
        <YoutubePlayer
          ref={playerRef}
          height={isFullscreen ? width : VIDEO_HEIGHT} // In CSS rotation, the iframe's height should be the screen width
          width={isFullscreen ? screenHeight : width} // And iframe's width should be the screen height
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          onReady={onReady}
          forceAndroidAutoplay={true}
          initialPlayerParams={{
            controls: true, // Enables native YouTube controls
            rel: false,
            preventFullScreen: false,
            iv_load_policy: 3,
            modestbranding: true as any
          }}
        />

        {/* Overlay controls for Fullscreen mode */}
        {isFullscreen && (
          <View style={styles.fullscreenControlsOverlay} pointerEvents="box-none">
            <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenBtnOverlay}>
              <Minimize size={24} color="white" />
            </TouchableOpacity>
            
            <View style={[styles.progressBarBg, styles.progressBarBgFullscreen]}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
          </View>
        )}
      </View>

      {/* Custom Video Controls (Portrait) */}
      {!isFullscreen && (
        <View style={styles.controlsContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>
      )}
      
      {!isFullscreen && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>{lessonTitle}</Text>
          <Text style={styles.infoDesc}>
            Watch this lesson to automatically track your progress. Completing the video will earn you a lesson badge and update your analytics!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  containerFullscreen: {
    backgroundColor: "black",
  },
  header: {
    padding: 20,
    paddingTop: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  videoWrapper: {
    width: width,
    height: VIDEO_HEIGHT,
    backgroundColor: "black",
    position: "relative",
  },
  videoWrapperFullscreen: {
    position: "absolute",
    top: (screenHeight - width) / 2,
    left: (width - screenHeight) / 2,
    width: screenHeight,
    height: width,
    transform: [{ rotate: "90deg" }],
    zIndex: 100,
    backgroundColor: "black",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "white",
    marginTop: 8,
    fontSize: 12,
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.08)",
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#5F8B70",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1C4966",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  seekBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  seekText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 4,
  },
  fullscreenBtnPortrait: {
    position: "absolute",
    right: 0,
    padding: 8,
  },
  fullscreenControlsOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  fullscreenBtnOverlay: {
    position: "absolute",
    top: 20,
    right: 20, // In rotated view, right is actually the physical bottom
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 24,
    zIndex: 101,
  },
  controlsRowFullscreen: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  playPauseBtnFullscreen: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  progressBarBgFullscreen: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    width: "auto",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  infoContainer: {
    padding: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: "#5F8B70",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#FFFFF0",
  },
  errorText: {
    fontSize: 14,
    color: "#8FBDD7",
    textAlign: "center",
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#1C4966",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});
