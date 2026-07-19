import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { MotiView } from "moti";
import {
  ArrowLeft,
  Search,
  Bookmark,
  MapPin,
  Award,
  Scale,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useKnowNextStore } from "../../../store/knownext.store";
import { supabase } from "../../../lib/supabase";
import { College, CareerStage, KnowNextView, NavContext } from "../types";
import { CareerStageFilter, CompareDrawer } from "./ExplorerScreens";

import { Typography } from "../../../components/Typography";
import { BentoCard, BentoCardPressable } from "../../../components/BentoCard";
import { IconButton } from "../../../components/IconButton";
import { Button } from "../../../components/Button";

const { width } = Dimensions.get("window");
const TYPES = ["All", "Government", "Private", "Deemed", "Autonomous"] as const;

// ── College Card Sub-Component ───────────────────────
interface CollegeCardProps {
  college: College;
  onSelect: (college: College) => void;
}

export function CollegeCard({ college, onSelect }: CollegeCardProps) {
  const { savedCollegeIds, toggleSaveCollege, compareCollegeIds, toggleCompareCollege } = useKnowNextStore();
  const isSaved = savedCollegeIds.includes(college.id);
  const isComparing = compareCollegeIds.includes(college.id);

  return (
    <BentoCardPressable
      activeOpacity={0.9}
      onPress={() => onSelect(college)}
      variant="secondary"
      className="bg-white border border-border-subtle shadow-sm mb-3 p-4"
    >
      <View className="flex-row gap-3">
        <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
          <Typography className="text-2xl">{college.icon || "🏛️"}</Typography>
        </View>
        <View className="flex-1">
          <Typography variant="caption" weight="bold" color="secondary" className="mb-0.5">{college.type} College</Typography>
          <Typography variant="body" weight="bold" color="primary">{college.name}</Typography>
          <View className="flex-row items-center gap-1 mt-1">
            <MapPin size={12} color="#4f378a" />
            <Typography variant="caption" color="secondary">{college.location}, {college.state}</Typography>
          </View>
        </View>
      </View>

      <View className="flex-row gap-2 mt-3">
        <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-1 rounded">
          <Award size={12} color="#b45309" />
          <Typography variant="caption" weight="bold" className="text-amber-700">NIRF Rank #{college.ranking}</Typography>
        </View>
        <View className="flex-row items-center gap-1 bg-slate-100 px-2 py-1 rounded">
          <Typography variant="caption" weight="bold" className="text-slate-700">
            ₹{(college.feeRange.min / 100000).toFixed(1)}-{(college.feeRange.max / 100000).toFixed(1)}L/yr
          </Typography>
        </View>
      </View>

      <View className="h-px bg-border-subtle my-3" />

      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={() => toggleSaveCollege(college.id)}
          className="flex-row items-center gap-1.5 p-1"
        >
          <Bookmark size={16} color={isSaved ? "#4f378a" : "#79747e"} fill={isSaved ? "#4f378a" : "transparent"} />
          <Typography variant="caption" weight="bold" className={isSaved ? "text-[#4f378a]" : "text-slate-500"}>
            {isSaved ? "Saved" : "Save"}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleCompareCollege(college.id)}
          className="flex-row items-center gap-1.5 p-1"
        >
          <Scale size={16} color={isComparing ? "#4f378a" : "#79747e"} />
          <Typography variant="caption" weight="bold" className={isComparing ? "text-[#4f378a]" : "text-slate-500"}>
            {isComparing ? "Added" : "Compare"}
          </Typography>
        </TouchableOpacity>
      </View>
    </BentoCardPressable>
  );
}

// ── 1. College Explorer ──────────────────────────────
interface CollegeExplorerProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const CollegeExplorer: React.FC<CollegeExplorerProps> = ({ onNavigate, onBack }) => {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const { activeStage, compareCollegeIds, clearCollegeComparison } = useKnowNextStore();

  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchColleges = React.useCallback(async () => {
    try {
      const { data } = await supabase.from('knownext_colleges').select('*');
      if (data) setColleges(data);
    } catch (e) {} finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchColleges();
    }, [fetchColleges])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchColleges();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      const matchesQuery =
        query.trim().length < 2 ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.shortName.toLowerCase().includes(query.toLowerCase()) ||
        c.location.toLowerCase().includes(query.toLowerCase());
      const matchesType = selectedType === "All" || c.type === selectedType;
      const applicableStages = Array.isArray(c.applicableStages) ? c.applicableStages : JSON.parse(c.applicableStages || '[]');
      const matchesStage = activeStage === "all" || applicableStages.includes(activeStage as CareerStage);
      return matchesQuery && matchesType && matchesStage;
    }).sort((a, b) => a.ranking - b.ranking);
  }, [query, selectedType, activeStage, colleges]);

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#4f378a", "#6750a4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-6 pt-16 rounded-b-[40px] shadow-sm z-10"
      >
        <SafeAreaView edges={["top"]} className="gap-4">
          <View className="flex-row items-center gap-3">
            <IconButton 
              icon={<ArrowLeft color="#FFF" size={24} />} 
              variant="ghost" 
              size="sm" 
              onPress={onBack} 
            />
            <View>
              <Typography variant="title" weight="bold" className="text-white">Colleges & Universities</Typography>
              <Typography variant="caption" className="text-white/80">{colleges.length} institutions</Typography>
            </View>
          </View>

          <View className="flex-row items-center bg-white/20 rounded-2xl px-4 h-12 gap-2 border border-white/30">
            <Search color="#FFF" size={18} />
            <TextInput
              placeholder="Search colleges, cities..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={query}
              onChangeText={setQuery}
              className="flex-1 text-white"
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View className="py-4 bg-white border-b border-border-subtle shadow-sm z-0">
        <CareerStageFilter />
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f378a" />}
      >
        {/* Type horizontal selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
          {TYPES.map((type) => {
            const active = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full mr-2 border ${active ? "bg-[#e8def8] border-[#e8def8]" : "bg-white border-border-subtle"}`}
              >
                <Typography variant="caption" weight="bold" className={active ? "text-[#1d192b]" : "text-slate-600"}>
                  {type}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Typography variant="caption" weight="bold" color="primary" className="mb-4 uppercase tracking-wider">
          {filtered.length} colleges found
        </Typography>

        {filtered.map((college, index) => (
          <MotiView
            key={college.id}
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: Math.min(index * 50, 300) }}
          >
            <CollegeCard
              college={college}
              onSelect={(c) => onNavigate("collegeDetails", { selectedCollegeId: c.id })}
            />
          </MotiView>
        ))}

        {filtered.length === 0 && (
          <View className="py-12 items-center justify-center">
            <Typography variant="body" color="secondary">No colleges matching selection found.</Typography>
          </View>
        )}
      </ScrollView>

      <CompareDrawer
        count={compareCollegeIds.length}
        onCompare={() => onNavigate("collegeComparison")}
        onClear={clearCollegeComparison}
      />
    </View>
  );
};

// ── 2. College Details ───────────────────────────────
interface CollegeDetailsProps {
  collegeId?: string;
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const CollegeDetails: React.FC<CollegeDetailsProps> = ({ collegeId, onNavigate, onBack }) => {
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchCollege() {
      if (!collegeId) return;
      try {
        const { data } = await supabase.from('knownext_colleges').select('*').eq('id', collegeId).single();
        if (data) setCollege(data);
      } catch (e) {} finally {
        setLoading(false);
      }
    }
    fetchCollege();
  }, [collegeId]);

  const { savedCollegeIds, toggleSaveCollege } = useKnowNextStore();
  const isSaved = savedCollegeIds.includes(college?.id || "");

  if (!college) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-primary p-6">
        <Typography variant="body" color="secondary" className="mb-4">College details not found.</Typography>
        <Button variant="primary" onPress={onBack}>Go Back</Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#4f378a", "#6750a4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-6 pt-16 rounded-b-[32px] shadow-sm z-10"
      >
        <View className="flex-row items-center gap-3">
          <IconButton 
            icon={<ArrowLeft color="#FFF" size={24} />} 
            variant="ghost" 
            size="sm" 
            onPress={onBack} 
          />
          <View className="flex-1">
            <Typography variant="title" weight="bold" className="text-white" numberOfLines={1}>{college.name}</Typography>
            <Typography variant="caption" className="text-white/80">{college.location}, {college.state}</Typography>
          </View>
          <IconButton 
            icon={<Bookmark color="#FFF" fill={isSaved ? "#FFF" : "transparent"} size={22} />}
            variant="ghost"
            onPress={() => toggleSaveCollege(college.id)}
          />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        {/* Info Box */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <Typography variant="heading" weight="bold" color="primary" className="mb-3">Institution Overview</Typography>
          <Typography variant="body" color="secondary" className="leading-relaxed mb-4">{college.overview}</Typography>

          <View className="flex-row gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <View className="flex-1">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px] mb-1">NIRF Ranking</Typography>
              <Typography variant="body" weight="bold" color="primary">#{college.ranking}</Typography>
            </View>
            <View className="flex-1">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px] mb-1">Fee Range</Typography>
              <Typography variant="body" weight="bold" color="primary">
                ₹{(college.feeRange.min / 100000).toFixed(1)}-{(college.feeRange.max / 100000).toFixed(1)}L/yr
              </Typography>
            </View>
          </View>
        </BentoCard>

        {/* Section Placements */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <Typography variant="heading" weight="bold" color="primary" className="mb-4">Placement Statistics</Typography>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Typography variant="caption" color="secondary" className="mb-1">Avg Package</Typography>
              <Typography variant="body" weight="bold" color="primary">₹{college.placementAvgPackage} LPA</Typography>
            </View>
            <View className="items-center">
              <Typography variant="caption" color="secondary" className="mb-1">Highest Package</Typography>
              <Typography variant="body" weight="bold" color="primary">₹{college.placementTopPackage} LPA</Typography>
            </View>
            <View className="items-center">
              <Typography variant="caption" color="secondary" className="mb-1">Placement Rate</Typography>
              <Typography variant="body" weight="bold" color="primary">{college.placementRate}%</Typography>
            </View>
          </View>
        </BentoCard>

        {/* Section: Admission & Exams */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <Typography variant="heading" weight="bold" color="primary" className="mb-4">Admission & Entrance Exams</Typography>
          
          <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px] mb-3">Accepted Entrance Exams</Typography>
          <View className="flex-row flex-wrap gap-2 mb-6">
          {(Array.isArray(college.entranceExamsAccepted) ? college.entranceExamsAccepted : JSON.parse(college.entranceExamsAccepted || '[]')).map((exam: string) => (
              <View key={exam} className="bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                <Typography variant="caption" weight="bold" color="primary">{exam}</Typography>
              </View>
            ))}
          </View>

          <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px] mb-3">Admission Steps</Typography>
          <View className="gap-2">
            {(Array.isArray(college.admissionProcess) ? college.admissionProcess : JSON.parse(college.admissionProcess || '[]')).map((step: string, idx: number) => (
              <View key={idx} className="flex-row gap-2">
                <Typography variant="body" color="primary" weight="bold">{idx + 1}.</Typography>
                <Typography variant="body" color="secondary" className="flex-1">{step}</Typography>
              </View>
            ))}
          </View>
        </BentoCard>

        {/* Section: Courses */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <Typography variant="heading" weight="bold" color="primary" className="mb-3">Courses Offered</Typography>
          <View className="gap-2">
            {(Array.isArray(college.coursesOffered) ? college.coursesOffered : JSON.parse(college.coursesOffered || '[]')).map((course: string) => (
              <View key={course} className="flex-row items-center gap-2">
                <Typography className="text-base">📚</Typography>
                <Typography variant="body" color="secondary" className="flex-1">{course}</Typography>
              </View>
            ))}
          </View>
        </BentoCard>

        {/* Section: Scholarships */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm">
          <Typography variant="heading" weight="bold" color="primary" className="mb-3">Scholarships & Aids</Typography>
          <Typography variant="body" color="secondary" className="leading-relaxed">
            {college.scholarshipsAvailable
              ? college.scholarshipDetails
              : "No specific college institutional scholarships listed. Feel free to explore general external scholarships in the Scholarships finder."}
          </Typography>
        </BentoCard>
      </ScrollView>
    </View>
  );
};

// ── 3. College Comparison ───────────────────────────
interface CollegeComparisonProps {
  compareIds: string[];
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
  onReset: (view: KnowNextView, context?: NavContext) => void;
}

export const CollegeComparison: React.FC<CollegeComparisonProps> = ({ compareIds, onNavigate, onBack, onReset }) => {
  const [colleges, setColleges] = useState<any[]>([]);
  React.useEffect(() => {
    async function fetchCompare() {
      if (compareIds.length === 0) return;
      try {
        const { data } = await supabase.from('knownext_colleges').select('*').in('id', compareIds);
        if (data) setColleges(data);
      } catch (e) {}
    }
    fetchCompare();
  }, [compareIds]);

  const { clearCollegeComparison } = useKnowNextStore();

  const handleClear = () => {
    clearCollegeComparison();
    onBack();
  };

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#4f378a", "#6750a4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-6 pt-16 rounded-b-[32px] shadow-sm z-10"
      >
        <View className="flex-row items-center gap-3">
          <IconButton 
            icon={<ArrowLeft color="#FFF" size={24} />} 
            variant="ghost" 
            size="sm" 
            onPress={onBack} 
          />
          <View className="flex-1">
            <Typography variant="title" weight="bold" className="text-white">Compare Colleges</Typography>
            <Typography variant="caption" className="text-white/80">{colleges.length} selected</Typography>
          </View>
          <TouchableOpacity onPress={handleClear}>
            <Typography variant="caption" weight="bold" className="text-white">Reset</Typography>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView horizontal contentContainerStyle={{ padding: 24 }}>
        <View className="w-24 mr-4 gap-y-4">
          <View className="h-16 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">College</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Type</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Ranking</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Rating</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Avg Package</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Max Package</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Placements %</Typography></View>
        </View>

        {colleges.map((college) => (
          <View key={college.id} className="w-40 mr-4 gap-y-4 bg-white rounded-2xl p-4 border border-border-subtle shadow-sm">
            <View className="h-16 justify-center border-b border-border-subtle">
              <Typography className="text-2xl mb-1">{college.icon || "🏛️"}</Typography>
              <Typography variant="body" weight="bold" color="primary" numberOfLines={1}>{college.shortName}</Typography>
            </View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" color="primary" numberOfLines={1}>{college.type}</Typography></View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" weight="bold" color="primary">NIRF #{college.ranking}</Typography></View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" color="primary">⭐ {college.rating}/5</Typography></View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" weight="bold" color="primary">₹{college.placementAvgPackage} LPA</Typography></View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" color="primary">₹{college.placementTopPackage} LPA</Typography></View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" color="primary">{college.placementRate}%</Typography></View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
