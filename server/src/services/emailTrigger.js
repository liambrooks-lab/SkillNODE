import { Resend } from "resend";
import { env } from "../env.js";

let resend = null;

function getResend() {
  if (!resend && env.RESEND_API_KEY) {
    resend = new Resend(env.RESEND_API_KEY);
  }
  return resend;
}

const FROM = env.RESEND_FROM || "SkillNODE <onboarding@resend.dev>";

/**
 * Send a welcome email to a new player.
 */
export async function sendWelcomeEmail({ to, name }) {
  const r = getResend();
  if (!r) {
    console.warn("[emailTrigger] RESEND_API_KEY not set — skipping welcome email.");
    return null;
  }

  return r.emails.send({
    from: FROM,
    to,
    subject: "Welcome to SkillNODE 🚀",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#07070f;color:#f0eefe;border-radius:12px;">
        <h1 style="font-size:1.6rem;font-weight:800;margin-bottom:8px;color:#c084fc;">Welcome, ${name}!</h1>
        <p style="color:rgba(216,205,254,0.75);line-height:1.7;">
          You've just joined <strong style="color:#c084fc;">SkillNODE</strong> — the premium skill platform for typing, coding, math, grammar, and competitive practice.
        </p>
        <p style="color:rgba(216,205,254,0.75);line-height:1.7;">
          Train hard, build your profile, and compete with players worldwide.
        </p>
        <a href="https://skill-node-client-bvoh.vercel.app/dashboard"
           style="display:inline-block;margin-top:20px;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">
          Open SkillNODE →
        </a>
      </div>
    `,
  });
}

/**
 * Send a fair-play alert email.
 */
export async function sendAlertEmail({ to, name, alertType, activityType }) {
  const r = getResend();
  if (!r) return null;

  return r.emails.send({
    from: FROM,
    to,
    subject: "SkillNODE Fair-Play Alert",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#07070f;color:#f0eefe;border-radius:12px;">
        <h2 style="color:#f87171;">Fair-Play Alert</h2>
        <p style="color:rgba(216,205,254,0.75);">
          Hi ${name}, a fair-play event (<strong>${alertType}</strong>) was recorded during your <strong>${activityType}</strong> session.
        </p>
        <p style="color:rgba(216,205,254,0.55);font-size:0.875rem;">
          This is an automated notification. Your session results are still saved locally.
        </p>
      </div>
    `,
  });
}
