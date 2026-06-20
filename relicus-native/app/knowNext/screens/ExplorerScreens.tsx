import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Bookmark,
  Check,
  Plus,
  Scale,
  GraduationCap,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";

import { useKnowNextStore } from "../../../store/knowNext.store";
import { CAREERS, CAREER_CATEGORIES } from "../../../constants/knowNext/careers";
import { ROADMAPS } from "../../../constants/knowNext/roadmaps";
import { Career, CareerStage, KnowNextView, NavContext } from "../types";

const { width } = Dimensions.get("window");

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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stageFilterScroll}>
      {stages.map((stage) => {
        const active = activeStage === stage.id;
        return (
          <TouchableOpacity
            key={stage.id}
            onPress={() => setActiveStage(stage.id)}
            style={[styles.stageChip, active && styles.stageChipActive]}
          >
            <Text style={[styles.stageChipText, active && styles.stageChipTextActive]}>
              {stage.label}
            </Text>
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
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onSelect(career)}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{career.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardCategory}>{career.category}</Text>
          <Text style={styles.cardTitle}>{career.title}</Text>
          <Text style={styles.cardTagline} numberOfLines={1}>
            {career.tagline}
          </Text>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statChip}>
          <TrendingUp size={12} color="#5F8B70" />
          <Text style={styles.statChipText}>{career.industryDemand} Demand</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipText}>₹{career.salaryRange.min}-{career.salaryRange.max} LPA</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() => toggleSaveCareer(career.id)}
          style={styles.cardActionBtn}
        >
          <Bookmark
            size={16}
            color={isSaved ? "#5F8B70" : "#8FBDD7"}
            fill={isSaved ? "#5F8B70" : "transparent"}
          />
          <Text style={[styles.actionBtnText, isSaved && { color: "#5F8B70" }]}>
            {isSaved ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleCompareCareer(career.id)}
          style={styles.cardActionBtn}
        >
          <Scale size={16} color={isComparing ? "#1C4966" : "#8FBDD7"} />
          <Text style={[styles.actionBtnText, isComparing && { color: "#1C4966", fontWeight: "bold" }]}>
            {isComparing ? "Added" : "Compare"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
    <View style={styles.drawerContainer}>
      <Text style={styles.drawerText}>
        {count} items selected for comparison
      </Text>
      <View style={styles.drawerActions}>
        <TouchableOpacity onPress={onClear} style={styles.drawerClearBtn}>
          <Text style={styles.drawerClearText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCompare} style={styles.drawerCompareBtn}>
          <Text style={styles.drawerCompareText}>Compare Now</Text>
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

  const filtered = useMemo(() => {
    return CAREERS.filter((c) => {
      const matchesQuery =
        query.trim().length < 2 ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase()) ||
        c.requiredSkills.some((s) => s.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      const matchesStage =
        activeStage === "all" || c.applicableStages.includes(activeStage as CareerStage);
      return matchesQuery && matchesCategory && matchesStage;
    });
  }, [query, selectedCategory, activeStage]);

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
            <Text style={styles.headerTitle}>Career Explorer</Text>
            <Text style={styles.headerSubtitle}>{CAREERS.length} career paths</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#8FBDD7" size={18} style={styles.searchIcon} />
          <TextInput
            placeholder="Search careers, skills, industries..."
            placeholderTextColor="#8FBDD7"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
      </LinearGradient>

      <View style={styles.filterSection}>
        <CareerStageFilter />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category horizontal scrolling tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {["All", ...CAREER_CATEGORIES].map((category) => {
            const active = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.resultsText}>
          {filtered.length} careers matching filters
        </Text>

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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No careers matches found.</Text>
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
  const career = useMemo(() => CAREERS.find((c) => c.id === careerId), [careerId]);
  const roadmap = useMemo(() => ROADMAPS.find((r) => r.careerId === careerId), [careerId]);

  const { savedCareerIds, toggleSaveCareer, setCareerGoal, setActiveRoadmap } = useKnowNextStore();
  const isSaved = savedCareerIds.includes(career?.id || "");

  if (!career) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Career details not found.</Text>
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
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{career.title}</Text>
            <Text style={styles.headerSubtitle}>{career.category}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleSaveCareer(career.id)}
            style={styles.bookmarkHeaderBtn}
          >
            <Bookmark
              size={22}
              color="white"
              fill={isSaved ? "white" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.detailsScrollContent}>
        {/* Card Overview */}
        <View style={styles.detailCard}>
          <View style={styles.overviewHeaderRow}>
            <Text style={styles.overviewEmoji}>{career.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.overviewTagline}>{career.tagline}</Text>
            </View>
          </View>
          <Text style={styles.overviewText}>{career.overview}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>SALARY RANGE</Text>
              <Text style={styles.metaValue}>₹{career.salaryRange.min}-{career.salaryRange.max} LPA</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>INDUSTRY DEMAND</Text>
              <Text style={styles.metaValue}>{career.industryDemand}</Text>
            </View>
          </View>

          {/* Set Goal / Start Roadmap CTAs */}
          <View style={styles.goalCtaRow}>
            <TouchableOpacity
              onPress={() => {
                setCareerGoal(career.id);
                alert(`${career.title} has been set as your Career Goal!`);
              }}
              style={[styles.btn, { flex: 1, backgroundColor: "#5F8B70" }]}
            >
              <Text style={styles.btnText}>Set as Goal</Text>
            </TouchableOpacity>

            {roadmap && (
              <TouchableOpacity
                onPress={() => {
                  setActiveRoadmap(roadmap.id);
                  onNavigate("learningPath", { selectedRoadmapId: roadmap.id });
                }}
                style={[styles.btn, { flex: 1 }]}
              >
                <Text style={styles.btnText}>Start Roadmap</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section: Educational Path */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Educational Path</Text>
          {career.educationalPath.map((step, idx) => (
            <View key={idx} style={styles.eduStepItem}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eduStepLevel}>{step.level}</Text>
                <Text style={styles.eduStepDuration}>{step.duration}</Text>
                <Text style={styles.eduStepColleges}>Colleges: {step.institutions.join(", ")}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Section: Skills & Entrance Exams */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Required Skills</Text>
          <View style={styles.skillsTagWrap}>
            {career.requiredSkills.map((skill) => (
              <View key={skill} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{skill}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionHeaderTitle, { marginTop: 20 }]}>Entrance Exams</Text>
          <View style={styles.skillsTagWrap}>
            {career.entranceExams.map((exam) => (
              <View key={exam} style={[styles.skillTag, { backgroundColor: "#F0F4F8" }]}>
                <Text style={[styles.skillTagText, { color: "#1C4966" }]}>{exam}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section: Job Roles & Growth */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Future Scope & Growth</Text>
          <Text style={styles.overviewText}>{career.futureScope}</Text>

          <Text style={[styles.sectionHeaderTitle, { marginTop: 20 }]}>Top Job Roles</Text>
          {career.jobRoles.map((role) => (
            <View key={role} style={styles.bulletItem}>
              <Text style={styles.bulletDot}>✦</Text>
              <Text style={styles.bulletText}>{role}</Text>
            </View>
          ))}

          <Text style={[styles.sectionHeaderTitle, { marginTop: 20 }]}>Growth Opportunities</Text>
          {career.growthOpportunities.map((opportunity) => (
            <View key={opportunity} style={styles.bulletItem}>
              <Text style={styles.bulletDot}>✦</Text>
              <Text style={styles.bulletText}>{opportunity}</Text>
            </View>
          ))}
        </View>
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
  const careers = useMemo(() => {
    return compareIds.map((id) => CAREERS.find((c) => c.id === id)).filter(Boolean) as Career[];
  }, [compareIds]);

  const { clearCareerComparison } = useKnowNextStore();

  const handleClear = () => {
    clearCareerComparison();
    onBack();
  };

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
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Compare Careers</Text>
            <Text style={styles.headerSubtitle}>{careers.length} selected</Text>
          </View>
          <TouchableOpacity onPress={handleClear}>
            <Text style={{ color: "white", fontSize: 13, fontWeight: "bold" }}>Reset</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView horizontal contentContainerStyle={{ padding: 16 }}>
        <View style={styles.compareTableColumnLabels}>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Career</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Industry</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Avg Salary</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Demand</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Growth %</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Exams</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Skills</Text></View>
        </View>

        {careers.map((career) => (
          <View key={career.id} style={styles.compareTableColumnData}>
            <View style={styles.compareDataCellHeader}>
              <Text style={styles.compareEmoji}>{career.icon}</Text>
              <Text style={styles.compareNameText} numberOfLines={1}>{career.title}</Text>
            </View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueText} numberOfLines={1}>{career.industry}</Text></View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueTextBold}>₹{career.avgSalary} LPA</Text></View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueText}>{career.industryDemand}</Text></View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueText}>{career.growthPercent}%</Text></View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueText} numberOfLines={1}>{career.entranceExams.join(", ")}</Text></View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueText} numberOfLines={2}>{career.requiredSkills.slice(0, 3).join(", ")}</Text></View>
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
            <Text style={styles.headerTitle}>Career Roadmaps</Text>
            <Text style={styles.headerSubtitle}>{ROADMAPS.length} milestones journeys</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.filterSection}>
        <CareerStageFilter />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredRoadmaps.map((roadmap) => (
          <TouchableOpacity
            key={roadmap.id}
            onPress={() => onNavigate("learningPath", { selectedRoadmapId: roadmap.id })}
            style={styles.card}
          >
            <View style={styles.cardRow}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>{roadmap.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{roadmap.careerTitle} Path</Text>
                <Text style={styles.cardTagline}>
                  {roadmap.totalSteps} Milestones • {roadmap.estimatedDuration}
                </Text>
              </View>
              <ChevronRight size={20} color="#8FBDD7" />
            </View>
          </TouchableOpacity>
        ))}
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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Please select a career path first.</Text>
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
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{roadmap.careerTitle} Path</Text>
            <Text style={styles.headerSubtitle}>{roadmap.estimatedDuration} estimated</Text>
          </View>
          <View style={styles.progressRingBadge}>
            <Text style={styles.progressRingText}>{progressPercent}%</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.timelineContainer}>
          {roadmap.steps.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            return (
              <View key={step.id} style={styles.timelineItem}>
                <View style={styles.timelineConnectorCol}>
                  <TouchableOpacity
                    onPress={() => completeRoadmapStep(roadmap.id, step.id)}
                    style={[styles.timelineNodeCircle, isCompleted && styles.timelineNodeCircleCompleted]}
                  >
                    {isCompleted ? (
                      <Check size={14} color="white" />
                    ) : (
                      <Plus size={14} color="#1C4966" />
                    )}
                  </TouchableOpacity>
                  {idx < roadmap.steps.length - 1 && <View style={styles.timelineLine} />}
                </View>

                <View style={[styles.timelineCard, isCompleted && styles.timelineCardCompleted]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.timelineStepNum}>Step {step.order}</Text>
                    <Text style={styles.timelineDuration}>{step.duration}</Text>
                  </View>
                  <Text style={styles.timelineTitle}>{step.title}</Text>
                  <Text style={styles.timelineDesc}>{step.description}</Text>

                  {step.skillsRequired.length > 0 && (
                    <View style={styles.timelineTagWrap}>
                      {step.skillsRequired.map((s) => (
                        <View key={s} style={styles.timelineTag}>
                          <Text style={styles.timelineTagText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "#1C4966",
  },
  filterSection: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  stageFilterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  stageChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(143, 189, 215, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.2)",
    marginRight: 8,
  },
  stageChipActive: {
    backgroundColor: "#1C4966",
    borderColor: "#1C4966",
  },
  stageChipText: {
    fontSize: 12,
    color: "#1C4966",
    fontWeight: "600",
  },
  stageChipTextActive: {
    color: "white",
  },
  scrollContent: {
    padding: 16,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDEEE3",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#5F8B70",
    borderColor: "#5F8B70",
  },
  categoryChipText: {
    fontSize: 12,
    color: "#5F8B70",
    fontWeight: "bold",
  },
  categoryChipTextActive: {
    color: "white",
  },
  resultsText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
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
  cardCategory: {
    fontSize: 10,
    color: "#5F8B70",
    fontWeight: "bold",
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
  cardStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(95, 139, 112, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1C4966",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F5F7FA",
    marginVertical: 12,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    color: "#8FBDD7",
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
  bookmarkHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
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
  overviewHeaderRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
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
  goalCtaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
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
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 16,
  },
  eduStepItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1C4966",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  eduStepLevel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
  },
  eduStepDuration: {
    fontSize: 12,
    color: "#8FBDD7",
    marginTop: 2,
  },
  eduStepColleges: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 4,
  },
  skillsTagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    backgroundColor: "rgba(95, 139, 112, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillTagText: {
    fontSize: 12,
    color: "#5F8B70",
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
  compareTableColumnLabels: {
    width: 90,
    gap: 1,
  },
  compareLabelCell: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "rgba(28, 73, 102, 0.05)",
  },
  compareLabelText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1C4966",
  },
  compareTableColumnData: {
    width: 150,
    borderLeftWidth: 1,
    borderColor: "#E6E6D5",
    gap: 1,
  },
  compareDataCellHeader: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "rgba(28, 73, 102, 0.08)",
  },
  compareEmoji: {
    fontSize: 18,
  },
  compareNameText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 2,
  },
  compareDataCell: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "white",
  },
  compareValueText: {
    fontSize: 12,
    color: "#5F8B70",
  },
  compareValueTextBold: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1C4966",
  },
  progressRingBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#5F8B70",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  progressRingText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  timelineContainer: {
    padding: 20,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 16,
  },
  timelineConnectorCol: {
    alignItems: "center",
    width: 28,
  },
  timelineNodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(143, 189, 215, 0.2)",
    borderWidth: 2,
    borderColor: "#1C4966",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timelineNodeCircleCompleted: {
    backgroundColor: "#5F8B70",
    borderColor: "#5F8B70",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#1C4966",
    marginVertical: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  timelineCardCompleted: {
    backgroundColor: "rgba(95, 139, 112, 0.02)",
    borderColor: "rgba(95, 139, 112, 0.15)",
  },
  timelineStepNum: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#8FBDD7",
  },
  timelineDuration: {
    fontSize: 10,
    color: "#5F8B70",
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 4,
  },
  timelineDesc: {
    fontSize: 13,
    color: "#5F8B70",
    marginTop: 6,
    lineHeight: 18,
  },
  timelineTagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  timelineTag: {
    backgroundColor: "rgba(143, 189, 215, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timelineTagText: {
    fontSize: 10,
    color: "#1C4966",
    fontWeight: "600",
  },
  drawerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerText: {
    fontSize: 13,
    color: "#1C4966",
    fontWeight: "600",
  },
  drawerActions: {
    flexDirection: "row",
    gap: 8,
  },
  drawerClearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8FBDD7",
  },
  drawerClearText: {
    fontSize: 12,
    color: "#1C4966",
  },
  drawerCompareBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#1C4966",
  },
  drawerCompareText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
});
