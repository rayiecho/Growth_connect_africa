import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getServiceAccount, getAccessToken } from "@/lib/firebase/rest-shared";

function toFirestoreValue(v: any): any {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map((item) => toFirestoreValue(item)) } };
  }
  if (typeof v === "object") {
    const fields: Record<string, any> = {};
    for (const k in v) fields[k] = toFirestoreValue(v[k]);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function fromFirestoreValue(val: any): any {
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return val.doubleValue;
  if ("booleanValue" in val) return val.booleanValue;
  if ("timestampValue" in val) return val.timestampValue;
  if ("nullValue" in val) return null;
  if ("arrayValue" in val) {
    const values = val.arrayValue.values || [];
    return values.map((item: any) => fromFirestoreValue(item));
  }
  if ("mapValue" in val) {
    return fromFirestoreFields(val.mapValue.fields || {});
  }
  return val;
}

function fromFirestoreFields(fields: Record<string, any> = {}): Record<string, any> {
  const out: Record<string, any> = {};
  for (const key in fields) {
    out[key] = fromFirestoreValue(fields[key]);
  }
  return out;
}

export interface FirestoreDoc {
  id: string;
  ref: { name: string };
  data: () => Record<string, any>;
}

const _queryCache = new Map<string, { data: FirestoreDoc[]; expiresAt: number }>();
const QUERY_CACHE_TTL_MS = 60_000;

export async function firestoreQuery(
  collection: string,
  where: { field: string; op: string; value: any }[]
): Promise<FirestoreDoc[]> {
  const cacheKey = `${collection}::${JSON.stringify(where)}`;
  const cached = _queryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

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

  const mapped = results
    .filter((r) => r.document)
    .map((r) => ({
      id: r.document.name.split("/").pop(),
      ref: { name: r.document.name },
      data: () => fromFirestoreFields(r.document.fields),
    }));
  _queryCache.set(cacheKey, { data: mapped, expiresAt: Date.now() + QUERY_CACHE_TTL_MS });
  return mapped;
}

const _getAllCache = new Map<string, { data: FirestoreDoc[]; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

async function fetchWithRetry(url: string, opts: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, opts);
    if (res.status !== 429) return res;
    if (attempt === maxRetries) return res;
    const delay = 500 * Math.pow(2, attempt);
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error("unreachable");
}

const KV_STALE_TTL_SECONDS = 3600;
const KV_WRITE_THROTTLE_MS = 5 * 60 * 1000;
const KV_FRESH_READ_MS = 3 * 60 * 1000;

function rawDocsToFirestoreDocs(rawDocs: any[]): FirestoreDoc[] {
  return rawDocs.map((docItem: any) => ({
    id: docItem.name.split("/").pop(),
    ref: { name: docItem.name },
    data: () => fromFirestoreFields(docItem.fields),
  }));
}

async function getKvNamespace(): Promise<any> {
  try {
    const cfContext = await getCloudflareContext();
    return (cfContext?.env as any)?.TOKEN_CACHE || null;
  } catch {
    return null;
  }
}

export async function firestoreGetAll(collection: string): Promise<FirestoreDoc[]> {
  const cached = _getAllCache.get(collection);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const kv = await getKvNamespace();
  const kvKey = `getall:${collection}`;

  if (kv) {
    try {
      const existingRaw = await kv.get(kvKey);
      if (existingRaw) {
        const existing = JSON.parse(existingRaw);
        if (existing.writtenAt && Date.now() - existing.writtenAt < KV_FRESH_READ_MS) {
          const result = rawDocsToFirestoreDocs(existing.docs);
          _getAllCache.set(collection, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
          return result;
        }
      }
    } catch {
      // fall through to a real Firestore fetch
    }
  }

  try {
    const sa = getServiceAccount();
    const token = await getAccessToken();

    let allDocs: any[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const url = new URL(
        `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/${collection}`
      );
      url.searchParams.set("pageSize", "300");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetchWithRetry(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(`Firestore getAll failed: ${JSON.stringify(data)}`);

      allDocs = allDocs.concat(data.documents || []);
      pageToken = data.nextPageToken;
    } while (pageToken);

    const result = rawDocsToFirestoreDocs(allDocs);
    _getAllCache.set(collection, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

    if (kv) {
      try {
        const existingRaw = await kv.get(kvKey);
        let shouldWrite = true;
        if (existingRaw) {
          try {
            const existing = JSON.parse(existingRaw);
            if (existing.writtenAt && Date.now() - existing.writtenAt < KV_WRITE_THROTTLE_MS) {
              shouldWrite = false;
            }
          } catch {
            // malformed existing entry - overwrite it
          }
        }
        if (shouldWrite) {
          await kv.put(kvKey, JSON.stringify({ writtenAt: Date.now(), docs: allDocs }), { expirationTtl: KV_STALE_TTL_SECONDS });
        }
      } catch {
        // KV write failure is non-fatal
      }
    }

    return result;
  } catch (err) {
    if (kv) {
      try {
        const staleRaw = await kv.get(kvKey);
        if (staleRaw) {
          console.error(`firestoreGetAll(${collection}) failed, serving stale cached data:`, err);
          const parsed = JSON.parse(staleRaw);
          const docs = Array.isArray(parsed) ? parsed : parsed.docs;
          return rawDocsToFirestoreDocs(docs);
        }
      } catch {
        // fall through to throw the original error
      }
    }
    throw err;
  }
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
  limitCount: number,
  startAfterValue?: any
) {
  const kv = await getKvNamespace();
  const kvKey = `queryOrdered:${collection}:${JSON.stringify(where)}:${orderByField}:${direction}:${limitCount}`;

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
  if (startAfterValue !== undefined && startAfterValue !== null) {
    body.structuredQuery.startAt = { values: [toFirestoreValue(startAfterValue)], before: false };
  }

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

export async function firestoreDeleteById(collection: string, id: string): Promise<void> {
  const sa = getServiceAccount();
  const token = await getAccessToken();
  const docName = `projects/${sa.project_id}/databases/(default)/documents/${collection}/${id}`;
  const res = await fetch(`https://firestore.googleapis.com/v1/${docName}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Firestore delete failed: ${await res.text()}`);
  }
}

export async function generateEmailVerificationLinkRest(email: string): Promise<string> {
  const token = await getAccessToken();
  const res = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requestType: "VERIFY_EMAIL", email, returnOobLink: true }),
  });
  const data = await res.json() as any;
  if (!res.ok) throw new Error(`generateEmailVerificationLink failed: ${JSON.stringify(data)}`);
  return data.oobLink as string;
}

const FIRESTORE_MAX_WRITES_PER_COMMIT = 450;

export async function firestoreBatchUpdate(
  updates: { collection: string; id: string; fields: Record<string, any> }[]
): Promise<void> {
  if (updates.length === 0) return;
  const sa = getServiceAccount();
  const token = await getAccessToken();

  for (let i = 0; i < updates.length; i += FIRESTORE_MAX_WRITES_PER_COMMIT) {
    const chunk = updates.slice(i, i + FIRESTORE_MAX_WRITES_PER_COMMIT);

    const writes = chunk.map((u) => {
      const fbFields: Record<string, any> = {};
      for (const k in u.fields) fbFields[k] = toFirestoreValue(u.fields[k]);
      return {
        update: {
          name: `projects/${sa.project_id}/databases/(default)/documents/${u.collection}/${u.id}`,
          fields: fbFields,
        },
        updateMask: { fieldPaths: Object.keys(u.fields) },
      };
    });

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents:commit`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ writes }),
      }
    );
    const data = await res.json() as any;
    if (!res.ok) throw new Error(`firestoreBatchUpdate failed (chunk starting at ${i}): ${JSON.stringify(data)}`);
  }
}

export async function logCronRun(cronName: string, result: any): Promise<void> {
  try {
    await firestoreAdd("cron_run_log", {
      cron_name: cronName,
      ran_at: new Date().toISOString(),
      result,
      had_errors: Array.isArray(result?.errors) && result.errors.length > 0,
    });
  } catch (err) {
    console.error(`Failed to log cron run for ${cronName}:`, err);
  }
}
