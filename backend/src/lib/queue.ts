// Fraylon - Phase 2.5 & 3
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const isRedisAvailable = !!process.env.REDIS_URL;

let connection: Redis | undefined;
if (isRedisAvailable) {
  connection = new Redis(process.env.REDIS_URL as string, { maxRetriesPerRequest: null });
}

export class MockQueue {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  async add(jobName: string, data: any) {
    console.log(`[MockQueue: ${this.name}] Added job: ${jobName}`, data);
    if (mockWorkers[this.name]) {
      setTimeout(() => {
        mockWorkers[this.name]!({ name: jobName, data }).catch(err => {
          console.error(`[MockQueue: ${this.name}] Job ${jobName} failed:`, err);
        });
      }, 100);
    }
    return { id: Math.random().toString(36).substring(7) };
  }
}

export const mockWorkers: Record<string, (job: any) => Promise<void>> = {};

export const quizGradingQueue = isRedisAvailable && connection ? new Queue('quizGrading', { connection: connection as any }) : new MockQueue('quizGrading');
export const projectReviewQueue = isRedisAvailable && connection ? new Queue('projectReview', { connection: connection as any }) : new MockQueue('projectReview');
export const capstoneReviewQueue = isRedisAvailable && connection ? new Queue('capstoneReview', { connection: connection as any }) : new MockQueue('capstoneReview');
export const certificateQueue = isRedisAvailable && connection ? new Queue('certificate', { connection: connection as any }) : new MockQueue('certificate');
export const notificationQueue = isRedisAvailable && connection ? new Queue('notification', { connection: connection as any }) : new MockQueue('notification');
