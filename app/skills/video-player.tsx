import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, TouchableOpacity, Dimensions, ActivityIndicator, StatusBar, BackHandler } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import YoutubePlayer from "react-native-youtube-iframe";
import { ArrowLeft, Play, Pause, Maximize, Minimize, RotateCcw, RotateCw } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { useSkillsStore } from "../../store/skills.store";
import { Typography } from "../../components/Typography";
import { Button } from "../../components/Button";

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
        const progressKey = `${store.lessonProgress}_${courseId}_${lessonId}`; // Fixed from auth store
        const savedProgress = useSkillsStore.getState().lessonProgress[progressKey]?.progress || 0;
        if (savedProgress > 0 && savedProgress < 95) {
          const seekTime = (savedProgress / 100) * duration;
          playerRef.current?.seekTo(seekTime, true);
        }
      }
    } catch (e) {}
  }, [courseId, lessonId, store]);

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
      <View className="flex-1 bg-surface-primary items-center justify-center p-8">
        <Typography variant="body" color="secondary" className="mb-4 text-center">Invalid video format. Cannot play this video directly.</Typography>
        <Button onPress={handleBack} variant="primary">Go Back</Button>
      </View>
    );
  }

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <View className={twMerge(clsx("flex-1 bg-surface-primary", isFullscreen && "bg-black"))}>
      <StatusBar hidden={isFullscreen} />
      
      {!isFullscreen && (
        <LinearGradient
          colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-6 pt-10"
        >
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={handleBack}
                className="w-10 h-10 rounded-full bg-white/40 items-center justify-center border border-white/50"
                activeOpacity={0.7}
              >
                <ArrowLeft color="#4f378a" size={20} />
              </TouchableOpacity>
              <View className="flex-1">
                <Typography variant="caption" color="secondary" className="mb-0.5">Now Playing</Typography>
                <Typography variant="heading" weight="bold" color="primary" numberOfLines={1}>{lessonTitle}</Typography>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      )}

      {/* Video Player Container */}
      <View 
        className={twMerge(clsx(
          "bg-black relative",
          isFullscreen ? "absolute z-50" : "w-full"
        ))}
        style={isFullscreen ? {
          top: (screenHeight - width) / 2,
          left: (width - screenHeight) / 2,
          width: screenHeight,
          height: width,
          transform: [{ rotate: "90deg" }]
        } : {
          width: width,
          height: VIDEO_HEIGHT,
        }}
      >
        {!isReady && (
          <View className="absolute inset-0 bg-black items-center justify-center z-10">
            <ActivityIndicator size="large" color="#6b4fa3" />
            <Typography variant="caption" className="text-white mt-2">Loading Video...</Typography>
          </View>
        )}
        
        <YoutubePlayer
          ref={playerRef}
          height={isFullscreen ? width : VIDEO_HEIGHT}
          width={isFullscreen ? screenHeight : width}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          onReady={onReady}
          forceAndroidAutoplay={true}
          initialPlayerParams={{
            controls: true,
            rel: false,
            preventFullScreen: false,
            iv_load_policy: 3,
          }}
        />

        {/* Overlay controls for Fullscreen mode */}
        {isFullscreen && (
          <View className="absolute inset-0 z-10 items-center justify-center bg-black/50" pointerEvents="box-none">
            <TouchableOpacity onPress={toggleFullscreen} className="absolute right-5 z-[101] bg-black/50 p-3 rounded-full" style={{ top: 20 }}>
              <Minimize size={24} color="white" />
            </TouchableOpacity>
            
            <View className="absolute bottom-10 left-10 right-10 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <View className="h-full bg-primary" style={{ width: `${progressPercentage}%` }} />
            </View>
          </View>
        )}
      </View>

      {/* Custom Video Controls (Portrait) */}
      {!isFullscreen && (
        <View className="p-5 bg-white border-b border-border-subtle">
          <View className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden">
            <View className="h-full bg-primary" style={{ width: `${progressPercentage}%` }} />
          </View>
        </View>
      )}
      
      {!isFullscreen && (
        <View className="p-6">
          <Typography variant="title" weight="bold" color="primary" className="mb-2">{lessonTitle}</Typography>
          <Typography variant="body" color="secondary" className="leading-6">
            Watch this lesson to automatically track your progress. Completing the video will earn you a lesson badge and update your analytics!
          </Typography>
        </View>
      )}
    </View>
  );
}
