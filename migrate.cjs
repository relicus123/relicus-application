const fs = require('fs');
const path = require('path');

const root = __dirname;
const adminDir = path.join(root, 'relicus-admin');

try {
  if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir);

  const webFiles = [
    'src', 'dist', 'index.html', 'vite.config.ts', 'postcss.config.mjs', 
    'package.json', 'pnpm-lock.yaml', 'tsconfig.json', 'default_shadcn_theme.css', 'create_user.js'
  ];

  console.log("Moving web files to relicus-admin...");
  for (const file of webFiles) {
    const srcPath = path.join(root, file);
    const destPath = path.join(adminDir, file);
    if (fs.existsSync(srcPath)) {
      try {
        fs.renameSync(srcPath, destPath);
        console.log(`Moved ${file}`);
      } catch (e) {
        console.error(`Failed to move ${file}:`, e.message);
        // Fallback to copy if move fails (e.g., due to file locks)
        fs.cpSync(srcPath, destPath, { recursive: true });
        console.log(`Copied ${file} instead.`);
      }
    }
  }

  const nativeDir = path.join(root, 'relicus-native');
  if (fs.existsSync(nativeDir)) {
    console.log("\nMoving relicus-native contents to root...");
    const nativeFiles = fs.readdirSync(nativeDir);
    for (const file of nativeFiles) {
      const srcPath = path.join(nativeDir, file);
      const destPath = path.join(root, file);
      
      try {
        fs.renameSync(srcPath, destPath);
        console.log(`Moved ${file} to root.`);
      } catch (e) {
        console.error(`Failed to move ${file} from relicus-native:`, e.message);
      }
    }
    
    try {
      fs.rmdirSync(nativeDir);
      console.log("Removed empty relicus-native directory.");
    } catch(e) {}
  }
  
  console.log("\nMigration complete! You can now run `npm install` and then `npx expo start`.");
} catch (error) {
  console.error("Fatal error during migration:", error);
}
