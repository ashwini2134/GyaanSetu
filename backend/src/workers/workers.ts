// Fraylon - Phase 2.5 & 3
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { mockWorkers } from '../lib/queue.js';
import { processQuizGrading } from './quizGradingWorker.js';
import { processProjectReview } from './projectReviewWorker.js';
import { processCapstoneReview } from './capstoneReviewWorker.js';
import { processCertificate } from './certificateWorker.js';
import { processNotification } from './notificationWorker.js';

export function startWorkers() {
  const isRedisAvailable = !!process.env.REDIS_URL;

  if (isRedisAvailable) {
    const connection = new Redis(process.env.REDIS_URL as string, { maxRetriesPerRequest: null }) as any;
    
    new Worker('quizGrading', processQuizGrading, { connection });
    new Worker('projectReview', processProjectReview, { connection });
    new Worker('capstoneReview', processCapstoneReview, { connection });
    new Worker('certificate', processCertificate, { connection });
    new Worker('notification', processNotification, { connection });
    
    console.log('[Workers] BullMQ workers started with Redis connection');
  } else {
    // Register mock workers
    mockWorkers['quizGrading'] = processQuizGrading;
    mockWorkers['projectReview'] = processProjectReview;
    mockWorkers['capstoneReview'] = processCapstoneReview;
    mockWorkers['certificate'] = processCertificate;
    mockWorkers['notification'] = processNotification;
    
    console.log('[Workers] Mock workers started (inline execution)');
  }
}
