import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { getGoogleAccessToken } from "../../_utils/googleAuth.js";

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

const SHARED_FOLDER_ID = "1Kb6pb7EKoS5mCWPI8tRPeG1rc3yqpMsv";

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
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid Content-Type: Must be multipart/form-data" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await request.formData();
    const student_id = formData.get("student_id")?.toString() || "";
    const student_name = formData.get("student_name")?.toString() || "Student";
    const student_email = formData.get("student_email")?.toString() || "";
    const payment_method = formData.get("payment_method")?.toString() || "";
    const amount = formData.get("amount")?.toString() || "";
    const transaction_reference = formData.get("transaction_reference")?.toString() || "";
    const course_tier = formData.get("course_tier")?.toString() || formData.get("tier")?.toString() || "";
    const file = formData.get("file");

    if (!student_id || !student_email || !payment_method || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: student_id, student_email, payment_method, amount." }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!file || typeof file === "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Payment confirmation screenshot is required." }),
        { status: 400, headers: corsHeaders }
      );
    }

    let driveFileId = `local-${Date.now()}`;
    let driveFileUrl = "";

    // Upload to Google Drive if credentials available
    try {
      const accessToken = await getGoogleAccessToken(env);
      const metadata = {
        name: `PaymentProof_${student_name || "Student"}_${Date.now()}_${file.name || "proof.png"}`,
        parents: [SHARED_FOLDER_ID],
      };

      const boundary = "-------" + Math.random().toString(36).substring(2);
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const fileBuffer = await file.arrayBuffer();
      const fileUint8 = new Uint8Array(fileBuffer);

      const encoder = new TextEncoder();
      const part1 = encoder.encode(
        `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n${delimiter}Content-Type: ${file.type || "image/png"}\r\n\r\n`
      );
      const part2 = encoder.encode(closeDelimiter);

      const multipartBody = new Uint8Array(part1.length + fileUint8.length + part2.length);
      multipartBody.set(part1, 0);
      multipartBody.set(fileUint8, part1.length);
      multipartBody.set(part2, part1.length + fileUint8.length);

      const driveRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: multipartBody,
        }
      );

      if (driveRes.ok) {
        const uploaded = await driveRes.json();
        driveFileId = uploaded.id;
        driveFileUrl = uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`;
      } else {
        const errText = await driveRes.text();
        console.warn("[Cloudflare Function Drive API Warning]:", errText);
      }
    } catch (driveErr) {
      console.warn("[Cloudflare Function Drive Upload Failed, continuing with fallback]:", driveErr);
    }

    // Fallback URL if Drive upload didn't produce a link
    if (!driveFileUrl) {
      try {
        const fileBuf = await file.arrayBuffer();
        const base64Str = btoa(String.fromCharCode(...new Uint8Array(fileBuf)));
        if (base64Str.length < 500000) {
          driveFileUrl = `data:${file.type || "image/png"};base64,${base64Str}`;
        } else {
          driveFileUrl = "https://drive.google.com";
        }
      } catch {
        driveFileUrl = "https://drive.google.com";
      }
    }

    const supabaseAdmin = getSupabaseAdminClient(env);
    const newRecord: Record<string, any> = {
      student_id: String(student_id),
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

    // Send confirmation email to student and notification to admin
    const emailUser = (
      env.EMAIL_USER ||
      env.GMAIL_USER ||
      env.SMTP_USER ||
      env.EMAIL_ADDRESS ||
      env.VITE_EMAIL_USER ||
      (typeof process !== "undefined" ? process.env?.EMAIL_USER || process.env?.GMAIL_USER : "") ||
      ""
    ).trim();

    const emailPass = (
      env.EMAIL_APP_PASSWORD ||
      env.GMAIL_APP_PASSWORD ||
      env.GMAIL_PASS ||
      env.SMTP_PASS ||
      env.EMAIL_PASS ||
      env.EMAIL_PASSWORD ||
      (typeof process !== "undefined" ? process.env?.EMAIL_APP_PASSWORD || process.env?.GMAIL_APP_PASSWORD : "") ||
      ""
    ).trim();

    let studentEmailSent = false;
    let adminEmailSent = false;
    let studentEmailErr: string | null = null;
    let adminEmailErr: string | null = null;

    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: emailUser, pass: emailPass },
        });

        const fromName = env.EMAIL_FROM_NAME || "Boardly Support";
        const from = `"${fromName}" <${emailUser}>`;

        // 1) Student Confirmation Email
        const studentHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px;">
            <h2 style="color: #059669;">Payment Proof Received - Boardly Premium</h2>
            <p>Dear ${student_name},</p>
            <p>We have successfully received your payment proof screenshot for <strong>${payment_method}</strong> (Amount: <strong>PKR ${amount}</strong>).</p>
            <p>Our administration team is reviewing your transaction and will activate your full access shortly.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Boardly Learning Platform &copy; ${new Date().getFullYear()}</p>
          </div>
        `;

        const studentRes = await transporter.sendMail({
          from,
          to: student_email,
          subject: "Payment Proof Received - Boardly Premium Access",
          html: studentHtml,
        });
        studentEmailSent = true;
        console.log(`[Cloudflare Function Email Sent to Student]: Message ID ${studentRes.messageId}`);
      } catch (sErr: any) {
        studentEmailErr = sErr?.message || String(sErr);
        console.error(`[Cloudflare Function Student Email Failed]:`, sErr);
      }

      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: emailUser, pass: emailPass },
        });

        const fromName = env.EMAIL_FROM_NAME || "Boardly Support";
        const from = `"${fromName}" <${emailUser}>`;

        // 2) Admin Notification Email
        const adminHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px;">
            <h2 style="color: #0f172a;">New Payment Proof Submission</h2>
            <p><strong>Student:</strong> ${student_name} (${student_email})</p>
            <p><strong>Method:</strong> ${payment_method}</p>
            <p><strong>Amount:</strong> PKR ${amount}</p>
            <p><strong>Transaction Ref:</strong> ${transaction_reference || 'N/A'}</p>
            <p><strong>Drive Proof URL:</strong> <a href="${driveFileUrl}">${driveFileUrl}</a></p>
          </div>
        `;

        const adminRes = await transporter.sendMail({
          from,
          to: "shsvirtualadmin@gmail.com",
          subject: `[NEW PAYMENT PROOF] ${student_name} (${student_email})`,
          html: adminHtml,
        });
        adminEmailSent = true;
        console.log(`[Cloudflare Function Email Sent to Admin]: Message ID ${adminRes.messageId}`);
      } catch (aErr: any) {
        adminEmailErr = aErr?.message || String(aErr);
        console.error(`[Cloudflare Function Admin Email Failed]:`, aErr);
      }
    } else {
      const missingKeys = [];
      if (!emailUser) missingKeys.push("EMAIL_USER/GMAIL_USER");
      if (!emailPass) missingKeys.push("EMAIL_APP_PASSWORD/GMAIL_APP_PASSWORD");
      studentEmailErr = `Gmail SMTP credentials missing on server (${missingKeys.join(", ")}).`;
      adminEmailErr = studentEmailErr;
      console.warn(`[Cloudflare Function Email Warning] Cannot send welcome email: ${studentEmailErr}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: insertedData,
        driveFileUrl,
        emailsSent: {
          student: studentEmailSent,
          admin: adminEmailSent,
          studentError: studentEmailErr,
          adminError: adminEmailErr,
        }
      }),
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
