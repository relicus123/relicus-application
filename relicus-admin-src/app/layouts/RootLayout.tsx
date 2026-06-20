import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Calendar, BookOpen, Bell, User } from "lucide-react";

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/app", icon: Home, label: "Home" },
    { path: "/app/sessions", icon: Calendar, label: "Sessions" },
    { path: "/app/learning", icon: BookOpen, label: "Learning" },
    { path: "/app/notifications", icon: Bell, label: "Notifications" },
    { path: "/app/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-border shadow-lg">
        <div className="flex justify-around items-center h-20 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-primary bg-accent/20"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
