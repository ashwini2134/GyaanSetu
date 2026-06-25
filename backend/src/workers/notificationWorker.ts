// Fraylon - Phase 2.5 & 3

export async function processNotification(job: any) {
  const { type, ...data } = job.data || {};
  console.log(`[NotificationWorker] Sending ${job.name} / ${type || 'GENERAL'}...`, data);

  // Mocked Resend Email
  if (!process.env.RESEND_API_KEY) {
    console.log(`[NotificationWorker] (Mocked) Email would be sent here. Job Name: ${job.name}`);
    return;
  }

  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ ... })
}
