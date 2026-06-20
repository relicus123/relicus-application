import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import {
  ArrowLeft,
  Search,
  BookOpen,
  MapPin,
  Award,
  DollarSign,
  Star,
  Activity,
  Briefcase,
  Layers,
  Sparkles,
  TrendingUp,
  X,
  Compass,
  Map,
  Calendar,
  ChevronRight,
} from "lucide-react-native";

import { useKnowNextStore } from "../../../store/knownext.store";
import { supabase } from "../../../lib/supabase";
const ROADMAPS = [] as any[];
const INDUSTRIES = [] as any[];
import { Industry, CareerStage, KnowNextView, NavContext } from "../types";
import { CareerStageFilter } from "./ExplorerScreens";

const { width } = Dimensions.get("window");

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
        style={styles.searchBarBox}
      >
        <Search color="#8FBDD7" size={18} />
        <Text style={styles.searchBarText}>Search careers, colleges, scholarships...</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
              <ArrowLeft color="#1C4966" size={24} />
            </TouchableOpacity>
            <TextInput
              placeholder="Type to search..."
              placeholderTextColor="#8FBDD7"
              value={query}
              onChangeText={setQuery}
              autoFocus
              style={styles.modalSearchInput}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <X color="#1C4966" size={20} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {results.length > 0 ? (
              results.map((item) => (
                <TouchableOpacity
                  key={`${item.type}-${item.id}`}
                  onPress={() => handleSelect(item)}
                  style={styles.searchResultItem}
                >
                  <Text style={styles.searchResultEmoji}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.searchResultTitle}>{item.title}</Text>
                    <Text style={styles.searchResultSub}>{item.type.toUpperCase()} • {item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : query.length >= 2 ? (
              <Text style={styles.noResultsText}>No results matching "{query}" found.</Text>
            ) : (
              <Text style={styles.noResultsText}>Start typing to search across all services...</Text>
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
  const { savedCareerIds, savedCollegeIds, savedScholarshipIds, activeRoadmapId, recentActivity } = useKnowNextStore();

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
    <View style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
      <LinearGradient
        colors={["#1C4966", "#5F8B70"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerSubtitle}>Relicus Guidance</Text>
            <Text style={styles.headerTitle}>KnowNext</Text>
          </View>
        </View>

        <GlobalSearch onNavigate={onNavigate} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Grid */}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statEmoji}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Global Stage Filter */}
        <View style={styles.stageCard}>
          <Text style={styles.stageCardTitle}>I want to explore paths suitable for:</Text>
          <CareerStageFilter />
        </View>

        {/* Saved Summary Alert */}
        {totalSaved > 0 && (
          <TouchableOpacity
            onPress={() => onNavigate("careerPlan")}
            style={styles.savedAlertCard}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={styles.savedAlertIcon}>
                <Star size={18} color="#F0AD4E" fill="#F0AD4E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedAlertTitle}>My Career Plan Workspace</Text>
                <Text style={styles.savedAlertDesc}>
                  You have {totalSaved} saved items to plan & track.
                </Text>
              </View>
              <Text style={styles.savedAlertArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Explore Categories Grid */}
        <Text style={styles.sectionTitle}>Explore Pathways</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() => onNavigate(cat.id as KnowNextView)}
              style={styles.categoryGridCard}
            >
              <LinearGradient colors={cat.color} style={styles.categoryGradient}>
                <Text style={styles.categoryIconText}>{cat.icon}</Text>
                <Text style={styles.categoryTitleText}>{cat.label}</Text>
                <Text style={styles.categoryDescText}>{cat.desc}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.activityCard}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentActivity.slice(0, 4).map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Activity size={16} color="#5F8B70" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityItemTitle}>{activity.title}</Text>
                  <Text style={styles.activityItemSubtitle}>{activity.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
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
    <View style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
      <LinearGradient
        colors={["#1C4966", "#5F8B70"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>My Career Plan</Text>
            <Text style={styles.headerSubtitle}>Workspace Dashboard</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Goal Card */}
        <View style={styles.goalDetailCard}>
          <Text style={styles.goalLabel}>🎯 CURRENT GOAL</Text>
          {careerGoal ? (
            <View style={styles.goalValueRow}>
              <Text style={styles.goalEmoji}>{careerGoal.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalTitle}>{careerGoal.title}</Text>
                <Text style={styles.goalCategory}>{careerGoal.category}</Text>
              </View>
              <TouchableOpacity onPress={() => onNavigate("careerExplorer")} style={styles.changeGoalBtn}>
                <Text style={styles.changeGoalText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noGoalRow}>
              <Text style={styles.noGoalText}>You haven't set a career goal yet.</Text>
              <TouchableOpacity onPress={() => onNavigate("careerExplorer")} style={styles.setGoalBtn}>
                <Text style={styles.setGoalText}>Set Goal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Roadmap Progress */}
        {activeRoadmap && (
          <View style={styles.goalDetailCard}>
            <Text style={styles.goalLabel}>🗺 ACTIVE ROADMAP</Text>
            <Text style={styles.roadmapTitle}>{activeRoadmap.careerTitle} Path</Text>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressPercentText}>{progressPercent}% Complete</Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate("learningPath", { selectedRoadmapId: activeRoadmap.id })}
              style={[styles.btn, { marginTop: 12 }]}
            >
              <Text style={styles.btnText}>Continue Journey</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Saved Counters */}
        <View style={styles.countersCard}>
          <TouchableOpacity onPress={() => onNavigate("savedItems")} style={styles.counterBox}>
            <Text style={styles.counterNum}>{savedCareerIds.length}</Text>
            <Text style={styles.counterLabel}>Saved Careers</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate("savedItems")} style={styles.counterBox}>
            <Text style={styles.counterNum}>{savedCollegeIds.length}</Text>
            <Text style={styles.counterLabel}>Saved Colleges</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate("savedItems")} style={styles.counterBox}>
            <Text style={styles.counterNum}>{savedScholarshipIds.length}</Text>
            <Text style={styles.counterLabel}>Saved Scholarships</Text>
          </TouchableOpacity>
        </View>

        {/* Deadline Tracker CTA */}
        {savedScholarshipIds.length > 0 && (
          <TouchableOpacity
            onPress={() => onNavigate("deadlineTracker")}
            style={styles.deadlineTrackerCta}
          >
            <Calendar size={18} color="#D9534F" />
            <Text style={styles.deadlineCtaText}>View Scholarship Deadlines</Text>
            <ChevronRight size={16} color="#D9534F" />
          </TouchableOpacity>
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
    <View style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
      <LinearGradient
        colors={["#1C4966", "#5F8B70"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Saved Items</Text>
            <Text style={styles.headerSubtitle}>Bookmarks manager</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs list */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("careers")}
          style={[styles.tabButton, activeTab === "careers" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === "careers" && styles.tabButtonTextActive]}>
            Careers ({careers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("colleges")}
          style={[styles.tabButton, activeTab === "colleges" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === "colleges" && styles.tabButtonTextActive]}>
            Colleges ({colleges.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("scholarships")}
          style={[styles.tabButton, activeTab === "scholarships" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === "scholarships" && styles.tabButtonTextActive]}>
            Scholarships ({scholarships.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === "careers" && (
          careers.map((career) => (
            <TouchableOpacity
              key={career.id}
              onPress={() => onNavigate("careerDetails", { selectedCareerId: career.id })}
              style={styles.savedListItem}
            >
              <Text style={styles.savedListEmoji}>{career.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedListTitle}>{career.title}</Text>
                <Text style={styles.savedListCategory}>{career.category}</Text>
              </View>
              <ChevronRight size={18} color="#8FBDD7" />
            </TouchableOpacity>
          ))
        )}

        {activeTab === "colleges" && (
          colleges.map((college) => (
            <TouchableOpacity
              key={college.id}
              onPress={() => onNavigate("collegeDetails", { selectedCollegeId: college.id })}
              style={styles.savedListItem}
            >
              <Text style={styles.savedListEmoji}>{college.icon || "🏛️"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedListTitle}>{college.name}</Text>
                <Text style={styles.savedListCategory}>{college.location}</Text>
              </View>
              <ChevronRight size={18} color="#8FBDD7" />
            </TouchableOpacity>
          ))
        )}

        {activeTab === "scholarships" && (
          scholarships.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => onNavigate("scholarshipDetails", { selectedScholarshipId: s.id })}
              style={styles.savedListItem}
            >
              <Text style={styles.savedListEmoji}>🎓</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedListTitle}>{s.name}</Text>
                <Text style={styles.savedListCategory}>{s.provider}</Text>
              </View>
              <ChevronRight size={18} color="#8FBDD7" />
            </TouchableOpacity>
          ))
        )}

        {((activeTab === "careers" && careers.length === 0) ||
          (activeTab === "colleges" && colleges.length === 0) ||
          (activeTab === "scholarships" && scholarships.length === 0)) && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved items in this category yet.</Text>
          </View>
        )}
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
    <View style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
      <LinearGradient
        colors={["#1C4966", "#5F8B70"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Industry Insights</Text>
            <Text style={styles.headerSubtitle}>Market demands & hiring growth</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {INDUSTRIES.map((industry) => (
          <TouchableOpacity
            key={industry.id}
            onPress={() => onNavigate("marketTrends", { selectedIndustryId: industry.id })}
            style={styles.card}
          >
            <View style={styles.cardRow}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>{industry.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{industry.name}</Text>
                <Text style={styles.cardTagline} numberOfLines={1}>{industry.description}</Text>
                <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                  <Text style={styles.industryStatVal}>📈 {industry.growthPercent}% YoY</Text>
                  <Text style={styles.industryStatVal}>₹ {industry.avgSalaryLPA} LPA Avg</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#8FBDD7" />
            </View>
          </TouchableOpacity>
        ))}
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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Industry details not found.</Text>
        <TouchableOpacity onPress={onBack} style={styles.btn}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
      <LinearGradient
        colors={["#1C4966", "#5F8B70"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{industry.name} Trends</Text>
            <Text style={styles.headerSubtitle}>Growth scope & requirements</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.detailsScrollContent}>
        {/* Industry summary */}
        <View style={styles.detailCard}>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <Text style={styles.overviewEmoji}>{industry.icon}</Text>
            <Text style={styles.overviewTagline}>{industry.growthPercent}% Annual Growth Rate</Text>
          </View>
          <Text style={styles.overviewText}>{industry.description}</Text>
        </View>

        {/* Future Skills & Emerging Technologies */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Emerging Technologies</Text>
          <View style={styles.skillsTagWrap}>
            {industry.marketTrends.emergingTechnologies.map((tech) => (
              <View key={tech} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{tech}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionHeaderTitle, { marginTop: 20 }]}>Future Skills Needed</Text>
          <View style={styles.skillsTagWrap}>
            {industry.marketTrends.futureSkills.map((skill) => (
              <View key={skill} style={[styles.skillTag, { backgroundColor: "#F0FDFA" }]}>
                <Text style={[styles.skillTagText, { color: "#0D9488" }]}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Recruiters */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Top Recruiters in India</Text>
          {industry.topRecruiters.map((recruiter) => (
            <View key={recruiter} style={styles.bulletItem}>
              <Text style={styles.bulletDot}>🏢</Text>
              <Text style={styles.bulletText}>{recruiter}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ── Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 44,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    marginTop: 16,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchBarText: {
    fontSize: 13,
    color: "#8FBDD7",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.08)",
    gap: 12,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#1C4966",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    gap: 12,
  },
  searchResultEmoji: {
    fontSize: 22,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
  },
  searchResultSub: {
    fontSize: 11,
    color: "#8FBDD7",
    marginTop: 2,
  },
  noResultsText: {
    fontSize: 14,
    color: "#8FBDD7",
    textAlign: "center",
    marginTop: 40,
  },
  scrollContent: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  statEmoji: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#8FBDD7",
    marginTop: 2,
  },
  stageCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  stageCardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 12,
  },
  savedAlertCard: {
    backgroundColor: "#FFFDF0",
    borderWidth: 1,
    borderColor: "#FFFBE6",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  savedAlertIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFFBE6",
    alignItems: "center",
    justifyContent: "center",
  },
  savedAlertTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#7C2D12",
  },
  savedAlertDesc: {
    fontSize: 11,
    color: "#D97706",
    marginTop: 2,
  },
  savedAlertArrow: {
    fontSize: 18,
    color: "#F59E0B",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  categoryGridCard: {
    width: (width - 42) / 2,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  categoryGradient: {
    padding: 16,
    minHeight: 120,
  },
  categoryIconText: {
    fontSize: 22,
  },
  categoryTitleText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 8,
  },
  categoryDescText: {
    fontSize: 10,
    color: "#5F8B70",
    marginTop: 4,
    lineHeight: 14,
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#F5F7FA",
  },
  activityItemTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1C4966",
  },
  activityItemSubtitle: {
    fontSize: 10,
    color: "#8FBDD7",
    marginTop: 1,
  },
  goalDetailCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#8FBDD7",
    marginBottom: 12,
  },
  goalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalEmoji: {
    fontSize: 28,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  goalCategory: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 2,
  },
  changeGoalBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#5F8B70",
  },
  changeGoalText: {
    fontSize: 11,
    color: "#5F8B70",
    fontWeight: "bold",
  },
  noGoalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noGoalText: {
    fontSize: 13,
    color: "#8FBDD7",
  },
  setGoalBtn: {
    backgroundColor: "#1C4966",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  setGoalText: {
    fontSize: 11,
    color: "white",
    fontWeight: "bold",
  },
  progressBarWrapper: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#F5F7FA",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1C4966",
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 11,
    color: "#8FBDD7",
    marginTop: 6,
    fontWeight: "bold",
  },
  countersCard: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  counterBox: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  counterNum: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C4966",
  },
  counterLabel: {
    fontSize: 10,
    color: "#8FBDD7",
    marginTop: 4,
    textAlign: "center",
  },
  deadlineTrackerCta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(217, 83, 79, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(217, 83, 79, 0.15)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  deadlineCtaText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "bold",
    color: "#D9534F",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.08)",
    backgroundColor: "white",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabButtonActive: {
    borderColor: "#1C4966",
  },
  tabButtonText: {
    fontSize: 12,
    color: "#8FBDD7",
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: "#1C4966",
    fontWeight: "bold",
  },
  savedListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    gap: 12,
  },
  savedListEmoji: {
    fontSize: 22,
  },
  savedListTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
  },
  savedListCategory: {
    fontSize: 11,
    color: "#5F8B70",
    marginTop: 2,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#8FBDD7",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.06)",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(143, 189, 215, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  cardTagline: {
    fontSize: 12,
    color: "#8FBDD7",
    marginTop: 2,
  },
  industryStatVal: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1C4966",
  },
  detailsScrollContent: {
    padding: 16,
    gap: 16,
  },
  detailCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  overviewEmoji: {
    fontSize: 32,
  },
  overviewTagline: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  overviewText: {
    fontSize: 14,
    color: "#5F8B70",
    lineHeight: 20,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 16,
  },
  skillsTagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: "rgba(28, 73, 102, 0.06)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillTagText: {
    fontSize: 12,
    color: "#1C4966",
    fontWeight: "bold",
  },
  bulletItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  bulletDot: {
    color: "#5F8B70",
  },
  bulletText: {
    fontSize: 14,
    color: "#5F8B70",
    flex: 1,
  },
  btn: {
    backgroundColor: "#1C4966",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  roadmapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 8,
    marginBottom: 12,
  },
  bookmarkHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    backgroundColor: "rgba(143, 189, 215, 0.06)",
    padding: 12,
    borderRadius: 12,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#8FBDD7",
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 2,
  },
});
