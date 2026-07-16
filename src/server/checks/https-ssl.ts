import type { CheckDefinition, CheckResult, ScanContext } from './types';
import type { Evidence } from '@/server/db/types';

// A1 · https_ssl — HTTPS и сертификат (ПС-03 §4).
// Данные готовит пайплайн (crawler/tls.ts), чек — чистая функция.

const WARN_DAYS_LEFT = 14;

export const httpsSsl: CheckDefinition = {
  id: 'https_ssl',
  title: 'HTTPS и сертификат',
  category: 'infra',
  severity: 'major',
  lawRef: 'ст. 19 152-ФЗ',

  run(ctx: ScanContext): CheckResult {
    const { ssl } = ctx;

    const extra: Record<string, string | number> = {};
    if (ssl.issuer) extra.issuer = ssl.issuer;
    if (ssl.validTo) extra.validTo = ssl.validTo;
    if (typeof ssl.daysLeft === 'number') extra.daysLeft = ssl.daysLeft;

    const ev = (detail: string): Evidence[] => [{ pageUrl: ctx.targetUrl, detail, extra }];

    if (!ssl.httpsReachable) {
      return { status: 'fail', evidence: ev('Сайт не отвечает по HTTPS') };
    }
    if (!ssl.valid) {
      const why =
        typeof ssl.daysLeft === 'number' && ssl.daysLeft < 0
          ? 'Сертификат просрочен'
          : 'Сертификат недействителен или цепочка не построена';
      return { status: 'fail', evidence: ev(why) };
    }
    if (!ssl.redirectsToHttps) {
      return {
        status: 'fail',
        evidence: ev('Сайт открывается по http:// без переадресации на https://'),
      };
    }
    if (typeof ssl.daysLeft === 'number' && ssl.daysLeft < WARN_DAYS_LEFT) {
      return {
        status: 'warn',
        evidence: ev(`Сертификат истекает через ${ssl.daysLeft} дн.`),
      };
    }
    return { status: 'pass', evidence: ev('HTTPS настроен корректно, переадресация с http:// работает') };
  },
};
