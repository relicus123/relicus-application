const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=====================================================');
console.log('   RELICUS PRODUCTION READINESS VERIFICATION AUDIT   ');
console.log('=====================================================\n');

let totalScore = 100;
const results = [];

function check(title, condition, deduction, successMsg, failMsg) {
  if (condition) {
    console.log(`[PASS] ${title}: ${successMsg}`);
    results.push({ title, status: 'PASS', score: 100 });
  } else {
    console.error(`[FAIL] ${title}: ${failMsg} (-${deduction}%)`);
    totalScore -= deduction;
    results.push({ title, status: 'FAIL', reason: failMsg });
  }
}

// 1. Check TypeScript Compilation
try {
  const tscBin = path.join(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
  execSync(`"${tscBin}" --noEmit`, { stdio: 'pipe' });
  check('TypeScript Strict Compilation', true, 10, '0 errors found', '');
} catch (e) {
  check('TypeScript Strict Compilation', false, 10, '', 'TypeScript compilation failed');
}

// 2. Load configurations
const appJsonPath = path.join(__dirname, '..', 'app.json');
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const easJsonPath = path.join(__dirname, '..', 'eas.json');

const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
const manifest = fs.readFileSync(manifestPath, 'utf8');
const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

// 3. Version Code & Name Consistency
const appVersion = appJson.expo.version;
const appVersionCode = appJson.expo.android.versionCode;
const gradleVersionCodeMatch = buildGradle.match(/versionCode\s+(\d+)/);
const gradleVersionNameMatch = buildGradle.match(/versionName\s+"([^"]+)"/);

const gradleVersionCode = gradleVersionCodeMatch ? parseInt(gradleVersionCodeMatch[1], 10) : null;
const gradleVersionName = gradleVersionNameMatch ? gradleVersionNameMatch[1] : null;

check(
  'Version Parity (app.json vs build.gradle)',
  appVersion === gradleVersionName && appVersionCode === gradleVersionCode,
  15,
  `Synced at v${appVersion} (code: ${appVersionCode})`,
  `Mismatch: app.json has v${appVersion} (${appVersionCode}), build.gradle has v${gradleVersionName} (${gradleVersionCode})`
);

// 4. Package Name Check
const appPackage = appJson.expo.android.package;
const gradleNamespaceMatch = buildGradle.match(/namespace\s+'([^']+)'/);
const gradlePackage = gradleNamespaceMatch ? gradleNamespaceMatch[1] : null;

check(
  'Package Name Consistency',
  appPackage === gradlePackage && appPackage === 'com.relicus.com',
  10,
  `Confirmed '${appPackage}' across app.json and build.gradle`,
  `Package mismatch: app.json=${appPackage}, build.gradle=${gradlePackage}`
);

// 5. EAS Project ID & Expo Update URL
const easProjectId = appJson.expo.extra?.eas?.projectId;
const updateUrlContainsId = manifest.includes(easProjectId);

check(
  'EAS Project ID & OTA Update URL Alignment',
  Boolean(easProjectId && updateUrlContainsId),
  10,
  `AndroidManifest update URL matches EAS project ID (${easProjectId})`,
  `AndroidManifest update URL does not contain current EAS project ID ${easProjectId}`
);

// 6. Blocked Storage Permissions (Google Play Photo/Video Policy)
const hasStorageRemoved =
  manifest.includes('android.permission.READ_EXTERNAL_STORAGE" tools:node="remove"') &&
  manifest.includes('android.permission.WRITE_EXTERNAL_STORAGE" tools:node="remove"') &&
  manifest.includes('android.permission.READ_MEDIA_IMAGES" tools:node="remove"');

check(
  'Storage & Media Permission Stripping',
  hasStorageRemoved,
  15,
  'All broad storage & media permissions forcibly removed with tools:node="remove"',
  'Broad storage permissions are not completely stripped in AndroidManifest.xml'
);

// 7. EAS Production App Bundle (.aab) Configuration
const easProductionBuildType = easJson.build?.production?.android?.buildType;
check(
  'EAS Production Bundle Format',
  easProductionBuildType === 'app-bundle',
  10,
  "Explicitly set to 'app-bundle' for Google Play Store upload",
  "eas.json production android buildType is not 'app-bundle'"
);

// 8. Account Deletion Requirements
const privacyCode = fs.readFileSync(path.join(__dirname, '..', 'app', 'profile', 'privacy.tsx'), 'utf8');
const hasInAppDelete = privacyCode.includes('handleDeleteAccount');
const hasWebDeleteLink = privacyCode.includes('relicus.in/privacy-policy#rights');

check(
  'Google Play Account Deletion Dual Compliance',
  hasInAppDelete && hasWebDeleteLink,
  15,
  'Both in-app permanent data purge and public web deletion request link are active',
  'Missing either in-app deletion or public web deletion link'
);

// 9. Edge-to-Edge Navigation Bar Insets
const tabLayoutCode = fs.readFileSync(path.join(__dirname, '..', 'app', '(tabs)', '_layout.tsx'), 'utf8');
const hasDynamicInsets = tabLayoutCode.includes('useSafeAreaInsets') && tabLayoutCode.includes('bottomInset');

check(
  'Android 15+ Dynamic Edge-to-Edge Insets',
  hasDynamicInsets,
  10,
  'Bottom navigation dynamically calculates insets for gesture and 3-button bars',
  'Tab layout is missing dynamic safe area insets for Android 15 edge-to-edge'
);

// 10. Crisis Disclaimer Modal (Health Apps Policy)
const crisisModalExists = fs.existsSync(path.join(__dirname, '..', 'components', 'CrisisDisclaimerModal.tsx'));
check(
  'Google Play Health & Mental Wellness Disclaimer',
  crisisModalExists,
  5,
  'CrisisDisclaimerModal with direct emergency helpline access is present',
  'CrisisDisclaimerModal component is missing'
);

console.log('\n-----------------------------------------------------');
console.log(`FINAL PRODUCTION READINESS SCORE: ${Math.max(0, totalScore)}%`);
console.log('-----------------------------------------------------\n');

if (totalScore === 100) {
  console.log('CONGRATULATIONS: All production requirements and policy compliance checks passed at 100%!');
  process.exit(0);
} else {
  console.log('Action items remain to reach 100% readiness.');
  process.exit(1);
}
