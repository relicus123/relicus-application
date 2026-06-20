const { execSync } = require('child_process');
try {
  console.log("Running TypeScript compilation check...");
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log("TypeScript compiled successfully with no errors.");
} catch (error) {
  console.error("TypeScript compilation failed.");
  process.exit(1);
}
