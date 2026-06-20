import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  DollarSign,
  Award,
  BookOpen,
  ChevronRight,
  ExternalLink,
} from "lucide-react-native";

import { useKnowNextStore } from "../../../store/knowNext.store";
import { SCHOLARSHIPS } from "../../../constants/knowNext/scholarships";
import { Scholarship, CareerStage, KnowNextView, NavContext } from "../types";
import { CareerStageFilter } from "./ExplorerScreens";

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
  let color = "#5CB85C"; // green
  let bg = "rgba(92, 184, 92, 0.15)";
  if (days <= 15) {
    color = "#D9534F"; // red
    bg = "rgba(217, 83, 79, 0.15)";
  } else if (days <= 30) {
    color = "#F0AD4E"; // orange
    bg = "rgba(240, 173, 78, 0.15)";
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{days} days left</Text>
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
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onSelect(scholarship)}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🎓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardCategory}>{scholarship.category} Scholarship</Text>
          <Text style={styles.cardTitle}>{scholarship.name}</Text>
          <Text style={styles.cardTagline}>Provided by {scholarship.provider}</Text>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statChip}>
          <DollarSign size={12} color="#1C4966" />
          <Text style={styles.statChipText}>₹{scholarship.amount.toLocaleString()} ({scholarship.frequency})</Text>
        </View>
        <DeadlineBadge deadline={scholarship.deadline} />
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() => toggleSaveScholarship(scholarship.id)}
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
      </View>
    </TouchableOpacity>
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

  const filtered = useMemo(() => {
    return SCHOLARSHIPS.filter((s) => {
      const matchesCat = selectedCat === "All" || s.category === selectedCat;
      const matchesStage = activeStage === "all" || s.applicableStages.includes(activeStage as CareerStage);
      const isOpen = new Date(s.deadline) > new Date();
      return matchesCat && matchesStage && isOpen;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [selectedCat, activeStage]);

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
            <Text style={styles.headerTitle}>Scholarship Finder</Text>
            <Text style={styles.headerSubtitle}>{filtered.length} active programs</Text>
          </View>
        </View>
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>Sorted by deadline · closest first</Text>
        </View>
      </LinearGradient>

      <View style={styles.filterSection}>
        <CareerStageFilter />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category horizontal tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCat(cat)}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.resultsText}>
          {filtered.length} scholarships found
        </Text>

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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active scholarships found matching filters.</Text>
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
  const scholarship = useMemo(() => SCHOLARSHIPS.find((s) => s.id === scholarshipId), [scholarshipId]);
  const { savedScholarshipIds, toggleSaveScholarship } = useKnowNextStore();
  const isSaved = savedScholarshipIds.includes(scholarship?.id || "");

  if (!scholarship) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Scholarship details not found.</Text>
        <TouchableOpacity onPress={onBack} style={styles.btn}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const daysLeft = getDaysRemaining(scholarship.deadline);

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
            <Text style={styles.headerTitle} numberOfLines={1}>{scholarship.name}</Text>
            <Text style={styles.headerSubtitle}>By {scholarship.provider}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleSaveScholarship(scholarship.id)}
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
        {/* Info Card */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Overview & Value</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>AWARD AMOUNT</Text>
              <Text style={styles.metaValue}>₹{scholarship.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>FREQUENCY</Text>
              <Text style={styles.metaValue}>{scholarship.frequency}</Text>
            </View>
          </View>

          <View style={[styles.metaRow, { marginTop: 12 }]}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>DEADLINE</Text>
              <Text style={styles.metaValue}>{new Date(scholarship.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>DAYS REMAINING</Text>
              <Text style={[styles.metaValue, { color: daysLeft <= 15 ? "#D9534F" : "#5CB85C" }]}>
                {daysLeft} days
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Eligibility */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Eligibility Criteria</Text>
          {scholarship.eligibility.map((criteria, index) => (
            <View key={index} style={styles.bulletItem}>
              <Text style={styles.bulletDot}>✔</Text>
              <Text style={styles.bulletText}>{criteria}</Text>
            </View>
          ))}
        </View>

        {/* Section: Required Documents */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionHeaderTitle}>Required Documents</Text>
          {scholarship.requiredDocuments.map((doc, index) => (
            <View key={index} style={styles.bulletItem}>
              <Text style={styles.bulletDot}>📄</Text>
              <Text style={styles.bulletText}>{doc}</Text>
            </View>
          ))}
        </View>

        {/* CTA to Apply */}
        <TouchableOpacity
          onPress={() => alert(`Redirecting to portal: ${scholarship.applicationUrl}`)}
          style={[styles.btn, { marginHorizontal: 4 }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.btnText}>Apply Now</Text>
            <ExternalLink size={16} color="white" />
          </View>
        </TouchableOpacity>
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

  const savedScholarships = useMemo(() => {
    return SCHOLARSHIPS.filter((s) => savedScholarshipIds.includes(s.id))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [savedScholarshipIds]);

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
            <Text style={styles.headerTitle}>Deadline Tracker</Text>
            <Text style={styles.headerSubtitle}>{savedScholarships.length} saved programs</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savedScholarships.length > 0 ? (
          savedScholarships.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => onNavigate("scholarshipDetails", { selectedScholarshipId: s.id })}
              style={styles.card}
            >
              <View style={styles.cardRow}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconText}>📅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardCategory}>{s.category} Scholarship</Text>
                  <Text style={styles.cardTitle}>{s.name}</Text>
                  <Text style={styles.cardTagline}>
                    Deadline: {new Date(s.deadline).toLocaleDateString()}
                  </Text>
                </View>
                <DeadlineBadge deadline={s.deadline} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved scholarships yet. Bookmark a scholarship to track its deadline here!</Text>
          </View>
        )}
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
  infoBanner: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 10,
    marginTop: 12,
    alignItems: "center",
  },
  infoBannerText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
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
