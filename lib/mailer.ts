import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | undefined;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** No-ops (logging a warning) when SMTP_USER/SMTP_PASS aren't configured, rather than throwing - email is a nice-to-have, never a blocker for the flow that triggers it. */
export async function sendMail(params: SendMailParams): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[mailer] SMTP_USER/SMTP_PASS not set - skipping email to ${params.to}.`);
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  await transport.sendMail({ from, to: params.to, subject: params.subject, html: params.html, text: params.text });
}
