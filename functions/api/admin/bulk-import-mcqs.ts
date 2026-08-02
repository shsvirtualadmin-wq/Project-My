import { createClient } from "@supabase/supabase-js";

interface PagesContext {
  request: Request;
  env: Record<string, string | undefined>;
}

function getSupabaseAdminClient(env: Record<string, string | undefined>) {
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "https://wbvzbbnapowwmrjecdyt.supabase.co";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "";
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

export const onRequestPost = async (context: PagesContext) => {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json() as any;
    const { requesterEmail, mcqs } = body || {};

    const isAdmin = Boolean(requesterEmail && requesterEmail.trim().toLowerCase() === "shsvirtualadmin@gmail.com");

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden: Only administrators can bulk import MCQs." }),
        { status: 403, headers: corsHeaders }
      );
    }

    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or invalid payload: 'mcqs' must be a non-empty array." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const db = getSupabaseAdminClient(env);
    let insertedCount = 0;
    const errors: string[] = [];
    const chunkSize = 50;

    if (db) {
      for (let i = 0; i < mcqs.length; i += chunkSize) {
        const batch = mcqs.slice(i, i + chunkSize);
        const { data, error } = await db.from("mcq_bank").insert(batch).select();

        if (error) {
          errors.push(`Batch ${Math.floor(i / chunkSize) + 1}: ${error.message}`);
        } else {
          insertedCount += data ? data.length : batch.length;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        insertedCount,
        message: `Successfully processed bulk import of ${insertedCount} MCQs into Supabase mcq_bank table.`,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Failed to bulk import MCQs" }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestPatch = onRequestPost;
export const onRequestPut = onRequestPost;

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
