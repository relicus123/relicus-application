import React, { useState } from "react";
import { View, ScrollView, Image } from "react-native";
import { TuitionView, TuitionNavContext } from "../types";
import { useTuitionStore } from "../../../store/tuition.store";
import { Typography } from "../../../components/Typography";
import { BentoCard } from "../../../components/BentoCard";
import { IconButton } from "../../../components/IconButton";
import { Button } from "../../../components/Button";
import { ArrowLeft, Users, Shield, TrendingUp, CreditCard, ChevronRight } from "lucide-react-native";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function ProfileDashboard({ onNavigate, onBack }: ScreenProps) {
  const student = useTuitionStore(s => s.student);
  const [showParentAuth, setShowParentAuth] = useState(false);

  if (showParentAuth) {
    return (
      <View className="flex-1 bg-surface-primary">
        <View className="flex-row items-center gap-4 px-6 pt-16 pb-6 bg-white border-b border-border-subtle">
          <IconButton 
            icon={<ArrowLeft size={24} color="#1d1b20" />}
            variant="ghost"
            size="sm"
            onPress={() => setShowParentAuth(false)}
          />
          <Typography variant="title" weight="bold" color="primary">Parent Access</Typography>
        </View>
        <View className="flex-1 px-6 pt-8">
          <View className="bg-white p-6 rounded-3xl border border-border-subtle shadow-sm items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Shield size={32} color="#4f378a" />
            </View>
            <Typography variant="heading" weight="bold" color="primary" className="text-center mb-2">Secure Access</Typography>
            <Typography variant="body" color="secondary" className="text-center">
              Enter PIN to access the parent dashboard and monitor student progress.
            </Typography>
          </View>
          <Button variant="primary" onPress={() => onNavigate("parentDashboard")}>
            Login (Mock)
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-primary">
      <View className="flex-row items-center gap-4 px-6 pt-16 pb-6 bg-white border-b border-border-subtle z-10">
        <IconButton 
          icon={<ArrowLeft size={24} color="#1d1b20" />}
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
        <Typography variant="title" weight="bold" color="primary">Student Profile</Typography>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="items-center mb-8">
          <Image source={{ uri: student.avatar }} className="w-24 h-24 rounded-full border-4 border-white shadow-sm mb-4 bg-slate-200" />
          <Typography variant="heading" weight="bold" color="primary">{student.name}</Typography>
          <Typography variant="body" color="secondary" className="mt-1">{student.classLevel} • {student.board}</Typography>
        </View>

        <Typography variant="heading" weight="bold" color="primary" className="mb-4">Enrolled Subjects</Typography>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {student.enrolledSubjects.map(sub => (
            <View key={sub} className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Typography variant="caption" weight="bold" color="primary">{sub}</Typography>
            </View>
          ))}
        </View>

        <Typography variant="heading" weight="bold" color="primary" className="mb-4">Parent Controls</Typography>
        <BentoCard 
          variant="secondary" 
          padding="md" 
          className="bg-white border-2 border-primary/20 shadow-sm"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
              <Users size={24} color="#4f378a" />
            </View>
            <View className="flex-1">
              <Typography variant="body" weight="bold" color="primary">Parent Dashboard</Typography>
              <Typography variant="caption" color="secondary">Track progress & fees</Typography>
            </View>
          </View>
          <Button variant="outline" onPress={() => setShowParentAuth(true)}>
            Access Dashboard
          </Button>
        </BentoCard>
      </ScrollView>
    </View>
  );
}

export function ParentDashboard({ onBack }: ScreenProps) {
  const parent = useTuitionStore(s => s.parent);
  const student = useTuitionStore(s => s.student);

  return (
    <View className="flex-1 bg-surface-primary">
      <View className="flex-row items-center gap-4 px-6 pt-16 pb-6 bg-white border-b border-border-subtle z-10">
        <IconButton 
          icon={<ArrowLeft size={24} color="#1d1b20" />}
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
        <View>
          <Typography variant="title" weight="bold" color="primary">Parent Dashboard</Typography>
          <Typography variant="caption" color="secondary">Welcome, {parent.name}</Typography>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Typography variant="heading" weight="bold" color="primary" className="mb-4">Student Performance</Typography>
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-6">
          <View className="flex-row items-center mb-4 pb-4 border-b border-border-subtle">
            <Image source={{ uri: student.avatar }} className="w-10 h-10 rounded-full mr-3 bg-slate-200" />
            <View>
              <Typography variant="body" weight="bold" color="primary">{student.name}</Typography>
              <Typography variant="caption" color="secondary">Overall Statistics</Typography>
            </View>
          </View>
          <View className="flex-row justify-between mb-2">
            <Typography variant="body" color="secondary">Attendance</Typography>
            <Typography variant="body" weight="bold" color="primary">{student.attendancePercent}%</Typography>
          </View>
          <View className="flex-row justify-between">
            <Typography variant="body" color="secondary">Current Rank</Typography>
            <View className="flex-row items-center gap-1">
              <TrendingUp size={16} color="#10B981" />
              <Typography variant="body" weight="bold" className="text-emerald-600">#{student.rank}</Typography>
            </View>
          </View>
        </BentoCard>

        <Typography variant="heading" weight="bold" color="primary" className="mb-4">Fee Management</Typography>
        <BentoCard variant="secondary" padding="md" className="bg-[#FFF8DC] border border-[#FDE68A] shadow-sm">
          <View className="flex-row items-center mb-4 pb-4 border-b border-[#FDE68A]/50">
            <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
              <CreditCard size={20} color="#D97706" />
            </View>
            <View>
              <Typography variant="body" weight="bold" color="primary">Tuition Fees</Typography>
              <Typography variant="caption" color="secondary">Billing Cycle</Typography>
            </View>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Typography variant="body" color="secondary">Status</Typography>
            <View className={`px-2.5 py-1 rounded-md ${parent.feeStatus === "Paid" ? "bg-emerald-100" : "bg-red-100"}`}>
              <Typography variant="caption" weight="bold" className={parent.feeStatus === "Paid" ? "text-emerald-700" : "text-red-700"}>
                {parent.feeStatus}
              </Typography>
            </View>
          </View>
          <View className="flex-row justify-between">
            <Typography variant="body" color="secondary">Next Due</Typography>
            <Typography variant="body" weight="bold" color="primary">{new Date(parent.nextFeeDueDate).toLocaleDateString()}</Typography>
          </View>
        </BentoCard>
      </ScrollView>
    </View>
  );
}
