// ── Mailer ────────────────────────────────────────────────────────────────────
// Sends transactional email through whatever SMTP server you put in env.
// Locally with no SMTP env set, falls back to logging the OTP to stdout so
// you can still develop without a Gmail App Password configured.

import nodemailer, { type Transporter } from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST ?? "";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465);
const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER;

const enabled = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter: Transporter | null = null;
if (enabled) {
  transporter = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/**
 * Deliver a one-time login code. Resolves once the message is queued by the
 * SMTP server (or immediately when SMTP is unconfigured in dev).
 */
export async function sendOtpEmail(email: string, code: string): Promise<void> {
  if (!transporter) {
    console.log(`[mailer] SMTP disabled — OTP for ${email}: ${code}`);
    return;
  }

  await transporter.sendMail({
    from:    SMTP_FROM,
    to:      email,
    subject: "Your sign-in code",
    text:
      `Your sign-in code is ${code}.\n\n` +
      `It expires in 10 minutes. If you didn't request this, ignore this email.\n` +
      `— System Design Roadmap`,
    html:
      `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0f172a;">
         <h2 style="margin:0 0 16px;font-size:18px;">Your sign-in code</h2>
         <div style="font-size:32px;font-weight:800;letter-spacing:6px;background:#f1f5f9;padding:14px 22px;border-radius:10px;text-align:center;">
           ${code}
         </div>
         <p style="font-size:13px;line-height:1.6;color:#475569;margin-top:18px;">
           This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.
         </p>
         <p style="font-size:11px;color:#94a3b8;margin-top:24px;">— System Design Roadmap</p>
       </div>`,
  });
}

/** True when SMTP credentials are configured. */
export function isMailerEnabled(): boolean {
  return enabled;
}
