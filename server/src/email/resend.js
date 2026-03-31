import { Resend } from "resend";
import { env } from "../env.js";

let resend = null;

function getResend() {
  if (!env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(env.RESEND_API_KEY);
  return resend;
}

export async function sendVerificationCodeEmail({ to, name, code, expiresInMinutes }) {
  const client = getResend();
  if (!client) return { skipped: true };

  return await client.emails.send({
    from: env.RESEND_FROM,
    to,
    subject: "Your SkillNODE verification code",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px 0">Verify your SkillNODE sign-in</h2>
        <p style="margin:0 0 10px 0">Hi ${escapeHtml(name || "there")},</p>
        <p style="margin:0 0 10px 0">Use this code to finish signing in:</p>
        <div style="margin:0 0 14px 0;padding:14px 18px;border-radius:14px;background:#0f172a;color:#f8fafc;font-size:28px;font-weight:700;letter-spacing:0.3em;text-align:center">
          ${escapeHtml(code)}
        </div>
        <p style="margin:0 0 10px 0;color:#475569">This code expires in ${expiresInMinutes} minutes.</p>
      </div>
    `,
  });
}

export async function sendLoginEmail({ to, name, region }) {
  const client = getResend();
  if (!client) return { skipped: true };

  const now = new Date();
  return await client.emails.send({
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

