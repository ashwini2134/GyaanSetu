// Fraylon Phase 3 — BullMQ queue producer connections
// MOCKED for local development without Redis
export const connection = {} as any;

export function createWorkerConnection(): any {
  return {};
}

const mockQueue = (name: string) => ({
  add: async (jobName: string, data: any) => {
    console.log(`[MockQueue] Enqueued to ${name}: ${jobName}`);
    return { id: 'mock-job-id' };
  }
});

export const projectReviewQueue  = mockQueue('project-review') as any;
export const quizGradingQueue    = mockQueue('quizGrading') as any;
export const capstoneReviewQueue = mockQueue('capstoneReview') as any;
export const certificateQueue    = mockQueue('certificate') as any;
export const notificationQueue   = mockQueue('notification') as any;
