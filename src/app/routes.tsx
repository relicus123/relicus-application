import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { AppIntro } from "./screens/AppIntro";
import { Splash } from "./screens/Splash";
import { Landing } from "./screens/Landing";
import { OTP } from "./screens/OTP";
import { Home } from "./screens/Home";
import { CounsellingListing } from "./screens/CounsellingListing";
import { TherapistProfile } from "./screens/TherapistProfile";
import { SessionBooking } from "./screens/SessionBooking";
import { VideoCall } from "./screens/VideoCall";
import { ClientDashboard } from "./screens/ClientDashboard";
import { TherapistDashboard } from "./screens/TherapistDashboard";
import { EntranceCoaching } from "./screens/EntranceCoaching";
import { MockTest } from "./screens/MockTest";
import { SkillEnhancement } from "./screens/SkillEnhancement";
import { StudentDashboard } from "./screens/StudentDashboard";
import { TeacherDashboard } from "./screens/TeacherDashboard";
import { Mindfulness } from "./screens/Mindfulness";
import { Profile } from "./screens/Profile";
import { DesignSystem } from "./screens/DesignSystem";
import { Showcase } from "./screens/Showcase";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppIntro,
  },
  {
    path: "/app",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "sessions", Component: ClientDashboard },
      { path: "learning", Component: EntranceCoaching },
      { path: "notifications", Component: ClientDashboard },
      { path: "profile", Component: Profile },
      { path: "counselling", Component: CounsellingListing },
      { path: "counselling/:id", Component: TherapistProfile },
      { path: "counselling/:id/book", Component: SessionBooking },
      { path: "counselling/video/:id", Component: VideoCall },
      { path: "therapist/dashboard", Component: TherapistDashboard },
      { path: "coaching", Component: EntranceCoaching },
      { path: "coaching/test/:id", Component: MockTest },
      { path: "skills", Component: SkillEnhancement },
      { path: "student/dashboard", Component: StudentDashboard },
      { path: "teacher/dashboard", Component: TeacherDashboard },
      { path: "mindfulness", Component: Mindfulness },
      { path: "design-system", Component: DesignSystem },
    ],
  },
  {
    path: "/splash",
    Component: Splash,
  },
  {
    path: "/landing",
    Component: Landing,
  },
  {
    path: "/otp",
    Component: OTP,
  },
  {
    path: "/showcase",
    Component: Showcase,
  },
]);
