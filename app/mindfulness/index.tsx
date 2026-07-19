import React, { useState, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MotiView } from "moti";
import { Wind, Heart, Activity, BookOpen, Smile, CheckSquare, Play, Pause, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { Typography } from "../../components/Typography";
import { BentoCard } from "../../components/BentoCard";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";
import { useMindfulnessStore } from "../../store/mindfulness.store";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Mindfulness() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [moodText, setMoodText] = useState("");

  const [activities, setActivities] = useState<any[]>([]);
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [todoItems, setTodoItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const store = useMindfulnessStore();

  const fetchData = useCallback(async () => {
    try {
      const [actsRes, affsRes, tasksRes] = await Promise.all([
        supabase.from("mindfulness_activities").select("*"),
        supabase.from("mindfulness_affirmations").select("*"),
        supabase.from("mindfulness_tasks").select("*")
      ]);

      if (actsRes.data) {
        setActivities(actsRes.data.map((a: any) => {
          const iconMatch = a.icon_type;
          const icon = iconMatch === "Wind" ? Wind : iconMatch === "Heart" ? Heart : Activity;
          let colors = ["#a584ef", "#d3c3f7"];
          if (a.gradient) {
            const matched = a.gradient.match(/\[(.*?)\]/g);
            if (matched && matched.length >= 2) {
              colors = [matched[0].replace(/[\[\]]/g, ''), matched[1].replace(/[\[\]]/g, '')];
            }
          }
          return {
            title: a.title,
            icon: icon,
            description: a.description || "Guided session",
            duration: a.duration ? `${a.duration} min` : "5 min",
            colors: colors,
          };
        }));
      }

      if (affsRes.data) {
        setAffirmations(affsRes.data.map((a: any) => a.text));
      }

      if (tasksRes.data) {
        setTodoItems(tasksRes.data.map((t: any) => ({
          id: t.id,
          text: t.title,
          completed: false
        })));
      }
      
      await store.fetchMindfulnessData();
    } catch (error) {
      console.error("Error fetching mindfulness data:", error);
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

  const toggleTodo = (id: string | number) => {
    setTodoItems(items => items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  return (
    <View className="flex-1 bg-surface-primary">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f378a" />}
      >
        <LinearGradient
          colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-12 pt-10 rounded-b-[40px]"
        >
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center gap-4 mb-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/40 items-center justify-center border border-white/50"
                activeOpacity={0.7}
              >
                <ArrowLeft color="#4f378a" size={20} />
              </TouchableOpacity>
              <Typography variant="heading" weight="bold" color="primary">Mindfulness</Typography>
            </View>
            <Typography variant="body" color="secondary" className="ml-14">
              Find your inner peace
            </Typography>
          </SafeAreaView>
        </LinearGradient>

        <View className="px-6 -mt-6 gap-5">
          {/* Audio Player Card */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-sm flex-row items-center">
              <View className="flex-1">
                <Typography variant="caption" color="secondary" className="mb-1">Currently Playing</Typography>
                <Typography variant="title" weight="bold" color="primary" className="mb-3">Ocean Waves</Typography>
                <View className="flex-row items-center gap-2 pr-4">
                  <Typography variant="caption" color="secondary" className="text-[10px]">12:34</Typography>
                  <View className="flex-1 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <View className="w-1/2 h-full bg-primary rounded-full" />
                  </View>
                  <Typography variant="caption" color="secondary" className="text-[10px]">20:00</Typography>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full overflow-hidden shadow-sm border border-white/20"
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#4f378a", "#6b4fa3"]}
                  className="flex-1 items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause color="white" size={24} fill="white" />
                  ) : (
                    <Play color="white" size={24} fill="white" className="ml-1" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </BentoCard>
          </MotiView>

          {/* Daily Activities */}
          <View className="gap-3">
            <Typography variant="title" weight="bold" color="primary" className="px-1">Daily Activities</Typography>
            <View className="gap-3">
              {activities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <MotiView
                    key={activity.title}
                    from={{ opacity: 0, translateY: 15 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: index * 100 }}
                    className="rounded-[24px] overflow-hidden shadow-sm"
                  >
                    <LinearGradient
                      colors={["#f4effa", "#e9ddff"]}
                      className="p-4 border border-border-subtle"
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-12 h-12 bg-white/60 rounded-[16px] items-center justify-center border border-white/40">
                          <Icon color="#4f378a" size={22} />
                        </View>
                        <View className="flex-1">
                          <Typography variant="body" weight="bold" color="primary">
                            {activity.title}
                          </Typography>
                          <Typography variant="caption" color="secondary" className="mt-0.5 opacity-80">
                            {activity.description}
                          </Typography>
                        </View>
                        <View className="bg-white/80 px-3 py-1.5 rounded-full border border-border-subtle">
                          <Typography variant="caption" weight="bold" color="primary">
                            {activity.duration}
                          </Typography>
                        </View>
                      </View>
                    </LinearGradient>
                  </MotiView>
                );
              })}
            </View>
          </View>

          {/* Daily Affirmations */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 350 }}
          >
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-sm">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                  <Smile color="#4f378a" size={18} />
                </View>
                <Typography variant="body" weight="bold" color="primary">Daily Affirmations</Typography>
              </View>
              <View className="gap-2.5">
                {affirmations.map((affirmation, index) => (
                  <View key={index} className="p-3 bg-surface-secondary rounded-xl border border-border-subtle">
                    <Typography variant="caption" weight="bold" color="primary" className="text-center text-[#4f378a]">
                      "{affirmation}"
                    </Typography>
                  </View>
                ))}
              </View>
            </BentoCard>
          </MotiView>

          {/* Mood Journal */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 450 }}
          >
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-sm">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                  <BookOpen color="#4f378a" size={18} />
                </View>
                <Typography variant="body" weight="bold" color="primary">Mood Journal</Typography>
              </View>
              <TextInput
                value={moodText}
                onChangeText={setMoodText}
                placeholder="How are you feeling today?"
                placeholderTextColor="#79747e"
                multiline
                numberOfLines={4}
                className="bg-surface-secondary border-2 border-border-subtle rounded-2xl p-4 min-h-[100px] text-[15px] text-[#1d1b20] mb-3 font-sans text-left align-top"
              />
              <Button
                onPress={async () => {
                  if (!moodText.trim()) return;
                  await store.addJournalEntry({
                    content: moodText,
                    mood: "neutral"
                  });
                  setMoodText("");
                  alert("Journal entry saved successfully!");
                }}
                variant="primary"
                className="w-full"
              >
                Save Entry
              </Button>
            </BentoCard>
          </MotiView>

          {/* Today's Tasks */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 550 }}
          >
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-sm mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                    <CheckSquare color="#4f378a" size={18} />
                  </View>
                  <Typography variant="body" weight="bold" color="primary">Today's Tasks</Typography>
                </View>
                <View className="bg-primary/10 px-2 py-1 rounded-full">
                  <Typography variant="caption" weight="bold" color="primary">
                    {todoItems.filter((i) => i.completed).length}/{todoItems.length}
                  </Typography>
                </View>
              </View>

              <View className="gap-3">
                {todoItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="flex-row items-center p-3 bg-surface-secondary rounded-xl border border-border-subtle gap-3"
                    activeOpacity={0.7}
                    onPress={() => toggleTodo(item.id)}
                  >
                    <View className={twMerge(clsx(
                      "w-5 h-5 rounded-[6px] border-2 flex items-center justify-center",
                      item.completed ? "bg-primary border-primary" : "border-[#4f378a]"
                    ))}>
                      {item.completed && <CheckSquare color="white" size={12} />}
                    </View>
                    <Typography 
                      variant="caption" 
                      weight={item.completed ? "medium" : "bold"}
                      color={item.completed ? "secondary" : "primary"}
                      className={twMerge(clsx("flex-1", item.completed && "line-through opacity-70"))}
                    >
                      {item.text}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </BentoCard>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
}
