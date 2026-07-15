// Имена очередей BullMQ (ПС-01 §5).
export const QUEUE_SCAN = 'scan';
export const QUEUE_DELIVER = 'deliver';

// Redis pub/sub канал прогресса скана (ПС-04 §7).
export const scanChannel = (scanId: string) => `scan:${scanId}`;

// Дедуп: последний done-скан того же домена младше 60 минут переиспользуется (ПС-02 §4).
export const DEDUP_WINDOW_MS = 60 * 60 * 1000;

// Стадии пайплайна для SSE (ПС-04 §1).
export type ScanStage =
  | 'queued'
  | 'infra'
  | 'pages'
  | 'crawl'
  | 'registry'
  | 'checks'
  | 'scoring'
  | 'done'
  | 'failed';

export type ScanEvent = {
  stage: ScanStage;
  score?: number;
  page?: string;
  i?: number;
  total?: number;
  message?: string;
};
