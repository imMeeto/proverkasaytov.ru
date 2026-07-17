import tls from 'node:tls';
import type { SslInfo } from '@/server/checks/types';

// TLS-рукопожатие и проверка редиректа http→https (ПС-04 §4, шаг 1 — без браузера).
// Данные уходят в чек A1 (https_ssl).

const HANDSHAKE_TIMEOUT_MS = 10_000;

function daysUntil(date: Date): number {
  return Math.floor((date.getTime() - Date.now()) / 86_400_000);
}

// Поля субъекта/издателя в Node типизированы как string | string[]:
// при повторяющихся RDN (например, двух OU) приходит массив.
function firstOf(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Рукопожатие с 443 портом: валидность цепочки, издатель, срок действия. */
export function inspectCertificate(hostname: string): Promise<SslInfo> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (info: SslInfo) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(info);
    };

    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname, // SNI обязателен, иначе получим не тот сертификат
        rejectUnauthorized: false, // хотим ОСМОТРЕТЬ невалидный серт, а не упасть на нём
        timeout: HANDSHAKE_TIMEOUT_MS,
      },
      () => {
        const cert = socket.getPeerCertificate(true);
        if (!cert || Object.keys(cert).length === 0) {
          done({
            valid: false,
            httpsReachable: true,
            redirectsToHttps: false,
            error: 'Сертификат не получен',
          });
          return;
        }
        const validTo = new Date(cert.valid_to);
        const daysLeft = daysUntil(validTo);
        // authorized от Node — истина о цепочке; отдельно ловим просрочку.
        const notExpired = daysLeft >= 0 && new Date(cert.valid_from).getTime() <= Date.now();
        done({
          valid: socket.authorized && notExpired,
          httpsReachable: true,
          redirectsToHttps: false, // заполняется в checkHttpRedirect
          validTo: Number.isNaN(validTo.getTime()) ? undefined : validTo.toISOString(),
          daysLeft: Number.isNaN(validTo.getTime()) ? undefined : daysLeft,
          issuer: firstOf(cert.issuer?.O) ?? firstOf(cert.issuer?.CN) ?? undefined,
          error: socket.authorized ? undefined : (socket.authorizationError?.toString() ?? undefined),
        });
      },
    );

    socket.on('timeout', () =>
      done({ valid: false, httpsReachable: false, redirectsToHttps: false, error: 'Таймаут TLS' }),
    );
    socket.on('error', (e: Error) =>
      done({ valid: false, httpsReachable: false, redirectsToHttps: false, error: e.message }),
    );
  });
}

/**
 * Отвечает ли http:// редиректом на https:// (требование чека A1).
 * reachable различает «http доступен, но без редиректа» (нарушение) и «порт 80 закрыт»
 * (HTTPS-only — НЕ нарушение), чтобы не давать ложный fail безопасной конфигурации.
 */
export async function checkHttpRedirect(
  hostname: string,
  userAgent: string,
): Promise<{ redirects: boolean; reachable: boolean }> {
  try {
    const res = await fetch(`http://${hostname}/`, {
      method: 'HEAD',
      redirect: 'manual', // нам нужен сам факт редиректа, а не итоговая страница
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location') ?? '';
      let redirects = false;
      if (loc.startsWith('https://')) redirects = true;
      else if (loc.startsWith('/')) redirects = false; // относительный редирект схему не меняет
      else {
        try {
          redirects = new URL(loc).protocol === 'https:';
        } catch {
          redirects = false;
        }
      }
      return { redirects, reachable: true };
    }
    return { redirects: false, reachable: true };
  } catch {
    return { redirects: false, reachable: false }; // ECONNREFUSED/timeout — http недоступен
  }
}

/** Шаг 1 пайплайна: полная TLS-картина сайта. */
export async function collectSsl(hostname: string, userAgent: string): Promise<SslInfo> {
  const [cert, http] = await Promise.all([
    inspectCertificate(hostname),
    checkHttpRedirect(hostname, userAgent),
  ]);
  return { ...cert, redirectsToHttps: http.redirects, httpReachable: http.reachable };
}
