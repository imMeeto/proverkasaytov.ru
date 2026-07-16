import type { CheckStatus, Severity } from './types';

// Скоринг (ПС-03 §3). score = max(0, 100 − Σ penalty).
//
// unable НЕ снижает балл: если мы не смогли проверить, это наша проблема,
// а не нарушение сайта. Штрафовать за собственную слепоту — нечестно.

const PENALTY: Record<'fail' | 'warn', Record<Severity, number>> = {
  fail: { critical: 14, major: 8, minor: 3 },
  warn: { critical: 4, major: 3, minor: 1 },
};

export function penaltyFor(status: CheckStatus, severity: Severity): number {
  if (status === 'fail') return PENALTY.fail[severity];
  if (status === 'warn') return PENALTY.warn[severity];
  return 0; // pass | unable | not_applicable
}

export function computeScore(results: { status: CheckStatus; severity: Severity }[]): number {
  const total = results.reduce((sum, r) => sum + penaltyFor(r.status, r.severity), 0);
  return Math.max(0, 100 - total);
}

export type Verdict = 'green' | 'yellow' | 'red';

/** Светофор: ≥80 зелёный, 50–79 жёлтый, <50 красный (ПС-03 §3). */
export function verdictFor(score: number): Verdict {
  if (score >= 80) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}
