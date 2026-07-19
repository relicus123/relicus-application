import React from "react";
import { View, ScrollView, TextInput } from "react-native";
import { TuitionView, TuitionNavContext } from "../types";
import { Typography } from "../../../components/Typography";
import { IconButton } from "../../../components/IconButton";
import { ArrowLeft, Sparkles, Send } from "lucide-react-native";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function AIAssistant({ onBack }: ScreenProps) {
  return (
    <View className="flex-1 bg-surface-primary">
      <View className="flex-row items-center gap-4 px-6 pt-16 pb-6 bg-white border-b border-border-subtle shadow-sm z-10">
        <IconButton 
          icon={<ArrowLeft size={24} color="#1d1b20" />}
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
        <View className="flex-row items-center gap-2">
          <Sparkles size={20} color="#4f378a" />
          <Typography variant="title" weight="bold" color="primary">AI Tutor</Typography>
        </View>
      </View>
      
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
      >
        <View className="bg-primary/10 p-4 rounded-2xl rounded-tl-sm max-w-[85%] self-start border border-primary/20 shadow-sm">
          <Typography variant="body" color="primary">
            Hi there! I am your AI Tutor. Need help understanding a concept or solving a problem?
          </Typography>
        </View>
      </ScrollView>
      
      <View className="flex-row items-center p-4 bg-white border-t border-border-subtle shadow-lg">
        <TextInput 
          className="flex-1 bg-surface-primary px-4 py-3 rounded-full border border-border-subtle text-[#1d1b20] mr-3"
          placeholder="Ask a question..." 
          placeholderTextColor="#79747e" 
        />
        <IconButton 
          icon={<Send size={20} color="#FFF" className="ml-1" />}
          variant="flat"
          className="w-12 h-12 bg-[#4f378a]"
          onPress={() => {}}
        />
      </View>
    </View>
  );
}
