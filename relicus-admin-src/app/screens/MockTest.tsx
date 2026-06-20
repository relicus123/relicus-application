import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Button } from "../components/Button";

export function MockTest() {
  const navigate = useNavigate();
  const { id } = useParams();
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-to-br from-primary to-secondary p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/app/coaching")}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <Clock className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-white/80 text-sm">{questions[currentQuestion].subject}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6 leading-relaxed">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <motion.button
                key={index}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedAnswer(index)}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  selectedAnswer === index
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-accent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      selectedAnswer === index
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-foreground">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="p-6 border-t border-border bg-card">
        <div className="flex gap-3 mb-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex-1"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </Button>
          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/app/coaching")}
              className="flex-1 bg-success hover:bg-success/90"
            >
              <Flag className="w-5 h-5 mr-1" />
              Submit
            </Button>
          )}
        </div>

        <div className="flex justify-center gap-1">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                index === currentQuestion
                  ? "bg-primary text-white"
                  : index <= currentQuestion
                  ? "bg-accent text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
