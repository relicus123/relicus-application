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
  Check,
  Plus,
  Scale,
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useKnowNextStore } from "../../../store/knownext.store";
import { supabase } from "../../../lib/supabase";
import { Career, CareerStage, KnowNextView, NavContext } from "../types";

import { Typography } from "../../../components/Typography";
import { BentoCard, BentoCardPressable } from "../../../components/BentoCard";
import { IconButton } from "../../../components/IconButton";
import { Button } from "../../../components/Button";

const { width } = Dimensions.get("window");
const ROADMAPS = [] as any[];
const CAREER_CATEGORIES = ["Engineering", "Medical", "Design", "Management", "Arts"];

// ── Shared Sub-Components ───────────────────────────

// Reusable Stage Filter Chip Row
export function CareerStageFilter() {
  const { activeStage, setActiveStage } = useKnowNextStore();
  const stages: Array<{ id: CareerStage | "all"; label: string }> = [
    { id: "all", label: "All Stages" },
    { id: "after10th", label: "After 10th" },
    { id: "after12th", label: "After 12th" },
    { id: "afterGraduation", label: "After Graduation" },
    { id: "workingProfessional", label: "Professional" },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}>
      {stages.map((stage) => {
        const active = activeStage === stage.id;
        return (
          <TouchableOpacity
            key={stage.id}
            onPress={() => setActiveStage(stage.id)}
            className={`px-4 py-2 rounded-full border mr-2 ${active ? "bg-[#4f378a] border-[#4f378a]" : "bg-white border-border-subtle"}`}
          >
            <Typography variant="caption" weight="bold" className={active ? "text-white" : "text-slate-600"}>
              {stage.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// Career Card Component
interface CareerCardProps {
  career: Career;
  onSelect: (career: Career) => void;
}

export function CareerCard({ career, onSelect }: CareerCardProps) {
  const { savedCareerIds, toggleSaveCareer, compareCareerIds, toggleCompareCareer } = useKnowNextStore();
  const isSaved = savedCareerIds.includes(career.id);
  const isComparing = compareCareerIds.includes(career.id);

  return (
    <BentoCardPressable
      activeOpacity={0.9}
      onPress={() => onSelect(career)}
      variant="secondary"
      className="bg-white border border-border-subtle shadow-sm mb-3 p-4"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
          <Typography className="text-2xl">{career.icon}</Typography>
        </View>
        <View className="flex-1">
          <Typography variant="caption" weight="bold" color="secondary" className="mb-0.5">{career.category}</Typography>
          <Typography variant="body" weight="bold" color="primary">{career.title}</Typography>
          <Typography variant="caption" color="secondary" numberOfLines={1}>{career.tagline}</Typography>
        </View>
      </View>

      <View className="flex-row gap-2 mt-3">
        <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
          <TrendingUp size={12} color="#059669" />
          <Typography variant="caption" weight="bold" className="text-emerald-700">{career.industryDemand || (career as any).industry_demand || 'High'} Demand</Typography>
        </View>
        <View className="flex-row items-center gap-1 bg-slate-100 px-2 py-1 rounded">
          <Typography variant="caption" weight="bold" className="text-slate-700">
            ₹{(() => {
              try {
                const sr = career.salaryRange || (career as any).salary_range;
                const parsed = typeof sr === 'string' ? JSON.parse(sr) : sr;
                return `${parsed?.min ?? 0}-${parsed?.max ?? 0}`;
              } catch (e) {
                return "0-0";
              }
            })()} LPA
          </Typography>
        </View>
      </View>

      <View className="h-px bg-border-subtle my-3" />

      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={() => toggleSaveCareer(career.id)}
          className="flex-row items-center gap-1.5 p-1"
        >
          <Bookmark size={16} color={isSaved ? "#4f378a" : "#79747e"} fill={isSaved ? "#4f378a" : "transparent"} />
          <Typography variant="caption" weight="bold" className={isSaved ? "text-[#4f378a]" : "text-slate-500"}>
            {isSaved ? "Saved" : "Save"}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleCompareCareer(career.id)}
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

// Compare Floating Drawer
interface CompareDrawerProps {
  count: number;
  onCompare: () => void;
  onClear: () => void;
}

export function CompareDrawer({ count, onCompare, onClear }: CompareDrawerProps) {
  if (count < 2) return null;
  return (
    <View className="absolute bottom-6 left-6 right-6 bg-[#1d1b20] rounded-2xl p-4 flex-row items-center shadow-lg">
      <Typography variant="body" weight="bold" className="text-white flex-1">
        {count} items selected for comparison
      </Typography>
      <View className="flex-row gap-2">
        <TouchableOpacity onPress={onClear} className="px-3 py-2 rounded-lg bg-white/20">
          <Typography variant="caption" weight="bold" className="text-white">Clear</Typography>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCompare} className="px-3 py-2 rounded-lg bg-[#d0bcff]">
          <Typography variant="caption" weight="bold" className="text-[#381e72]">Compare Now</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── 1. Career Explorer ───────────────────────────────
interface CareerExplorerProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const CareerExplorer: React.FC<CareerExplorerProps> = ({ onNavigate, onBack }) => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { activeStage, compareCareerIds, clearCareerComparison } = useKnowNextStore();

  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCareers = React.useCallback(async () => {
    try {
      const { data } = await supabase.from('knownext_careers').select('*');
      if (data) setCareers(data);
    } catch (err) {} finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCareers();
    }, [fetchCareers])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCareers();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    return careers.filter((c) => {
      const matchesQuery =
        query.trim().length < 2 ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase()) ||
        (Array.isArray(c.requiredSkills) ? c.requiredSkills : JSON.parse(c.requiredSkills || '[]')).some((s: string) => s.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      const applicableStages = Array.isArray(c.applicableStages) ? c.applicableStages : JSON.parse(c.applicableStages || '[]');
      const matchesStage =
        activeStage === "all" || applicableStages.includes(activeStage as CareerStage);
      return matchesQuery && matchesCategory && matchesStage;
    });
  }, [query, selectedCategory, activeStage, careers]);

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
              <Typography variant="title" weight="bold" className="text-white">Career Explorer</Typography>
              <Typography variant="caption" className="text-white/80">{careers.length} career paths</Typography>
            </View>
          </View>

          <View className="flex-row items-center bg-white/20 rounded-2xl px-4 h-12 gap-2 border border-white/30">
            <Search color="#FFF" size={18} />
            <TextInput
              placeholder="Search careers, skills, industries..."
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
        {/* Category horizontal scrolling tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
          {["All", ...CAREER_CATEGORIES].map((category) => {
            const active = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full mr-2 border ${active ? "bg-[#e8def8] border-[#e8def8]" : "bg-white border-border-subtle"}`}
              >
                <Typography variant="caption" weight="bold" className={active ? "text-[#1d192b]" : "text-slate-600"}>
                  {category}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Typography variant="caption" weight="bold" color="primary" className="mb-4 uppercase tracking-wider">
          {filtered.length} careers matching filters
        </Typography>

        {filtered.map((career, index) => (
          <MotiView
            key={career.id}
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: Math.min(index * 50, 300) }}
          >
            <CareerCard
              career={career}
              onSelect={(c) => onNavigate("careerDetails", { selectedCareerId: c.id })}
            />
          </MotiView>
        ))}

        {filtered.length === 0 && (
          <View className="py-12 items-center justify-center">
            <Typography variant="body" color="secondary">No careers matches found.</Typography>
          </View>
        )}
      </ScrollView>

      <CompareDrawer
        count={compareCareerIds.length}
        onCompare={() => onNavigate("careerComparison")}
        onClear={clearCareerComparison}
      />
    </View>
  );
};

// ── 2. Career Details ────────────────────────────────
interface CareerDetailsProps {
  careerId?: string;
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const CareerDetails: React.FC<CareerDetailsProps> = ({ careerId, onNavigate, onBack }) => {
  const [career, setCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchCareer() {
      if (!careerId) return;
      try {
        const { data } = await supabase.from('knownext_careers').select('*').eq('id', careerId).single();
        if (data) setCareer(data);
      } catch (e) {} finally {
        setLoading(false);
      }
    }
    fetchCareer();
  }, [careerId]);

  const roadmap = useMemo(() => ROADMAPS.find((r) => r.careerId === careerId), [careerId]);

  const { savedCareerIds, toggleSaveCareer, setCareerGoal, setActiveRoadmap } = useKnowNextStore();
  const isSaved = savedCareerIds.includes(career?.id || "");

  if (!career) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-primary">
        <Typography variant="body" color="secondary" className="mb-4">Career details not found.</Typography>
        <Button variant="outline" onPress={onBack}>Go Back</Button>
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
            <Typography variant="title" weight="bold" className="text-white" numberOfLines={1}>{career.title}</Typography>
            <Typography variant="caption" className="text-white/80">{career.category}</Typography>
          </View>
          <IconButton 
            icon={<Bookmark color="#FFF" fill={isSaved ? "#FFF" : "transparent"} size={22} />}
            variant="ghost"
            onPress={() => toggleSaveCareer(career.id)}
          />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        {/* Card Overview */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <View className="flex-row gap-3 items-center mb-3">
            <Typography className="text-4xl">{career.icon}</Typography>
            <View className="flex-1">
              <Typography variant="body" weight="bold" color="primary">{career.tagline}</Typography>
            </View>
          </View>
          <Typography variant="body" color="secondary" className="leading-relaxed mb-4">{career.overview}</Typography>

          <View className="flex-row gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <View className="flex-1">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px] mb-1">Salary Range</Typography>
              <Typography variant="body" weight="bold" color="primary">
                ₹{(() => {
                  try {
                    const sr = career.salaryRange || career.salary_range;
                    const parsed = typeof sr === 'string' ? JSON.parse(sr) : sr;
                    return `${parsed?.min ?? 0}-${parsed?.max ?? 0}`;
                  } catch (e) {
                    return "0-0";
                  }
                })()} LPA
              </Typography>
            </View>
            <View className="flex-1">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px] mb-1">Industry Demand</Typography>
              <Typography variant="body" weight="bold" color="primary">{career.industryDemand || career.industry_demand || 'High'}</Typography>
            </View>
          </View>

          {/* Set Goal / Start Roadmap CTAs */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                variant="outline"
                onPress={() => {
                  setCareerGoal(career.id);
                  alert(`${career.title} has been set as your Career Goal!`);
                }}
              >
                Set as Goal
              </Button>
            </View>

            {roadmap && (
              <View className="flex-1">
                <Button
                  variant="primary"
                  onPress={() => {
                    setActiveRoadmap(roadmap.id);
                    onNavigate("learningPath", { selectedRoadmapId: roadmap.id });
                  }}
                >
                  Start Roadmap
                </Button>
              </View>
            )}
          </View>
        </BentoCard>

        {/* Section: Educational Path */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <Typography variant="heading" weight="bold" color="primary" className="mb-4">Educational Path</Typography>
          {(Array.isArray(career.educationalPath) ? career.educationalPath : JSON.parse(career.educationalPath || '[]')).map((step: any, idx: number) => (
            <View key={idx} className="flex-row gap-4 mb-4 last:mb-0">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <Typography variant="caption" weight="bold" color="primary">{idx + 1}</Typography>
              </View>
              <View className="flex-1 pt-1">
                <Typography variant="body" weight="bold" color="primary">{step.level}</Typography>
                <Typography variant="caption" color="secondary" className="mt-0.5">{step.duration}</Typography>
                <Typography variant="caption" className="text-slate-500 mt-1">Colleges: {step.institutions.join(", ")}</Typography>
              </View>
            </View>
          ))}
        </BentoCard>

        {/* Section: Skills & Entrance Exams */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <Typography variant="heading" weight="bold" color="primary" className="mb-3">Required Skills</Typography>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {(Array.isArray(career.requiredSkills) ? career.requiredSkills : JSON.parse(career.requiredSkills || '[]')).map((skill: string) => (
              <View key={skill} className="bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <Typography variant="caption" weight="bold" color="primary">{skill}</Typography>
              </View>
            ))}
          </View>

          <Typography variant="heading" weight="bold" color="primary" className="mb-3">Entrance Exams</Typography>
          <View className="flex-row flex-wrap gap-2">
          {(Array.isArray(career.entranceExams) ? career.entranceExams : JSON.parse(career.entranceExams || '[]')).map((exam: string) => (
              <View key={exam} className="bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                <Typography variant="caption" weight="bold" color="primary">{exam}</Typography>
              </View>
            ))}
          </View>
        </BentoCard>

        {/* Section: Job Roles & Growth */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm">
          <Typography variant="heading" weight="bold" color="primary" className="mb-3">Future Scope & Growth</Typography>
          <Typography variant="body" color="secondary" className="leading-relaxed mb-6">{career.futureScope}</Typography>

          <Typography variant="heading" weight="bold" color="primary" className="mb-3">Top Job Roles</Typography>
          <View className="gap-2 mb-6">
            {(Array.isArray(career.jobRoles) ? career.jobRoles : JSON.parse(career.jobRoles || '[]')).map((role: string) => (
              <View key={role} className="flex-row items-center gap-2">
                <View className="w-1.5 h-1.5 rounded-full bg-[#4f378a]" />
                <Typography variant="body" color="secondary">{role}</Typography>
              </View>
            ))}
          </View>

          <Typography variant="heading" weight="bold" color="primary" className="mb-3">Growth Opportunities</Typography>
          <View className="gap-2">
            {(Array.isArray(career.growthOpportunities) ? career.growthOpportunities : JSON.parse(career.growthOpportunities || '[]')).map((opportunity: string) => (
              <View key={opportunity} className="flex-row items-center gap-2">
                <View className="w-1.5 h-1.5 rounded-full bg-[#4f378a]" />
                <Typography variant="body" color="secondary">{opportunity}</Typography>
              </View>
            ))}
          </View>
        </BentoCard>
      </ScrollView>
    </View>
  );
};

// ── 3. Career Comparison ────────────────────────────
interface CareerComparisonProps {
  compareIds: string[];
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
  onReset: (view: KnowNextView, context?: NavContext) => void;
}

export const CareerComparison: React.FC<CareerComparisonProps> = ({ compareIds, onNavigate, onBack, onReset }) => {
  const [careers, setCareers] = useState<any[]>([]);

  React.useEffect(() => {
    async function fetchCompare() {
      if (compareIds.length === 0) return;
      try {
        const { data } = await supabase.from('knownext_careers').select('*').in('id', compareIds);
        if (data) setCareers(data);
      } catch (e) {}
    }
    fetchCompare();
  }, [compareIds]);

  const { clearCareerComparison } = useKnowNextStore();

  const handleClear = () => {
    clearCareerComparison();
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
            <Typography variant="title" weight="bold" className="text-white">Compare Careers</Typography>
            <Typography variant="caption" className="text-white/80">{careers.length} selected</Typography>
          </View>
          <TouchableOpacity onPress={handleClear}>
            <Typography variant="caption" weight="bold" className="text-white">Reset</Typography>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView horizontal contentContainerStyle={{ padding: 24 }}>
        <View className="w-24 mr-4 gap-y-4">
          <View className="h-16 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Career</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Industry</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Avg Salary</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Demand</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Growth %</Typography></View>
          <View className="h-12 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Exams</Typography></View>
          <View className="h-16 justify-center border-b border-transparent"><Typography variant="caption" weight="bold" color="secondary">Skills</Typography></View>
        </View>

        {careers.map((career) => (
          <View key={career.id} className="w-40 mr-4 gap-y-4 bg-white rounded-2xl p-4 border border-border-subtle shadow-sm">
            <View className="h-16 justify-center border-b border-border-subtle">
              <Typography className="text-2xl mb-1">{career.icon}</Typography>
              <Typography variant="body" weight="bold" color="primary" numberOfLines={1}>{career.title}</Typography>
            </View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" color="primary" numberOfLines={1}>{career.industry}</Typography></View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" weight="bold" color="primary">₹{career.avgSalary || 0} LPA</Typography></View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" color="primary">{career.industryDemand || 'High'}</Typography></View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" color="primary">{career.growthPercent || 0}%</Typography></View>
            <View className="h-12 justify-center border-b border-border-subtle"><Typography variant="caption" color="primary" numberOfLines={1}>{(Array.isArray(career.entranceExams) ? career.entranceExams : JSON.parse(career.entranceExams || '[]')).join(", ")}</Typography></View>
            <View className="h-16 justify-center"><Typography variant="caption" color="primary" numberOfLines={2}>{(Array.isArray(career.requiredSkills) ? career.requiredSkills : JSON.parse(career.requiredSkills || '[]')).slice(0, 3).join(", ")}</Typography></View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ── 4. Career Roadmaps ──────────────────────────────
interface CareerRoadmapsProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const CareerRoadmaps: React.FC<CareerRoadmapsProps> = ({ onNavigate, onBack }) => {
  const { activeStage } = useKnowNextStore();

  const filteredRoadmaps = useMemo(() => {
    return ROADMAPS.filter((roadmap) => {
      return activeStage === "all" || roadmap.applicableStages.includes(activeStage as CareerStage);
    });
  }, [activeStage]);

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
          <View>
            <Typography variant="title" weight="bold" className="text-white">Career Roadmaps</Typography>
            <Typography variant="caption" className="text-white/80">{ROADMAPS.length} milestones journeys</Typography>
          </View>
        </View>
      </LinearGradient>

      <View className="py-4 bg-white border-b border-border-subtle shadow-sm z-0">
        <CareerStageFilter />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="gap-4">
          {filteredRoadmaps.map((roadmap) => (
            <BentoCardPressable
              key={roadmap.id}
              onPress={() => onNavigate("learningPath", { selectedRoadmapId: roadmap.id })}
              variant="secondary"
              className="flex-row items-center p-4 bg-white border border-border-subtle shadow-sm gap-4"
            >
              <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
                <Typography className="text-2xl">{roadmap.icon}</Typography>
              </View>
              <View className="flex-1">
                <Typography variant="body" weight="bold" color="primary">{roadmap.careerTitle} Path</Typography>
                <Typography variant="caption" color="secondary" className="mt-0.5">
                  {roadmap.totalSteps} Milestones • {roadmap.estimatedDuration}
                </Typography>
              </View>
              <ChevronRight size={20} color="#79747e" />
            </BentoCardPressable>
          ))}
          {filteredRoadmaps.length === 0 && (
             <Typography variant="caption" color="secondary" className="italic text-center py-4">No roadmaps found for this stage.</Typography>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ── 5. Learning Path ────────────────────────────────
interface LearningPathProps {
  roadmapId?: string;
  onBack: () => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ roadmapId, onBack }) => {
  const { activeRoadmapId, getRoadmapProgressPercent, completeRoadmapStep, getCompletedSteps } = useKnowNextStore();
  const targetId = roadmapId ?? activeRoadmapId;
  const roadmap = useMemo(() => ROADMAPS.find((r) => r.id === targetId), [targetId]);
  const completedSteps = useMemo(() => getCompletedSteps(targetId || ""), [targetId, getCompletedSteps]);
  const progressPercent = useMemo(() => {
    if (!roadmap) return 0;
    return getRoadmapProgressPercent(roadmap.id, roadmap.totalSteps);
  }, [roadmap, getRoadmapProgressPercent]);

  if (!roadmap) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-primary">
        <Typography variant="body" color="secondary" className="mb-4">Please select a career path first.</Typography>
        <Button variant="outline" onPress={onBack}>Go Back</Button>
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
            <Typography variant="title" weight="bold" className="text-white" numberOfLines={1}>{roadmap.careerTitle} Path</Typography>
            <Typography variant="caption" className="text-white/80">{roadmap.estimatedDuration} estimated</Typography>
          </View>
          <View className="w-12 h-12 rounded-full border-4 border-white/20 items-center justify-center bg-white/10">
            <Typography variant="caption" weight="bold" className="text-white">{progressPercent}%</Typography>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="ml-4 border-l-2 border-slate-200">
          {roadmap.steps.map((step: any, idx: number) => {
            const isCompleted = completedSteps.includes(step.id);
            return (
              <View key={step.id} className="mb-8 pl-6 relative">
                {/* Node */}
                <TouchableOpacity
                  onPress={() => completeRoadmapStep(roadmap.id, step.id)}
                  className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full border-4 border-white items-center justify-center z-10 ${isCompleted ? 'bg-[#4f378a]' : 'bg-slate-200'}`}
                >
                  {isCompleted ? (
                    <Check size={12} color="white" />
                  ) : (
                    <Plus size={12} color="#475569" />
                  )}
                </TouchableOpacity>

                {/* Card */}
                <BentoCard variant="secondary" padding="md" className={`bg-white border shadow-sm ${isCompleted ? 'border-[#4f378a]/30' : 'border-border-subtle'}`}>
                  <View className="flex-row justify-between items-center mb-1">
                    <Typography variant="caption" weight="bold" className="text-[#4f378a] uppercase tracking-wider text-[10px]">Step {step.order}</Typography>
                    <Typography variant="caption" color="secondary">{step.duration}</Typography>
                  </View>
                  <Typography variant="body" weight="bold" color="primary" className="mb-2">{step.title}</Typography>
                  <Typography variant="caption" color="secondary" className="leading-relaxed mb-4">{step.description}</Typography>

                  {step.skillsRequired?.length > 0 && (
                    <View className="flex-row flex-wrap gap-2">
                      {step.skillsRequired.map((s: string) => (
                        <View key={s} className="bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          <Typography variant="caption" className="text-slate-600 text-[10px]">{s}</Typography>
                        </View>
                      ))}
                    </View>
                  )}
                </BentoCard>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
