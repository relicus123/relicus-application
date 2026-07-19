import React from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { TuitionView, TuitionNavContext } from "../types";
import { supabase } from "../../../lib/supabase";
import { useTuitionStore } from "../../../store/tuition.store";
import { Typography } from "../../../components/Typography";
import { BentoCard } from "../../../components/BentoCard";
import { IconButton } from "../../../components/IconButton";
import { Button } from "../../../components/Button";
import { ArrowLeft, Clock, Award, FileText } from "lucide-react-native";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function AssessmentCentre({ onNavigate, onBack }: ScreenProps) {
  const submitAssessment = useTuitionStore((s) => s.submitAssessment);
  const [assessments, setAssessments] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchAssessments = React.useCallback(async () => {
    try {
      const { data } = await supabase.from('tuition_assessments').select('*');
      if (data) setAssessments(data);
    } catch (e) {}
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAssessments();
    }, [fetchAssessments])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssessments();
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
        <Typography variant="title" weight="bold" color="primary">Test Centre</Typography>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f378a" />}
      >
        {/* Pending Tests */}
        <Typography variant="heading" weight="bold" color="primary" className="mb-4">Pending Tests</Typography>
        <View className="gap-4 mb-8">
          {assessments.filter(a => a.status === "Pending").map((test) => (
            <BentoCard key={test.id} variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                  <Typography variant="body" weight="bold" color="primary">{test.title}</Typography>
                </View>
                <View className="bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                  <Typography variant="caption" weight="bold" className="text-blue-600 text-[10px] uppercase tracking-wider">{test.type}</Typography>
                </View>
              </View>
              
              <View className="flex-row items-center gap-3 mb-4 opacity-80">
                <View className="flex-row items-center gap-1.5">
                  <FileText size={14} color="#4f378a" />
                  <Typography variant="caption" color="secondary">{test.subject}</Typography>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Clock size={14} color="#4f378a" />
                  <Typography variant="caption" color="secondary">{test.durationMinutes} mins</Typography>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Award size={14} color="#4f378a" />
                  <Typography variant="caption" color="secondary">{test.totalMarks} marks</Typography>
                </View>
              </View>

              <View className="flex-row justify-between items-center mt-2 border-t border-border-subtle pt-4">
                <Typography variant="caption" weight="bold" className="text-red-500">
                  Due: {new Date(test.dueDate).toLocaleDateString()}
                </Typography>
                <Button 
                  size="sm" 
                  variant="primary"
                  onPress={() => submitAssessment(test.id, test.totalMarks * 0.9)} 
                >
                  Start Test
                </Button>
              </View>
            </BentoCard>
          ))}
          {assessments.filter(a => a.status === "Pending").length === 0 && (
             <Typography variant="caption" color="secondary" className="italic text-center py-4">No pending tests.</Typography>
          )}
        </View>

        {/* Analytics / Graded */}
        <Typography variant="heading" weight="bold" color="primary" className="mb-4">Completed Tests</Typography>
        <View className="gap-4">
          {assessments.filter(a => a.status === "Graded").map((test) => (
            <BentoCard key={test.id} variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm opacity-80">
              <View className="flex-row justify-between items-center mb-1">
                <Typography variant="body" weight="bold" color="primary" className="flex-1 mr-4">{test.title}</Typography>
                <Typography variant="body" weight="bold" className="text-emerald-600">
                  {test.score} <Typography variant="caption" color="secondary">/ {test.totalMarks}</Typography>
                </Typography>
              </View>
              <Typography variant="caption" color="secondary">{test.subject}</Typography>
            </BentoCard>
          ))}
          {assessments.filter(a => a.status === "Graded").length === 0 && (
             <Typography variant="caption" color="secondary" className="italic text-center py-4">No completed tests yet.</Typography>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
