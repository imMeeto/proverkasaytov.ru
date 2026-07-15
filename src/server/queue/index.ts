import { Queue } from 'bullmq';
import { createRedis } from '@/server/realtime/redis';
import { QUEUE_SCAN, QUEUE_DELIVER } from '@/lib/constants';
import { env } from '@/lib/env';

export type ScanJobData = { scanId: string };
export type DeliverJobData = { scanId: string };

const globalForQueue = globalThis as unknown as {
  _scanQueue?: Queue<ScanJobData>;
  _deliverQueue?: Queue<DeliverJobData>;
};

// Очередь scan: concurrency 2, 2 попытки, exponential backoff ≥ 30 с (ПС-01 §5).
export const scanQueue =
  globalForQueue._scanQueue ??
  new Queue<ScanJobData>(QUEUE_SCAN, {
    connection: createRedis(),
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 1000 },
    },
  });

// Очередь deliver (PDF + письмо): 3 попытки (ПС-01 §5). Реализация воркера — Фаза 4.
export const deliverQueue =
  globalForQueue._deliverQueue ??
  new Queue<DeliverJobData>(QUEUE_DELIVER, {
    connection: createRedis(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 1000 },
    },
  });

if (env.NODE_ENV !== 'production') {
  globalForQueue._scanQueue = scanQueue;
  globalForQueue._deliverQueue = deliverQueue;
}
