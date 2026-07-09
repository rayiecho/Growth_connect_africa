export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("Email engine blocked: BREVO_API_KEY is not defined.");
    return { error: "Missing API Key" };
  }

  try {
    const response = await fetch("https://brevo.com", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "GrowthConnect Team", email: "notifications@growthconnect.africa" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      return { error: errData };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
