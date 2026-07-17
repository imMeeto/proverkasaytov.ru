import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// Серверная верификация Yandex SmartCaptcha (ПС-08 §5).
// Если серверный ключ не задан (dev/не подключено) — пропускаем, чтобы не блокировать разработку.
// Когда ключ задан (прод) — токен обязателен, а недоступность сервиса капчи трактуем как отказ.

export async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  if (!env.SMARTCAPTCHA_SERVER_KEY) return true; // капча не настроена — не мешаем dev
  if (!token) return false;
  try {
    const url = new URL('https://smartcaptcha.yandexcloud.net/validate');
    url.searchParams.set('secret', env.SMARTCAPTCHA_SERVER_KEY);
    url.searchParams.set('token', token);
    if (ip && ip !== '0.0.0.0') url.searchParams.set('ip', ip);
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5_000) });
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === 'ok';
  } catch (e) {
    logger.warn({ e }, 'SmartCaptcha verify недоступна — отклоняем');
    return false;
  }
}
