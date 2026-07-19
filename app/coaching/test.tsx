import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { Typography } from "../../components/Typography";
import { BentoCard } from "../../components/BentoCard";
import { Button } from "../../components/Button";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
    <View className="flex-1 bg-surface-primary">
      <LinearGradient 
        colors={["#fdf7ff", "#e9ddff", "#cfbcff"]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
        className="px-6 pb-6 pt-8 rounded-b-[40px]"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/40 items-center justify-center border border-white/50"
            >
              <ArrowLeft color="#4f378a" size={20} />
            </TouchableOpacity>
            
            <View className="flex-row items-center gap-2 bg-white/40 px-4 py-2 rounded-full border border-white/50">
              <Clock color="#4f378a" size={16} />
              <Typography variant="body" weight="bold" color="primary">{formatTime(timeRemaining)}</Typography>
            </View>
          </View>

          <BentoCard variant="secondary" padding="md" className="border border-white/50 bg-white/30 backdrop-blur-md">
            <View className="flex-row justify-between items-center mb-2">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider">
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
              <Typography variant="caption" weight="bold" color="primary">
                {questions[currentQuestion].subject}
              </Typography>
            </View>
            <View className="h-2 bg-white/40 rounded-full overflow-hidden">
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ type: "timing", duration: 300 }}
                className="h-full bg-primary rounded-full"
              />
            </View>
          </BentoCard>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        <MotiView
          key={currentQuestion}
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
        >
          <BentoCard variant="secondary" padding="lg" className="border border-border-subtle mb-6 bg-white shadow-sm">
            <Typography variant="title" weight="bold" color="primary" className="mb-2">
              {questions[currentQuestion].question}
            </Typography>
          </BentoCard>

          <View className="gap-3">
            {questions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedAnswer(index)}
                  className={twMerge(clsx(
                    "w-full p-4 rounded-2xl flex-row items-center gap-4 border-2 transition-colors",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border-subtle bg-white"
                  ))}
                  activeOpacity={0.7}
                >
                  <View className={twMerge(clsx(
                    "w-10 h-10 rounded-full items-center justify-center transition-colors",
                    isSelected ? "bg-primary" : "bg-surface-secondary"
                  ))}>
                    <Typography 
                      weight="bold" 
                      color={isSelected ? "inverse" : "primary"}
                    >
                      {String.fromCharCode(65 + index)}
                    </Typography>
                  </View>
                  <Typography 
                    variant="body"
                    weight={isSelected ? "bold" : "regular"}
                    color="primary" 
                    className="flex-1"
                  >
                    {option}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </MotiView>
      </ScrollView>

      <View className="bg-white border-t border-border-subtle px-6 py-4 pb-8 shadow-sm">
        <View className="flex-row gap-3 mb-4">
          <Button
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex-1"
          >
            <View className="flex-row items-center justify-center gap-1">
              <ChevronLeft color={currentQuestion === 0 ? "#cac4d0" : "#4f378a"} size={20} />
              <Typography weight="bold" color={currentQuestion === 0 ? "secondary" : "primary"}>Prev</Typography>
            </View>
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button
              onPress={handleNext}
              variant="primary"
              className="flex-1"
            >
              <View className="flex-row items-center justify-center gap-1">
                <Typography weight="bold" color="inverse">Next</Typography>
                <ChevronRight color="white" size={20} />
              </View>
            </Button>
          ) : (
            <Button
              onPress={handleSubmit}
              variant="primary"
              className="flex-1 !bg-green-600"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Flag color="white" size={18} />
                <Typography weight="bold" color="inverse">Submit</Typography>
              </View>
            </Button>
          )}
        </View>

        <View className="flex-row justify-center gap-2 flex-wrap">
          {questions.map((_, index) => {
            const isCurrent = index === currentQuestion;
            const isCompleted = index < currentQuestion || (index === currentQuestion && selectedAnswer !== null);
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setCurrentQuestion(index);
                  setSelectedAnswer(null);
                }}
                className={twMerge(clsx(
                  "w-10 h-10 rounded-xl items-center justify-center transition-colors border",
                  isCurrent 
                    ? "bg-primary border-primary" 
                    : isCompleted 
                    ? "bg-primary/20 border-primary/30" 
                    : "bg-surface-secondary border-transparent"
                ))}
              >
                <Typography 
                  variant="caption"
                  weight="bold" 
                  color={isCurrent ? "inverse" : (isCompleted ? "primary" : "secondary")}
                >
                  {index + 1}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
