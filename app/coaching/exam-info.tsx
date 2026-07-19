import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, CheckCircle, Info, List, Star, Briefcase } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

import { Typography } from "../../components/Typography";
import { BentoCard } from "../../components/BentoCard";
import { Button } from "../../components/Button";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function ExamInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examType = params.examType as string;

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExam = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("coaching_exams")
        .select("*")
        .eq("id", examType)
        .single();
      
      if (data) setExam(data);
    } catch (err) {
      console.error("Error fetching exam:", err);
    } finally {
      setLoading(false);
    }
  }, [examType]);

  useFocusEffect(
    useCallback(() => {
      fetchExam();
    }, [fetchExam])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExam();
    setRefreshing(false);
  };

  const handleStart = () => {
    router.push({
      pathname: "/coaching/dashboard" as any,
      params: { examType },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface-primary justify-center items-center">
        <ActivityIndicator size="large" color="#4f378a" />
      </View>
    );
  }

  if (!exam) {
    return (
      <View className="flex-1 bg-surface-primary justify-center items-center px-6">
        <Typography color="secondary" className="mb-4">Exam details not found.</Typography>
        <Button onPress={() => router.back()} variant="primary" className="w-full">
          Go Back
        </Button>
      </View>
    );
  }

  const eligibility = Array.isArray(exam.eligibility) ? exam.eligibility : JSON.parse(exam.eligibility || '[]');
  const examPattern = Array.isArray(exam.pattern) ? exam.pattern : JSON.parse(exam.pattern || '[]');
  const careers = Array.isArray(exam.careers) ? exam.careers : JSON.parse(exam.careers || '[]');

  return (
    <View className="flex-1 bg-surface-primary">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f378a" />}
      >
        <LinearGradient 
          colors={["#fdf7ff", "#e9ddff", "#cfbcff"]} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }}
          className="px-6 pb-12 pt-8 rounded-b-[40px]"
        >
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center gap-4 mb-4">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/40 items-center justify-center border border-white/50"
              >
                <ArrowLeft color="#4f378a" size={20} />
              </TouchableOpacity>
              <View className="flex-1">
                <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider opacity-80">Exam Overview</Typography>
                <Typography variant="title" weight="bold" color="primary" numberOfLines={1}>{exam.name}</Typography>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5 ml-14">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  color={i < (exam.difficulty || 3) ? "#F59E0B" : "rgba(79, 55, 138, 0.2)"} 
                  fill={i < (exam.difficulty || 3) ? "#F59E0B" : "transparent"} 
                />
              ))}
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View className="px-6 pb-10 -mt-6 gap-4">
          <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white">
            <View className="flex-row items-center gap-2.5 mb-3">
              <Info size={20} color="#4f378a" />
              <Typography variant="heading" weight="bold" color="primary">About the Exam</Typography>
            </View>
            <Typography weight="bold" color="primary" className="mb-2 text-accent-primary">
              {exam.tagline || 'National Level Entrance Exam'}
            </Typography>
            <Typography color="secondary" className="leading-relaxed">
              {exam.description || 'Description not available.'}
            </Typography>
          </BentoCard>

          <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white">
            <View className="flex-row items-center gap-2.5 mb-4">
              <CheckCircle size={20} color="#10B981" />
              <Typography variant="heading" weight="bold" color="primary">Eligibility Criteria</Typography>
            </View>
            {eligibility.map((crit: string, idx: number) => (
              <View key={idx} className="flex-row gap-3 mb-2.5">
                <Typography weight="bold" className="text-green-500">✓</Typography>
                <Typography color="secondary" className="flex-1">{crit}</Typography>
              </View>
            ))}
          </BentoCard>

          <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white">
            <View className="flex-row items-center gap-2.5 mb-4">
              <List size={20} color="#3B82F6" />
              <Typography variant="heading" weight="bold" color="primary">Exam Pattern</Typography>
            </View>
            {examPattern.map((pattern: any, idx: number) => (
              <View key={idx} className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mb-3">
                <Typography weight="bold" color="primary" className="mb-3">{pattern.section}</Typography>
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <Typography variant="heading" weight="bold" className="text-accent-primary">{pattern.questions}</Typography>
                    <Typography variant="caption" color="secondary">Questions</Typography>
                  </View>
                  <View className="w-[1px] h-full bg-border-subtle" />
                  <View className="items-center">
                    <Typography variant="heading" weight="bold" className="text-accent-primary">{pattern.marks}</Typography>
                    <Typography variant="caption" color="secondary">Marks</Typography>
                  </View>
                </View>
              </View>
            ))}
          </BentoCard>

          <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white">
            <View className="flex-row items-center gap-2.5 mb-4">
              <Briefcase size={20} color="#F59E0B" />
              <Typography variant="heading" weight="bold" color="primary">Career Scope</Typography>
            </View>
            {careers.map((op: string, idx: number) => (
              <View key={idx} className="flex-row gap-3 mb-2.5">
                <Typography weight="bold" className="text-orange-500">✦</Typography>
                <Typography color="secondary" className="flex-1">{op}</Typography>
              </View>
            ))}
          </BentoCard>

          <Button 
            onPress={handleStart} 
            variant="primary" 
            className="w-full mt-2"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Typography weight="bold" color="inverse">Start Preparation</Typography>
              <ArrowRight size={18} color="white" />
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
