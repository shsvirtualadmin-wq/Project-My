const fs = require('fs');
let code = fs.readFileSync('src/components/LmsPortalModal.tsx', 'utf8');

code = code.replace(
  /const \[loading, setLoading\] = useState<boolean>\(!\(initialUser !== undefined && \(initialUser === null \|\| initialProfile !== undefined\)\)\);/,
  `const [loading, setLoading] = useState<boolean>(() => {
    if (initialUser) return !initialProfile;
    return initialUser === undefined;
  });`
);

fs.writeFileSync('src/components/LmsPortalModal.tsx', code);
