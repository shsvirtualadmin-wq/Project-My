const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix req in syncAllInMemoryToSupabase
code = code.replace(/if \(getAuthClient\(req\)\)/g, 'if (getAuthClient(req || null))');
code = code.replace(/await getAuthClient\(req\)\?\./g, 'await getAuthClient(req || null)?.');
code = code.replace(/if \(!getAuthClient\(req\)\)/g, 'if (!getAuthClient(req || null))');

// Fix tsconfig iterator and esModuleInterop
let tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
tsconfig.compilerOptions.downlevelIteration = true;
tsconfig.compilerOptions.esModuleInterop = true;
tsconfig.compilerOptions.allowSyntheticDefaultImports = true;
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

// Fix the 1568 error: incrementStudentMonthlyUsage expects 4 args, got 3.
code = code.replace(/await incrementStudentMonthlyUsage\(userId, userEmail, 1\);/g, 'await incrementStudentMonthlyUsage(userId, userEmail, 1, req);');
code = code.replace(/await incrementStudentMonthlyUsage\(studentId, studentEmail, 1\);/g, 'await incrementStudentMonthlyUsage(studentId, studentEmail, 1, req);');
code = code.replace(/await incrementStudentMonthlyUsage\(studentId, studentEmail, count\);/g, 'await incrementStudentMonthlyUsage(studentId, studentEmail, count, req);');

fs.writeFileSync('server.ts', code);
