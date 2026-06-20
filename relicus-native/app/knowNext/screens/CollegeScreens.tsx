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
  Bookmark,
  MapPin,
  Award,
  BookOpen,
  DollarSign,
  Briefcase,
  ChevronRight,
  Scale,
} from "lucide-react-native";

import { useKnowNextStore } from "../../../store/knowNext.store";
import { COLLEGES } from "../../../constants/knowNext/colleges";
import { College, CareerStage, KnowNextView, NavContext } from "../types";
import { CareerStageFilter, CompareDrawer } from "./ExplorerScreens";

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
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onSelect(college)}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{college.icon || "🏛️"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardCategory}>{college.type} College</Text>
          <Text style={styles.cardTitle}>{college.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <MapPin size={12} color="#5F8B70" />
            <Text style={styles.cardTagline}>{college.location}, {college.state}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statChip}>
          <Award size={12} color="#1C4966" />
          <Text style={styles.statChipText}>NIRF Rank #{college.ranking}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipText}>₹{(college.feeRange.min / 100000).toFixed(1)}-{(college.feeRange.max / 100000).toFixed(1)}L/yr</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() => toggleSaveCollege(college.id)}
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
          onPress={() => toggleCompareCollege(college.id)}
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

// ── 1. College Explorer ──────────────────────────────
interface CollegeExplorerProps {
  onNavigate: (view: KnowNextView, context?: NavContext) => void;
  onBack: () => void;
}

export const CollegeExplorer: React.FC<CollegeExplorerProps> = ({ onNavigate, onBack }) => {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const { activeStage, compareCollegeIds, clearCollegeComparison } = useKnowNextStore();

  const filtered = useMemo(() => {
    return COLLEGES.filter((c) => {
      const matchesQuery =
        query.trim().length < 2 ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.shortName.toLowerCase().includes(query.toLowerCase()) ||
        c.location.toLowerCase().includes(query.toLowerCase());
      const matchesType = selectedType === "All" || c.type === selectedType;
      const matchesStage = activeStage === "all" || c.applicableStages.includes(activeStage as CareerStage);
      return matchesQuery && matchesType && matchesStage;
    }).sort((a, b) => a.ranking - b.ranking);
  }, [query, selectedType, activeStage]);

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
            <Text style={styles.headerTitle}>Colleges & Universities</Text>
            <Text style={styles.headerSubtitle}>{COLLEGES.length} institutions</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#8FBDD7" size={18} style={styles.searchIcon} />
          <TextInput
            placeholder="Search colleges, cities..."
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
        {/* Type horizontal selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {TYPES.map((type) => {
            const active = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.resultsText}>
          {filtered.length} colleges found
        </Text>

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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No colleges matching selection found.</Text>
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
  const college = useMemo(() => COLLEGES.find((c) => c.id === collegeId), [collegeId]);
  const { savedCollegeIds, toggleSaveCollege } = useKnowNextStore();
  const isSaved = savedCollegeIds.includes(college?.id || "");

  if (!college) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>College details not found.</Text>
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
            <Text style={styles.headerTitle} numberOfLines={1}>{college.name}</Text>
            <Text style={styles.headerSubtitle}>{college.location}, {college.state}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleSaveCollege(college.id)}
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
        {/* Info Box */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Institution Overview</Text>
          <Text style={styles.overviewText}>{college.overview}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>NIRF RANKING</Text>
              <Text style={styles.metaValue}>#{college.ranking}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>FEE RANGE</Text>
              <Text style={styles.metaValue}>₹{(college.feeRange.min / 100000).toFixed(1)}-{(college.feeRange.max / 100000).toFixed(1)}L/yr</Text>
            </View>
          </View>
        </View>

        {/* Section Placements */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Placement Statistics</Text>
          <View style={styles.placementStatBox}>
            <View style={styles.placementStatCol}>
              <Text style={styles.placementStatLabel}>Avg Package</Text>
              <Text style={styles.placementStatValue}>₹{college.placementAvgPackage} LPA</Text>
            </View>
            <View style={styles.placementStatCol}>
              <Text style={styles.placementStatLabel}>Highest Package</Text>
              <Text style={styles.placementStatValue}>₹{college.placementTopPackage} LPA</Text>
            </View>
            <View style={styles.placementStatCol}>
              <Text style={styles.placementStatLabel}>Placement Rate</Text>
              <Text style={styles.placementStatValue}>{college.placementRate}%</Text>
            </View>
          </View>
        </View>

        {/* Section: Admission & Exams */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Admission & Entrance Exams</Text>
          <Text style={styles.metaLabel}>ACCEPTED ENTRANCE EXAMS</Text>
          <View style={styles.skillsTagWrap}>
            {college.entranceExamsAccepted.map((exam) => (
              <View key={exam} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{exam}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.metaLabel, { marginTop: 16 }]}>ADMISSION STEPS</Text>
          {college.admissionProcess.map((step, idx) => (
            <View key={idx} style={styles.bulletItem}>
              <Text style={styles.bulletDot}>{idx + 1}.</Text>
              <Text style={styles.bulletText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Section: Courses */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Courses Offered</Text>
          {college.coursesOffered.map((course) => (
            <View key={course} style={styles.bulletItem}>
              <Text style={styles.bulletDot}>📚</Text>
              <Text style={styles.bulletText}>{course}</Text>
            </View>
          ))}
        </View>

        {/* Section: Scholarships */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Scholarships & Aids</Text>
          <Text style={styles.overviewText}>
            {college.scholarshipsAvailable
              ? college.scholarshipDetails
              : "No specific college institutional scholarships listed. Feel free to explore general external scholarships in the Scholarships finder."}
          </Text>
        </View>
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
  const colleges = useMemo(() => {
    return compareIds.map((id) => COLLEGES.find((c) => c.id === id)).filter(Boolean) as College[];
  }, [compareIds]);

  const { clearCollegeComparison } = useKnowNextStore();

  const handleClear = () => {
    clearCollegeComparison();
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
            <Text style={styles.headerTitle}>Compare Colleges</Text>
            <Text style={styles.headerSubtitle}>{colleges.length} selected</Text>
          </View>
          <TouchableOpacity onPress={handleClear}>
            <Text style={{ color: "white", fontSize: 13, fontWeight: "bold" }}>Reset</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView horizontal contentContainerStyle={{ padding: 16 }}>
        <View style={styles.compareTableColumnLabels}>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>College</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Type</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Ranking</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Rating</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Avg Package</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Max Package</Text></View>
          <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Placements %</Text></View>
        </View>

        {colleges.map((college) => (
          <View key={college.id} style={styles.compareTableColumnData}>
            <View style={styles.compareDataCellHeader}>
              <Text style={styles.compareEmoji}>{college.icon || "🏛️"}</Text>
              <Text style={styles.compareNameText} numberOfLines={1}>{college.shortName}</Text>
            </View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueText} numberOfLines={1}>{college.type}</Text></View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueTextBold}>NIRF #{college.ranking}</Text></View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueText}>⭐ {college.rating}/5</Text></View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueTextBold}>₹{college.placementAvgPackage} LPA</Text></View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueText}>₹{college.placementTopPackage} LPA</Text></View>
            <View style={styles.compareDataCell}><Text style={styles.compareValueText}>{college.placementRate}%</Text></View>
          </View>
        ))}
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
    backgroundColor: "rgba(143, 189, 215, 0.08)",
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
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 16,
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
  placementStatBox: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  placementStatCol: {
    flex: 1,
    alignItems: "center",
  },
  placementStatLabel: {
    fontSize: 11,
    color: "#8FBDD7",
  },
  placementStatValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 4,
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
});
