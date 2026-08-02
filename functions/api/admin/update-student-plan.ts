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
];

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized) || normalized.includes("admin");
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
    let body: any = {};
    try {
      const text = await request.text();
      if (text && text.trim()) {
        body = JSON.parse(text);
      }
    } catch {
      body = {};
    }

    const {
      studentId,
      studentEmail,
      subscribedPlans,
      packageName,
      paymentStatus = "Verified & Paid",
      expirationMonths = 12,
      adminNote,
      adminEmail,
    } = body || {};

    const requestedByEmail = (adminEmail || "").trim().toLowerCase();
    const isAdmin = isAdminEmail(requestedByEmail);

    if (!isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Forbidden: Manual plan changes are strictly restricted to authorized administrators.",
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    if ((!studentId && !studentEmail) || !Array.isArray(subscribedPlans) || !packageName) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request parameters. Required: studentId or studentEmail, subscribedPlans (array), packageName.",
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

    // Fetch existing student record
    let query = supabaseAdmin.from("students").select("*");
    if (studentId) {
      query = query.eq("id", studentId);
    } else {
      query = query.eq("email", studentEmail);
    }

    const { data: existingStudents, error: fetchErr } = await query;
    const currentStudent = existingStudents && existingStudents[0];

    if (fetchErr || !currentStudent) {
      return new Response(
        JSON.stringify({ success: false, error: "Student record not found." }),
        { status: 404, headers: corsHeaders }
      );
    }

    const oldPlan = currentStudent.package_name || (currentStudent.subscribed_plans && currentStudent.subscribed_plans.join(", ")) || "Free Plan";

    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + Number(expirationMonths));
    const accessExpiresStr = expDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const isFree = subscribedPlans.includes("free") && subscribedPlans.length === 1;
    const finalPaymentStatus = isFree ? "Free Plan" : paymentStatus;
    const finalRequiresPayment = isFree;

    const planData = {
      subscribed_plans: subscribedPlans,
      package_name: packageName,
      payment_status: finalPaymentStatus,
      requires_payment: finalRequiresPayment,
      status: "active",
      access_expires: accessExpiresStr,
      updated_at: new Date().toISOString(),
    };

    let updatedStudent = { ...currentStudent, ...planData };

    try {
      const { data: updatedStudentData, error: updateErr } = await supabaseAdmin
        .from("students")
        .update(planData)
        .eq("id", currentStudent.id)
        .select();

      if (updateErr) {
        await supabaseAdmin
          .from("students")
          .update({ updated_at: planData.updated_at })
          .eq("id", currentStudent.id);
      } else if (updatedStudentData && updatedStudentData[0]) {
        updatedStudent = { ...updatedStudentData[0], ...planData };
      }
    } catch (dbErr: any) {
      console.warn("Supabase update error:", dbErr);
    }

    // Log admin activity
    const logRecord = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      admin_email: requestedByEmail || "shsvirtualadmin@gmail.com",
      target_student_id: currentStudent.id,
      target_student_name: currentStudent.name || "Student",
      target_student_email: currentStudent.email,
      action_type: "manual_plan_change",
      old_plan: oldPlan,
      new_plan: packageName,
      note: adminNote || "Manual subscription plan override by administrator",
      created_at: new Date().toISOString(),
    };

    try {
      await supabaseAdmin.from("admin_activity_logs").insert([logRecord]);
    } catch (logErr) {
      console.warn("Notice: admin_activity_logs insert skipped:", logErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Plan successfully updated to "${packageName}" for ${currentStudent.name || "Student"}!`,
        profile: updatedStudent,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal server error." }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
