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
import { rateLimit, hashIp, clientIp } from '@/server/security/ratelimit';
import { verifyCaptcha } from '@/server/security/captcha';

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

  const ip = clientIp(req);
  const iph = hashIp(ip);

  // Капча (ПС-08 §5): без валидного токена — 403. В dev без ключа SmartCaptcha пропускается.
  if (!(await verifyCaptcha(parsed.data.captchaToken ?? '', ip))) {
    return fail('captcha_failed', 'Проверка «я не робот» не пройдена. Обновите страницу и попробуйте снова.', 403);
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

  // Предохранитель: длинная очередь → честный 503 вместо часового ожидания (ПС-08 §5).
  if ((await scanQueue.getWaitingCount()) > 50) {
    return fail('overloaded', 'Сейчас высокая нагрузка. Попробуйте через несколько минут.', 503);
  }

  // Rate-limit по IP (ПС-08 §5): 5/сутки и 2/час.
  const [okDay, okHour] = await Promise.all([
    rateLimit(`scan:ip:d:${iph}`, 5, 86_400),
    rateLimit(`scan:ip:h:${iph}`, 2, 3_600),
  ]);
  if (!okDay || !okHour) {
    return fail('rate_limited', 'Слишком много проверок с вашего адреса. Попробуйте позже.', 429);
  }

  // Дедуп: последний done-скан того же домена младше 60 минут переиспользуется (ПС-05 §1).
  const since = new Date(Date.now() - DEDUP_WINDOW_MS);
  const [recent] = await db
    .select({ id: scans.id })
    .from(scans)
    .where(
      and(
        eq(scans.domain, normalized.domain),
        eq(scans.status, 'done'),
        // Только НЕоплаченные: иначе новый пользователь получил бы чужой платный отчёт.
        eq(scans.isPaid, false),
        gt(scans.createdAt, since),
      ),
    )
    .orderBy(desc(scans.createdAt))
    .limit(1);

  if (recent) {
    return ok({ scanId: recent.id, deduped: true });
  }

  // Домен: не более 3 РЕАЛЬНЫХ сканов/сутки от всех IP (защита чужого сайта от долбёжки
  // нашим роботом, ПС-08 §5). Считаем только после промаха дедупа — кэш-выдача сайт не грузит.
  if (!(await rateLimit(`scan:dom:${normalized.domain}`, 3, 86_400))) {
    return fail('domain_rate_limited', 'Этот сайт уже проверялся несколько раз за сутки. Попробуйте позже.', 429);
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
