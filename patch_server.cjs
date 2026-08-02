const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const getAuthClientCode = `
// Helper to create an authenticated Supabase client using the user's JWT
function getAuthClient(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !supabaseUrl || !supabaseAnonKey) {
    return supabaseServer;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });
}
`;

code = code.replace(
  'const inMemoryUsageStore: Record<string, Record<string, number>> = {};',
  getAuthClientCode + '\nconst inMemoryUsageStore: Record<string, Record<string, number>> = {};'
);

// Now replace all `await supabaseServer.` with `await getAuthClient(req).` inside endpoints.
// But we have to be careful. Some are inside routes, some are not?
// Let's just do a regex replace for supabaseServer inside app.post / app.get.

// Since the req object is always named req in the handlers, we can safely replace
// supabaseServer with getAuthClient(req) EXCEPT where we check if (supabaseServer).
// Actually, let's just replace `supabaseServer.` with `getAuthClient(req)?.`
// But wait, getAuthClient might return null if supabaseServer is null.
// Let's modify getAuthClient to return null if supabaseUrl is missing.

code = code.replace(/supabaseServer\.from/g, 'getAuthClient(req)?.from');
// Fix the if (supabaseServer) checks:
code = code.replace(/if \(!supabaseServer\)/g, 'if (!getAuthClient(req))');
code = code.replace(/if \(supabaseServer\)/g, 'if (getAuthClient(req))');

fs.writeFileSync('server.ts', code);
