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

const handleSubmitPaymentRequest = async (context: PagesContext) => {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  try {
    const contentType = request.headers.get("content-type") || "";
    let student_id = "";
    let student_name = "Student";
    let student_email = "";
    let payment_method = "";
    let amount = "";
    let transaction_reference = "";
    let course_tier = "";

    if (contentType.includes("application/json")) {
      const body = await request.json() as any;
      student_id = body.student_id || body.studentId || "";
      student_name = body.student_name || body.studentName || "Student";
      student_email = body.student_email || body.studentEmail || "";
      payment_method = body.payment_method || body.paymentMethod || "";
      amount = body.amount || "";
      transaction_reference = body.transaction_reference || body.transactionRef || "";
      course_tier = body.course_tier || body.tier || "";
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      student_id = formData.get("student_id")?.toString() || formData.get("studentId")?.toString() || "";
      student_name = formData.get("student_name")?.toString() || formData.get("studentName")?.toString() || "Student";
      student_email = formData.get("student_email")?.toString() || formData.get("studentEmail")?.toString() || "";
      payment_method = formData.get("payment_method")?.toString() || formData.get("paymentMethod")?.toString() || "";
      amount = formData.get("amount")?.toString() || "";
      transaction_reference = formData.get("transaction_reference")?.toString() || formData.get("transactionRef")?.toString() || "";
      course_tier = formData.get("course_tier")?.toString() || formData.get("tier")?.toString() || "";
    }

    if (!student_email || !payment_method || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: student_email, payment_method, amount." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const driveFileId = `wa-${Date.now()}`;
    const driveFileUrl = "WhatsApp Submission (+923222314436)";

    const supabaseAdmin = getSupabaseAdminClient(env);
    const newRecord: Record<string, any> = {
      student_id: String(student_id || `anon-${Date.now()}`),
      student_name: String(student_name || "Student"),
      student_email: String(student_email).toLowerCase().trim(),
      payment_method: String(payment_method),
      amount: Number(amount) || amount,
      drive_file_id: driveFileId,
      drive_file_url: driveFileUrl,
      transaction_reference: String(transaction_reference || "").trim(),
      status: "pending",
      created_at: new Date().toISOString(),
    };

    if (course_tier) {
      newRecord.admin_note = `Selected Tier: ${course_tier}`;
    }

    let insertedData = newRecord;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("payment_requests")
        .insert(newRecord)
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("[Supabase Insert Error payment_requests]:", error);
      } else if (data) {
        insertedData = data;
      }

      // Update student payment status in students table
      try {
        await supabaseAdmin
          .from("students")
          .update({
            payment_status: "Pending Verification",
            requires_payment: true,
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${student_id},email.eq.${student_email}`);
      } catch (stErr) {
        console.warn("[Error updating student payment_status]:", stErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: insertedData }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("[functions/api/payment-requests/submit exception]:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal server error submitting payment proof." }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestPost = handleSubmitPaymentRequest;
export const onRequestPut = handleSubmitPaymentRequest;
export const onRequestPatch = handleSubmitPaymentRequest;
export const onRequestDelete = handleSubmitPaymentRequest;
export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
