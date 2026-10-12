// Fraylon Phase 3 — BullMQ workers
// Falls back to in-process execution when Redis is unavailable (local dev).
//
// NOTE on the REDIS_URL branch below: lib/queue.ts's exported queues
// (projectReviewQueue, certificateQueue, etc.) are unconditionally mocked
// producers regardless of REDIS_URL — .add() just logs and returns, it
// never actually pushes a job onto Redis. So even with real BullMQ Workers
// registered here, they'd have nothing to consume until queue.ts is also
// updated to produce real jobs. That's a larger, separate infra change
// (needs a provisioned Redis instance to verify against) — flagging it
// rather than silently leaving production non-functional.
let started = false;

export async function startWorkers() {
  if (started) return;
  started = true;

  const { runProjectReview } = await import('../services/aiReviewService.js');
  const { processCapstoneReview } = await import('./capstoneReviewWorker.js');
  const { processCertificate } = await import('./certificateWorker.js');
  const { processNotification } = await import('./notificationWorker.js');
  const {
    projectReviewQueue,
    capstoneReviewQueue,
    certificateQueue,
    notificationQueue,
  } = await import('../lib/queue.js');

  if (process.env.REDIS_URL) {
    console.log('[Workers] REDIS_URL is set, but lib/queue.ts producers are still mocked — see note above. Falling back to inline execution so jobs are not silently dropped.');
  } else {
    console.log('[Workers] Redis not configured — running all queued jobs inline (no BullMQ).');
  }

  const origProjectAdd = projectReviewQueue.add.bind(projectReviewQueue);
  projectReviewQueue.add = async (jobName: string, data: any) => {
    const result = await origProjectAdd(jobName, data);
    setImmediate(() => {
      runProjectReview(data.submissionId).catch((err: any) =>
        console.error('[Workers] Inline project review failed:', err)
      );
    });
    return result;
  };

  // Was previously wired to call runProjectReview directly here too — that
  // re-ran the same generic review pipeline (security/validation/AI review)
  // a capstone submission already goes through, instead of the step that
  // actually finalizes a capstone: marking the portfolio entry
  // isCapstone: true and queuing the certificate eligibility check. That's
  // exactly what processCapstoneReview does (it calls runProjectReview
  // itself, then does the capstone-specific finalization on top).
  const origCapstoneAdd = capstoneReviewQueue.add.bind(capstoneReviewQueue);
  capstoneReviewQueue.add = async (jobName: string, data: any) => {
    const result = await origCapstoneAdd(jobName, data);
    setImmediate(() => {
      processCapstoneReview({ data }).catch((err: any) =>
        console.error('[Workers] Inline capstone review failed:', err)
      );
    });
    return result;
  };

  // Was entirely unpatched before — every certificateQueue.add() call just
  // logged "[MockQueue] Enqueued" and did nothing else, so no student ever
  // got an automatically-issued certificate no matter how complete their
  // course was.
  const origCertificateAdd = certificateQueue.add.bind(certificateQueue);
  certificateQueue.add = async (jobName: string, data: any) => {
    const result = await origCertificateAdd(jobName, data);
    setImmediate(() => {
      processCertificate({ data }).catch((err: any) =>
        console.error('[Workers] Inline certificate check failed:', err)
      );
    });
    return result;
  };

  // Also entirely unpatched before — every notificationQueue.add('send-email', ...)
  // call (project-approval emails, certificate-ready emails, etc.) just
  // logged and did nothing, so in-app notifications worked but the paired
  // email never sent.
  const origNotificationAdd = notificationQueue.add.bind(notificationQueue);
  notificationQueue.add = async (jobName: string, data: any) => {
    const result = await origNotificationAdd(jobName, data);
    setImmediate(() => {
      processNotification({ data }).catch((err: any) =>
        console.error('[Workers] Inline notification email failed:', err)
      );
    });
    return result;
  };
}
