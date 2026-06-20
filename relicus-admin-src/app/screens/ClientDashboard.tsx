import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Calendar, Clock, Video, TrendingUp, BookOpen, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";

export function ClientDashboard() {
  const navigate = useNavigate();

  const upcomingSessions = [
    {
      id: 1,
      therapist: "Dr. Sarah Johnson",
      type: "Video Session",
      date: "Today",
      time: "3:00 PM",
      status: "upcoming",
    },
    {
      id: 2,
      therapist: "Dr. Rajesh Kumar",
      type: "Chat Session",
      date: "Tomorrow",
      time: "10:00 AM",
      status: "scheduled",
    },
  ];

  const moodData = [
    { day: "Mon", mood: 7 },
    { day: "Tue", mood: 6 },
    { day: "Wed", mood: 8 },
    { day: "Thu", mood: 7 },
    { day: "Fri", mood: 9 },
    { day: "Sat", mood: 8 },
    { day: "Sun", mood: 9 },
  ];

  const tasks = [
    { id: 1, title: "Daily gratitude journal", completed: true },
    { id: 2, title: "10-minute meditation", completed: true },
    { id: 3, title: "Evening walk", completed: false },
    { id: 4, title: "Read 20 pages", completed: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-3xl font-bold text-white mb-2">Your Journey</h1>
        <p className="text-white/80">Track your mental wellness progress</p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        <Card className="bg-gradient-to-r from-secondary to-primary text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Current Streak</p>
              <h3 className="text-4xl font-bold">7 days 🔥</h3>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-accent/10 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{session.therapist}</h4>
                    <p className="text-sm text-muted-foreground">{session.type}</p>
                  </div>
                  {session.status === "upcoming" && (
                    <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full font-medium">
                      Today
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{session.time}</span>
                  </div>
                </div>
                {session.status === "upcoming" && (
                  <Button
                    onClick={() => navigate(`/app/counselling/video/${session.id}`)}
                    className="w-full bg-primary"
                    size="sm"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Session
                  </Button>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mood Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {moodData.map((item, index) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.mood * 10}%` }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full bg-gradient-to-t from-secondary to-primary rounded-t-lg"
                  />
                  <span className="text-xs text-muted-foreground">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daily Tasks</CardTitle>
              <span className="text-sm text-muted-foreground">
                {tasks.filter((t) => t.completed).length}/{tasks.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-muted rounded-xl"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    task.completed ? "bg-success" : "bg-border"
                  }`}
                >
                  {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span
                  className={`flex-1 ${
                    task.completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {task.title}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-accent/10 border-accent/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Journal Entry</h4>
              <p className="text-sm text-muted-foreground">Reflect on your day</p>
            </div>
            <Button size="sm" variant="outline">
              Write
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
