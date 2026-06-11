import { config } from "../config.js";

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (config.isDev) {
    console.log("\n── Password Reset Email (dev mode) ──");
    console.log(`To: ${email}`);
    console.log(`Reset link: ${resetUrl}`);
    console.log("────────────────────────────────────\n");
    return;
  }
  // Production: integrate with SendGrid, SES, etc.
  console.log(`[email] Password reset requested for ${email}`);
}
