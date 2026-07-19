import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Search,
  Star,
  Activity,
  X,
  Calendar,
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";

import { useKnowNextStore } from "../../../store/knownext.store";
import { supabase } from "../../../lib/supabase";
import { Industry, CareerStage, KnowNextView, NavContext } from "../types";
import { CareerStageFilter } from "./ExplorerScreens";
import { Typography } from "../../../components/Typography";
import { BentoCard, BentoCardPressable } from "../../../components/BentoCard";
import { IconButton } from "../../../components/IconButton";
import { Button } from "../../../components/Button";

const { width } = Dimensions.get("window");
const ROADMAPS = [] as any[];
const INDUSTRIES = [] as any[];

// ── Global Search Sub-Component ─────────────────────
interface GlobalSearchProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
}

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  React.useEffect(() => {
    async function doSearch() {
      if (query.trim().length < 2) { setResults([]); return; }
      try {
        const [carRes, colRes, schRes] = await Promise.all([
          supabase.from('knownext_careers').select('id, title, category').ilike('title', `%${query}%`).limit(3),
          supabase.from('knownext_colleges').select('id, name, location').ilike('name', `%${query}%`).limit(3),
          supabase.from('knownext_scholarships').select('id, name, provider').ilike('name', `%${query}%`).limit(3)
        ]);
        const careers = (carRes.data || []).map((c: any) => ({ id: c.id, title: c.title, type: 'career', subtitle: c.category, icon: '🧬' }));
        const colleges = (colRes.data || []).map((c: any) => ({ id: c.id, title: c.name, type: 'college', subtitle: c.location, icon: '🏛️' }));
        const scholarships = (schRes.data || []).map((s: any) => ({ id: s.id, title: s.name, type: 'scholarship', subtitle: s.provider, icon: '🎓' }));
        setResults([...careers, ...colleges, ...scholarships]);
      } catch(e) {}
    }
    doSearch();
  }, [query]);

  const handleSelect = (item: any) => {
    setModalVisible(false);
    setQuery("");
    if (item.type === "career") {
      onNavigate("careerDetails", { selectedCareerId: item.id });
    } else if (item.type === "college") {
      onNavigate("collegeDetails", { selectedCollegeId: item.id });
    } else if (item.type === "scholarship") {
      onNavigate("scholarshipDetails", { selectedScholarshipId: item.id });
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-row items-center bg-white/20 rounded-2xl mt-4 px-4 h-12 gap-2 border border-white/30"
      >
        <Search color="#FFF" size={20} />
        <Typography variant="body" className="text-white/80">Search careers, colleges...</Typography>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-surface-primary">
          <View className="flex-row items-center p-4 border-b border-border-subtle gap-3">
            <IconButton 
              icon={<ArrowLeft color="#1d1b20" size={24} />} 
              variant="ghost" 
              size="sm" 
              onPress={() => setModalVisible(false)} 
            />
            <TextInput
              placeholder="Type to search..."
              placeholderTextColor="#79747e"
              value={query}
              onChangeText={setQuery}
              autoFocus
              className="flex-1 h-10 text-base text-[#1d1b20]"
            />
            {query.length > 0 && (
              <IconButton 
                icon={<X color="#49454f" size={20} />} 
                variant="ghost" 
                size="sm" 
                onPress={() => setQuery("")} 
              />
            )}
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {results.length > 0 ? (
              results.map((item) => (
                <TouchableOpacity
                  key={`${item.type}-${item.id}`}
                  onPress={() => handleSelect(item)}
                  className="flex-row items-center py-3 border-b border-border-subtle gap-3"
                >
                  <Typography className="text-[22px]">{item.icon}</Typography>
                  <View className="flex-1">
                    <Typography variant="body" weight="bold" color="primary">{item.title}</Typography>
                    <Typography variant="caption" color="secondary" className="mt-0.5 uppercase tracking-wider text-[10px]">
                      {item.type} • {item.subtitle}
                    </Typography>
                  </View>
                </TouchableOpacity>
              ))
            ) : query.length >= 2 ? (
              <Typography variant="body" color="secondary" className="text-center mt-10">No results matching "{query}" found.</Typography>
            ) : (
              <Typography variant="body" color="secondary" className="text-center mt-10">Start typing to search across all services...</Typography>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ── 1. LandingHub ──────────────────────────────────
interface LandingHubProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const LandingHub: React.FC<LandingHubProps> = ({ onNavigate, onBack }) => {
  const { savedCareerIds, savedCollegeIds, savedScholarshipIds, recentActivity } = useKnowNextStore();
  const totalSaved = savedCareerIds.length + savedCollegeIds.length + savedScholarshipIds.length;

  const [stats, setStats] = useState([
    { label: "Careers", value: 0, icon: "🧬" },
    { label: "Colleges", value: 0, icon: "🏛️" },
    { label: "Scholarships", value: 0, icon: "🎓" },
    { label: "Roadmaps", value: 0, icon: "🗺️" },
  ]);

  React.useEffect(() => {
    async function fetchStats() {
      const [c, col, s] = await Promise.all([
        supabase.from('knownext_careers').select('id', { count: 'exact', head: true }),
        supabase.from('knownext_colleges').select('id', { count: 'exact', head: true }),
        supabase.from('knownext_scholarships').select('id', { count: 'exact', head: true })
      ]);
      setStats([
        { label: "Careers", value: c.count || 0, icon: "🧬" },
        { label: "Colleges", value: col.count || 0, icon: "🏛️" },
        { label: "Scholarships", value: s.count || 0, icon: "🎓" },
        { label: "Roadmaps", value: ROADMAPS.length, icon: "🗺️" },
      ]);
    }
    fetchStats();
  }, []);

  const categories = [
    { id: "careerExplorer", label: "Career Explorer", desc: "Discover career paths", icon: "🧭", color: ["#F0F7FF", "#EDF5FE"] },
    { id: "careerRoadmaps", label: "Career Roadmaps", desc: "Learning roadmap paths", icon: "🗺️", color: ["#FAF5FF", "#F5EEFE"] },
    { id: "colleges", label: "Colleges & Universities", desc: "Browse admissions info", icon: "🏛️", color: ["#ECFDF5", "#EBFBF2"] },
    { id: "scholarships", label: "Scholarships", desc: "Find college aids", icon: "🎓", color: ["#FFF7ED", "#FFF1E5"] },
    { id: "industryInsights", label: "Industry Insights", desc: "Browse job trends", icon: "📊", color: ["#F0FDFA", "#E6F9F9"] },
    { id: "careerPlan", label: "My Career Plan", desc: "Goal tracker workspace", icon: "⭐", color: ["#FFFDF0", "#FFFBE6"] },
  ];

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#4f378a", "#6750a4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-16 rounded-b-[40px] shadow-sm"
      >
        <SafeAreaView edges={["top"]} className="gap-2">
          <View className="flex-row items-center gap-3">
            <IconButton 
              icon={<ArrowLeft color="#FFF" size={24} />} 
              variant="ghost" 
              size="sm" 
              onPress={onBack} 
            />
            <View>
              <Typography variant="caption" className="text-white/80">Relicus Guidance</Typography>
              <Typography variant="title" weight="bold" className="text-white">KnowNext</Typography>
            </View>
          </View>
          <GlobalSearch onNavigate={onNavigate} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        {/* Stats Grid */}
        <View className="flex-row gap-2 mb-6">
          {stats.map((stat) => (
            <BentoCard key={stat.label} variant="secondary" className="flex-1 p-3 items-center justify-center bg-white border border-border-subtle shadow-sm">
              <Typography className="text-lg">{stat.icon}</Typography>
              <Typography variant="body" weight="bold" color="primary" className="mt-1">{stat.value}</Typography>
              <Typography variant="caption" color="secondary" className="text-[10px] text-center">{stat.label}</Typography>
            </BentoCard>
          ))}
        </View>

        {/* Global Stage Filter */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-6">
          <Typography variant="body" weight="bold" color="primary" className="mb-3">I want to explore paths suitable for:</Typography>
          <CareerStageFilter />
        </BentoCard>

        {/* Saved Summary Alert */}
        {totalSaved > 0 && (
          <BentoCardPressable 
            variant="secondary" 
            padding="md"
            className="flex-row items-center bg-[#FFFDF0] border border-[#FFFBE6] shadow-sm mb-6 gap-3"
            onPress={() => onNavigate("careerPlan")}
          >
            <View className="w-10 h-10 rounded-xl bg-orange-100 items-center justify-center">
              <Star size={20} color="#F59E0B" fill="#F59E0B" />
            </View>
            <View className="flex-1">
              <Typography variant="body" weight="bold" className="text-orange-900">My Career Plan Workspace</Typography>
              <Typography variant="caption" className="text-orange-700 mt-0.5">You have {totalSaved} saved items to plan & track.</Typography>
            </View>
            <ChevronRight size={20} color="#F59E0B" />
          </BentoCardPressable>
        )}

        {/* Explore Categories Grid */}
        <Typography variant="heading" weight="bold" color="primary" className="mb-4">Explore Pathways</Typography>
        <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() => onNavigate(cat.id as KnowNextView)}
              style={{ width: (width - 48 - 12) / 2 }}
            >
              <LinearGradient colors={cat.color as [string, string]} className="p-4 min-h-[120px] rounded-2xl border border-border-subtle/50">
                <Typography className="text-[24px]">{cat.icon}</Typography>
                <Typography variant="body" weight="bold" color="primary" className="mt-2">{cat.label}</Typography>
                <Typography variant="caption" color="secondary" className="mt-1 leading-tight">{cat.desc}</Typography>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm">
            <Typography variant="heading" weight="bold" color="primary" className="mb-4">Recent Activity</Typography>
            {recentActivity.slice(0, 4).map((activity) => (
              <View key={activity.id} className="flex-row items-center gap-3 py-2 border-b border-border-subtle/50 last:border-b-0">
                <Activity size={16} color="#4f378a" />
                <View className="flex-1">
                  <Typography variant="body" weight="bold" color="primary" className="text-sm">{activity.title}</Typography>
                  <Typography variant="caption" color="secondary">{activity.subtitle}</Typography>
                </View>
              </View>
            ))}
          </BentoCard>
        )}
      </ScrollView>
    </View>
  );
};

// ── 2. Career Plan ──────────────────────────────────
interface CareerPlanProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const CareerPlan: React.FC<CareerPlanProps> = ({ onNavigate, onBack }) => {
  const {
    careerGoalId,
    activeRoadmapId,
    getRoadmapProgressPercent,
    savedCareerIds,
    savedCollegeIds,
    savedScholarshipIds,
  } = useKnowNextStore();

  const [careerGoal, setCareerGoal] = useState<any>(null);
  React.useEffect(() => {
    if (careerGoalId) {
      supabase.from("knownext_careers").select("*").eq("id", careerGoalId).single().then(({ data }) => {
        if (data) setCareerGoal(data);
      });
    }
  }, [careerGoalId]);
  
  const activeRoadmap = useMemo(() => ROADMAPS.find((r) => r.id === activeRoadmapId), [activeRoadmapId]);
  const progressPercent = useMemo(() => {
    if (!activeRoadmap) return 0;
    return getRoadmapProgressPercent(activeRoadmap.id, activeRoadmap.totalSteps);
  }, [activeRoadmap, getRoadmapProgressPercent]);

  return (
    <View className="flex-1 bg-surface-primary">
      <View className="flex-row items-center gap-4 px-6 pt-16 pb-6 bg-white border-b border-border-subtle shadow-sm z-10">
        <IconButton 
          icon={<ArrowLeft size={24} color="#1d1b20" />}
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
        <View>
          <Typography variant="title" weight="bold" color="primary">My Career Plan</Typography>
          <Typography variant="caption" color="secondary">Workspace Dashboard</Typography>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        {/* Goal Card */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <Typography variant="caption" weight="bold" className="text-[#4f378a] tracking-wider uppercase mb-3">🎯 Current Goal</Typography>
          {careerGoal ? (
            <View className="flex-row items-center gap-3">
              <Typography className="text-3xl">{careerGoal.icon}</Typography>
              <View className="flex-1">
                <Typography variant="body" weight="bold" color="primary">{careerGoal.title}</Typography>
                <Typography variant="caption" color="secondary">{careerGoal.category}</Typography>
              </View>
              <Button variant="outline" size="sm" onPress={() => onNavigate("careerExplorer")}>Change</Button>
            </View>
          ) : (
            <View className="flex-row justify-between items-center">
              <Typography variant="body" color="secondary">You haven't set a career goal yet.</Typography>
              <Button variant="primary" size="sm" onPress={() => onNavigate("careerExplorer")}>Set Goal</Button>
            </View>
          )}
        </BentoCard>

        {/* Roadmap Progress */}
        {activeRoadmap && (
          <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
            <Typography variant="caption" weight="bold" className="text-[#4f378a] tracking-wider uppercase mb-3">🗺 Active Roadmap</Typography>
            <Typography variant="body" weight="bold" color="primary">{activeRoadmap.careerTitle} Path</Typography>
            <View className="mt-3 mb-1">
              <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <View className="h-full bg-[#4f378a]" style={{ width: `${progressPercent}%` }} />
              </View>
              <Typography variant="caption" weight="bold" color="secondary" className="mt-2">{progressPercent}% Complete</Typography>
            </View>
            <View className="mt-4">
              <Button variant="primary" onPress={() => onNavigate("learningPath", { selectedRoadmapId: activeRoadmap.id })}>
                Continue Journey
              </Button>
            </View>
          </BentoCard>
        )}

        {/* Saved Counters */}
        <View className="flex-row gap-2 mb-6">
          <TouchableOpacity onPress={() => onNavigate("savedItems")} className="flex-1 bg-white border border-border-subtle rounded-2xl p-3 items-center shadow-sm">
            <Typography variant="heading" weight="bold" color="primary">{savedCareerIds.length}</Typography>
            <Typography variant="caption" color="secondary" className="text-center mt-1">Saved Careers</Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate("savedItems")} className="flex-1 bg-white border border-border-subtle rounded-2xl p-3 items-center shadow-sm">
            <Typography variant="heading" weight="bold" color="primary">{savedCollegeIds.length}</Typography>
            <Typography variant="caption" color="secondary" className="text-center mt-1">Saved Colleges</Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate("savedItems")} className="flex-1 bg-white border border-border-subtle rounded-2xl p-3 items-center shadow-sm">
            <Typography variant="heading" weight="bold" color="primary">{savedScholarshipIds.length}</Typography>
            <Typography variant="caption" color="secondary" className="text-center mt-1">Saved Scholarships</Typography>
          </TouchableOpacity>
        </View>

        {/* Deadline Tracker CTA */}
        {savedScholarshipIds.length > 0 && (
          <BentoCardPressable 
            variant="secondary"
            className="flex-row items-center bg-red-50 border border-red-100 p-4 gap-3 shadow-sm"
            onPress={() => onNavigate("deadlineTracker")}
          >
            <Calendar size={20} color="#DC2626" />
            <Typography variant="body" weight="bold" className="text-red-600 flex-1">View Scholarship Deadlines</Typography>
            <ChevronRight size={20} color="#DC2626" />
          </BentoCardPressable>
        )}
      </ScrollView>
    </View>
  );
};

// ── 3. Saved Items ──────────────────────────────────
interface SavedItemsProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const SavedItems: React.FC<SavedItemsProps> = ({ onNavigate, onBack }) => {
  const { savedCareerIds, savedCollegeIds, savedScholarshipIds } = useKnowNextStore();
  const [activeTab, setActiveTab] = useState<"careers" | "colleges" | "scholarships">("careers");

  const [careers, setCareers] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      if (savedCareerIds.length > 0) {
        supabase.from("knownext_careers").select("*").in("id", savedCareerIds).then(({ data }) => {
          if (data) setCareers(data);
        });
      }
      if (savedCollegeIds.length > 0) {
        supabase.from("knownext_colleges").select("*").in("id", savedCollegeIds).then(({ data }) => {
          if (data) setColleges(data);
        });
      }
      if (savedScholarshipIds.length > 0) {
        supabase.from("knownext_scholarships").select("*").in("id", savedScholarshipIds).then(({ data }) => {
          if (data) setScholarships(data);
        });
      }
    }
    fetchData();
  }, [savedCareerIds, savedCollegeIds, savedScholarshipIds]);

  return (
    <View className="flex-1 bg-surface-primary">
      <View className="flex-row items-center gap-4 px-6 pt-16 pb-4 bg-white border-b border-border-subtle z-10">
        <IconButton 
          icon={<ArrowLeft size={24} color="#1d1b20" />}
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
        <View>
          <Typography variant="title" weight="bold" color="primary">Saved Items</Typography>
          <Typography variant="caption" color="secondary">Bookmarks manager</Typography>
        </View>
      </View>

      {/* Tabs list */}
      <View className="flex-row bg-white border-b border-border-subtle">
        <TouchableOpacity
          onPress={() => setActiveTab("careers")}
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === "careers" ? "border-[#4f378a]" : "border-transparent"}`}
        >
          <Typography variant="caption" weight="bold" className={activeTab === "careers" ? "text-[#4f378a]" : "text-slate-500"}>
            Careers ({careers.length})
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("colleges")}
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === "colleges" ? "border-[#4f378a]" : "border-transparent"}`}
        >
          <Typography variant="caption" weight="bold" className={activeTab === "colleges" ? "text-[#4f378a]" : "text-slate-500"}>
            Colleges ({colleges.length})
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("scholarships")}
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === "scholarships" ? "border-[#4f378a]" : "border-transparent"}`}
        >
          <Typography variant="caption" weight="bold" className={activeTab === "scholarships" ? "text-[#4f378a]" : "text-slate-500"}>
            Awards ({scholarships.length})
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="gap-3">
          {activeTab === "careers" && (
            careers.map((career) => (
              <BentoCardPressable
                key={career.id}
                onPress={() => onNavigate("careerDetails", { selectedCareerId: career.id })}
                variant="secondary"
                className="flex-row items-center p-4 bg-white border border-border-subtle shadow-sm gap-3"
              >
                <Typography className="text-2xl">{career.icon}</Typography>
                <View className="flex-1">
                  <Typography variant="body" weight="bold" color="primary">{career.title}</Typography>
                  <Typography variant="caption" color="secondary" className="mt-0.5">{career.category}</Typography>
                </View>
                <ChevronRight size={20} color="#79747e" />
              </BentoCardPressable>
            ))
          )}

          {activeTab === "colleges" && (
            colleges.map((college) => (
              <BentoCardPressable
                key={college.id}
                onPress={() => onNavigate("collegeDetails", { selectedCollegeId: college.id })}
                variant="secondary"
                className="flex-row items-center p-4 bg-white border border-border-subtle shadow-sm gap-3"
              >
                <Typography className="text-2xl">{college.icon || "🏛️"}</Typography>
                <View className="flex-1">
                  <Typography variant="body" weight="bold" color="primary">{college.name}</Typography>
                  <Typography variant="caption" color="secondary" className="mt-0.5">{college.location}</Typography>
                </View>
                <ChevronRight size={20} color="#79747e" />
              </BentoCardPressable>
            ))
          )}

          {activeTab === "scholarships" && (
            scholarships.map((s) => (
              <BentoCardPressable
                key={s.id}
                onPress={() => onNavigate("scholarshipDetails", { selectedScholarshipId: s.id })}
                variant="secondary"
                className="flex-row items-center p-4 bg-white border border-border-subtle shadow-sm gap-3"
              >
                <Typography className="text-2xl">🎓</Typography>
                <View className="flex-1">
                  <Typography variant="body" weight="bold" color="primary">{s.name}</Typography>
                  <Typography variant="caption" color="secondary" className="mt-0.5">{s.provider}</Typography>
                </View>
                <ChevronRight size={20} color="#79747e" />
              </BentoCardPressable>
            ))
          )}

          {((activeTab === "careers" && careers.length === 0) ||
            (activeTab === "colleges" && colleges.length === 0) ||
            (activeTab === "scholarships" && scholarships.length === 0)) && (
            <View className="py-12 items-center justify-center">
              <Typography variant="body" color="secondary">No saved items in this category yet.</Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ── 4. Industry Insights ─────────────────────────────
interface IndustryInsightsProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const IndustryInsights: React.FC<IndustryInsightsProps> = ({ onNavigate, onBack }) => {
  return (
    <View className="flex-1 bg-surface-primary">
      <View className="flex-row items-center gap-4 px-6 pt-16 pb-6 bg-white border-b border-border-subtle shadow-sm z-10">
        <IconButton 
          icon={<ArrowLeft size={24} color="#1d1b20" />}
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
        <View>
          <Typography variant="title" weight="bold" color="primary">Industry Insights</Typography>
          <Typography variant="caption" color="secondary">Market demands & hiring growth</Typography>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="gap-4">
          {INDUSTRIES.map((industry) => (
            <BentoCardPressable
              key={industry.id}
              onPress={() => onNavigate("marketTrends", { selectedIndustryId: industry.id })}
              variant="secondary"
              className="flex-row items-center bg-white border border-border-subtle shadow-sm p-4 gap-4"
            >
              <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
                <Typography className="text-2xl">{industry.icon}</Typography>
              </View>
              <View className="flex-1">
                <Typography variant="body" weight="bold" color="primary">{industry.name}</Typography>
                <Typography variant="caption" color="secondary" className="mt-0.5 mb-2" numberOfLines={1}>{industry.description}</Typography>
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <TrendingUp size={12} color="#059669" />
                    <Typography variant="caption" weight="bold" className="text-emerald-700 ml-1">{industry.growthPercent}% YoY</Typography>
                  </View>
                  <Typography variant="caption" weight="bold" color="primary">₹ {industry.avgSalaryLPA} LPA Avg</Typography>
                </View>
              </View>
              <ChevronRight size={20} color="#79747e" />
            </BentoCardPressable>
          ))}
          {INDUSTRIES.length === 0 && (
             <Typography variant="caption" color="secondary" className="italic text-center py-4">No industry data available.</Typography>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ── 5. Market Trends ─────────────────────────────────
interface MarketTrendsProps {
  industryId?: string;
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const MarketTrends: React.FC<MarketTrendsProps> = ({ industryId, onNavigate, onBack }) => {
  const industry = useMemo(() => INDUSTRIES.find((i) => i.id === industryId), [industryId]);

  if (!industry) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-primary p-6">
        <Typography variant="body" color="secondary" className="mb-4">Industry details not found.</Typography>
        <Button variant="primary" onPress={onBack}>Go Back</Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-primary">
      <View className="flex-row items-center gap-4 px-6 pt-16 pb-6 bg-white border-b border-border-subtle shadow-sm z-10">
        <IconButton 
          icon={<ArrowLeft size={24} color="#1d1b20" />}
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
        <View className="flex-1 pr-6">
          <Typography variant="title" weight="bold" color="primary" numberOfLines={1}>{industry.name} Trends</Typography>
          <Typography variant="caption" color="secondary">Growth scope & requirements</Typography>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        {/* Industry summary */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <View className="flex-row items-center gap-3 mb-3">
            <Typography className="text-3xl">{industry.icon}</Typography>
            <Typography variant="body" weight="bold" color="primary">{industry.growthPercent}% Annual Growth Rate</Typography>
          </View>
          <Typography variant="body" color="secondary" className="leading-relaxed">{industry.description}</Typography>
        </BentoCard>

        {/* Future Skills & Emerging Technologies */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <Typography variant="body" weight="bold" color="primary" className="mb-3">Emerging Technologies</Typography>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {industry.marketTrends?.emergingTechnologies?.map((tech: string) => (
              <View key={tech} className="bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <Typography variant="caption" weight="bold" color="primary">{tech}</Typography>
              </View>
            ))}
          </View>

          <Typography variant="body" weight="bold" color="primary" className="mb-3">Future Skills Needed</Typography>
          <View className="flex-row flex-wrap gap-2">
            {industry.marketTrends?.futureSkills?.map((skill: string) => (
              <View key={skill} className="bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                <Typography variant="caption" weight="bold" className="text-teal-700">{skill}</Typography>
              </View>
            ))}
          </View>
        </BentoCard>

        {/* Top Recruiters */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm">
          <Typography variant="body" weight="bold" color="primary" className="mb-3">Top Recruiters in India</Typography>
          <View className="gap-2">
            {industry.topRecruiters?.map((recruiter: string) => (
              <View key={recruiter} className="flex-row items-center gap-3">
                <Typography className="text-base">🏢</Typography>
                <Typography variant="body" color="secondary">{recruiter}</Typography>
              </View>
            ))}
          </View>
        </BentoCard>
      </ScrollView>
    </View>
  );
};
