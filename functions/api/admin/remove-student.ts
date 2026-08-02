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

const handleRemoveStudent = async (context: PagesContext) => {
  const { request, env } = context;

  // Enable CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, DELETE, PATCH, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty or URL params used
    }

    const urlParams = new URL(request.url).searchParams;
    const requesterEmail = body.requesterEmail || urlParams.get("requesterEmail") || "";
    const studentId = body.studentId || urlParams.get("studentId") || "";
    const studentEmail = body.studentEmail || urlParams.get("studentEmail") || "";

    const isAdmin = Boolean(requesterEmail && requesterEmail.trim().toLowerCase() === "shsvirtualadmin@gmail.com");

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden: Only administrators can wipe student accounts." }),
        { status: 403, headers: corsHeaders }
      );
    }

    if (!studentId && !studentEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing parameters: studentId or studentEmail is required." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const db = getSupabaseAdminClient(env);
    const errors: string[] = [];

    if (db) {
      // Step 1: Delete from related child tables in order to prevent FK constraints
      const childTasks: Array<{ table: string; field: string; val: string }> = [];

      if (studentId) {
        childTasks.push(
          { table: "test_results", field: "student_id", val: studentId },
          { table: "mcq_attempts", field: "student_id", val: studentId },
          { table: "student_mcq_usage", field: "student_id", val: studentId },
          { table: "mcq_usage", field: "student_id", val: studentId },
          { table: "student_progress", field: "student_id", val: studentId },
          { table: "ai_history", field: "student_id", val: studentId },
          { table: "study_buddy_history", field: "student_id", val: studentId },
          { table: "study_buddy_usage", field: "student_id", val: studentId },
          { table: "student_achievements", field: "student_id", val: studentId },
          { table: "achievements", field: "student_id", val: studentId }
        );
      }

      if (studentEmail) {
        childTasks.push(
          { table: "student_mcq_usage", field: "email", val: studentEmail },
          { table: "mcq_usage", field: "email", val: studentEmail },
          { table: "study_buddy_usage", field: "email", val: studentEmail }
        );
      }

      for (const task of childTasks) {
        try {
          const { error } = await db.from(task.table).delete().eq(task.field, task.val);
          if (error) {
            errors.push(`${task.table}: ${error.message}`);
          }
        } catch (tErr: any) {
          console.warn(`Exception deleting ${task.table}:`, tErr?.message || String(tErr));
        }
      }

      // Step 2: Delete from main 'students' table
      if (studentId) {
        try {
          const { error } = await db.from("students").delete().eq("id", studentId);
          if (error) {
            errors.push(`students(id): ${error.message}`);
          }
        } catch (sErr: any) {
          console.error(`Exception deleting student row (id=${studentId}):`, sErr);
        }
      }

      if (studentEmail) {
        try {
          await db.from("students").delete().eq("email", studentEmail);
        } catch (seErr: any) {
          console.warn(`Exception deleting student by email:`, seErr);
        }
      }

      // Step 3: Delete Auth User if admin SDK permissions available
      if (studentId && (db as any).auth?.admin?.deleteUser) {
        try {
          await (db as any).auth.admin.deleteUser(studentId);
        } catch (aErr: any) {
          console.warn(`Exception deleting auth user:`, aErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Student account, test history, and registration wiped successfully.",
        warnings: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Failed to remove student account" }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestPost = handleRemoveStudent;
export const onRequestDelete = handleRemoveStudent;
export const onRequestPatch = handleRemoveStudent;
export const onRequestPut = handleRemoveStudent;
export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, DELETE, PATCH, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
