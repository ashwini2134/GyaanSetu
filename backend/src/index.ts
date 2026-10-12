import dotenv from 'dotenv';
dotenv.config();

import { createApp } from "./app.js";
import { config } from "./config.js";
import { startWorkers } from "./workers/workers.js";
import { startCronJobs } from "./cron/inactivityCron.js";
import './jobs/projectReviewJob.js';

// In Railway deployments, set DISABLE_WORKERS=true on the web service so only
// the dedicated worker service processes jobs. In local dev this stays false and
// workers run in-process alongside Express (single command convenience).
if (process.env.DISABLE_WORKERS !== 'true') {
  await startWorkers();
  startCronJobs();
} else {
  console.log('[API] DISABLE_WORKERS=true — background workers not started in this process');
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});


const app = createApp();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Auth API running on http://0.0.0.0:${config.port}`);
});
