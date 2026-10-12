import nodemailer from "nodemailer";
import { config } from "../config.js";

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const { host, port, user, pass, from } = config.smtp;

  if (host && user) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from,
      to: email,
      subject: "Password Reset Request - GyanSetu",
      text: `Hello,

A password reset request was made for your account. If you did not make this request, you can ignore this email.

Otherwise, please follow this link to reset your password:
${resetUrl}

This link will expire in 15 minutes.

Thanks,
GyanSetu Support`,
      html: `<p>Hello,</p>
<p>A password reset request was made for your account. If you did not make this request, you can ignore this email.</p>
<p>Otherwise, please click the link below to reset your password:</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>This link will expire in 15 minutes.</p>
<br>
<p>Thanks,</p>
<p>GyanSetu Support</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log(`[email] Password reset email sent to ${email} via SMTP.`);
    return;
  }

  // Fallback dev mode console printing
  console.log("\n── Password Reset Email (dev mode fallback) ──");
  console.log(`To: ${email}`);
  console.log(`Reset link: ${resetUrl}`);
  console.log("──────────────────────────────────────────────\n");
}
