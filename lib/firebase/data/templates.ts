import { getAdminDatabase } from "../admin";
import { RT } from "./_references";
import type { EmailTemplate, TemplateKey } from "../types";

export async function getTemplate(key: TemplateKey): Promise<EmailTemplate | null> {
  const db = getAdminDatabase();
  const snap = await db.ref(`${RT.templates}/${key}`).get();
  return snap.exists() ? (snap.val() as EmailTemplate) : null;
}

export async function listTemplates(): Promise<EmailTemplate[]> {
  const db = getAdminDatabase();
  const snap = await db.ref(RT.templates).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, EmailTemplate>);
}

export async function upsertTemplate(template: EmailTemplate): Promise<void> {
  const db = getAdminDatabase();
  await db.ref(`${RT.templates}/${template.key}`).set({
    ...template,
    updatedAt: new Date().toISOString(),
  });
}
