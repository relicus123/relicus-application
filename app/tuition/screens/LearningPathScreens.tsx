import React from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { TuitionView, TuitionNavContext } from "../types";
import { supabase } from "../../../lib/supabase";
import { Typography } from "../../../components/Typography";
import { BentoCard } from "../../../components/BentoCard";
import { IconButton } from "../../../components/IconButton";
import { ArrowLeft, Clock, BookOpen, CheckCircle, Circle } from "lucide-react-native";
import { Button } from "../../../components/Button";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function LearningPath({ onNavigate, onBack }: ScreenProps) {
  const [classes, setClasses] = React.useState<any[]>([]);
  const [syllabus, setSyllabus] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      const [clsRes, sylRes] = await Promise.all([
        supabase.from('tuition_classes').select('*'),
        supabase.from('tuition_syllabus').select('*').order('chapterNumber', { ascending: true })
      ]);
      if (clsRes.data) setClasses(clsRes.data);
      if (sylRes.data) setSyllabus(sylRes.data);
    } catch (e) {}
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-surface-primary">
      <View className="flex-row items-center gap-4 px-6 pt-16 pb-6 bg-white border-b border-border-subtle shadow-sm z-10">
        <IconButton 
          icon={<ArrowLeft size={24} color="#1d1b20" />}
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
        <Typography variant="title" weight="bold" color="primary">Learning Path</Typography>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f378a" />}
      >
        <Typography variant="heading" weight="bold" color="primary" className="mb-4">Upcoming Classes</Typography>
        <View className="gap-4 mb-8">
          {classes.filter(c => c.status === "Upcoming").length > 0 ? (
            classes.filter(c => c.status === "Upcoming").map((cls) => (
              <BentoCard key={cls.id} variant="secondary" padding="md" className="flex-row justify-between items-center bg-white border border-border-subtle shadow-sm">
                <View className="flex-1 mr-4">
                  <Typography variant="body" weight="bold" color="primary">{cls.title}</Typography>
                  <View className="flex-row items-center mt-2 gap-2 opacity-80">
                    <BookOpen size={14} color="#4f378a" />
                    <Typography variant="caption" color="secondary" className="mr-2">{cls.subject}</Typography>
                    <Clock size={14} color="#4f378a" />
                    <Typography variant="caption" color="secondary">
                      {new Date(cls.startTime || cls.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </View>
                </View>
                <Button variant="primary" size="sm" onPress={() => {}}>Join</Button>
              </BentoCard>
            ))
          ) : (
            <Typography variant="caption" color="secondary" className="italic text-center py-4">No upcoming classes scheduled.</Typography>
          )}
        </View>

        <Typography variant="heading" weight="bold" color="primary" className="mb-6">Syllabus Roadmap</Typography>
        <View className="pl-2">
          {syllabus.map((topic, idx) => {
            const isCompleted = topic.status === "Completed";
            const isLast = idx === syllabus.length - 1;
            return (
              <View key={topic.id} className="flex-row mb-6 relative">
                <View className="items-center mr-4 z-10">
                  <View className="bg-surface-primary">
                    {isCompleted ? (
                      <CheckCircle size={24} color="#10B981" fill="#D1FAE5" />
                    ) : (
                      <Circle size={24} color="#9CA3AF" />
                    )}
                  </View>
                  {!isLast && (
                    <View className="absolute top-6 bottom-[-24px] w-0.5 bg-border-subtle z-0" />
                  )}
                </View>
                
                <View className="flex-1 bg-white border border-border-subtle rounded-xl p-4 shadow-sm -mt-2">
                  <Typography variant="body" weight="bold" color={isCompleted ? "primary" : "secondary"}>
                    Ch {topic.chapterNumber || idx + 1}: {topic.title}
                  </Typography>
                  <View className="flex-row justify-between items-center mt-2">
                    <Typography variant="caption" color="secondary" className="uppercase tracking-wider text-[10px]">
                      {topic.status}
                    </Typography>
                    <Typography variant="caption" weight="bold" className={isCompleted ? "text-emerald-600" : "text-slate-400"}>
                      {topic.progressPercent || 0}%
                    </Typography>
                  </View>
                  
                  {/* Progress bar */}
                  <View className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <View 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${topic.progressPercent || 0}%`,
                        backgroundColor: isCompleted ? "#10B981" : "#4f378a" 
                      }} 
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
