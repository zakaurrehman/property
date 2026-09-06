import "server-only";
import { Resend } from "resend";
import type { ReactElement } from "react";
import { env } from "./env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * No-ops (with a console log) when RESEND_API_KEY isn't set, so lead/contact
 * flows keep working end-to-end (the DB write always happens) before Resend
 * is configured — see .env.example for when this phase's vars get wired up.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  react: ReactElement;
}): Promise<void> {
  if (!resend) {
    console.log(
      `[email] Resend not configured — skipping "${params.subject}" to ${params.to}`,
    );
    return;
  }

  const from = env.RESEND_FROM_EMAIL ?? "no-reply@estatebureau.pk";
  const result = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    react: params.react,
  });

  if (result.error) {
    console.error("[email] Resend send failed:", result.error);
  }
}
