import { motion } from "motion/react";
import { Wind, Heart, Activity, BookOpen, Smile, CheckSquare, Play, Pause } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { useState } from "react";

export function Mindfulness() {
  const [isPlaying, setIsPlaying] = useState(false);

  const activities = [
    {
      title: "Meditation",
      icon: Wind,
      description: "5-minute guided session",
      duration: "5 min",
      gradient: "from-[#8FBDD7] to-[#DDEEE3]",
    },
    {
      title: "Breathing",
      icon: Heart,
      description: "Deep breathing exercise",
      duration: "3 min",
      gradient: "from-[#DDEEE3] to-[#5F8B70]",
    },
    {
      title: "Yoga",
      icon: Activity,
      description: "Morning yoga routine",
      duration: "15 min",
      gradient: "from-[#5F8B70] to-[#8FBDD7]",
    },
  ];

  const affirmations = [
    "I am capable and strong",
    "Today is full of possibilities",
    "I choose peace and calm",
  ];

  const todoItems = [
    { id: 1, text: "Morning meditation", completed: true },
    { id: 2, text: "Gratitude journaling", completed: true },
    { id: 3, text: "Evening walk", completed: false },
    { id: 4, text: "Read before bed", completed: false },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFF0] pb-20">
      <div className="bg-gradient-to-br from-[#8FBDD7] to-[#DDEEE3] p-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-3xl font-bold text-[#1C4966] mb-2">Mindfulness</h1>
        <p className="text-[#1C4966]/80">Find your inner peace</p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        <Card className="bg-white border-0 shadow-lg">
          <div className="flex items-center justify-between p-6">
            <div className="flex-1">
              <p className="text-[#1C4966]/60 text-sm mb-1">Currently Playing</p>
              <h3 className="text-xl font-semibold text-[#1C4966] mb-2">Ocean Waves</h3>
              <div className="flex items-center gap-2 text-sm text-[#1C4966]/60">
                <span>12:34</span>
                <div className="flex-1 h-1 bg-[#DDEEE3] rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-[#8FBDD7] rounded-full" />
                </div>
                <span>20:00</span>
              </div>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 bg-gradient-to-br from-[#8FBDD7] to-[#5F8B70] rounded-full flex items-center justify-center ml-4 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" fill="white" />
              ) : (
                <Play className="w-8 h-8 text-white" fill="white" />
              )}
            </button>
          </div>
        </Card>

        <div>
          <h3 className="text-lg font-semibold text-[#1C4966] mb-3 px-2">Daily Activities</h3>
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`bg-gradient-to-r ${activity.gradient} border-0 text-white overflow-hidden relative`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg mb-1">{activity.title}</h4>
                          <p className="text-white/90 text-sm">{activity.description}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-white text-[#1C4966] hover:bg-white/90">
                        {activity.duration}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-[#5F8B70]" />
              <CardTitle className="text-[#1C4966]">Daily Affirmations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {affirmations.map((affirmation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-[#DDEEE3]/30 rounded-xl text-center"
              >
                <p className="text-[#1C4966] font-medium">{affirmation}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#5F8B70]" />
              <CardTitle className="text-[#1C4966]">Mood Journal</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-[#FFFFF0] rounded-xl p-4 border-2 border-[#DDEEE3] min-h-32">
              <p className="text-[#1C4966]/60 text-sm">How are you feeling today?</p>
            </div>
            <Button className="w-full mt-3 bg-gradient-to-r from-[#5F8B70] to-[#8FBDD7]">
              Save Entry
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#5F8B70]" />
                <CardTitle className="text-[#1C4966]">Today's Tasks</CardTitle>
              </div>
              <span className="text-sm text-[#1C4966]/60">
                {todoItems.filter((item) => item.completed).length}/{todoItems.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {todoItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-3 bg-[#F5F7FA] rounded-xl cursor-pointer hover:bg-[#DDEEE3]/30 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  readOnly
                  className="w-5 h-5 accent-[#5F8B70] rounded"
                />
                <span
                  className={`flex-1 ${
                    item.completed
                      ? "line-through text-[#1C4966]/40"
                      : "text-[#1C4966]"
                  }`}
                >
                  {item.text}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
