import { getCloudflareContext } from "@opennextjs/cloudflare";

function base64url(input: ArrayBuffer | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") bytes = new TextEncoder().encode(input);
  else bytes = new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const clean = pem.replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const raw = atob(clean);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

export function getServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set");
  return JSON.parse(atob(b64)) as {
    client_email: string;
    private_key: string;
    project_id: string;
  };
}

let cachedToken: { token: string; exp: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() / 1000 + 60) {
    return cachedToken.token;
  }

  let kv: any = null;
  try {
    const cfContext = await getCloudflareContext();
    kv = (cfContext?.env as any)?.TOKEN_CACHE || null;
  } catch {
    kv = null;
  }

  if (kv) {
    try {
      const cachedRaw = await kv.get("firestore_access_token");
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as { token: string; exp: number };
        if (cached.exp > Date.now() / 1000 + 60) {
          cachedToken = cached;
          return cached.token;
        }
      }
    } catch {
      // KV read failed - fall through to a fresh token
    }
  }

  const sa = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json() as any;
  if (!res.ok) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);

  const tokenData = { token: data.access_token, exp: now + data.expires_in };
  cachedToken = tokenData;

  if (kv) {
    try {
      await kv.put("firestore_access_token", JSON.stringify(tokenData), { expirationTtl: Math.max(data.expires_in - 60, 60) });
    } catch {
      // KV write failed - in-memory cache still works for this isolate
    }
  }

  return data.access_token;
}
