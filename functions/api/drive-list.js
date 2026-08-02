import { getGoogleAccessToken } from "../_utils/googleAuth.js";

const SHARED_FOLDER_ID = "1Kb6pb7EKoS5mCWPI8tRPeG1rc3yqpMsv";

export const onRequestGet = async (context) => {
  const { env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  try {
    const accessToken = await getGoogleAccessToken(env);

    const query = `'${SHARED_FOLDER_ID}' in parents and trashed = false`;
    const fields = "files(id,name,webViewLink,webContentLink,createdTime,mimeType,size)";
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=createdTime%20desc`;

    const driveRes = await fetch(driveUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!driveRes.ok) {
      const errText = await driveRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `Google Drive API list failed (${driveRes.status}): ${errText}` }),
        { status: 500, headers: corsHeaders }
      );
    }

    const data = await driveRes.json();
    const files = (data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
      webContentLink: f.webContentLink || `https://drive.google.com/uc?id=${f.id}&export=download`,
      createdTime: f.createdTime,
      mimeType: f.mimeType,
      size: f.size,
    }));

    return new Response(JSON.stringify(files), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Failed to list files from Google Drive" }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
