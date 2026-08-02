const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add profileSyncing state
code = code.replace(
  /const \[authLoading, setAuthLoading\] = useState<boolean>\(\(\) => \{/,
  'const [profileSyncing, setProfileSyncing] = useState<boolean>(false);\n  const [authLoading, setAuthLoading] = useState<boolean>(() => {'
);

// Update syncUserProfile calls to use profileSyncing
code = code.replace(
  /\/\/ Run profile sync in background without blocking UI\n\s*syncUserProfile\(user\)/g,
  '// Run profile sync\n      setProfileSyncing(true);\n      syncUserProfile(user)'
);

code = code.replace(
  /\.then\(\(profile\) => \{\n\s*if \(isSubscribed && profile\) \{\n\s*setUserProfile\(profile\);\n\s*\}\n\s*\}\)/g,
  '.then((profile) => {\n          if (isSubscribed && profile) {\n            setUserProfile(profile);\n          }\n        })\n        .finally(() => {\n          if (isSubscribed) {\n            setProfileSyncing(false);\n          }\n        })'
);

code = code.replace(
  /syncUserProfile\(user, grade, 'Google'\)\n\s*\.then\(\(updatedProfile\) => \{/,
  'setProfileSyncing(true);\n      syncUserProfile(user, grade, \'Google\')\n        .then((updatedProfile) => {'
);

// We need to find the specific .finally() or just append it manually for the second instance.
// Let's just find and replace the whole block for LmsAuthScreen onSuccess callback
// Wait, LmsAuthScreen has onSuccess={(user, profile) ...
// We don't need to change LmsAuthScreen onSuccess because that happens on user interaction, not on mount. The flash is on mount/refresh.

fs.writeFileSync('src/App.tsx', code);
