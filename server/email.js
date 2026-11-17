// Outgoing email through the Resend HTTP API (https://resend.com).
// Every message is recorded in the `outbox` table. It is only delivered when
// the RESEND_API_KEY secret and the EMAIL_FROM variable are set.
import { newId, nowIso } from "./db.js";

export const emailConfigured = (env) => Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);

/** Sends one email and records delivery status. Sensitive message bodies are omitted from the outbox. */
export async function sendEmail(env, { to, subject, html, text, sensitive = false }) {
  if (!to || !subject) throw new Error("Email needs a recipient and a subject");
  const id = newId();
  await env.DB
    .prepare("INSERT INTO outbox (id, to_addr, subject, body, created_date) VALUES (?, ?, ?, ?, ?)")
    .bind(id, String(to), String(subject), sensitive ? "" : String(html || text || ""), nowIso())
    .run();

  if (!emailConfigured(env)) {
    return { sent: false };
  }

  let error = "";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [String(to)], subject: String(subject), ...(html ? { html } : { text: text || "" }) }),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      error = detail?.message || `Email service answered ${response.status}`;
    }
  } catch (err) {
    error = `Could not reach the email service: ${err.message}`;
  }

  if (error) {
    if (sensitive) error = "The email service could not send the account message.";
    await env.DB.prepare("UPDATE outbox SET error = ? WHERE id = ?").bind(error, id).run();
    throw new Error(error);
  }
  await env.DB.prepare("UPDATE outbox SET sent = 1 WHERE id = ?").bind(id).run();
  return { sent: true };
}
