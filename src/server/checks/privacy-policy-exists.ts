import type { CheckDefinition, CheckResult, ScanContext } from './types';
import { findPolicyPage, policyLinks } from './helpers';

// B1 · privacy_policy_exists — наличие политики ПДн (ПС-03 §5), ст. 18.1 152-ФЗ.
// critical: без политики не работает и B2, а сам факт отсутствия — типовое основание предписания.

export const privacyPolicyExists: CheckDefinition = {
  id: 'privacy_policy_exists',
  title: 'Политика обработки персональных данных',
  category: 'docs',
  severity: 'critical',
  lawRef: 'ст. 18.1 152-ФЗ',

  run(ctx: ScanContext): CheckResult {
    const links = policyLinks(ctx);

    if (links.length === 0) {
      return {
        status: 'fail',
        evidence: [
          {
            pageUrl: ctx.targetUrl,
            detail: 'Ссылка на политику обработки персональных данных не найдена ни на одной из проверенных страниц',
          },
        ],
      };
    }

    const page = findPolicyPage(ctx);
    if (!page) {
      // Ссылка есть, а документа за ней нет — с точки зрения закона это отсутствие политики.
      const first = links[0];
      return {
        status: 'fail',
        evidence: [
          {
            pageUrl: first.pageUrl,
            detail:
              `Ссылка на политику есть («${first.anchor || first.href}»), но страница не открывается ` +
              'или содержит слишком мало текста',
            extra: { href: first.href },
          },
        ],
      };
    }

    return {
      status: 'pass',
      evidence: [
        {
          pageUrl: page.url,
          detail: 'Политика обработки персональных данных найдена и открывается',
          extra: { symbols: page.text.length },
        },
      ],
    };
  },
};
