const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const studyBuddyRateLimitMap = new Map<string, { count: number; resetTime: number }>();',
  `const studyBuddyRateLimitMap = new Map<string, { count: number; resetTime: number }>();

  // Cleanup old rate limit records every 5 minutes to prevent memory leaks in long-running Node.js processes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of studyBuddyRateLimitMap.entries()) {
      if (now > record.resetTime) {
        studyBuddyRateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);`
);

fs.writeFileSync('server.ts', code);
