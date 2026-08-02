const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We have syntax errors for `req` in some places. Let's find all occurrences of getAuthClient(req) outside of request handlers and fix them.

code = code.replace(/getStudentMonthlyUsage\(userId: string, userEmail\?: string\): Promise<number> \{/g, 'getStudentMonthlyUsage(userId: string, userEmail: string | undefined, req: express.Request | null): Promise<number> {');
code = code.replace(/incrementStudentMonthlyUsage\(userId: string, userEmail: string \| undefined, addCount: number\): Promise<number> \{/g, 'incrementStudentMonthlyUsage(userId: string, userEmail: string | undefined, addCount: number, req: express.Request | null): Promise<number> {');
code = code.replace(/const currentCount = await getStudentMonthlyUsage\(userId, userEmail\);/g, 'const currentCount = await getStudentMonthlyUsage(userId, userEmail, req);');

// For custom topics and MCQ caching, they don't have req either?
code = code.replace(/async function getCachedCustomTopics\(\) \{/g, 'async function getCachedCustomTopics(req: express.Request | null) {');
code = code.replace(/async function addCustomTopic\(subject: string, topic: string, authorId: string\) \{/g, 'async function addCustomTopic(subject: string, topic: string, authorId: string, req: express.Request | null) {');
code = code.replace(/async function getCachedMcqs\(subject: string, topic: string\): Promise<any\[\] \| null> \{/g, 'async function getCachedMcqs(subject: string, topic: string, req: express.Request | null): Promise<any[] | null> {');
code = code.replace(/async function cacheMcqs\(subject: string, topic: string, mcqs: any\[\]\) \{/g, 'async function cacheMcqs(subject: string, topic: string, mcqs: any[], req: express.Request | null) {');

// In endpoints, update the calls
code = code.replace(/await getStudentMonthlyUsage\(userId, userEmail\);/g, 'await getStudentMonthlyUsage(userId, userEmail, req);');
code = code.replace(/await incrementStudentMonthlyUsage\(userId, userEmail, 1\);/g, 'await incrementStudentMonthlyUsage(userId, userEmail, 1, req);');
code = code.replace(/await getCachedCustomTopics\(\);/g, 'await getCachedCustomTopics(req);');
code = code.replace(/await addCustomTopic\(subject, newTopic, authorId\);/g, 'await addCustomTopic(subject, newTopic, authorId, req);');
code = code.replace(/await getCachedMcqs\(subject, topic\);/g, 'await getCachedMcqs(subject, topic, req);');
code = code.replace(/await cacheMcqs\(subject, topic, result.mcqs\);/g, 'await cacheMcqs(subject, topic, result.mcqs, req);');

// Inside these functions, we need to handle if req is null, fallback to supabaseServer or something.
// But getAuthClient(req) expects express.Request. Let's change it to getAuthClient(req: express.Request | null).
code = code.replace(/function getAuthClient\(req: express.Request\) \{/, 'function getAuthClient(req: express.Request | null) {\n  if (!req) return supabaseServer;');

// Also, the other supabaseServer occurrences in those functions need to be getAuthClient(req)
// We already replaced supabaseServer with getAuthClient(req) blindly. But the typescript compiler is complaining about `req` not found in `async function syncAllInMemoryToSupabase()`!
code = code.replace(/async function syncAllInMemoryToSupabase\(\) \{/g, 'async function syncAllInMemoryToSupabase(req: express.Request | null = null) {');

fs.writeFileSync('server.ts', code);
