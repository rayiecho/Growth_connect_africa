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
    const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
    if (!apiKey) {
      console.error("Email engine blocked: ELASTIC_EMAIL_API_KEY is not defined.");
      return { error: "ELASTIC_EMAIL_API_KEY is not defined" };
    }
    const fromEmail = process.env.SES_FROM_EMAIL || "launchpadx@growthconnect.africa";
    const fromName = process.env.SES_FROM_NAME || "LaunchPadX";

    const response = await fetch("https://api.elasticemail.com/v4/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ElasticEmail-ApiKey": apiKey,
      },
      body: JSON.stringify({
        Recipients: [{ Email: to }],
        Content: {
          Body: [{ ContentType: "HTML", Charset: "utf-8", Content: html }],
          From: `${fromName} <${fromEmail}>`,
          Subject: subject,
        },
      }),
    });

    const responseText = await response.text();
    console.log("Elastic Email response:", response.status, responseText);

    if (!response.ok) {
      console.error("Elastic Email send error:", responseText);
      return { error: responseText };
    }

    return { error: null };
  } catch (err) {
    console.error("Elastic Email send error:", err);
    return { error: err instanceof Error ? err.message : "Unknown email error" };
  }
}

export function mergeTags(template: string, values: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}



export async function sendBulkEmail({
  recipients,
  subject,
  html,
}: {
  recipients: { email: string; fields: Record<string, string> }[];
  subject: string;
  html: string;
}): Promise<{ error: string | null }> {
  if (recipients.length === 0) return { error: null };

  try {
    const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
    if (!apiKey) {
      console.error("Email engine blocked: ELASTIC_EMAIL_API_KEY is not defined.");
      return { error: "ELASTIC_EMAIL_API_KEY is not defined" };
    }
    const fromEmail = process.env.SES_FROM_EMAIL || "launchpadx@growthconnect.africa";
    const fromName = process.env.SES_FROM_NAME || "LaunchPadX";

    const response = await fetch("https://api.elasticemail.com/v4/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ElasticEmail-ApiKey": apiKey,
      },
      body: JSON.stringify({
        Recipients: recipients.map((r) => ({ Email: r.email, Fields: r.fields })),
        Content: {
          Body: [{ ContentType: "HTML", Charset: "utf-8", Content: html }],
          From: `${fromName} <${fromEmail}>`,
          Subject: subject,
        },
      }),
    });

    const responseText = await response.text();
    console.log("Elastic Email bulk response:", response.status, recipients.length, "recipients", responseText);

    if (!response.ok) {
      console.error("Elastic Email bulk send error:", responseText);
      return { error: responseText };
    }
    return { error: null };
  } catch (err) {
    console.error("Elastic Email bulk send error:", err);
    return { error: err instanceof Error ? err.message : "Unknown email error" };
  }
}
