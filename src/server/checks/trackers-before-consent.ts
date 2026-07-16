import type { CheckDefinition, CheckResult, ScanContext } from './types';
import type { Evidence } from '@/server/db/types';
import { matchTracker } from './trackers';

// D3 · trackers_before_consent — счётчики до согласия (ПС-03 §7, уточнение v2).
// ст. 9 152-ФЗ. Санкция: ч. 1/ч. 2 ст. 13.11.
//
// Чек опирается на железное свойство краулера: робот НЕ кликал «Принять» и вообще
// ничего не нажимал. Значит любой запрос к трекеру в ctx.network произошёл до согласия.
//
// Важно (ПС-11 §2): российские счётчики — тоже нарушение. IP и cookie-идентификаторы
// практика относит к ПДн, поэтому Метрика, стартовавшая до клика, — сбор без согласия.

export const trackersBeforeConsent: CheckDefinition = {
  id: 'trackers_before_consent',
  title: 'Счётчики до согласия',
  category: 'cookies',
  severity: 'critical',
  lawRef: 'ст. 9 152-ФЗ',

  run(ctx: ScanContext): CheckResult {
    const hits = new Map<string, { name: string; domain: string; pageUrl: string }>();

    for (const req of ctx.network) {
      const t = matchTracker(req.requestUrl);
      if (!t) continue;
      if (!hits.has(t.name)) {
        hits.set(t.name, { name: t.name, domain: req.domain, pageUrl: req.pageUrl });
      }
    }

    if (hits.size === 0) {
      return {
        status: 'pass',
        evidence: [
          {
            pageUrl: ctx.targetUrl,
            detail: 'До согласия пользователя счётчики аналитики не запускаются',
          },
        ],
      };
    }

    const evidence: Evidence[] = [...hits.values()].map((h) => ({
      pageUrl: h.pageUrl,
      detail: `«${h.name}» отправляет данные до того, как пользователь дал согласие`,
      extra: { tracker: h.name, domain: h.domain },
    }));

    return { status: 'fail', evidence };
  },
};
