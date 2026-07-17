import 'dotenv/config';
import { Worker, type Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { db, scans } from '@/server/db';
import { createRedis } from '@/server/realtime/redis';
import { publishScanEvent } from '@/server/realtime/publish';
import { QUEUE_SCAN, QUEUE_MAINTENANCE } from '@/lib/constants';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { maintenanceQueue, type ScanJobData } from '@/server/queue';
import { runScanPipeline } from '@/server/crawler/pipeline';
import { closeBrowser } from '@/server/crawler';
import { runRetention, failStuckScans } from '@/server/maintenance/retention';

// Воркер — тонкая обёртка над очередью. Вся логика скана живёт в pipeline.ts.
// Воркер не отвечает на HTTP: общение только через очередь и Redis pub/sub (ПС-01 §4).

const worker = new Worker<ScanJobData>(
  QUEUE_SCAN,
  async (job: Job<ScanJobData>) => {
    logger.info({ jobId: job.id, scanId: job.data.scanId }, 'processing scan job');
    await runScanPipeline(job.data.scanId);
  },
  { connection: createRedis(), concurrency: env.WORKER_CONCURRENCY },
);

worker.on('failed', async (job, err) => {
  logger.error({ jobId: job?.id, err: err.message }, 'scan job failed');
  const scanId = job?.data?.scanId;
  const isFinalAttempt = !job || job.attemptsMade >= (job.opts.attempts ?? 1);
  if (scanId && isFinalAttempt) {
    try {
      await db
        .update(scans)
        .set({ status: 'failed', error: 'Не удалось проверить сайт', finishedAt: new Date() })
        .where(eq(scans.id, scanId));
      await publishScanEvent(scanId, { stage: 'failed', message: 'Не удалось проверить сайт' });
    } catch (e) {
      logger.error({ scanId, e }, 'failed to mark scan failed');
    }
  }
});

worker.on('error', (err) => logger.error({ err: err.message }, 'worker error'));

logger.info({ concurrency: env.WORKER_CONCURRENCY, queue: QUEUE_SCAN }, 'scan worker started');

// Обслуживание: ретенция ПДн и добивание зависших сканов (ПС-02 §5, ПС-04 §8).
const maintenanceWorker = new Worker(
  QUEUE_MAINTENANCE,
  async (job: Job) => {
    if (job.name === 'retention') await runRetention();
    else await failStuckScans();
  },
  { connection: createRedis(), concurrency: 1 },
);
maintenanceWorker.on('error', (err) => logger.error({ err: err.message }, 'maintenance worker error'));

// Повторяющиеся задачи (BullMQ дедуплицирует по jobId шаблона при рестартах).
maintenanceQueue
  .add('stuck', {}, { repeat: { every: 5 * 60_000 }, jobId: 'stuck' })
  .catch((err) => logger.error({ err }, 'не удалось зарегистрировать stuck-задачу'));
maintenanceQueue
  .add('retention', {}, { repeat: { every: 6 * 60 * 60_000 }, jobId: 'retention' })
  .catch((err) => logger.error({ err }, 'не удалось зарегистрировать retention-задачу'));

async function shutdown(signal: string) {
  logger.info({ signal }, 'worker shutting down');
  await worker.close();
  await maintenanceWorker.close();
  await closeBrowser(); // иначе Chromium остаётся висеть процессом-сиротой
  process.exit(0);
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
