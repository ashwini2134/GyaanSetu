// GyanSetu Phase 3 — Railway Background Worker Process
// This entry point runs ONLY background workers and cron jobs.
// It does NOT start an Express server.
// Railway Worker Service start command: node dist/worker.js
//
// IMPORTANT: 'dotenv/config' MUST be the first import.
// In ESM, static imports are evaluated in declaration order, so placing
// dotenv/config first ensures REDIS_URL and DATABASE_URL are in process.env
// before queue.ts reads them at module evaluation time.
import 'dotenv/config';

import { startWorkers } from './workers/workers.js';
import { startCronJobs } from './cron/inactivityCron.js';

console.log('[WorkerProcess] Starting GyanSetu background worker...');
console.log(`[WorkerProcess] Node ${process.version} | ENV=${process.env.NODE_ENV ?? 'development'}`);
console.log(`[WorkerProcess] Redis : ${process.env.REDIS_URL ? process.env.REDIS_URL.replace(/:\/\/[^@]+@/, '://***@') : 'NOT SET'}`);
console.log(`[WorkerProcess] DB    : ${process.env.DATABASE_URL ? 'configured' : 'NOT SET'}`);

if (!process.env.REDIS_URL) {
  console.error('[WorkerProcess] FATAL: REDIS_URL is not set. Exiting.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('[WorkerProcess] FATAL: DATABASE_URL is not set. Exiting.');
  process.exit(1);
}

startWorkers();
startCronJobs();

console.log('[WorkerProcess] All workers and cron jobs active. Waiting for jobs...');

// Keep the process alive — BullMQ workers are event-driven
// Railway's restart policy handles crash recovery automatically
process.on('uncaughtException', (err) => {
  console.error('[WorkerProcess] Uncaught Exception:', err.message, '\n', err.stack);
  // Log but stay alive — individual job errors should not kill the whole worker
});

process.on('unhandledRejection', (reason) => {
  console.error('[WorkerProcess] Unhandled Rejection:', reason);
});
