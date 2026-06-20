import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { ArrowLeft, Star, MapPin, Languages, Award } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

export default function TherapistProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [therapist, setTherapist] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTherapist() {
      try {
        const { data, error } = await supabase
          .from("therapist_details")
          .select("*")
          .eq("id", id)
          .single();
        if (data) {
          setTherapist(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTherapist();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#1C4966" }}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!therapist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#1C4966", marginBottom: 16 }}>Therapist not found.</Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#1C4966", "#5F8B70"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>

          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{therapist.photo}</Text>
            </View>
            <Text style={styles.userName}>{therapist.name}</Text>
            <Text style={styles.userExperience}>{therapist.experience} experience</Text>
            <View style={styles.ratingBadge}>
              <Star color="#F1C40F" size={14} fill="#F1C40F" />
              <Text style={styles.ratingText}>
                {therapist.rating} ({therapist.reviews} reviews)
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.detailsContainer}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.cardText}>{therapist.about}</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Specialization</Text>
            <View style={styles.badgeContainer}>
              {therapist.specialization?.map((spec: string) => (
                <View key={spec} style={styles.badge}>
                  <Text style={styles.badgeText}>{spec}</Text>
                </View>
              ))}
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.card}
          >
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Languages color="#1C4966" size={20} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Languages</Text>
                <Text style={styles.infoValue}>{therapist.languages?.join(", ")}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, { marginTop: 16 }]}>
              <View style={styles.infoIconBox}>
                <Award color="#1C4966" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Education</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {therapist.education}
                </Text>
              </View>
            </View>

            <View style={[styles.infoRow, { marginTop: 16 }]}>
              <View style={styles.infoIconBox}>
                <MapPin color="#1C4966" size={20} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{therapist.location}</Text>
              </View>
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Availability</Text>
            <View style={styles.daysRow}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                const isAvailable = therapist.availability?.includes(day);
                return (
                  <View
                    key={day}
                    style={[
                      styles.dayBox,
                      isAvailable ? styles.dayAvailable : styles.dayUnavailable,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isAvailable ? styles.dayTextAvailable : styles.dayTextUnavailable,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
          >
            <LinearGradient
              colors={["#1C4966", "#5F8B70"]}
              style={styles.footerBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View>
                <Text style={styles.feeLabel}>Session Fee</Text>
                <Text style={styles.feeValue}>{therapist.fee}</Text>
              </View>
              <Button
                variant="secondary"
                onPress={() => router.push({ pathname: "/counselling/book" as any, params: { id, fee: therapist.fee, name: therapist.name } })}
                style={styles.bookButton}
              >
                Book Session
              </Button>
            </LinearGradient>
          </MotiView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingBottom: 64,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    width: 108,
    height: 108,
    backgroundColor: "white",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1C4966",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  userExperience: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  detailsContainer: {
    padding: 24,
    marginTop: -40,
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: "#5F8B70",
    lineHeight: 22,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(143, 189, 215, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 13,
    color: "#1C4966",
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(143, 189, 215, 0.15)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#8FBDD7",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C4966",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  dayBox: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  dayAvailable: {
    backgroundColor: "#5F8B70",
  },
  dayUnavailable: {
    backgroundColor: "#F5F7FA",
  },
  dayText: {
    fontSize: 11,
    fontWeight: "600",
  },
  dayTextAvailable: {
    color: "white",
  },
  dayTextUnavailable: {
    color: "#8FBDD7",
  },
  footerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  feeLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  feeValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  bookButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
  },
});
