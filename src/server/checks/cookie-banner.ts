import type { CheckDefinition, CheckResult, ScanContext } from './types';
import { matchTracker } from './trackers';

// D1 · cookie_banner — наличие cookie-баннера (ПС-03 §7), ст. 9 152-ФЗ (практика РКН).

// Классы известных CMP — самый надёжный сигнал.
const CMP_CLASS_RE = /cookiescript|cookie-consent|cookieconsent|cookie-banner|cookie-notice|cmp-|cookiebot|osano|onetrust|cookie_law|gdpr-cookie/i;

// Текстовая эвристика: рядом должны быть и слово про куки, и кнопка принятия.
const COOKIE_WORD_RE = /cookie|куки|cookies/i;
// Только кнопочные формы согласия. Пассивное «вы соглашаетесь» (implied-consent) не считается
// баннером, поэтому bare `соглас` убрано (оно матчило «соглашаетесь»). `ок` — с явными
// границами: `\b` на кириллице не срабатывает.
const ACCEPT_BTN_RE = /принять|принима|разрешить|согласен|соглашаюсь|хорошо|понятно|accept|allow|(^|\s)ок(\s|$)/i;

/** Ищем блок баннера: сначала по классам CMP, затем по связке «куки + кнопка». */
function hasBanner(html: string, text: string): boolean {
  if (CMP_CLASS_RE.test(html)) return true;
  if (!COOKIE_WORD_RE.test(text)) return false;

  // Кнопка должна быть рядом с упоминанием кук, а не где-то на странице:
  // ищем окно ±400 символов вокруг слова про куки.
  const idx = text.search(COOKIE_WORD_RE);
  if (idx === -1) return false;
  const window = text.slice(Math.max(0, idx - 400), idx + 400);
  return ACCEPT_BTN_RE.test(window);
}

export const cookieBanner: CheckDefinition = {
  id: 'cookie_banner',
  title: 'Cookie-баннер',
  category: 'cookies',
  severity: 'minor',
  lawRef: 'ст. 9 152-ФЗ',

  run(ctx: ScanContext): CheckResult {
    const found = ctx.pages.find((p) => hasBanner(p.html, p.text));
    if (found) {
      return {
        status: 'pass',
        evidence: [{ pageUrl: found.url, detail: 'Cookie-баннер найден' }],
      };
    }

    const trackers = ctx.network.filter((r) => matchTracker(r.requestUrl) !== null);
    if (trackers.length > 0) {
      const names = [...new Set(trackers.map((r) => matchTracker(r.requestUrl)!.name))];
      return {
        status: 'fail',
        evidence: [
          {
            pageUrl: ctx.targetUrl,
            detail: `Cookie-баннер не найден, при этом на сайте работают счётчики: ${names.join(', ')}`,
            extra: { trackers: names.join(', ') },
          },
        ],
      };
    }

    // Счётчиков нет — но куки может ставить и сам сайт, поэтому warn, а не fail.
    return {
      status: 'warn',
      evidence: [
        {
          pageUrl: ctx.targetUrl,
          detail: 'Cookie-баннер не найден. Счётчиков аналитики мы тоже не увидели, но сайт может ставить собственные cookie',
        },
      ],
    };
  },
};
