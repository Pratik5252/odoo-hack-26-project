import nodemailer from "nodemailer";

export async function sendPasswordEmail(opts: {
  to: string;
  userName: string;
  plainPassword: string;
}): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM?.trim() || "noreply@localhost";

  const text = `Hello ${opts.userName},

Your account password has been set. Your new password is:

${opts.plainPassword}

Please sign in and change it as soon as possible.

`;

  if (!host) {
    console.warn("[mail] SMTP_HOST not set; printing email body to console instead of sending");
    console.warn(`[mail] To: ${opts.to}\n${text}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from,
    to: opts.to,
    subject: "Your new password",
    text,
  });
}
