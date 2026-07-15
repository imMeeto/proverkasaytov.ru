import type { Scan, CheckResultRow } from '@/server/db/schema';

// Публичная форма скана — БЕЗ email и прочих ПДн (ПС-05 §1).
export type PublicScan = {
  id: string;
  url: string;
  domain: string;
  status: Scan['status'];
  score: number | null;
  isPaid: boolean;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  pagesCrawled: number;
};

export function toPublicScan(scan: Scan): PublicScan {
  return {
    id: scan.id,
    url: scan.url,
    domain: scan.domain,
    status: scan.status,
    score: scan.score,
    isPaid: scan.isPaid,
    createdAt: scan.createdAt.toISOString(),
    startedAt: scan.startedAt?.toISOString() ?? null,
    finishedAt: scan.finishedAt?.toISOString() ?? null,
    error: scan.error,
    pagesCrawled: scan.meta?.pagesCrawled?.length ?? 0,
  };
}

// Публичная форма результатов чеков.
// Фаза 3: серверное усечение неоплаченного (2 самых тяжёлых fail целиком, остальные — заголовки),
// подмешивание текстов из checks/texts.ts. Пока — каркасная проекция строк.
export type PublicCheckResult = {
  checkId: string;
  status: CheckResultRow['status'];
  severity: CheckResultRow['severity'];
  locked: boolean;
  evidence: CheckResultRow['evidence'];
};

export function toPublicResults(results: CheckResultRow[], isPaid: boolean): PublicCheckResult[] {
  return results.map((r) => ({
    checkId: r.checkId,
    status: r.status,
    severity: r.severity,
    locked: !isPaid, // TODO Фаза 3: pass/unable всегда открыты; 2 тяжёлых fail открыты; блюр остального
    evidence: isPaid ? r.evidence : null,
  }));
}
