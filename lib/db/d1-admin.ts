import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1Doc = {
  id: string;
  ref: { name: string };
  data: () => Record<string, any>;
};

async function getDb() {
  const cfContext = await getCloudflareContext();
  const db = (cfContext?.env as any)?.launchpadx_db;
  if (!db) throw new Error("D1 database binding (launchpadx_db) is not available in this context.");
  return db;
}

function toDoc(table: string, row: Record<string, any>): D1Doc {
  const { id, ...rest } = row;
  return {
    id: String(id),
    ref: { name: `${table}/${id}` },
    data: () => rest,
  };
}

export async function d1Add(table: string, fields: Record<string, any>): Promise<{ id: string }> {
  const db = await getDb();
  const id = fields.id || crypto.randomUUID();
  const allFields: Record<string, any> = { ...fields };
  delete allFields.id;
  const columns = Object.keys(allFields);
  const placeholders = columns.map(() => "?").join(", ");
  const values = columns.map((c) => {
    const v = allFields[c];
    if (typeof v === "boolean") return v ? 1 : 0;
    if (v === undefined) return null;
    if (typeof v === "object" && v !== null) return JSON.stringify(v);
    return v;
  });

  await db
    .prepare(`INSERT OR IGNORE INTO ${table} (id, ${columns.join(", ")}) VALUES (?, ${placeholders})`)
    .bind(id, ...values)
    .run();

  return { id };
}

export async function d1GetById(table: string, id: string): Promise<D1Doc | null> {
  const db = await getDb();
  const row = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
  if (!row) return null;
  return toDoc(table, row);
}

export async function d1UpdateById(table: string, id: string, fields: Record<string, any>): Promise<void> {
  const db = await getDb();
  const columns = Object.keys(fields);
  if (columns.length === 0) return;
  const setClause = columns.map((c) => `${c} = ?`).join(", ");
  const values = columns.map((c) => {
    const v = fields[c];
    if (typeof v === "boolean") return v ? 1 : 0;
    if (v === undefined) return null;
    if (typeof v === "object" && v !== null) return JSON.stringify(v);
    return v;
  });

  await db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).bind(...values, id).run();
}

export async function d1Delete(table: string, id: string): Promise<void> {
  const db = await getDb();
  await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
}

const OP_MAP: Record<string, string> = {
  EQUAL: "=",
  LESS_THAN_OR_EQUAL: "<=",
  LESS_THAN: "<",
  GREATER_THAN_OR_EQUAL: ">=",
  GREATER_THAN: ">",
};

export async function d1Query(
  table: string,
  where: { field: string; op: string; value: any }[]
): Promise<D1Doc[]> {
  const db = await getDb();
  const clauses: string[] = [];
  const values: any[] = [];

  for (const w of where) {
    if (w.value === null || w.value === undefined) {
      clauses.push(`${w.field} IS NULL`);
    } else {
      const sqlOp = OP_MAP[w.op] || "=";
      clauses.push(`${w.field} ${sqlOp} ?`);
      values.push(typeof w.value === "boolean" ? (w.value ? 1 : 0) : w.value);
    }
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const stmt = db.prepare(`SELECT * FROM ${table} ${whereClause}`);
  const result = values.length > 0 ? await stmt.bind(...values).all() : await stmt.all();

  return (result.results || []).map((row: any) => toDoc(table, row));
}

export async function d1QueryOrdered(
  table: string,
  where: { field: string; op: string; value: any }[],
  orderByField: string,
  direction: "ASCENDING" | "DESCENDING",
  limitCount: number,
  startAfterValue?: any
): Promise<D1Doc[]> {
  const db = await getDb();
  const clauses: string[] = [];
  const values: any[] = [];

  for (const w of where) {
    if (w.value === null || w.value === undefined) {
      clauses.push(`${w.field} IS NULL`);
    } else {
      const sqlOp = OP_MAP[w.op] || "=";
      clauses.push(`${w.field} ${sqlOp} ?`);
      values.push(typeof w.value === "boolean" ? (w.value ? 1 : 0) : w.value);
    }
  }

  if (startAfterValue !== undefined && startAfterValue !== null) {
    const cmp = direction === "ASCENDING" ? ">" : "<";
    clauses.push(`${orderByField} ${cmp} ?`);
    values.push(startAfterValue);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const dir = direction === "ASCENDING" ? "ASC" : "DESC";
  const sql = `SELECT * FROM ${table} ${whereClause} ORDER BY ${orderByField} ${dir} LIMIT ?`;

  const stmt = db.prepare(sql).bind(...values, limitCount);
  const result = await stmt.all();

  return (result.results || []).map((row: any) => toDoc(table, row));
}

export async function d1BatchUpdate(
  updates: { table: string; id: string; fields: Record<string, any> }[]
): Promise<void> {
  if (updates.length === 0) return;
  const db = await getDb();

  const statements = updates.map((u) => {
    const columns = Object.keys(u.fields);
    const setClause = columns.map((c) => `${c} = ?`).join(", ");
    const values = columns.map((c) => {
      const v = u.fields[c];
      if (typeof v === "boolean") return v ? 1 : 0;
      if (v === undefined) return null;
      if (typeof v === "object" && v !== null) return JSON.stringify(v);
      return v;
    });
    return db.prepare(`UPDATE ${u.table} SET ${setClause} WHERE id = ?`).bind(...values, u.id);
  });

  await db.batch(statements);
}

export async function d1GetAll(table: string): Promise<D1Doc[]> {
  const db = await getDb();
  const result = await db.prepare(`SELECT * FROM ${table}`).all();
  return (result.results || []).map((row: any) => toDoc(table, row));
}



export async function d1GetBatchLink(batchDate: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.prepare("SELECT whatsapp_link FROM batch_links WHERE release_date = ?").bind(batchDate).first();
  return (row?.whatsapp_link as string) ?? null;
}

export async function d1SetBatchLink(batchDate: string, link: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("INSERT OR REPLACE INTO batch_links (release_date, whatsapp_link, updated_at) VALUES (?, ?, ?)")
    .bind(batchDate, link, new Date().toISOString())
    .run();
}

export async function d1LogCronRun(cronName: string, result: any): Promise<void> {
  try {
    await d1Add("cron_run_log", {
      cron_name: cronName,
      ran_at: new Date().toISOString(),
      result: JSON.stringify(result),
      had_errors: Array.isArray(result?.errors) && result.errors.length > 0,
    });
  } catch (err) {
    console.error(`Failed to log cron run for ${cronName}:`, err);
  }
}

export function normalizeApplicant(a: Record<string, any>): Record<string, any> {
  let trial_history: any[] = [];
  if (a.trial_history) {
    try {
      trial_history = typeof a.trial_history === "string" ? JSON.parse(a.trial_history) : a.trial_history;
      if (!Array.isArray(trial_history)) trial_history = [];
    } catch {
      trial_history = [];
    }
  }
  return { ...a, trial_history };
}
