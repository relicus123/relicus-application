import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { MotiView } from "moti";
import {
  ArrowLeft,
  Bookmark,
  DollarSign,
  ExternalLink,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useKnowNextStore } from "../../../store/knownext.store";
import { supabase } from "../../../lib/supabase";
import { Scholarship, CareerStage, KnowNextView, NavContext } from "../types";
import { CareerStageFilter } from "./ExplorerScreens";

import { Typography } from "../../../components/Typography";
import { BentoCard, BentoCardPressable } from "../../../components/BentoCard";
import { IconButton } from "../../../components/IconButton";
import { Button } from "../../../components/Button";

const { width } = Dimensions.get("window");
const CATEGORIES = ["All", "Merit", "Need-based", "Category", "Sports", "Research"] as const;

// Helper to calculate days remaining
export function getDaysRemaining(deadlineStr: string) {
  const diffTime = new Date(deadlineStr).getTime() - Date.now();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Reusable Urgency Badge
export function DeadlineBadge({ deadline }: { deadline: string }) {
  const days = getDaysRemaining(deadline);
  let colorClass = "text-emerald-700";
  let bgClass = "bg-emerald-50";
  
  if (days <= 15) {
    colorClass = "text-red-700";
    bgClass = "bg-red-50";
  } else if (days <= 30) {
    colorClass = "text-amber-700";
    bgClass = "bg-amber-50";
  }

  return (
    <View className={`px-2 py-1 rounded ${bgClass}`}>
      <Typography variant="caption" weight="bold" className={colorClass}>{days} days left</Typography>
    </View>
  );
}

// Scholarship Card Sub-Component
interface ScholarshipCardProps {
  scholarship: Scholarship;
  onSelect: (scholarship: Scholarship) => void;
}

export function ScholarshipCard({ scholarship, onSelect }: ScholarshipCardProps) {
  const { savedScholarshipIds, toggleSaveScholarship } = useKnowNextStore();
  const isSaved = savedScholarshipIds.includes(scholarship.id);

  return (
    <BentoCardPressable
      activeOpacity={0.9}
      onPress={() => onSelect(scholarship)}
      variant="secondary"
      className="bg-white border border-border-subtle shadow-sm mb-3 p-4"
    >
      <View className="flex-row gap-3">
        <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
          <Typography className="text-2xl">🎓</Typography>
        </View>
        <View className="flex-1">
          <Typography variant="caption" weight="bold" color="secondary" className="mb-0.5">{scholarship.category} Scholarship</Typography>
          <Typography variant="body" weight="bold" color="primary">{scholarship.name}</Typography>
          <Typography variant="caption" color="secondary">Provided by {scholarship.provider}</Typography>
        </View>
      </View>

      <View className="flex-row gap-2 mt-3 items-center">
        <View className="flex-row items-center gap-1 bg-slate-100 px-2 py-1 rounded">
          <DollarSign size={12} color="#1C4966" />
          <Typography variant="caption" weight="bold" className="text-slate-700">₹{scholarship.amount.toLocaleString()} ({scholarship.frequency})</Typography>
        </View>
        <DeadlineBadge deadline={scholarship.deadline} />
      </View>

      <View className="h-px bg-border-subtle my-3" />

      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={() => toggleSaveScholarship(scholarship.id)}
          className="flex-row items-center gap-1.5 p-1"
        >
          <Bookmark size={16} color={isSaved ? "#4f378a" : "#79747e"} fill={isSaved ? "#4f378a" : "transparent"} />
          <Typography variant="caption" weight="bold" className={isSaved ? "text-[#4f378a]" : "text-slate-500"}>
            {isSaved ? "Saved" : "Save"}
          </Typography>
        </TouchableOpacity>
      </View>
    </BentoCardPressable>
  );
}

// ── 1. Scholarship Explorer ──────────────────────────
interface ScholarshipExplorerProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const ScholarshipExplorer: React.FC<ScholarshipExplorerProps> = ({ onNavigate, onBack }) => {
  const [selectedCat, setSelectedCat] = useState("All");
  const { activeStage } = useKnowNextStore();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScholarships = React.useCallback(async () => {
    try {
      const { data } = await supabase.from("knownext_scholarships").select("*");
      if (data) setScholarships(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchScholarships();
    }, [fetchScholarships])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScholarships();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    return scholarships.filter((s) => {
      const matchesCat = selectedCat === "All" || s.category === selectedCat;
      const matchesStage = activeStage === "all" || (s.applicableStages && s.applicableStages.includes(activeStage as CareerStage));
      const isOpen = new Date(s.deadline) > new Date();
      return matchesCat && matchesStage && isOpen;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [selectedCat, activeStage, scholarships]);

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
              <Typography variant="title" weight="bold" className="text-white">Scholarship Finder</Typography>
              <Typography variant="caption" className="text-white/80">{filtered.length} active programs</Typography>
            </View>
          </View>
          <View className="bg-white/10 rounded-2xl py-2 px-4 self-start">
            <Typography variant="caption" weight="bold" className="text-white">Sorted by deadline · closest first</Typography>
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
        {/* Category horizontal tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-full mr-2 border ${active ? "bg-[#e8def8] border-[#e8def8]" : "bg-white border-border-subtle"}`}
              >
                <Typography variant="caption" weight="bold" className={active ? "text-[#1d192b]" : "text-slate-600"}>
                  {cat}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Typography variant="caption" weight="bold" color="primary" className="mb-4 uppercase tracking-wider">
          {loading ? "Loading scholarships..." : `${filtered.length} scholarships found`}
        </Typography>

        {filtered.map((scholarship, index) => (
          <MotiView
            key={scholarship.id}
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: Math.min(index * 50, 300) }}
          >
            <ScholarshipCard
              scholarship={scholarship}
              onSelect={(s) => onNavigate("scholarshipDetails", { selectedScholarshipId: s.id })}
            />
          </MotiView>
        ))}

        {filtered.length === 0 && (
          <View className="py-12 items-center justify-center">
            <Typography variant="body" color="secondary" className="text-center">No active scholarships found matching filters.</Typography>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ── 2. Scholarship Details ───────────────────────────
interface ScholarshipDetailsProps {
  scholarshipId?: string;
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const ScholarshipDetails: React.FC<ScholarshipDetailsProps> = ({ scholarshipId, onNavigate, onBack }) => {
  const [scholarship, setScholarship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { savedScholarshipIds, toggleSaveScholarship } = useKnowNextStore();
  
  React.useEffect(() => {
    async function fetchDetails() {
      if (!scholarshipId) return;
      try {
        const { data } = await supabase.from("knownext_scholarships").select("*").eq("id", scholarshipId).single();
        if (data) setScholarship(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [scholarshipId]);

  const isSaved = savedScholarshipIds.includes(scholarship?.id || "");

  if (!scholarship) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-primary p-6">
        <Typography variant="body" color="secondary" className="mb-4">Scholarship details not found.</Typography>
        <Button variant="primary" onPress={onBack}>Go Back</Button>
      </View>
    );
  }

  const daysLeft = getDaysRemaining(scholarship.deadline);

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
            <Typography variant="title" weight="bold" className="text-white" numberOfLines={1}>{scholarship.name}</Typography>
            <Typography variant="caption" className="text-white/80">By {scholarship.provider}</Typography>
          </View>
          <IconButton 
            icon={<Bookmark color="#FFF" fill={isSaved ? "#FFF" : "transparent"} size={22} />}
            variant="ghost"
            onPress={() => toggleSaveScholarship(scholarship.id)}
          />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        {/* Info Card */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <Typography variant="heading" weight="bold" color="primary" className="mb-4">Overview & Value</Typography>
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px] mb-1">Award Amount</Typography>
              <Typography variant="body" weight="bold" color="primary">₹{scholarship.amount.toLocaleString()}</Typography>
            </View>
            <View className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px] mb-1">Frequency</Typography>
              <Typography variant="body" weight="bold" color="primary">{scholarship.frequency}</Typography>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px] mb-1">Deadline</Typography>
              <Typography variant="body" weight="bold" color="primary">
                {new Date(scholarship.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </Typography>
            </View>
            <View className={`flex-1 p-3 rounded-2xl border ${daysLeft <= 15 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px] mb-1">Days Remaining</Typography>
              <Typography variant="body" weight="bold" className={daysLeft <= 15 ? 'text-red-700' : 'text-emerald-700'}>
                {daysLeft} days
              </Typography>
            </View>
          </View>
        </BentoCard>

        {/* Section: Eligibility */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-4">
          <Typography variant="heading" weight="bold" color="primary" className="mb-3">Eligibility Criteria</Typography>
          <View className="gap-2">
            {(Array.isArray(scholarship.eligibility) ? scholarship.eligibility : JSON.parse(scholarship.eligibility || '[]')).map((criteria: string, index: number) => (
              <View key={index} className="flex-row gap-2">
                <Typography className="text-base text-emerald-600">✔</Typography>
                <Typography variant="body" color="secondary" className="flex-1">{criteria}</Typography>
              </View>
            ))}
          </View>
        </BentoCard>

        {/* Section: Required Documents */}
        <BentoCard variant="secondary" padding="md" className="bg-white border border-border-subtle shadow-sm mb-6">
          <Typography variant="heading" weight="bold" color="primary" className="mb-3">Required Documents</Typography>
          <View className="gap-2">
            {(Array.isArray(scholarship.requiredDocuments) ? scholarship.requiredDocuments : JSON.parse(scholarship.requiredDocuments || '[]')).map((doc: string, index: number) => (
              <View key={index} className="flex-row items-center gap-2">
                <Typography className="text-base">📄</Typography>
                <Typography variant="body" color="secondary" className="flex-1">{doc}</Typography>
              </View>
            ))}
          </View>
        </BentoCard>

        {/* CTA to Apply */}
        <Button
          variant="primary"
          onPress={() => alert(`Redirecting to portal: ${scholarship.applicationUrl}`)}
          className="flex-row justify-center gap-2"
        >
          <Typography variant="body" weight="bold" className="text-white">Apply Now</Typography>
          <ExternalLink size={18} color="white" />
        </Button>
      </ScrollView>
    </View>
  );
};

// ── 3. Deadline Tracker ──────────────────────────────
interface DeadlineTrackerProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const DeadlineTracker: React.FC<DeadlineTrackerProps> = ({ onNavigate, onBack }) => {
  const { savedScholarshipIds } = useKnowNextStore();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchSaved() {
      if (savedScholarshipIds.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from("knownext_scholarships").select("*").in("id", savedScholarshipIds);
        if (data) setScholarships(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, [savedScholarshipIds]);

  const savedScholarships = useMemo(() => {
    return scholarships.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [scholarships]);

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
            <Typography variant="title" weight="bold" className="text-white">Deadline Tracker</Typography>
            <Typography variant="caption" className="text-white/80">{savedScholarships.length} saved programs</Typography>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="gap-4">
          {savedScholarships.length > 0 ? (
            savedScholarships.map((s) => (
              <BentoCardPressable
                key={s.id}
                onPress={() => onNavigate("scholarshipDetails", { selectedScholarshipId: s.id })}
                variant="secondary"
                className="bg-white border border-border-subtle shadow-sm p-4 flex-row items-center gap-4"
              >
                <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
                  <Typography className="text-2xl">📅</Typography>
                </View>
                <View className="flex-1">
                  <Typography variant="caption" weight="bold" color="secondary" className="mb-0.5">{s.category} Scholarship</Typography>
                  <Typography variant="body" weight="bold" color="primary">{s.name}</Typography>
                  <Typography variant="caption" color="secondary" className="mt-1">
                    Deadline: {new Date(s.deadline).toLocaleDateString()}
                  </Typography>
                </View>
                <DeadlineBadge deadline={s.deadline} />
              </BentoCardPressable>
            ))
          ) : (
            <View className="py-12 items-center justify-center">
              <Typography variant="body" color="secondary" className="text-center">No saved scholarships yet. Bookmark a scholarship to track its deadline here!</Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
