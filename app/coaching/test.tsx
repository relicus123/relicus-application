import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";

const { width } = Dimensions.get("window");

export default function MockTest() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(7200);

  const questions = [
    {
      id: 1,
      question: "What is the derivative of x² with respect to x?",
      options: ["x", "2x", "x²", "2"],
      correctAnswer: 1,
      subject: "Mathematics",
    },
    {
      id: 2,
      question: "Which of the following is Newton's Second Law of Motion?",
      options: ["F = ma", "E = mc²", "F = G(m₁m₂)/r²", "PV = nRT"],
      correctAnswer: 0,
      subject: "Physics",
    },
    {
      id: 3,
      question: "What is the atomic number of Carbon?",
      options: ["4", "6", "8", "12"],
      correctAnswer: 1,
      subject: "Chemistry",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
    }
  };

  const handleSubmit = () => {
    // Navigate back to learning tab
    router.replace("/(tabs)/learning" as any);
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={styles.timerBadge}>
            <Clock color="white" size={18} />
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabelText}>
              Question {currentQuestion + 1} of {questions.length}
            </Text>
            <Text style={styles.progressSubjectText}>
              {questions[currentQuestion].subject}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <MotiView
              from={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.progressFill}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <MotiView
          key={currentQuestion}
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
          style={styles.questionCard}
        >
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>

          <View style={styles.optionsList}>
            {questions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedAnswer(index)}
                  style={[
                    styles.optionBtn,
                    isSelected ? styles.optionBtnSelected : styles.optionBtnUnselected,
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.optionCircle,
                    isSelected ? styles.optionCircleSelected : styles.optionCircleUnselected,
                  ]}>
                    <Text style={[
                      styles.optionIndexText,
                      isSelected ? styles.textWhite : styles.textSecondary,
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionContentText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </MotiView>
      </ScrollView>

      {/* Footer controls */}
      <View style={styles.footer}>
        <View style={styles.navButtonsRow}>
          <Button
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            style={styles.navBtn}
          >
            <ChevronLeft color="#1C4966" size={20} />
            <Text style={{ marginLeft: 4 }}>Prev</Text>
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button
              onPress={handleNext}
              style={styles.navBtn}
            >
              <Text style={{ marginRight: 4 }}>Next</Text>
              <ChevronRight color="white" size={20} />
            </Button>
          ) : (
            <Button
               onPress={handleSubmit}
               style={StyleSheet.flatten([styles.navBtn, styles.submitBtn])}
             >
              <Flag color="white" size={18} />
              <Text style={{ marginLeft: 6, color: "white" }}>Submit</Text>
            </Button>
          )}
        </View>

        <View style={styles.dotIndicatorsRow}>
          {questions.map((_, index) => {
            const isCurrent = index === currentQuestion;
            const isCompleted = index <= currentQuestion;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setCurrentQuestion(index);
                  setSelectedAnswer(null);
                }}
                style={[
                  styles.dotBtn,
                  isCurrent
                    ? styles.dotBtnCurrent
                    : isCompleted
                    ? styles.dotBtnCompleted
                    : styles.dotBtnRemaining,
                ]}
              >
                <Text
                  style={[
                    styles.dotText,
                    isCurrent
                      ? styles.textWhite
                      : isCompleted
                      ? styles.textPrimary
                      : styles.textSecondary,
                  ]}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  header: {
    backgroundColor: "#1C4966",
    padding: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  progressCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabelText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  progressSubjectText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 4,
  },
  scrollContent: {
    padding: 24,
  },
  questionCard: {
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
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C4966",
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsList: {
    gap: 12,
  },
  optionBtn: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
  },
  optionBtnSelected: {
    borderColor: "#1C4966",
    backgroundColor: "rgba(28, 73, 102, 0.05)",
  },
  optionBtnUnselected: {
    borderColor: "rgba(28, 73, 102, 0.1)",
    backgroundColor: "white",
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCircleSelected: {
    backgroundColor: "#1C4966",
  },
  optionCircleUnselected: {
    backgroundColor: "#F5F7FA",
  },
  optionIndexText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  optionContentText: {
    fontSize: 15,
    color: "#1C4966",
    fontWeight: "500",
    flex: 1,
  },
  textWhite: {
    color: "white",
  },
  textSecondary: {
    color: "#5F8B70",
  },
  textPrimary: {
    color: "#1C4966",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(28, 73, 102, 0.1)",
    backgroundColor: "white",
  },
  navButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
  },
  submitBtn: {
    backgroundColor: "#5CB85C",
  },
  dotIndicatorsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dotBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dotBtnCurrent: {
    backgroundColor: "#1C4966",
  },
  dotBtnCompleted: {
    backgroundColor: "rgba(143, 189, 215, 0.2)",
  },
  dotBtnRemaining: {
    backgroundColor: "#F5F7FA",
  },
  dotText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
