import { and, eq, lt, sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { scans, emailLog } from '@/server/db/schema';
import { logger } from '@/lib/logger';

// Ретенция ПДн (ПС-02 §5). Сроки обязаны совпадать с текстом политики (/privacy).
// check_results удаляются каскадом при удалении скана.

const DAY_MS = 86_400_000;

export async function runRetention(): Promise<void> {
  const now = Date.now();
  const unpaidCutoff = new Date(now - 30 * DAY_MS); // ужесточено 90→30 (правовой ресёрч 07.2026)
  const yearCutoff = new Date(now - 365 * DAY_MS);

  // Неоплаченные сканы старше 30 дней — удаляем целиком.
  const delUnpaid = await db
    .delete(scans)
    .where(and(eq(scans.isPaid, false), lt(scans.createdAt, unpaidCutoff)))
    .returning({ id: scans.id });

  // Оплаченные старше 365 дней — затираем email; отчёт остаётся доступен по ссылке.
  const nulled = await db
    .update(scans)
    .set({ email: null })
    .where(and(eq(scans.isPaid, true), lt(scans.createdAt, yearCutoff), sql`${scans.email} is not null`))
    .returning({ id: scans.id });

  // email_log старше 365 дней — удаляем.
  const delLog = await db
    .delete(emailLog)
    .where(lt(emailLog.createdAt, yearCutoff))
    .returning({ id: emailLog.id });

  logger.info(
    { unpaidDeleted: delUnpaid.length, emailNulled: nulled.length, logDeleted: delLog.length },
    'ретенция выполнена',
  );
}

// Зависшие сканы: воркер мог умереть посреди обработки → status застрял в 'running'.
// Через 10 минут переводим в 'failed', чтобы пользователь увидел честный отказ (ПС-04 §8).
export async function failStuckScans(): Promise<void> {
  const cutoff = new Date(Date.now() - 10 * 60_000);
  const stuck = await db
    .update(scans)
    .set({ status: 'failed', error: 'Проверка прервана и не завершилась', finishedAt: new Date() })
    .where(and(eq(scans.status, 'running'), lt(scans.startedAt, cutoff)))
    .returning({ id: scans.id });
  if (stuck.length) logger.warn({ count: stuck.length }, 'зависшие running переведены в failed');
}
