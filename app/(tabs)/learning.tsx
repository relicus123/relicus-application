import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  GraduationCap,
  Search,
  X,
  Calendar,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCoachingStore } from "../../store/coaching.store";
import { useAuthStore } from "../../store/auth.store";
import { Typography } from "../../components/Typography";
import { BentoCard } from "../../components/BentoCard";
import { toTitleCase } from "../../constants/coaching/examFormatter";

export default function LearningScreen() {
  const router = useRouter();
  const {
    categories,
    exams,
    fetchCategoriesAndExams,
    setSelectedExam,
    isLoading,
    userAllowedCategoryIds,
    fetchUserCategoryAccess,
  } = useCoachingStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isAdmin = currentUser?.role === "admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchCategoriesAndExams();
      fetchUserCategoryAccess();
    }, [fetchCategoriesAndExams, fetchUserCategoryAccess])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCategoriesAndExams(true), fetchUserCategoryAccess()]);
    setRefreshing(false);
  };

  const toggleCategory = (id: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectExam = (examType: string) => {
    setSelectedExam(examType);
    router.push({
      pathname: "/coaching/exam-info" as any,
      params: { examType },
    });
  };

  // Filter real exams by search query if typed
  const filteredExams = useMemo(() => {
    if (!searchQuery.trim()) return exams;
    const q = searchQuery.toLowerCase().trim();
    return exams.filter((exam) => {
      const name = (exam.full_name || exam.id || "").toLowerCase();
      const tag = (exam.tagline || "").toLowerCase();
      return name.includes(q) || tag.includes(q);
    });
  }, [exams, searchQuery]);

  return (
    <View className="flex-1 bg-surface-primary">
      {/* Header Banner */}
      <LinearGradient
        colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-6 pt-3 rounded-b-[36px] shadow-sm"
      >
        <SafeAreaView edges={["top"]}>
          {/* Header Title */}
          <View className="flex-row items-center gap-3.5 mb-4">
            <View className="w-11 h-11 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20 shadow-xs">
              <GraduationCap color="#1C4966" size={24} strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Typography variant="title" weight="bold" color="primary" className="text-xl">
                Entrance Coaching
              </Typography>
              <Typography variant="caption" color="secondary" className="text-xs">
                Select an exam category to start preparation
              </Typography>
            </View>
          </View>

          {/* Search bar if there are exams */}
          {exams.length > 1 && (
            <View className="flex-row items-center bg-white rounded-2xl px-3.5 py-2.5 border border-border-subtle shadow-xs">
              <Search size={18} color="#71818B" className="mr-2.5" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search exams..."
                placeholderTextColor="#87959D"
                className="flex-1 text-sm text-text-primary py-0"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
                  <X size={16} color="#71818B" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* Main Categories & Exams List */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1C4966" />}
      >
        {isLoading && categories.length === 0 ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#1C4966" />
            <Typography color="secondary" className="mt-4 text-sm">Loading Categories...</Typography>
          </View>
        ) : categories.length === 0 ? (
          <View className="py-12 items-center px-4">
            <Typography color="secondary" className="text-center text-sm">
              No exam categories found. Add categories from the Admin Panel.
            </Typography>
          </View>
        ) : (
          <View className="gap-3.5">
            {categories.map((category, index) => {
              if (category.id === "dfssdf" || category.id === "sdfa") return null;
              const isCollapsed = collapsedCategories[category.id] ?? false;
              const categoryExams = filteredExams.filter((e) => e.category_id === category.id);
              const isCategoryUnlocked = isAdmin || userAllowedCategoryIds.includes(category.id);

              if (categoryExams.length === 0 && searchQuery) return null;

              return (
                <MotiView
                  key={category.id}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 50 }}
                >
                  <BentoCard variant="primary" padding="none" className="overflow-hidden border border-border-subtle bg-white shadow-xs">
                    {/* Category Accordion Header */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => toggleCategory(category.id)}
                      className="flex-row items-center p-4 bg-surface-secondary/50 border-b border-border-subtle/60"
                    >
                      <View className="w-10 h-10 items-center justify-center bg-white rounded-xl shadow-2xs border border-border-subtle mr-3">
                        <Typography className="text-xl">{category.icon || "📚"}</Typography>
                      </View>
                      <View className="flex-1">
                        <Typography weight="bold" color="primary" className="text-base">
                          {category.title}
                        </Typography>
                        <Typography variant="caption" color="secondary" numberOfLines={1} className="text-xs">
                          {category.description}
                        </Typography>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        {isCategoryUnlocked ? (
                          <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-row items-center">
                            <Typography variant="caption" weight="bold" className="text-[10px] text-emerald-700">
                              Unlocked 🔓
                            </Typography>
                          </View>
                        ) : (
                          <View className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-row items-center">
                            <Typography variant="caption" weight="bold" className="text-[10px] text-amber-700">
                              Demo 🎬
                            </Typography>
                          </View>
                        )}
                        <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                          <Typography variant="caption" weight="bold" color="primary" className="text-[10px]">
                            {categoryExams.length} {categoryExams.length === 1 ? "Exam" : "Exams"}
                          </Typography>
                        </View>
                        {isCollapsed ? (
                          <ChevronDown size={18} color="#71818B" />
                        ) : (
                          <ChevronUp size={18} color="#71818B" />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Category Exam Items */}
                    {!isCollapsed && (
                      <View className="p-3.5 gap-2.5 bg-white">
                        {categoryExams.length === 0 ? (
                          <View className="py-4 items-center">
                            <Typography variant="caption" color="secondary">
                              No exams added under this category yet.
                            </Typography>
                          </View>
                        ) : (
                          categoryExams.map((exam) => {
                            const examType = exam.id;
                            const cleanTitle = toTitleCase(exam.full_name || exam.id);
                            const tagline = exam.tagline?.trim();

                            return (
                              <TouchableOpacity
                                key={examType}
                                activeOpacity={0.75}
                                onPress={() => handleSelectExam(examType)}
                                className="p-3.5 rounded-2xl border border-border-subtle bg-surface-primary/60 hover:bg-surface-primary"
                              >
                                <View className="flex-row items-start justify-between">
                                  <View className="flex-1 mr-3">
                                    {/* Exam Code Badge */}
                                    <View className="flex-row items-center gap-2 mb-1.5 flex-wrap">
                                      <View className="bg-primary/10 px-2.5 py-0.5 rounded-md">
                                        <Typography variant="caption" weight="bold" color="primary" className="text-xs">
                                          {exam.id}
                                        </Typography>
                                      </View>
                                      {exam.next_exam_date && (
                                        <View className="flex-row items-center gap-1 bg-surface-secondary px-2 py-0.5 rounded-md border border-border-subtle">
                                          <Calendar size={10} color="#71818B" />
                                          <Typography variant="caption" color="secondary" className="text-[10px]">
                                            Target: {exam.next_exam_date}
                                          </Typography>
                                        </View>
                                      )}
                                    </View>

                                    {/* Clean Title Case (Not shouty all-caps!) */}
                                    <Typography weight="bold" color="primary" className="text-base leading-snug mb-1">
                                      {cleanTitle}
                                    </Typography>

                                    {/* Tagline */}
                                    {tagline ? (
                                      <Typography variant="caption" color="secondary" numberOfLines={2} className="text-xs leading-relaxed">
                                        {tagline}
                                      </Typography>
                                    ) : null}
                                  </View>

                                  {/* Right Chevron */}
                                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mt-1">
                                    <ChevronRight size={16} color="#1C4966" />
                                  </View>
                                </View>
                              </TouchableOpacity>
                            );
                          })
                        )}
                      </View>
                    )}
                  </BentoCard>
                </MotiView>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
