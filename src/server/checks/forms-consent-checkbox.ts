import type { CheckDefinition, CheckResult, ScanContext } from './types';
import type { Evidence } from '@/server/db/types';
import { pdForms } from './helpers';
import { maskPii } from '@/server/security/pii';

// C1 · forms_consent_checkbox — согласие в формах (ПС-03 §6, правки v2).
// ст. 6, ст. 9 152-ФЗ. Санкция: ч. 2 ст. 13.11 — 300–700 тыс., повторно до 1,5 млн.
//
// Три независимых условия провала (ПС-11 §1.3, практика РКН-2026):
//   1. чекбокса согласия нет вовсе;
//   2. [v2] чекбокс предустановлен — предустановленная галочка не является согласием;
//   3. [v2] «отправляя форму, вы соглашаетесь…» вместо чекбокса — РКН признаёт
//      только активное действие.

const CONSENT_TEXT_RE = /согла/i;
const PD_TEXT_RE = /персональн|обработк/i;

// «Согласие действием» — формулировка, которой пытаются заменить чекбокс.
const IMPLIED_CONSENT_RE =
  /(отправляя|нажимая|продолжая)[^.]{0,60}(форм|заявк|кнопк|отправит|регистрац)[^.]{0,80}(соглаша|согласи|принима)/i;

function isConsentCheckbox(text: string): boolean {
  return CONSENT_TEXT_RE.test(text) && PD_TEXT_RE.test(text);
}

export const formsConsentCheckbox: CheckDefinition = {
  id: 'forms_consent_checkbox',
  title: 'Согласие на обработку данных в формах',
  category: 'forms',
  severity: 'critical',
  lawRef: 'ст. 6, ст. 9 152-ФЗ',

  run(ctx: ScanContext): CheckResult {
    const forms = pdForms(ctx);
    if (forms.length === 0) {
      return { status: 'not_applicable', evidence: [] };
    }

    const problems: Evidence[] = [];

    for (const { page, form } of forms) {
      const consentBoxes = form.checkboxes.filter((c) => isConsentCheckbox(c.text));
      const fieldNames = form.fields
        .filter((f) => !['hidden', 'submit', 'button'].includes((f.type || '').toLowerCase()))
        .map((f) => f.name || f.type)
        .filter(Boolean)
        .slice(0, 8)
        .join(', ');

      if (consentBoxes.length === 0) {
        // Условие 3: чекбокса нет, но есть «отправляя форму — соглашаетесь».
        const implied = IMPLIED_CONSENT_RE.test(form.innerText);
        problems.push({
          pageUrl: page.url,
          selector: form.selector,
          detail: implied
            ? `Форма (поля: ${fieldNames}) заменяет чекбокс формулировкой «отправляя форму, вы соглашаетесь» — ` +
              'согласием это не считается, нужен отдельный непредустановленный чекбокс'
            : `Форма (поля: ${fieldNames}) собирает персональные данные без чекбокса согласия`,
          extra: { violation: implied ? 'implied_consent' : 'no_checkbox' },
        });
        continue;
      }

      // Условие 2: галочка предустановлена.
      const preset = consentBoxes.find((c) => c.checked);
      if (preset) {
        problems.push({
          pageUrl: page.url,
          selector: form.selector,
          detail:
            `В форме (поля: ${fieldNames}) чекбокс согласия предустановлен: ` +
            `«${maskPii(preset.text).slice(0, 160)}». Предустановленная галочка не является согласием`,
          extra: { violation: 'preset_checked' },
        });
      }
    }

    if (problems.length > 0) return { status: 'fail', evidence: problems };

    return {
      status: 'pass',
      evidence: [
        {
          pageUrl: ctx.targetUrl,
          detail: `Все формы сбора персональных данных (${forms.length}) имеют непредустановленный чекбокс согласия`,
        },
      ],
    };
  },
};
