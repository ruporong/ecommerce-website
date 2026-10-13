/**
 * BACKGROUND JOB QUEUE ADAPTER (QStash/BullMQ Interface)
 * 
 * STATUS: BLOCKED — QUEUE INFRASTRUCTURE REQUIRED
 * 
 * This file defines the contract and payload schemas for background jobs.
 * Real background processing is currently disabled because Vercel Serverless
 * does not support long-running BullMQ workers, and Upstash QStash tokens
 * are not yet provisioned in the production environment.
 */

// 1. Job Payloads (Secured: No PII, No Passwords)
export interface PushNotificationJob {
  type: 'PUSH_NOTIFICATION';
  jobId: string;
  orderId?: string;
  title: string;
  message: string;
}

export interface EmailJob {
  type: 'SEND_EMAIL';
  jobId: string;
  orderId: string;
  templateId: string;
}

export interface CourierSyncJob {
  type: 'COURIER_SYNC';
  jobId: string;
  orderId: string;
  consignmentId: string;
  provider: 'steadfast' | 'pathao';
}

export type BackgroundJob = PushNotificationJob | EmailJob | CourierSyncJob;

// 2. Queue Adapter Interface
export class QueueAdapter {
  /**
   * Enqueue a job for background processing.
   * If infrastructure is available, this will dispatch via QStash HTTP API.
   * Currently mocks the enqueue behavior and logs a warning.
   */
  static async enqueue(job: BackgroundJob, delayMs: number = 0): Promise<boolean> {
    console.warn(`[QUEUE] Enqueue requested for job ${job.jobId} of type ${job.type}.`);
    console.warn(`[QUEUE] BLOCKED: No active queue infrastructure (QStash/BullMQ) configured.`);
    
    // Do NOT run the job synchronously here. That defeats the purpose of the queue
    // and causes hidden event-loop blocks. The job is intentionally dropped to 
    // enforce infrastructure provisioning.
    
    return false;
  }
}
