import { motion } from "motion/react";
import { Calendar, Users, FileText, Video, Clock, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";

export function TherapistDashboard() {
  const todayAppointments = [
    {
      id: 1,
      client: "John Doe",
      time: "09:00 AM",
      type: "Video",
      status: "upcoming",
    },
    {
      id: 2,
      client: "Jane Smith",
      time: "11:00 AM",
      type: "Chat",
      status: "upcoming",
    },
    {
      id: 3,
      client: "Mike Johnson",
      time: "02:00 PM",
      type: "Phone",
      status: "completed",
    },
    {
      id: 4,
      client: "Sarah Williams",
      time: "04:00 PM",
      type: "Video",
      status: "upcoming",
    },
  ];

  const stats = [
    { label: "Today's Sessions", value: "4", icon: Calendar, color: "from-primary to-secondary" },
    { label: "Total Clients", value: "32", icon: Users, color: "from-secondary to-accent" },
    { label: "This Week", value: "18", icon: TrendingUp, color: "from-accent to-primary" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-3xl font-bold text-white mb-2">Therapist Dashboard</h1>
        <p className="text-white/80">Welcome back, Dr. Sarah Johnson</p>
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today's Appointments</CardTitle>
              <span className="text-sm text-muted-foreground">
                {todayAppointments.filter((a) => a.status === "upcoming").length} upcoming
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl ${
                  appointment.status === "completed"
                    ? "bg-muted opacity-60"
                    : "bg-accent/10 border border-accent/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                      {appointment.client.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{appointment.client}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.type} Session</p>
                    </div>
                  </div>
                  {appointment.status === "completed" ? (
                    <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full font-medium">
                      Completed
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-primary">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold">{appointment.time}</span>
                    </div>
                  )}
                </div>
                {appointment.status === "upcoming" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1">
                      <Video className="w-4 h-4 mr-1" />
                      Join
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="w-4 h-4 mr-1" />
                      Notes
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gradient-to-br from-primary to-secondary rounded-xl text-white text-left">
              <Users className="w-6 h-6 mb-2" />
              <p className="font-semibold">Client List</p>
              <p className="text-xs opacity-80">View all clients</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-secondary to-accent rounded-xl text-white text-left">
              <FileText className="w-6 h-6 mb-2" />
              <p className="font-semibold">Case Notes</p>
              <p className="text-xs opacity-80">Session records</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-accent to-primary rounded-xl text-white text-left">
              <Video className="w-6 h-6 mb-2" />
              <p className="font-semibold">Recordings</p>
              <p className="text-xs opacity-80">Past sessions</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-primary/80 to-secondary/80 rounded-xl text-white text-left">
              <Calendar className="w-6 h-6 mb-2" />
              <p className="font-semibold">Schedule</p>
              <p className="text-xs opacity-80">Manage calendar</p>
            </button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Pending Follow-Ups</h4>
              <p className="text-sm text-muted-foreground">3 clients need attention</p>
            </div>
            <Button size="sm">Review</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
