const fs = require('fs');
const path = require('path');

const root = __dirname;

const filesToDelete = [
  // Expo App Dead Code
  'constants/coaching',
  'constants/tuition',
  'constants/knowNext',
  'components/Button.tsx',
  'components/Input.tsx',
  'components/GradientCard.tsx',

  // Web App Dead Code
  'relicus-admin/src/app/screens/EntranceCoaching',
  'relicus-admin/src/app/screens/KnowNext',
  'relicus-admin/src/app/screens/SkillEnhancement',
  'relicus-admin/src/app/screens/AppIntro.tsx',
  'relicus-admin/src/app/screens/ClientDashboard.tsx',
  'relicus-admin/src/app/screens/CounsellingListing.tsx',
  'relicus-admin/src/app/screens/DesignSystem.tsx',
  'relicus-admin/src/app/screens/Home.tsx',
  'relicus-admin/src/app/screens/Landing.tsx',
  'relicus-admin/src/app/screens/Mindfulness.tsx',
  'relicus-admin/src/app/screens/MockTest.tsx',
  'relicus-admin/src/app/screens/OTP.tsx',
  'relicus-admin/src/app/screens/Profile.tsx',
  'relicus-admin/src/app/screens/SessionBooking.tsx',
  'relicus-admin/src/app/screens/Showcase.tsx',
  'relicus-admin/src/app/screens/Splash.tsx',
  'relicus-admin/src/app/screens/StudentDashboard.tsx',
  'relicus-admin/src/app/screens/TeacherDashboard.tsx',
  'relicus-admin/src/app/screens/TherapistDashboard.tsx',
  'relicus-admin/src/app/screens/TherapistProfile.tsx',
  'relicus-admin/src/app/screens/VideoCall.tsx',
];

console.log("Starting dead code cleanup...");

for (const relativePath of filesToDelete) {
  const fullPath = path.join(root, relativePath);
  if (fs.existsSync(fullPath)) {
    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Deleted directory: ${relativePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${relativePath}`);
      }
    } catch (err) {
      console.error(`Failed to delete ${relativePath}: ${err.message}`);
    }
  } else {
    console.log(`Skipped (not found): ${relativePath}`);
  }
}

console.log("Cleanup complete!");
