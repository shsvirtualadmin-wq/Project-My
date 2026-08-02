import { getGoogleAccessToken } from "../_utils/googleAuth.js";

const SHARED_FOLDER_ID = "1Kb6pb7EKoS5mCWPI8tRPeG1rc3yqpMsv";
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB max limit

export const onRequestPost = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return new Response(
        JSON.stringify({ success: false, error: "No file uploaded. Please include a file in the 'file' field." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Size Validation (15MB Limit)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return new Response(
        JSON.stringify({
          success: false,
          error: `File size limit exceeded: File is ${sizeMB}MB, maximum allowed size is 15MB.`,
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Format Validation (PDF and Images Only)
    const allowedMimePrefixes = ["image/"];
    const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    const ext = (file.name || "").split(".").pop()?.toLowerCase();
    const isAllowedExt = ["pdf", "jpg", "jpeg", "png", "webp", "gif"].includes(ext || "");
    const isAllowedMime = allowedMimes.includes(file.type) || allowedMimePrefixes.some(p => file.type?.startsWith(p));

    if (!isAllowedExt && !isAllowedMime) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid file type. Only PDF and Image files (JPG, PNG, WEBP, GIF) are accepted.",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch Google OAuth Access Token
    const accessToken = await getGoogleAccessToken(env);

    // Prepare Google Drive Multipart Body
    const metadata = {
      name: file.name,
      parents: [SHARED_FOLDER_ID],
    };

    const boundary = "-------" + Math.random().toString(36).substring(2);
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileBuffer = await file.arrayBuffer();
    const fileUint8 = new Uint8Array(fileBuffer);

    const encoder = new TextEncoder();
    const part1 = encoder.encode(
      `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n${delimiter}Content-Type: ${file.type || "application/octet-stream"}\r\n\r\n`
    );
    const part2 = encoder.encode(closeDelimiter);

    const multipartBody = new Uint8Array(part1.length + fileUint8.length + part2.length);
    multipartBody.set(part1, 0);
    multipartBody.set(fileUint8, part1.length);
    multipartBody.set(part2, part1.length + fileUint8.length);

    const driveRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,createdTime",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      }
    );

    if (!driveRes.ok) {
      const errText = await driveRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `Google Drive API upload failed (${driveRes.status}): ${errText}` }),
        { status: 500, headers: corsHeaders }
      );
    }

    const uploaded = await driveRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        id: uploaded.id,
        name: uploaded.name,
        webViewLink: uploaded.webViewLink,
        webContentLink: uploaded.webContentLink,
        createdTime: uploaded.createdTime,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Failed to process drive upload" }),
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
