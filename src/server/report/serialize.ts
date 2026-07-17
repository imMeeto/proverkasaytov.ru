import type { Scan, CheckResultRow } from '@/server/db/schema';
import { penaltyFor } from '@/server/checks/scoring';

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

// Публичная форма результатов чеков с СЕРВЕРНЫМ усечением (ПС-05 §1) — платный контент
// физически не уходит клиенту до оплаты (не CSS-блюр). Тексты «что делать»/сниппеты
// подмешиваются в API только для разблокированных элементов (Фаза 3, checks/texts.ts).
export type PublicCheckResult = {
  checkId: string;
  status: CheckResultRow['status'];
  severity: CheckResultRow['severity'];
  locked: boolean; // тело скрыто (заголовок+статус видны, evidence вырезан)
  evidence: CheckResultRow['evidence'];
};

export function toPublicResults(results: CheckResultRow[], isPaid: boolean): PublicCheckResult[] {
  if (isPaid) {
    return results.map((r) => ({
      checkId: r.checkId,
      status: r.status,
      severity: r.severity,
      locked: false,
      evidence: r.evidence,
    }));
  }

  // Неоплаченный отчёт: pass/unable/not_applicable открыты целиком (бесплатная ценность
  // и честность), плюс ДВА fail с наибольшим penalty. Остальные fail/warn — только заголовок.
  const openFail = new Set(
    results
      .map((r, i) => ({ i, pen: r.status === 'fail' ? penaltyFor('fail', r.severity) : -1 }))
      .filter((x) => x.pen > 0)
      .sort((a, b) => b.pen - a.pen)
      .slice(0, 2)
      .map((x) => x.i),
  );

  return results.map((r, i) => {
    const open =
      r.status === 'pass' ||
      r.status === 'unable' ||
      r.status === 'not_applicable' ||
      openFail.has(i);
    return {
      checkId: r.checkId,
      status: r.status,
      severity: r.severity,
      locked: !open,
      evidence: open ? r.evidence : null,
    };
  });
}
