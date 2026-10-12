import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { config } from '../config.js';

export async function processNotification(job: any) {
  const { to, subject, body, link, html } = job.data || {};

  if (!to || !subject) {
    console.warn(`[NotificationWorker] Job ${job.id} missing required fields — skipping`);
    return;
  }

  console.log(`[NotificationWorker] Sending "${subject}" to ${to}`);

  // Priority 1: Resend (production)
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'GyanSetu <noreply@gyansetu.academy>',
      to,
      subject,
      html: html || `<p>${body}</p>`,
    });
    console.log(`[NotificationWorker] Sent via Resend → ${to}`);
    return;
  }

  // Priority 2: SMTP nodemailer (staging / self-hosted)
  const { host, port, user, pass, from } = config.smtp;
  if (host && user) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({ from, to, subject, html: html || `<p>${body}</p>` });
    console.log(`[NotificationWorker] Sent via SMTP → ${to}`);
    return;
  }

  // Dev fallback — no provider configured
  console.log('\n── Notification Email (dev — no provider configured) ──');
  console.log(`To     : ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body   : ${body}`);
  if (link) console.log(`Link   : ${link}`);
  console.log('────────────────────────────────────────────────────\n');
}
