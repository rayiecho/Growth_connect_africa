export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ error: string | null }> {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error("Email engine blocked: BREVO_API_KEY is not defined.");
      return { error: "BREVO_API_KEY is not defined" };
    }

    const fromEmail = process.env.SES_FROM_EMAIL || "hello@growthconnect.africa";
    const fromName = process.env.SES_FROM_NAME || "GrowthConnect Team";

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Brevo send error:", errText);
      return { error: errText };
    }

    return { error: null };
  } catch (err) {
    console.error("Brevo send error:", err);
    return { error: err instanceof Error ? err.message : "Unknown email error" };
  }
}

export function mergeTags(template: string, values: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}
