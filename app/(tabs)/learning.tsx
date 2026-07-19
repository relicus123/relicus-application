import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { ChevronDown, ChevronUp, ChevronRight, GraduationCap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCoachingStore } from "../../store/coaching.store";
import { supabase } from "../../lib/supabase";
import { Typography } from "../../components/Typography";
import { GlassSurface } from "../../components/GlassSurface";
import { BentoCardPressable, BentoCard } from "../../components/BentoCard";

export default function LearningScreen() {
  const router = useRouter();
  const { setSelectedExam } = useCoachingStore();
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    undergraduate: false,
    postgraduate: false,
    state: false,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [catsRes, examsRes] = await Promise.all([
        supabase.from("coaching_exam_categories").select("*").order("sequence_number"),
        supabase.from("coaching_exams").select("*")
      ]);
      if (catsRes.data) setCategories(catsRes.data);
      if (examsRes.data) setExams(examsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const toggleCategory = (id: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectExam = (examType: string) => {
    setSelectedExam(examType as any);
    router.push({
      pathname: "/coaching/exam-info" as any,
      params: { examType },
    });
  };

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-12 rounded-b-[40px] pt-8"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center gap-4 mb-4 mt-2">
            <GlassSurface rounded="full" intensity={40} className="w-12 h-12 items-center justify-center border-white/30 bg-primary/10">
              <GraduationCap color="#4f378a" size={24} strokeWidth={2.5} />
            </GlassSurface>
            <View>
              <Typography variant="title" weight="bold" color="primary">Entrance Coaching</Typography>
              <Typography variant="caption" color="secondary">Select an exam category to start</Typography>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 48, marginTop: -32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f378a" />}
      >
        <View className="gap-4">
          {loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#4f378a" />
              <Typography color="secondary" className="mt-4">Loading Exams...</Typography>
            </View>
          ) : categories.map((category, index) => {
            const isCollapsed = collapsedCategories[category.id];
            const categoryExams = exams.filter(e => e.category_id === category.id);
            if (categoryExams.length === 0) return null;
            return (
              <MotiView
                key={category.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 50 }}
              >
                <BentoCard variant="primary" padding="none" className="overflow-hidden">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleCategory(category.id)}
                    className="flex-row items-center p-4 bg-primary/5"
                  >
                    <View className="w-10 h-10 items-center justify-center bg-white rounded-xl shadow-sm border border-black/5 mr-3">
                      <Typography variant="heading">{category.icon}</Typography>
                    </View>
                    <View className="flex-1">
                      <Typography weight="bold" color="primary">{category.title}</Typography>
                      <Typography variant="caption" color="secondary" numberOfLines={1}>{category.description}</Typography>
                    </View>
                    {isCollapsed ? (
                      <ChevronDown size={20} color="#79747e" />
                    ) : (
                      <ChevronUp size={20} color="#79747e" />
                    )}
                  </TouchableOpacity>

                  {!isCollapsed && (
                    <View className="p-4 pt-2 gap-3 bg-white">
                      {categoryExams.map((exam) => {
                        const examType = exam.id;
                        return (
                          <TouchableOpacity
                            key={examType}
                            activeOpacity={0.7}
                            onPress={() => handleSelectExam(examType)}
                            className="flex-row items-center p-3 rounded-2xl border border-border-subtle bg-surface-primary"
                          >
                            <View className="w-10 h-10 items-center justify-center bg-primary/5 rounded-xl mr-3">
                              <Typography variant="title">{exam.icon || "📝"}</Typography>
                            </View>
                            <View className="flex-1">
                              <Typography weight="bold" color="primary">{exam.full_name}</Typography>
                              <Typography variant="caption" color="secondary" numberOfLines={1}>{exam.tagline || exam.overview}</Typography>
                            </View>
                            <View className="w-8 h-8 rounded-full bg-primary/5 items-center justify-center">
                              <ChevronRight size={18} color="#4f378a" />
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </BentoCard>
              </MotiView>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
