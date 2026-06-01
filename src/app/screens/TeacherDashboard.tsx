import { motion } from "motion/react";
import { Upload, Users, FileText, Calendar, CheckCircle, TrendingUp, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";

export function TeacherDashboard() {
  const stats = [
    { label: "Total Students", value: "45", icon: Users, color: "from-primary to-secondary" },
    { label: "Classes Today", value: "3", icon: Calendar, color: "from-secondary to-accent" },
    { label: "Pending Reviews", value: "12", icon: FileText, color: "from-accent to-primary" },
  ];

  const upcomingClasses = [
    { subject: "Mathematics", grade: "Grade 10", time: "10:00 AM", students: 30 },
    { subject: "Physics", grade: "Grade 11", time: "2:00 PM", students: 25 },
  ];

  const assignments = [
    { title: "Algebra Assignment", subject: "Mathematics", submitted: 28, total: 30, pending: 2 },
    { title: "Newton's Laws Essay", subject: "Physics", submitted: 20, total: 25, pending: 5 },
  ];

  const recentStudents = [
    { name: "Alice Johnson", grade: "A", attendance: 95, initials: "AJ" },
    { name: "Bob Smith", grade: "B+", attendance: 88, initials: "BS" },
    { name: "Carol White", grade: "A-", attendance: 92, initials: "CW" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
        <p className="text-white/80">Welcome back, Professor</p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl text-white`}
              >
                <Icon className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs opacity-90">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Upload Content</h4>
              <p className="text-sm text-muted-foreground">Add study materials for students</p>
            </div>
            <Button size="sm">Upload</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingClasses.map((cls, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-accent/10 rounded-xl p-4 border border-accent/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{cls.subject}</h4>
                    <p className="text-sm text-muted-foreground">{cls.grade} • {cls.students} students</p>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-semibold">{cls.time}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">Start Class</Button>
                  <Button size="sm" variant="outline">Attendance</Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assignments</CardTitle>
              <span className="text-sm text-muted-foreground">
                {assignments.reduce((acc, a) => acc + a.pending, 0)} to review
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.map((assignment, index) => (
              <div
                key={index}
                className="bg-muted rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                  </div>
                  <span className="px-2 py-1 bg-accent/20 text-primary text-sm font-semibold rounded-lg">
                    {assignment.submitted}/{assignment.total}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((assignment.submitted / assignment.total) * 100)}%
                  </span>
                </div>
                {assignment.pending > 0 && (
                  <Button size="sm" variant="outline" className="w-full">
                    Review {assignment.pending} Pending
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Performance</CardTitle>
              <Button size="sm" variant="ghost">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentStudents.map((student, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-accent/10 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                    {student.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{student.name}</h4>
                    <p className="text-sm text-muted-foreground">Attendance: {student.attendance}%</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-success/20 text-success font-semibold rounded-lg">
                  {student.grade}
                </span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Management</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gradient-to-br from-primary to-secondary rounded-xl text-white text-left">
              <Users className="w-6 h-6 mb-2" />
              <p className="font-semibold">Student List</p>
              <p className="text-xs opacity-80">View all students</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-secondary to-accent rounded-xl text-white text-left">
              <Calendar className="w-6 h-6 mb-2" />
              <p className="font-semibold">Attendance</p>
              <p className="text-xs opacity-80">Mark attendance</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-accent to-primary rounded-xl text-white text-left">
              <FileText className="w-6 h-6 mb-2" />
              <p className="font-semibold">Materials</p>
              <p className="text-xs opacity-80">Study resources</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-primary/80 to-secondary/80 rounded-xl text-white text-left">
              <TrendingUp className="w-6 h-6 mb-2" />
              <p className="font-semibold">Analytics</p>
              <p className="text-xs opacity-80">Track progress</p>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
