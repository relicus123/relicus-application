import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Play, Award, Download, TrendingUp, Clock, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";

export function SkillEnhancement() {
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: "Web Development Bootcamp",
      instructor: "John Smith",
      progress: 65,
      duration: "12 weeks",
      lessons: 48,
      enrolled: true,
      rating: 4.8,
      thumbnail: "💻",
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      instructor: "Sarah Johnson",
      progress: 0,
      duration: "10 weeks",
      lessons: 40,
      enrolled: false,
      rating: 4.9,
      thumbnail: "📊",
    },
    {
      id: 3,
      title: "Digital Marketing Mastery",
      instructor: "Mike Chen",
      progress: 30,
      duration: "8 weeks",
      lessons: 32,
      enrolled: true,
      rating: 4.7,
      thumbnail: "📱",
    },
  ];

  const recentLessons = [
    { title: "React Hooks Deep Dive", duration: "45 min", completed: true },
    { title: "State Management with Redux", duration: "60 min", completed: false },
  ];

  const certificates = [
    { name: "JavaScript Basics", date: "Jan 2026", icon: "🏆" },
    { name: "HTML & CSS", date: "Dec 2025", icon: "🎖️" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-3xl font-bold text-white mb-2">Skill Enhancement</h1>
        <p className="text-white/80">Unlock your potential</p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        <Card className="bg-gradient-to-r from-secondary to-accent text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Learning Streak</p>
              <h3 className="text-4xl font-bold">15 days 🔥</h3>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Certificates</p>
              <h3 className="text-4xl font-bold">{certificates.length}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLessons.map((lesson, index) => (
              <div
                key={index}
                className="bg-accent/10 rounded-xl p-4 border border-accent/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{lesson.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.duration}</span>
                        {lesson.completed && (
                          <span className="ml-2 px-2 py-0.5 bg-success/20 text-success text-xs rounded-full font-medium">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!lesson.completed && (
                    <Button size="sm">Resume</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Courses</CardTitle>
              <Button size="sm" variant="ghost">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl overflow-hidden ${
                  course.enrolled
                    ? "bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20"
                    : "bg-card border border-border"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                      {course.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-1">{course.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{course.instructor}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          <span>{course.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{course.lessons} lessons</span>
                        <span>•</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>

                  {course.enrolled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-primary">{course.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1"
                      variant={course.enrolled ? "primary" : "outline"}
                    >
                      {course.enrolled ? "Continue" : "Enroll Now"}
                    </Button>
                    {course.enrolled && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificates.map((cert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cert.icon}</span>
                  <div>
                    <h4 className="font-semibold text-foreground">{cert.name}</h4>
                    <p className="text-sm text-muted-foreground">{cert.date}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
