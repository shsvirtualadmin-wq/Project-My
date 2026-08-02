/**
 * Utility to generate Google OAuth2 Access Token using RS256 JWT signing via Web Crypto API (crypto.subtle).
 * Suitable for Cloudflare Pages / Workers and modern Node.js environments (no googleapis or google-auth-library needed).
 */

function base64UrlEncode(input) {
  let base64 = '';
  if (typeof input === 'string') {
    base64 = btoa(unescape(encodeURIComponent(input)));
  } else {
    let binary = '';
    const bytes = new Uint8Array(input);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(binary);
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToBinary(pem) {
  const cleanPem = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '');
  const raw = atob(cleanPem);
  const rawLength = raw.length;
  const array = new Uint8Array(new ArrayBuffer(rawLength));
  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array.buffer;
}

/**
 * Reads GOOGLE_SERVICE_ACCOUNT_KEY from env, signs RS256 JWT, exchanges for access token.
 * @param {Record<string, any>} [env] - Cloudflare environment object
 * @returns {Promise<string>} Access Token
 */
export async function getGoogleAccessToken(env) {
  const keyRaw = env?.GOOGLE_SERVICE_ACCOUNT_KEY || (typeof process !== 'undefined' ? process.env?.GOOGLE_SERVICE_ACCOUNT_KEY : null);
  if (!keyRaw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is missing.");
  }

  let credentials;
  if (typeof keyRaw === 'object' && keyRaw !== null) {
    credentials = keyRaw;
  } else {
    try {
      credentials = JSON.parse(keyRaw);
    } catch (e) {
      throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY format: Must be a valid JSON string or object.");
    }
  }

  const clientEmail = credentials.client_email;
  const privateKeyPem = credentials.private_key;

  if (!clientEmail || !privateKeyPem) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is missing 'client_email' or 'private_key'.");
  }

  const binaryKey = pemToBinary(privateKeyPem);

  const importedKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  );

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    importedKey,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = base64UrlEncode(signature);
  const jwt = `${unsignedToken}.${encodedSignature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`Google OAuth Token Exchange failed: ${tokenResponse.status} - ${errText}`);
  }

  const data = await tokenResponse.json();
  return data.access_token;
}

export default getGoogleAccessToken;
