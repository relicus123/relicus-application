const fs = require('fs');
const path = require('path');
const root = __dirname;
const nativeDir = path.join(root, 'relicus-native');

if (fs.existsSync(nativeDir)) {
  console.log("Fixing migration: Moving remaining directories...");
  const dirs = ['app', 'constants', 'assets'];
  for (const dir of dirs) {
    const src = path.join(nativeDir, dir);
    const dest = path.join(root, dir);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
      console.log(`Copied ${dir} to root.`);
    }
  }
  console.log("Migration completely fixed! You can delete relicus-native now.");
} else {
  console.log("relicus-native directory not found, migration is likely already complete.");
}
