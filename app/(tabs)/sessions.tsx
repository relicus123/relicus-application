import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Search, SlidersHorizontal, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

export default function SessionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchTherapists() {
      try {
        const { data, error } = await supabase
          .from("therapist_details")
          .select("*");
        if (data) {
          setTherapists(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTherapists();
  }, []);

  const filteredTherapists = therapists.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.specialization && t.specialization.join(", ").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={["#1C4966", "#5F8B70"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Find a Therapist</Text>
            <TouchableOpacity
              onPress={() => router.push("/sessions/dashboard" as any)}
              style={styles.journeyBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.journeyBtnText}>My Journey</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchWrapper}>
              <Search color="#8FBDD7" size={20} style={styles.searchIcon} />
              <TextInput
                placeholder="Search therapists..."
                placeholderTextColor="#8FBDD7"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <SlidersHorizontal color="#1C4966" size={20} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.listContainer}>
          {loading ? (
            <Text style={{ textAlign: "center", color: "#1C4966", padding: 20 }}>Loading Therapists...</Text>
          ) : filteredTherapists.map((therapist, index) => (
            <MotiView
              key={therapist.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
              style={styles.card}
            >
              <View style={styles.cardContent}>
                <LinearGradient
                  colors={["#1C4966", "#5F8B70"]}
                  style={styles.photoContainer}
                >
                  <Text style={styles.photoText}>{therapist.photo}</Text>
                </LinearGradient>
                <View style={styles.infoContainer}>
                  <View style={styles.infoTop}>
                    <View style={styles.nameWrapper}>
                      <Text style={styles.name}>{therapist.name}</Text>
                      <Text style={styles.experience}>
                        {therapist.experience} exp
                      </Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Star color="#F1C40F" size={12} fill="#F1C40F" />
                      <Text style={styles.ratingText}>{therapist.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.specialization} numberOfLines={1}>
                    {therapist.specialization?.join(", ")}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.fee}>{therapist.fee}/session</Text>
                    <Button
                      size="sm"
                      onPress={() => router.push({ pathname: "/counselling/[id]" as any, params: { id: therapist.id } })}
                      disabled={false} // Assuming all are available for now since we don't have available field yet or we can deduce it
                      style={styles.bookButton}
                    >
                      Book Now
                    </Button>
                  </View>
                </View>
              </View>
            </MotiView>
          ))}
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
    paddingBottom: 32,
  },
  header: {
    padding: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  journeyBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  journeyBtnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    height: 52,
    backgroundColor: "white",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1C4966",
  },
  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: "white",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: {
    padding: 24,
    marginTop: -20,
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardContent: {
    flexDirection: "row",
    gap: 16,
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  infoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 2,
  },
  experience: {
    fontSize: 14,
    color: "#8FBDD7",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(241, 196, 15, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#F1C40F",
  },
  specialization: {
    fontSize: 14,
    color: "#5F8B70",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fee: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  bookButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
