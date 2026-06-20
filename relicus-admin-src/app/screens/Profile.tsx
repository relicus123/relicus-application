import { motion } from "motion/react";
import { User, Bell, Lock, Award, Clock, LogOut, ChevronRight, Edit } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

export function Profile() {
  const menuItems = [
    {
      icon: User,
      label: "Edit Profile",
      description: "Update your information",
      color: "from-primary to-secondary",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage preferences",
      color: "from-secondary to-accent",
    },
    {
      icon: Lock,
      label: "Privacy & Security",
      description: "Control your data",
      color: "from-accent to-primary",
    },
    {
      icon: Award,
      label: "Certificates",
      description: "View achievements",
      color: "from-primary/80 to-secondary/80",
    },
    {
      icon: Clock,
      label: "Session History",
      description: "Past appointments",
      color: "from-secondary/80 to-accent/80",
    },
  ];

  const stats = [
    { label: "Sessions", value: "24" },
    { label: "Courses", value: "5" },
    { label: "Certificates", value: "3" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-12 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Edit className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
            <span className="text-4xl font-bold text-primary">U</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">User Name</h2>
          <p className="text-white/80 mb-4">user@example.com</p>

          <div className="flex gap-4 w-full max-w-sm">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            </motion.div>
          );
        })}

        <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Relicus Premium</h3>
              <p className="text-sm text-muted-foreground">Unlock exclusive features</p>
            </div>
            <Button size="sm">Upgrade</Button>
          </div>
        </Card>

        <button className="w-full flex items-center justify-center gap-2 p-4 text-danger font-semibold bg-danger/5 rounded-2xl border border-danger/20 hover:bg-danger/10 transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>

        <div className="text-center pt-4 pb-2">
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2026 Relicus. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
