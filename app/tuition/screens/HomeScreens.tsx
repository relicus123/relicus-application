import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  BookOpen, 
  Users, 
  Award, 
  Folder, 
  Bot, 
  User, 
  Flame,
  ArrowRight,
  TrendingUp,
  Target
} from "lucide-react-native";

import { TuitionView, TuitionNavContext } from "../types";
import { useTuitionStore } from "../../../store/tuition.store";
import { Typography } from "../../../components/Typography";
import { BentoCard, BentoCardPressable } from "../../../components/BentoCard";
import { GlassSurface } from "../../../components/GlassSurface";
import { MotiView } from "moti";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
  onReset: (view: TuitionView, context?: TuitionNavContext) => void;
}

export function HomeDashboard({ onNavigate }: ScreenProps) {
  const student = useTuitionStore((s) => s.student);
  
  if (!student) return null;

  const quickActions = [
    { id: "learningPath", label: "Classes", icon: BookOpen, color: "#3B82F6", bg: "bg-blue-500/10" },
    { id: "myTeachers", label: "Teachers", icon: Users, color: "#10B981", bg: "bg-emerald-500/10" },
    { id: "testCentre", label: "Tests", icon: Award, color: "#F59E0B", bg: "bg-amber-500/10" },
    { id: "studyMaterials", label: "Materials", icon: Folder, color: "#8B5CF6", bg: "bg-purple-500/10" },
    { id: "aiAssistant", label: "AI Tutor", icon: Bot, color: "#EC4899", bg: "bg-pink-500/10" },
    { id: "profile", label: "Profile", icon: User, color: "#64748B", bg: "bg-slate-500/10" },
  ];

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-8 rounded-b-[40px]"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Typography variant="heading" weight="bold" color="primary">
                Hello, {student.name.split(" ")[0]} 👋
              </Typography>
              <Typography variant="caption" color="secondary" className="mt-1 font-medium">
                {student.classLevel} | {student.board}
              </Typography>
            </View>
            <View className="bg-orange-500/15 border border-orange-500/30 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 shadow-sm">
              <Flame size={14} color="#F97316" strokeWidth={2.5} />
              <Typography variant="caption" weight="bold" className="text-orange-600">
                {student.streakDays} Days
              </Typography>
            </View>
          </View>

          <GlassSurface rounded="2xl" intensity={60} className="p-4 border-white/50 bg-white/40">
            <Typography variant="caption" color="primary" className="italic opacity-80 leading-5">
              "Success is the sum of small efforts, repeated day in and day out."
            </Typography>
            <Typography variant="caption" weight="bold" color="secondary" className="text-right mt-2 opacity-70">
              - Robert Collier
            </Typography>
          </GlassSurface>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
          <Typography variant="title" weight="bold" color="primary" className="mb-4">Your Progress</Typography>
          
          <View className="flex-row justify-between gap-3 mb-6">
            <BentoCard variant="secondary" className="flex-1 items-center justify-center p-4 border border-border-subtle shadow-sm bg-white">
              <Target size={20} color="#3B82F6" className="mb-2" />
              <Typography variant="title" weight="bold" color="primary">{student.attendancePercent}%</Typography>
              <Typography variant="caption" color="secondary" className="mt-1 text-[10px] uppercase tracking-wider text-center">Attendance</Typography>
            </BentoCard>
            
            <BentoCard variant="secondary" className="flex-1 items-center justify-center p-4 border border-border-subtle shadow-sm bg-white">
              <Award size={20} color="#F59E0B" className="mb-2" />
              <Typography variant="title" weight="bold" color="primary">{student.totalPoints}</Typography>
              <Typography variant="caption" color="secondary" className="mt-1 text-[10px] uppercase tracking-wider text-center">Total Points</Typography>
            </BentoCard>
            
            <BentoCard variant="secondary" className="flex-1 items-center justify-center p-4 border border-border-subtle shadow-sm bg-white">
              <TrendingUp size={20} color="#10B981" className="mb-2" />
              <Typography variant="title" weight="bold" color="primary">#{student.rank}</Typography>
              <Typography variant="caption" color="secondary" className="mt-1 text-[10px] uppercase tracking-wider text-center">Rank</Typography>
            </BentoCard>
          </View>
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
          <Typography variant="title" weight="bold" color="primary" className="mb-4">Quick Actions</Typography>
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <BentoCardPressable
                  key={action.id}
                  variant="secondary"
                  className="w-[31%] items-center py-4 border border-border-subtle bg-white shadow-sm"
                  onPress={() => onNavigate(action.id as any)}
                >
                  <View className={twMerge(clsx("w-12 h-12 rounded-2xl items-center justify-center mb-2", action.bg))}>
                    <Icon size={24} color={action.color} strokeWidth={2} />
                  </View>
                  <Typography variant="caption" weight="bold" color="primary" className="text-center text-[11px]">
                    {action.label}
                  </Typography>
                </BentoCardPressable>
              );
            })}
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}
