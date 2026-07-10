// lib/firebase/rest-admin.ts
// Cloudflare Workers-safe replacement for firebase-admin.
// Talks to Google APIs over plain HTTPS/fetch + Web Crypto — no gRPC, no eval.
// Includes FULL RSA signature verification for session cookies via a
// minimal DER/X.509 parser that extracts the SubjectPublicKeyInfo from
// Google's certs (Web Crypto needs SPKI, Google serves full X.509 PEM).

function base64url(input: ArrayBuffer | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") bytes = new TextEncoder().encode(input);
  else bytes = new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const raw = atob(b64 + pad);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf;
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

function getServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set");
  return JSON.parse(atob(b64)) as {
    client_email: string;
    private_key: string;
    project_id: string;
  };
}

let cachedToken: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() / 1000 + 60) {
    return cachedToken.token;
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

  cachedToken = { token: data.access_token, exp: now + data.expires_in };
  return data.access_token;
}

function toFirestoreValue(v: any): any {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  return { stringValue: String(v) };
}

function fromFirestoreFields(fields: Record<string, any> = {}): Record<string, any> {
  const out: Record<string, any> = {};
  for (const key in fields) {
    const val = fields[key];
    if ("stringValue" in val) out[key] = val.stringValue;
    else if ("integerValue" in val) out[key] = Number(val.integerValue);
    else if ("doubleValue" in val) out[key] = val.doubleValue;
    else if ("booleanValue" in val) out[key] = val.booleanValue;
    else if ("timestampValue" in val) out[key] = val.timestampValue;
    else if ("nullValue" in val) out[key] = null;
    else out[key] = val;
  }
  return out;
}

export interface FirestoreDoc {
  id: string;
  ref: { name: string };
  data: () => Record<string, any>;
}

export async function firestoreQuery(
  collection: string,
  where: { field: string; op: string; value: any }[]
): Promise<FirestoreDoc[]> {
  const sa = getServiceAccount();
  const token = await getAccessToken();

    const filters = where.map((w) => {
    if (w.value === null || w.value === undefined) {
      return {
        unaryFilter: {
          field: { fieldPath: w.field },
          op: "IS_NULL",
        },
      };
    }
    return {
      fieldFilter: {
        field: { fieldPath: w.field },
        op: w.op,
        value: toFirestoreValue(w.value),
      },
    };
  });

  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: filters.length > 1
        ? { compositeFilter: { op: "AND", filters } }
        : filters[0],
    },
  };

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const results = await res.json() as any[];
  if (!res.ok) throw new Error(`Firestore query failed: ${JSON.stringify(results)}`);

  return results
    .filter((r) => r.document)
    .map((r) => ({
      id: r.document.name.split("/").pop(),
      ref: { name: r.document.name },
      data: () => fromFirestoreFields(r.document.fields),
    }));
}

export async function firestoreGetAll(collection: string): Promise<FirestoreDoc[]> {
  const sa = getServiceAccount();
  const token = await getAccessToken();

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/${collection}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json() as any;
  if (!res.ok) throw new Error(`Firestore getAll failed: ${JSON.stringify(data)}`);

  return (data.documents || []).map((docItem: any) => ({
    id: docItem.name.split("/").pop(),
    ref: { name: docItem.name },
    data: () => fromFirestoreFields(docItem.fields),
  }));
}

export async function firestoreUpdate(docName: string, fields: Record<string, any>) {
  const token = await getAccessToken();
  const fbFields: Record<string, any> = {};
  for (const k in fields) fbFields[k] = toFirestoreValue(fields[k]);

  const mask = Object.keys(fields).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
  const res = await fetch(`https://firestore.googleapis.com/v1/${docName}?${mask}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: fbFields }),
  });
  if (!res.ok) throw new Error(`Firestore update failed: ${await res.text()}`);
}

export async function firestoreAdd(collection: string, fields: Record<string, any>) {
  const sa = getServiceAccount();
  const token = await getAccessToken();
  const fbFields: Record<string, any> = {};
  for (const k in fields) fbFields[k] = toFirestoreValue(fields[k]);

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/${collection}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: fbFields }),
    }
  );
  if (!res.ok) throw new Error(`Firestore add failed: ${await res.text()}`);
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
  return { uid: user.localId, email: user.email, admin: customAttrs.admin === true };
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



export async function firestoreUpdateById(collection: string, id: string, fields: Record<string, any>) {
  const sa = getServiceAccount();
  const docName = `projects/${sa.project_id}/databases/(default)/documents/${collection}/${id}`;
  await firestoreUpdate(docName, fields);
}

export async function firestoreGetById(collection: string, id: string) {
  const sa = getServiceAccount();
  const token = await getAccessToken();
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/${collection}/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 404) return null;
  const data = await res.json() as any;
  if (!res.ok) throw new Error(`Firestore getById failed: ${JSON.stringify(data)}`);
  return { id, ref: { name: data.name }, data: () => fromFirestoreFields(data.fields) };
}

export async function firestoreQueryOrdered(
  collection: string,
  where: { field: string; op: string; value: any }[],
  orderByField: string,
  direction: "ASCENDING" | "DESCENDING",
  limitCount: number
) {
  const sa = getServiceAccount();
  const token = await getAccessToken();

    const filters = where.map((w) => {
    if (w.value === null || w.value === undefined) {
      return {
        unaryFilter: {
          field: { fieldPath: w.field },
          op: "IS_NULL",
        },
      };
    }
    return {
      fieldFilter: {
        field: { fieldPath: w.field },
        op: w.op,
        value: toFirestoreValue(w.value),
      },
    };
  });

  const body: any = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      orderBy: [{ field: { fieldPath: orderByField }, direction }],
      limit: limitCount,
    },
  };
  if (filters.length === 1) body.structuredQuery.where = filters[0];
  if (filters.length > 1) body.structuredQuery.where = { compositeFilter: { op: "AND", filters } };

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const results = await res.json() as any[];
  if (!res.ok) throw new Error(`Firestore ordered query failed: ${JSON.stringify(results)}`);

  return results
    .filter((r) => r.document)
    .map((r) => ({
      id: r.document.name.split("/").pop(),
      ref: { name: r.document.name },
      data: () => fromFirestoreFields(r.document.fields),
    }));
}


export async function getBatchLink(batchDate: string): Promise<string | null> {
  const sa = getServiceAccount();
  const token = await getAccessToken();
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/batch_links/${batchDate}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 404) return null;
  const data = await res.json() as any;
  if (!res.ok) throw new Error(`getBatchLink failed: ${JSON.stringify(data)}`);
  return fromFirestoreFields(data.fields).whatsapp_link ?? null;
}

export async function setBatchLink(batchDate: string, link: string): Promise<void> {
  const sa = getServiceAccount();
  const token = await getAccessToken();
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/batch_links/${batchDate}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { whatsapp_link: { stringValue: link } } }),
    }
  );
  if (!res.ok) throw new Error(`setBatchLink failed: ${await res.text()}`);
}
