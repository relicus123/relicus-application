import { createBrowserRouter } from "react-router";
import { Navigate } from "react-router";
// Admin Layout & Panels
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminLogin } from "./screens/Admin/AdminLogin";
import { AdminOverview } from "./screens/Admin/AdminOverview";
import { SkillsManager } from "./screens/Admin/SkillsManager";
import { CoachingManager } from "./screens/Admin/CoachingManager";
import { KnowNextManager } from "./screens/Admin/KnowNextManager";
import { TuitionManager } from "./screens/Admin/TuitionManager";
import { MindfulnessManager } from "./screens/Admin/MindfulnessManager";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <Navigate to="/admin" replace />,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminOverview },
      { path: "skills", Component: SkillsManager },
      { path: "coaching", Component: CoachingManager },
      { path: "knownext", Component: KnowNextManager },
      { path: "tuition", Component: TuitionManager },
      { path: "mindfulness", Component: MindfulnessManager },
    ],
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
]);
