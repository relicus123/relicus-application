import React from "react";
import { View, ScrollView, TouchableOpacity, Image, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { TuitionView, TuitionNavContext } from "../types";
import { supabase } from "../../../lib/supabase";
import { Typography } from "../../../components/Typography";
import { BentoCard } from "../../../components/BentoCard";
import { IconButton } from "../../../components/IconButton";
import { ArrowLeft, MessageCircle, Star } from "lucide-react-native";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function TeacherHub({ onNavigate, onBack }: ScreenProps) {
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchTeachers = React.useCallback(async () => {
    try {
      const { data } = await supabase.from('tuition_teachers').select('*');
      if (data) setTeachers(data);
    } catch (e) {}
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTeachers();
    }, [fetchTeachers])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeachers();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-surface-primary">
      <View className="flex-row items-center gap-4 px-6 pt-16 pb-6 bg-white border-b border-border-subtle">
        <IconButton 
          icon={<ArrowLeft size={24} color="#1d1b20" />}
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
        <Typography variant="title" weight="bold" color="primary">My Teachers</Typography>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f378a" />}
      >
        <View className="gap-4">
          {teachers.map((teacher) => (
            <BentoCard key={teacher.id} variant="secondary" className="flex-row items-center border border-border-subtle bg-white p-4">
              <Image source={{ uri: teacher.avatar }} className="w-14 h-14 rounded-full bg-slate-200 mr-4" />
              <View className="flex-1">
                <Typography variant="body" weight="bold" color="primary">{teacher.name}</Typography>
                <Typography variant="caption" color="secondary" className="mt-0.5">{teacher.subjects.join(", ")}</Typography>
                <View className="flex-row items-center mt-2 gap-2">
                  <View className="flex-row items-center bg-orange-100 px-2 py-0.5 rounded">
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Typography variant="caption" weight="bold" className="text-orange-600 ml-1">{teacher.rating}</Typography>
                  </View>
                  <Typography variant="caption" color="secondary">• {teacher.experienceYears} Yrs Exp</Typography>
                </View>
              </View>
              <IconButton 
                icon={<MessageCircle size={20} color="#4f378a" />}
                variant="flat"
                className="bg-primary/10 border-primary/20 ml-2"
                onPress={() => onNavigate("teacherChat", { selectedTeacherId: teacher.id })}
              />
            </BentoCard>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function TeacherChat({ context, onBack }: ScreenProps) {
  const [teacher, setTeacher] = React.useState<any>(null);
  React.useEffect(() => {
    async function fetchTeacher() {
      if (context.selectedTeacherId) {
        const { data } = await supabase.from('tuition_teachers').select('*').eq('id', context.selectedTeacherId).single();
        if (data) setTeacher(data);
      }
    }
    fetchTeacher();
  }, [context.selectedTeacherId]);

  return (
    <View className="flex-1 bg-surface-primary">
      <View className="flex-row items-center gap-4 px-6 pt-16 pb-6 bg-white border-b border-border-subtle shadow-sm z-10">
        <IconButton 
          icon={<ArrowLeft size={24} color="#1d1b20" />}
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
        <View className="flex-1 flex-row items-center gap-3">
          {teacher?.avatar && <Image source={{ uri: teacher.avatar }} className="w-10 h-10 rounded-full" />}
          <View>
            <Typography variant="body" weight="bold" color="primary">{teacher?.name || "Teacher"}</Typography>
            <Typography variant="caption" color="secondary">Online</Typography>
          </View>
        </View>
      </View>
      
      <View className="flex-1 justify-center items-center bg-[#F9FAFB]">
        <Typography color="secondary" className="italic opacity-60">Chat interface mockup goes here...</Typography>
      </View>
    </View>
  );
}
