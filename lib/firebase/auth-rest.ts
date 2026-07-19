import { getServiceAccount, getAccessToken } from "@/lib/firebase/rest-shared";

function base64urlToBytes(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const raw = atob(b64 + pad);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf;
}

export async function verifyIdTokenRest(idToken: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json() as any;
  if (!res.ok || !data.users?.length) throw new Error("Invalid ID token");

  const user = data.users[0];
  const customAttrs = user.customAttributes ? JSON.parse(user.customAttributes) : {};
  return { uid: user.localId, email: user.email, admin: customAttrs.admin === true, emailVerified: user.emailVerified === true };
}

export async function createSessionCookieRest(idToken: string, expiresInMs: number) {
  const sa = getServiceAccount();
  const token = await getAccessToken();

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${sa.project_id}:createSessionCookie`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, validDuration: String(Math.floor(expiresInMs / 1000)) }),
    }
  );
  const data = await res.json() as any;
  if (!res.ok) throw new Error(`createSessionCookie failed: ${JSON.stringify(data)}`);
  return data.sessionCookie as string;
}

// ---- Session cookie verification — FULL signature check, no shortcuts ----

let cachedCerts: { certs: Record<string, string>; fetchedAt: number } | null = null;

async function getSessionCookieCerts(): Promise<Record<string, string>> {
  if (cachedCerts && Date.now() - cachedCerts.fetchedAt < 3600_000) {
    return cachedCerts.certs;
  }
  const res = await fetch("https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys");
  const certs = await res.json() as Record<string, string>;
  cachedCerts = { certs, fetchedAt: Date.now() };
  return certs;
}

// Minimal DER TLV reader — just enough to walk an X.509 cert's structure.
function readDerLength(bytes: Uint8Array, offset: number): { length: number; next: number } {
  let len = bytes[offset];
  offset++;
  if (len & 0x80) {
    const numBytes = len & 0x7f;
    len = 0;
    for (let i = 0; i < numBytes; i++) {
      len = (len << 8) | bytes[offset];
      offset++;
    }
  }
  return { length: len, next: offset };
}

function readDerTLV(bytes: Uint8Array, offset: number) {
  const tag = bytes[offset];
  const { length, next } = readDerLength(bytes, offset + 1);
  const value = bytes.slice(next, next + length);
  const fullBytes = bytes.slice(offset, next + length);
  return { tag, value, fullBytes, next: next + length };
}

// Walks Certificate -> TBSCertificate -> subjectPublicKeyInfo, per the
// standard X.509 field order (version, serialNumber, signature, issuer,
// validity, subject, subjectPublicKeyInfo). Returns the raw SPKI DER
// bytes, which is exactly what crypto.subtle.importKey("spki", ...) needs.
function extractSpkiFromCert(pemCert: string): ArrayBuffer {
  const clean = pemCert
    .replace(/-----BEGIN CERTIFICATE-----/, "")
    .replace(/-----END CERTIFICATE-----/, "")
    .replace(/\s/g, "");
  const raw = atob(clean);
  const certBytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) certBytes[i] = raw.charCodeAt(i);

  const cert = readDerTLV(certBytes, 0);
  if (cert.tag !== 0x30) throw new Error("Not a valid certificate: expected outer SEQUENCE");

  const tbs = readDerTLV(cert.value, 0);
  if (tbs.tag !== 0x30) throw new Error("Not a valid certificate: expected TBSCertificate SEQUENCE");

  const body = tbs.value;
  let pos = 0;
  let field = readDerTLV(body, pos);
  if (field.tag === 0xa0) {
    // Optional [0] version field — skip it.
    pos = field.next;
    field = readDerTLV(body, pos);
  }
  pos = field.next; field = readDerTLV(body, pos); // serialNumber -> read signature algo next
  pos = field.next; field = readDerTLV(body, pos); // -> issuer
  pos = field.next; field = readDerTLV(body, pos); // -> validity
  pos = field.next; field = readDerTLV(body, pos); // -> subject
  pos = field.next; field = readDerTLV(body, pos); // -> subjectPublicKeyInfo

  if (field.tag !== 0x30) {
    throw new Error("Failed to locate subjectPublicKeyInfo in certificate");
  }
  return field.fullBytes.buffer as ArrayBuffer;
}

export async function verifySessionCookieRest(sessionCookie: string) {
  const sa = getServiceAccount();
  const parts = sessionCookie.split(".");
  if (parts.length !== 3) throw new Error("Malformed session cookie");

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(new TextDecoder().decode(base64urlToBytes(headerB64)));
  const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadB64)));

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error("Session cookie expired");
  if (payload.iat > now + 300) throw new Error("Session cookie issued in the future");
  if (payload.aud !== sa.project_id) throw new Error("Invalid audience");
  if (payload.iss !== `https://session.firebase.google.com/${sa.project_id}`) {
    throw new Error("Invalid issuer");
  }

  const certs = await getSessionCookieCerts();
  const certPem = certs[header.kid];
  if (!certPem) throw new Error("No matching certificate for session cookie's key ID");

  const spki = extractSpkiFromCert(certPem);
  const publicKey = await crypto.subtle.importKey(
    "spki",
    spki,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64urlToBytes(signatureB64);

  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, signature, signedData);
  if (!valid) throw new Error("Session cookie signature verification failed");

  const isAdmin = payload.admin === true || payload.claims?.admin === true;
  return { uid: payload.sub || payload.user_id, admin: isAdmin, raw: payload };
}
