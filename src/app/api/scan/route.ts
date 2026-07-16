import { and, desc, eq, gt } from 'drizzle-orm';
import { db, scans } from '@/server/db';
import type { ScanMeta } from '@/server/db/types';
import { scanQueue } from '@/server/queue';
import { scanCreateSchema } from '@/lib/schemas';
import { normalizeUrl } from '@/lib/url';
import { ok, fail } from '@/lib/api';
import { DEDUP_WINDOW_MS, QUEUE_SCAN } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { assertPublicUrl } from '@/server/security/ssrf';
import { checkKii, KII_REFUSAL_MESSAGE } from '@/server/security/kii';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail('bad_json', 'Некорректный JSON в теле запроса', 400);
  }

  const parsed = scanCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return fail('validation', 'Проверьте адрес сайта и оба чекбокса согласия', 400);
  }

  const normalized = normalizeUrl(parsed.data.url);
  if (!normalized) {
    return fail('bad_url', 'Не удалось разобрать адрес сайта. Пример: example.ru', 400);
  }

  // Стоп-КИИ (ПС-08 §8.2): банки, госорганы, связь — не сканируем даже по заявке (ст. 274.1 УК).
  const kii = checkKii(normalized.domain, normalized.hostname);
  if (kii.blocked) {
    logger.info({ domain: normalized.domain }, 'скан отклонён: КИИ');
    return fail('kii_blocked', KII_REFUSAL_MESSAGE, 422);
  }

  // SSRF-предпроверка до постановки в очередь (ПС-08 §2): резолвим DNS и требуем,
  // чтобы все адреса были публичными. Воркер проверит ещё раз перед goto (rebinding).
  const safe = await assertPublicUrl(normalized.url);
  if (!safe.ok) {
    logger.warn({ domain: normalized.domain, reason: safe.reason }, 'скан отклонён: SSRF-предпроверка');
    return fail('unsafe_url', safe.reason, 422);
  }

  // TODO Фаза 2 (антиабьюз): SmartCaptcha verify → rate-limit по IP → blocked_domains.

  // Дедуп: последний done-скан того же домена младше 60 минут переиспользуется (ПС-05 §1).
  const since = new Date(Date.now() - DEDUP_WINDOW_MS);
  const [recent] = await db
    .select({ id: scans.id })
    .from(scans)
    .where(and(eq(scans.domain, normalized.domain), eq(scans.status, 'done'), gt(scans.createdAt, since)))
    .orderBy(desc(scans.createdAt))
    .limit(1);

  if (recent) {
    return ok({ scanId: recent.id, deduped: true });
  }

  const meta: ScanMeta = {
    consents: { pd: true, ownership: true },
  };

  const [scan] = await db
    .insert(scans)
    .values({
      url: normalized.url,
      domain: normalized.domain,
      status: 'queued',
      meta,
    })
    .returning({ id: scans.id });

  // jobId = scanId → идемпотентность постановки в очередь (ПС-01 §5).
  await scanQueue.add(QUEUE_SCAN, { scanId: scan.id }, { jobId: scan.id });
  logger.info({ scanId: scan.id, domain: normalized.domain }, 'scan enqueued');

  return ok({ scanId: scan.id, deduped: false });
}
