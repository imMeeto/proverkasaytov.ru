import 'dotenv/config';
import { Worker, type Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { db, scans } from '@/server/db';
import { createRedis } from '@/server/realtime/redis';
import { publishScanEvent } from '@/server/realtime/publish';
import { QUEUE_SCAN, type ScanEvent } from '@/lib/constants';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { ScanJobData } from '@/server/queue';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function processScan(scanId: string): Promise<void> {
  const scan = await db.query.scans.findFirst({ where: eq(scans.id, scanId) });
  if (!scan) {
    logger.warn({ scanId }, 'scan not found, skipping');
    return;
  }
  // Идемпотентность: job scan может быть переигран — если уже done, выходим (ПС-01 §5).
  if (scan.status === 'done') {
    logger.info({ scanId }, 'scan already done, skipping');
    return;
  }

  await db.update(scans).set({ status: 'running', startedAt: new Date() }).where(eq(scans.id, scanId));

  // ---- КАРКАС ФАЗЫ 1 ----
  // Реальный пайплайн ПС-04 (TLS/GeoIP → выбор страниц → обход → реестр РКН → 21 чек → скоринг)
  // приходит в Фазах 2–3. Пока публикуем стадии, чтобы проверить сквозной SSE-прогресс.
  const stages: ScanEvent[] = [
    { stage: 'infra', message: 'Проверяю соединение и сертификат' },
    { stage: 'pages', total: 1, message: 'Выбираю страницы для обхода' },
    { stage: 'crawl', i: 1, total: 1, page: scan.url, message: 'Обхожу страницы сайта' },
    { stage: 'registry', message: 'Сверяю данные с реестром РКН' },
    { stage: 'checks', message: 'Прогоняю проверки' },
    { stage: 'scoring', message: 'Считаю итоговый балл' },
  ];
  for (const s of stages) {
    await publishScanEvent(scanId, s);
    await sleep(700);
  }

  // Каркас: балл ещё не считаем (движок — Фаза 3). Отмечаем скан завершённым.
  await db
    .update(scans)
    .set({ status: 'done', score: null, finishedAt: new Date() })
    .where(eq(scans.id, scanId));
  await publishScanEvent(scanId, { stage: 'done' });
  logger.info({ scanId }, 'scan done (skeleton pipeline)');
}

const worker = new Worker<ScanJobData>(
  QUEUE_SCAN,
  async (job: Job<ScanJobData>) => {
    logger.info({ jobId: job.id, scanId: job.data.scanId }, 'processing scan job');
    await processScan(job.data.scanId);
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

async function shutdown(signal: string) {
  logger.info({ signal }, 'worker shutting down');
  await worker.close();
  process.exit(0);
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
