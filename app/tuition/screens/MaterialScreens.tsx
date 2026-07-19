import React from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { TuitionView, TuitionNavContext } from "../types";
import { supabase } from "../../../lib/supabase";
import { Typography } from "../../../components/Typography";
import { BentoCardPressable } from "../../../components/BentoCard";
import { IconButton } from "../../../components/IconButton";
import { ArrowLeft, Video, FileText, ChevronRight } from "lucide-react-native";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function MaterialLibrary({ onNavigate, onBack }: ScreenProps) {
  const [materials, setMaterials] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchMaterials = React.useCallback(async () => {
    try {
      const { data } = await supabase.from('tuition_materials').select('*');
      if (data) setMaterials(data);
    } catch (e) {}
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMaterials();
    }, [fetchMaterials])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMaterials();
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
        <Typography variant="title" weight="bold" color="primary">Study Materials</Typography>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f378a" />}
      >
        <View className="gap-4">
          {materials.map((mat) => (
            <BentoCardPressable 
              key={mat.id} 
              variant="secondary" 
              padding="md"
              className="flex-row items-center bg-white border border-border-subtle shadow-sm"
              onPress={() => {}} // Handle opening material
            >
              <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-4">
                {mat.type === "Video" ? (
                  <Video size={24} color="#4f378a" />
                ) : (
                  <FileText size={24} color="#4f378a" />
                )}
              </View>
              <View className="flex-1 mr-4">
                <Typography variant="body" weight="bold" color="primary">{mat.title}</Typography>
                <View className="flex-row items-center mt-1">
                  <Typography variant="caption" color="secondary" className="mr-2">{mat.subject}</Typography>
                  <View className="w-1 h-1 rounded-full bg-border-subtle mr-2" />
                  <Typography variant="caption" color="secondary">{mat.type} • {mat.size || mat.duration}</Typography>
                </View>
              </View>
              <ChevronRight size={20} color="#79747e" />
            </BentoCardPressable>
          ))}
          {materials.length === 0 && (
             <Typography variant="caption" color="secondary" className="italic text-center py-8">No materials found.</Typography>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
