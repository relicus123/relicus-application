import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, FileText, Download, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { supabase } from "../services/supabaseClient";

export function StudentDashboard() {
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [attendance, setAttendance] = useState({ present: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [classesRes, assignmentsRes, studentsRes] = await Promise.all([
          supabase.from("tuition_classes").select("*").limit(3),
          supabase.from("tuition_assignments").select("*"),
          supabase.from("tuition_students").select("*").limit(1) // Assuming single student view for dashboard
        ]);

        if (classesRes.data) setUpcomingClasses(classesRes.data);
        if (assignmentsRes.data) setHomework(assignmentsRes.data);
        
        // Mock progress for now based on classes fetched
        if (classesRes.data) {
          setSubjects(classesRes.data.map((c: any) => ({
            name: c.subject,
            grade: "A", 
            progress: Math.floor(Math.random() * 20) + 70
          })));
        }

        if (studentsRes.data && studentsRes.data.length > 0) {
          const s = studentsRes.data[0];
          setAttendance({
            present: s.attendance || 0,
            total: 50,
            percentage: s.attendance ? Math.round((s.attendance / 50) * 100) : 0
          });
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-3xl font-bold text-white mb-2">Student Dashboard</h1>
        <p className="text-white/80">Welcome back</p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary to-secondary text-white border-0">
            <div className="text-center">
              <p className="text-white/80 text-sm mb-1">Attendance</p>
              <h3 className="text-4xl font-bold mb-1">{attendance.percentage}%</h3>
              <p className="text-white/90 text-xs">{attendance.present}/{attendance.total} days</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-secondary to-accent text-white border-0">
            <div className="text-center">
              <p className="text-white/80 text-sm mb-1">Overall</p>
              <h3 className="text-4xl font-bold mb-1">A-</h3>
              <p className="text-white/90 text-xs">Current Grade</p>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingClasses.length === 0 && <p className="text-sm text-muted-foreground">No upcoming classes.</p>}
            {upcomingClasses.map((cls, index) => (
              <div
                key={cls.id || index}
                className="bg-accent/10 rounded-xl p-4 border border-accent/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold">
                      {cls.subject?.[0] || "?"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{cls.subject}</h4>
                      <p className="text-sm text-muted-foreground">{cls.teacher}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-semibold">{cls.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Homework</CardTitle>
              <span className="text-sm text-muted-foreground">
                {homework.filter((h) => !h.submitted).length} pending
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {homework.length === 0 && <p className="text-sm text-muted-foreground">No pending homework.</p>}
            {homework.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl ${
                  item.submitted
                    ? "bg-muted opacity-70"
                    : "bg-accent/10 border border-accent/20"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.subject}</p>
                  </div>
                  {item.submitted ? (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-xs font-medium">Submitted</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-warning">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-xs font-medium">{item.due_date || "Soon"}</span>
                    </div>
                  )}
                </div>
                {!item.submitted && (
                  <Button size="sm" className="w-full mt-2">Submit</Button>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjects.length === 0 && <p className="text-sm text-muted-foreground">No subjects found.</p>}
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{subject.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                    <span className="px-2 py-1 bg-success/20 text-success text-sm font-semibold rounded-lg">
                      {subject.grade}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Study Materials</h4>
              <p className="text-sm text-muted-foreground">Download course materials</p>
            </div>
            <Button size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
