import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Play, Video, BookOpen, Target, TrendingUp, Clock, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";

export function EntranceCoaching() {
  const navigate = useNavigate();

  const subjects = [
    { name: "Mathematics", progress: 75, icon: "📐", color: "from-primary to-secondary" },
    { name: "Physics", progress: 60, icon: "⚛️", color: "from-secondary to-accent" },
    { name: "Chemistry", progress: 85, icon: "🧪", color: "from-accent to-primary" },
    { name: "Biology", progress: 70, icon: "🧬", color: "from-primary/80 to-secondary/80" },
  ];

  const upcomingClasses = [
    { subject: "Mathematics", topic: "Calculus - Derivatives", time: "Today, 4:00 PM", type: "Live" },
    { subject: "Physics", topic: "Mechanics - Motion", time: "Tomorrow, 10:00 AM", type: "Recorded" },
  ];

  const mockTests = [
    { name: "CUET Mock Test 1", duration: "180 min", questions: 150, attempted: false },
    { name: "JEE Main Practice", duration: "120 min", questions: 90, attempted: true },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-3xl font-bold text-white mb-2">Entrance Coaching</h1>
        <p className="text-white/80">Your path to success</p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        <Card className="bg-gradient-to-r from-primary to-secondary text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Study Streak</p>
              <h3 className="text-4xl font-bold">12 days 🎯</h3>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Overall Progress</p>
              <h3 className="text-4xl font-bold">72%</h3>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What To Do Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Complete 5 questions</h4>
                    <p className="text-sm text-muted-foreground">Mathematics - Chapter 8</p>
                  </div>
                </div>
                <Button size="sm">Start</Button>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Watch lecture</h4>
                    <p className="text-sm text-muted-foreground">Physics - Wave Motion</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Watch</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{subject.icon}</span>
                    <span className="font-semibold text-foreground">{subject.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{subject.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${subject.color} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingClasses.map((cls, index) => (
              <div
                key={index}
                className="bg-accent/10 rounded-xl p-4 border border-accent/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{cls.subject}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        cls.type === "Live"
                          ? "bg-danger/20 text-danger"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {cls.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{cls.topic}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{cls.time}</span>
                    </div>
                  </div>
                  <Button size="sm" className="mt-1">
                    {cls.type === "Live" ? <Video className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mock Tests</CardTitle>
              <Button size="sm" variant="ghost">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockTests.map((test, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  test.attempted
                    ? "bg-muted"
                    : "bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{test.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{test.duration}</span>
                      <span>•</span>
                      <span>{test.questions} questions</span>
                    </div>
                  </div>
                  {test.attempted ? (
                    <div className="flex items-center gap-2 text-success">
                      <Award className="w-5 h-5" />
                      <span className="text-sm font-semibold">85%</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/app/coaching/test/${index + 1}`)}
                    >
                      Start
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
