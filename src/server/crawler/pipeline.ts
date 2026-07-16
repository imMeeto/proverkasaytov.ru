import { eq, sql } from 'drizzle-orm';
import { db, scans, checkResults } from '@/server/db';
import type { ScanMeta } from '@/server/db/types';
import { publishScanEvent } from '@/server/realtime/publish';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { BOT_USER_AGENT } from '@/lib/site';
import { assertPublicUrl } from '@/server/security/ssrf';
import { checkKii } from '@/server/security/kii';
import { runChecks } from '@/server/checks/registry';
import { computeScore } from '@/server/checks/scoring';
import type { ScanContext } from '@/server/checks/types';
import { crawlSite, CrawlFatalError } from './index';

// Пайплайн скана (ПС-04 §1). Живёт в воркере: app никогда не запускает Playwright.

// Человекочитаемые причины отказа. Наружу не отдаём внутренние детали (ПС-08).
const FATAL_MESSAGES: Record<string, string> = {
  site_unreachable: 'Сайт не отвечает. Проверьте адрес и доступность сайта.',
  robots_disallow: 'Сайт запрещает автоматический обход в robots.txt.',
  unsafe_redirect: 'Сайт переадресует во внутреннюю сеть — проверка остановлена.',
};

function fatalMessage(raw: string): string {
  for (const [key, msg] of Object.entries(FATAL_MESSAGES)) {
    if (raw.startsWith(key)) return msg;
  }
  return 'Не удалось проверить сайт.';
}

/** Ошибка, после которой ретраить бессмысленно (сайт мёртв, robots запрещает). */
export class ScanRejected extends Error {}

export async function runScanPipeline(scanId: string): Promise<void> {
  const scan = await db.query.scans.findFirst({ where: eq(scans.id, scanId) });
  if (!scan) {
    logger.warn({ scanId }, 'скан не найден');
    return;
  }
  // Идемпотентность: job мог быть переигран (ПС-01 §5).
  if (scan.status === 'done') {
    logger.info({ scanId }, 'скан уже выполнен, пропускаем');
    return;
  }

  await db.update(scans).set({ status: 'running', startedAt: new Date() }).where(eq(scans.id, scanId));

  const publish = async (e: Parameters<typeof publishScanEvent>[1]) => publishScanEvent(scanId, e);

  try {
    // ---- Повторная проверка безопасности ----
    // DNS мог смениться между постановкой в очередь и стартом скана (rebinding, ПС-08 §3).
    const verdict = await assertPublicUrl(scan.url);
    if (!verdict.ok) throw new ScanRejected(`unsafe_target: ${verdict.reason}`);

    const kii = checkKii(scan.domain, new URL(scan.url).hostname);
    if (kii.blocked) throw new ScanRejected('kii_blocked');

    // ---- Шаги 1–3: обход (с глобальным таймаутом) ----
    const crawled = await withTimeout(
      crawlSite(scan.url, scan.domain, publish),
      env.SCAN_TOTAL_TIMEOUT_MS,
    );

    // ---- Шаг 4: реестры (Фаза 3) ----
    // Пока заглушки: чеки A3/F1 ещё не в реестре, а дисциплина ПС-04 §6 —
    // недоступный реестр даёт unavailable, а не ложный вывод.
    const ctx: ScanContext = {
      ...crawled,
      rkn: { status: 'unavailable' },
      hostingRegistry: { status: 'unavailable' },
      innFound: null,
    };

    // ---- Шаг 5: чеки ----
    await publish({ stage: 'checks', message: 'Прогоняю проверки' });
    const runs = runChecks(ctx);

    // ---- Шаг 6: скоринг и запись ----
    await publish({ stage: 'scoring', message: 'Считаю итоговый балл' });
    const score = computeScore(runs.map((r) => ({ status: r.result.status, severity: r.check.severity })));

    await db
      .insert(checkResults)
      .values(
        runs.map((r) => ({
          scanId,
          checkId: r.check.id,
          status: r.result.status,
          severity: r.check.severity,
          evidence: r.result.evidence,
        })),
      )
      // Повторный прогон перезаписывает результат (ПС-02 §4).
      .onConflictDoUpdate({
        target: [checkResults.scanId, checkResults.checkId],
        set: {
          status: sql`excluded.status`,
          severity: sql`excluded.severity`,
          evidence: sql`excluded.evidence`,
        },
      });

    // meta: только технические факты. Сырой HTML и ПДн третьих лиц не сохраняем (ПС-08 §8.3).
    const meta: ScanMeta = {
      ...(scan.meta ?? { consents: { pd: true, ownership: true } }),
      ip: ctx.geo.ip,
      geo: ctx.geo.country
        ? { country: ctx.geo.country, asn: ctx.geo.asn, provider: ctx.geo.provider }
        : undefined,
      ssl: {
        valid: ctx.ssl.valid,
        validTo: ctx.ssl.validTo,
        daysLeft: ctx.ssl.daysLeft,
        issuer: ctx.ssl.issuer,
      },
      pagesCrawled: ctx.pages.map((p) => ({ url: p.url, status: p.status, ms: p.loadMs })),
      loadMs: ctx.pages[0]?.loadMs,
      userAgentUsed: BOT_USER_AGENT,
    };

    await db
      .update(scans)
      .set({ status: 'done', score, meta, finishedAt: new Date(), error: null })
      .where(eq(scans.id, scanId));

    await publish({ stage: 'done', score });
    logger.info({ scanId, score, pages: ctx.pages.length }, 'скан завершён');
  } catch (e) {
    const raw = (e as Error).message ?? '';
    // Отказ по существу (сайт мёртв, robots, КИИ) — ретраить бессмысленно,
    // помечаем failed сразу и не тратим попытки очереди.
    if (e instanceof ScanRejected || e instanceof CrawlFatalError) {
      const message = raw.startsWith('kii_blocked')
        ? 'Мы не проверяем сайты объектов критической информационной инфраструктуры.'
        : raw.startsWith('unsafe_target')
          ? 'Этот адрес нельзя проверить: он ведёт во внутреннюю сеть.'
          : fatalMessage(raw);
      await db
        .update(scans)
        .set({ status: 'failed', error: message, finishedAt: new Date() })
        .where(eq(scans.id, scanId));
      await publish({ stage: 'failed', message });
      logger.info({ scanId, reason: raw }, 'скан отклонён');
      return; // не бросаем — job считается обработанным
    }
    throw e; // прочее — пусть BullMQ ретраит
  }
}

// Глобальный таймаут скана (ПС-04 §1): Promise.race, контекст браузера закроется в finally краулера.
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  return Promise.race([
    p.finally(() => clearTimeout(timer)),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`scan_timeout: превышено ${ms} мс`)), ms);
    }),
  ]);
}
