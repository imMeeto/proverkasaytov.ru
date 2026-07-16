import type { CheckDefinition, CheckResult, ScanContext } from './types';
import { logger } from '@/lib/logger';
import { httpsSsl } from './https-ssl';
import { hostingGeo } from './hosting-geo';
import { privacyPolicyExists } from './privacy-policy-exists';
import { formsConsentCheckbox } from './forms-consent-checkbox';
import { cookieBanner } from './cookie-banner';
import { trackersBeforeConsent } from './trackers-before-consent';

// Реестр чеков (ПС-01 §3). Всего по ПС-03 их 21; Фаза 2 включает 6,
// остальные 15 добавляются в Фазе 3 — просто дописыванием в этот массив.

export const CHECKS: readonly CheckDefinition[] = [
  // Группа A · Инфраструктура
  httpsSsl,
  hostingGeo,
  // Группа B · Документы
  privacyPolicyExists,
  // Группа C · Формы
  formsConsentCheckbox,
  // Группа D · Cookie и трекеры
  cookieBanner,
  trackersBeforeConsent,
] as const;

export type CheckRun = {
  check: CheckDefinition;
  result: CheckResult;
};

/**
 * Прогон всех чеков. Падение одного чека не роняет скан: он получает unable,
 * остальные отрабатывают (CLAUDE.md §4 — деградируем, а не падаем).
 */
export function runChecks(ctx: ScanContext): CheckRun[] {
  return CHECKS.map((check) => {
    try {
      return { check, result: check.run(ctx) };
    } catch (e) {
      logger.error({ checkId: check.id, err: (e as Error).message }, 'чек упал, деградируем в unable');
      return {
        check,
        result: {
          status: 'unable',
          evidence: [{ pageUrl: ctx.targetUrl, detail: 'Проверку не удалось выполнить автоматически' }],
        } satisfies CheckResult,
      };
    }
  });
}

export const getCheck = (id: string): CheckDefinition | undefined => CHECKS.find((c) => c.id === id);
