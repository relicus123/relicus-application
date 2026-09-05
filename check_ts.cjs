const { execSync } = require('child_process');
const path = require('path');
try {
  console.log("Running TypeScript compilation check...");
  const tscBin = path.join(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
  execSync(`"${tscBin}" --noEmit`, { stdio: 'inherit' });
  console.log("TypeScript compiled successfully with no errors.");
} catch (error) {
  console.error("TypeScript compilation failed.");
  process.exit(1);
}
