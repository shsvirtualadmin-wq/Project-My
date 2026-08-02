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

const ADMIN_EMAILS = [
  "shsvirtualadmin@gmail.com",
  "shsteachersemail@gmail.com",
  "itxakira67@gmail.com"
];

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized) || normalized.includes("admin");
}

const handleUpdateStudentStatus = async (context: PagesContext) => {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  try {
    let body: any = {};
    try {
      const text = await request.text();
      if (text && text.trim()) {
        body = JSON.parse(text);
      }
    } catch {
      body = {};
    }

    const urlParams = new URL(request.url).searchParams;
    const requesterEmail = body.requesterEmail || body.adminEmail || urlParams.get("requesterEmail") || urlParams.get("adminEmail") || "";
    const studentId = body.studentId || urlParams.get("studentId") || "";
    const status = body.status || urlParams.get("status") || "";

    const isAdmin = isAdminEmail(requesterEmail);

    if (!isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Forbidden: Only administrators can update student status.",
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    if (!studentId || !status || !["active", "suspended"].includes(status)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing or invalid parameters: studentId and valid status ('active' or 'suspended') are required.",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient(env);
    if (!supabaseAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Database client unavailable." }),
        { status: 500, headers: corsHeaders }
      );
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedData, error: updateErr } = await supabaseAdmin
      .from("students")
      .update(updateData)
      .eq("id", studentId)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.error("[functions/api/admin/update-student-status error]:", updateErr);
      return new Response(
        JSON.stringify({ success: false, error: updateErr.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Student status updated to ${status}.`,
        status,
        profile: updatedData,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("[functions/api/admin/update-student-status exception]:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Failed to update student status." }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestPost = handleUpdateStudentStatus;
export const onRequestPatch = handleUpdateStudentStatus;
export const onRequestPut = handleUpdateStudentStatus;
export const onRequestDelete = handleUpdateStudentStatus;
export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
