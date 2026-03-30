import { Resend } from "resend";
import { env } from "../env.js";

let resend = null;

export async function sendLoginEmail({ to, name, region }) {
  if (!env.RESEND_API_KEY) return { skipped: true };
  if (!resend) resend = new Resend(env.RESEND_API_KEY);

  const now = new Date();
  return await resend.emails.send({
    from: env.RESEND_FROM,
    to,
    subject: "SkillNODE login alert",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.4">
        <h2 style="margin:0 0 12px 0">Login alert</h2>
        <p style="margin:0 0 10px 0">Hi ${escapeHtml(name || "there")},</p>
        <p style="margin:0 0 10px 0">Your SkillNODE profile was used to sign in.</p>
        <ul style="margin:0 0 12px 18px;padding:0">
          <li><b>Time</b>: ${now.toUTCString()}</li>
          <li><b>Region</b>: ${escapeHtml(region || "unknown")}</li>
        </ul>
        <p style="margin:0;color:#475569">If this wasn’t you, rotate your token by signing out everywhere (coming soon).</p>
      </div>
    `,
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

