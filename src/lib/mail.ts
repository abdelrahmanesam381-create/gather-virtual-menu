import nodemailer from "nodemailer";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
export async function sendInvitation(
  email: string,
  token: string,
  restaurant: string,
) {
  const link = `${process.env.APP_URL || "http://localhost:3000"}/invite/${token}`;
  const message = {
    from: process.env.MAIL_FROM || "Gather <menus@example.com>",
    to: email,
    subject: `You’re invited to manage ${restaurant}`,
    text: `You have been invited to manage ${restaurant} on Gather.\n\nAccept your invitation: ${link}\n\nThis invitation expires in 7 days. If you weren't expecting it, you can ignore it.`,
  };
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV === "production")
      throw Error("SMTP is required in production.");
    await mkdir("var/mail", { recursive: true });
    await writeFile(
      `var/mail/${randomUUID()}.json`,
      JSON.stringify(message, null, 2),
    );
    return "local-outbox";
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
    connectionTimeout: 10000,
    socketTimeout: 15000,
  });
  await transport.sendMail(message);
  return "email";
}
