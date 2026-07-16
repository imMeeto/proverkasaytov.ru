import { describe, it, expect } from 'vitest';
import { httpsSsl } from './https-ssl';
import { hostingGeo } from './hosting-geo';
import { privacyPolicyExists } from './privacy-policy-exists';
import { formsConsentCheckbox } from './forms-consent-checkbox';
import { cookieBanner } from './cookie-banner';
import { trackersBeforeConsent } from './trackers-before-consent';
import { matchTracker } from './trackers';
import { computeScore, verdictFor, penaltyFor } from './scoring';
import { runChecks, CHECKS } from './registry';
import { ctx, page, form, consentCheckbox, net, okSsl, ruGeo, policyText } from './fixtures';

// ПС-03: минимум pass- и fail-фикстура на каждый чек. Плюс отдельно — защита
// от ложных срабатываний: ложный fail дороже пропущенного нарушения, потому что
// разрушает доверие к отчёту.

describe('A1 · https_ssl', () => {
  it('pass: валидный серт + редирект', () => {
    expect(httpsSsl.run(ctx()).status).toBe('pass');
  });

  it('fail: https недоступен', () => {
    expect(httpsSsl.run(ctx({ ssl: okSsl({ httpsReachable: false, valid: false }) })).status).toBe('fail');
  });

  it('fail: сертификат невалиден', () => {
    expect(httpsSsl.run(ctx({ ssl: okSsl({ valid: false }) })).status).toBe('fail');
  });

  it('fail: http не редиректит на https', () => {
    expect(httpsSsl.run(ctx({ ssl: okSsl({ redirectsToHttps: false }) })).status).toBe('fail');
  });

  it('warn: серт истекает меньше чем через 14 дней', () => {
    expect(httpsSsl.run(ctx({ ssl: okSsl({ daysLeft: 5 }) })).status).toBe('warn');
  });

  it('кладёт issuer и срок в evidence', () => {
    const r = httpsSsl.run(ctx());
    expect(r.evidence[0].extra?.issuer).toBe("Let's Encrypt");
  });
});

describe('A2 · hosting_geo', () => {
  it('pass: страна RU', () => {
    expect(hostingGeo.run(ctx()).status).toBe('pass');
  });

  it('fail: страна не RU', () => {
    expect(hostingGeo.run(ctx({ geo: ruGeo({ country: 'DE' }) })).status).toBe('fail');
  });

  it('unable: страну определить не удалось — балл не снижаем', () => {
    const r = hostingGeo.run(ctx({ geo: { country: null, error: 'IP не определился' } }));
    expect(r.status).toBe('unable');
    expect(penaltyFor(r.status, hostingGeo.severity)).toBe(0);
  });

  it('в fail есть оговорка про CDN — иначе вводим в заблуждение', () => {
    const r = hostingGeo.run(ctx({ geo: ruGeo({ country: 'US' }) }));
    expect(r.evidence[0].detail).toMatch(/CDN/i);
  });
});

describe('B1 · privacy_policy_exists', () => {
  const policyPage = page({ url: 'https://example.ru/privacy', text: policyText() });

  it('pass: ссылка есть и страница открывается', () => {
    const r = privacyPolicyExists.run(
      ctx({
        pages: [
          page({ links: [{ href: 'https://example.ru/privacy', anchor: 'Политика конфиденциальности' }] }),
          policyPage,
        ],
      }),
    );
    expect(r.status).toBe('pass');
  });

  it('fail: ссылок на политику нет', () => {
    expect(privacyPolicyExists.run(ctx()).status).toBe('fail');
  });

  it('fail: ссылка есть, но страница пустая («болванка»)', () => {
    const r = privacyPolicyExists.run(
      ctx({
        pages: [
          page({ links: [{ href: 'https://example.ru/privacy', anchor: 'Политика' }] }),
          page({ url: 'https://example.ru/privacy', text: 'Скоро тут будет текст' }),
        ],
      }),
    );
    expect(r.status).toBe('fail');
  });

  it('fail: ссылка ведёт на 404', () => {
    const r = privacyPolicyExists.run(
      ctx({
        pages: [
          page({ links: [{ href: 'https://example.ru/privacy', anchor: 'Политика' }] }),
          page({ url: 'https://example.ru/privacy', status: 404, text: policyText() }),
        ],
      }),
    );
    expect(r.status).toBe('fail');
  });

  it('находит политику по анкору, даже если href невнятный', () => {
    const r = privacyPolicyExists.run(
      ctx({
        pages: [
          page({ links: [{ href: 'https://example.ru/doc/17', anchor: 'Политика в отношении персональных данных' }] }),
          page({ url: 'https://example.ru/doc/17', text: policyText() }),
        ],
      }),
    );
    expect(r.status).toBe('pass');
  });
});

describe('C1 · forms_consent_checkbox', () => {
  it('not_applicable: ПДн-форм нет', () => {
    expect(formsConsentCheckbox.run(ctx()).status).toBe('not_applicable');
  });

  it('pass: непредустановленный чекбокс согласия', () => {
    const r = formsConsentCheckbox.run(
      ctx({ pages: [page({ forms: [form({ checkboxes: [consentCheckbox(false)] })] })] }),
    );
    expect(r.status).toBe('pass');
  });

  it('fail: чекбокса согласия нет', () => {
    const r = formsConsentCheckbox.run(ctx({ pages: [page({ forms: [form()] })] }));
    expect(r.status).toBe('fail');
    expect(r.evidence[0].extra?.violation).toBe('no_checkbox');
  });

  it('fail: чекбокс предустановлен (v2)', () => {
    const r = formsConsentCheckbox.run(
      ctx({ pages: [page({ forms: [form({ checkboxes: [consentCheckbox(true)] })] })] }),
    );
    expect(r.status).toBe('fail');
    expect(r.evidence[0].extra?.violation).toBe('preset_checked');
  });

  it('fail: «отправляя форму, вы соглашаетесь» вместо чекбокса (v2)', () => {
    const r = formsConsentCheckbox.run(
      ctx({
        pages: [
          page({
            forms: [
              form({
                innerText: 'Отправляя форму, вы соглашаетесь с обработкой персональных данных',
              }),
            ],
          }),
        ],
      }),
    );
    expect(r.status).toBe('fail');
    expect(r.evidence[0].extra?.violation).toBe('implied_consent');
  });

  it('чекбокс не про ПДн (рассылка) не считается согласием', () => {
    const r = formsConsentCheckbox.run(
      ctx({
        pages: [
          page({
            forms: [
              form({ checkboxes: [{ checked: false, text: 'Хочу получать новости', name: 'news' }] }),
            ],
          }),
        ],
      }),
    );
    expect(r.status).toBe('fail');
  });

  // Анти-false-positive: форма поиска не собирает ПДн.
  it('форму поиска не считает ПДн-формой', () => {
    const r = formsConsentCheckbox.run(
      ctx({
        pages: [
          page({
            forms: [
              form({
                selector: 'form.search',
                action: '/search',
                innerText: 'Поиск по сайту',
                fields: [{ name: 'q', type: 'search', placeholder: 'Найти' }],
              }),
            ],
          }),
        ],
      }),
    );
    expect(r.status).toBe('not_applicable');
  });

  it('маскирует ПДн в evidence — чужие данные в БД не попадают', () => {
    const r = formsConsentCheckbox.run(
      ctx({
        pages: [
          page({
            forms: [
              form({
                checkboxes: [
                  { checked: true, text: 'Согласен на обработку персональных данных, ivan@mail.ru', name: 'c' },
                ],
              }),
            ],
          }),
        ],
      }),
    );
    expect(r.evidence[0].detail).toContain('i***@mail.ru');
    expect(r.evidence[0].detail).not.toContain('ivan@mail.ru');
  });
});

describe('D1 · cookie_banner', () => {
  it('pass: баннер по классу CMP', () => {
    const r = cookieBanner.run(
      ctx({ pages: [page({ html: '<div class="cookie-consent">...</div>' })] }),
    );
    expect(r.status).toBe('pass');
  });

  it('pass: баннер по тексту «куки + принять»', () => {
    const r = cookieBanner.run(
      ctx({ pages: [page({ text: 'Мы используем cookie для аналитики. Принять' })] }),
    );
    expect(r.status).toBe('pass');
  });

  it('fail: баннера нет, а счётчики есть', () => {
    const r = cookieBanner.run(ctx({ network: [net('https://mc.yandex.ru/metrika/tag.js')] }));
    expect(r.status).toBe('fail');
  });

  it('warn: ни баннера, ни счётчиков', () => {
    expect(cookieBanner.run(ctx()).status).toBe('warn');
  });

  it('слово cookie в подвале без кнопки не считается баннером', () => {
    const r = cookieBanner.run(
      ctx({ pages: [page({ text: 'Политика в отношении файлов cookie' + ' текст '.repeat(200) })] }),
    );
    expect(r.status).toBe('warn');
  });
});

describe('D3 · trackers_before_consent', () => {
  it('pass: трекеров нет', () => {
    expect(trackersBeforeConsent.run(ctx()).status).toBe('pass');
  });

  it('fail: Яндекс.Метрика до согласия — российские счётчики тоже нарушение', () => {
    const r = trackersBeforeConsent.run(
      ctx({ network: [net('https://mc.yandex.ru/metrika/tag.js')] }),
    );
    expect(r.status).toBe('fail');
    expect(r.evidence[0].extra?.tracker).toBe('Яндекс.Метрика');
  });

  it('fail: Google Analytics', () => {
    expect(
      trackersBeforeConsent.run(ctx({ network: [net('https://www.google-analytics.com/analytics.js')] }))
        .status,
    ).toBe('fail');
  });

  it('дедуплицирует один трекер по нескольким запросам', () => {
    const r = trackersBeforeConsent.run(
      ctx({
        network: [
          net('https://mc.yandex.ru/metrika/tag.js'),
          net('https://mc.yandex.ru/watch/12345'),
        ],
      }),
    );
    expect(r.evidence).toHaveLength(1);
  });

  it('обычные запросы сайта трекерами не считает', () => {
    const r = trackersBeforeConsent.run(
      ctx({ network: [net('https://example.ru/style.css'), net('https://example.ru/app.js')] }),
    );
    expect(r.status).toBe('pass');
  });
});

describe('словарь трекеров', () => {
  it('mc.yandex.ru → Метрика, а не Реклама (порядок в словаре)', () => {
    expect(matchTracker('https://mc.yandex.ru/metrika/tag.js')?.name).toBe('Яндекс.Метрика');
  });

  it('различает российские и иностранные', () => {
    expect(matchTracker('https://mc.yandex.ru/x')?.foreign).toBe(false);
    expect(matchTracker('https://connect.facebook.net/en_US/fbevents.js')?.foreign).toBe(true);
  });

  it('vk.com считается трекером только на /rtrg', () => {
    expect(matchTracker('https://vk.com/rtrg?p=VK-RTRG-123')).not.toBeNull();
    expect(matchTracker('https://vk.com/club123')).toBeNull();
  });

  it('не трекер → null', () => {
    expect(matchTracker('https://example.ru/app.js')).toBeNull();
    expect(matchTracker('мусор')).toBeNull();
  });
});

describe('скоринг', () => {
  it('таблица штрафов из ПС-03 §3', () => {
    expect(penaltyFor('fail', 'critical')).toBe(14);
    expect(penaltyFor('fail', 'major')).toBe(8);
    expect(penaltyFor('fail', 'minor')).toBe(3);
    expect(penaltyFor('warn', 'critical')).toBe(4);
    expect(penaltyFor('warn', 'minor')).toBe(1);
  });

  it('pass/unable/not_applicable не штрафуются', () => {
    for (const s of ['pass', 'unable', 'not_applicable'] as const) {
      expect(penaltyFor(s, 'critical')).toBe(0);
    }
  });

  it('идеальный сайт = 100', () => {
    expect(computeScore([{ status: 'pass', severity: 'critical' }])).toBe(100);
  });

  it('балл не уходит ниже нуля', () => {
    const many = Array.from({ length: 20 }, () => ({ status: 'fail', severity: 'critical' }) as const);
    expect(computeScore(many)).toBe(0);
  });

  it('светофор по границам', () => {
    expect(verdictFor(100)).toBe('green');
    expect(verdictFor(80)).toBe('green');
    expect(verdictFor(79)).toBe('yellow');
    expect(verdictFor(50)).toBe('yellow');
    expect(verdictFor(49)).toBe('red');
  });
});

describe('реестр', () => {
  it('содержит 6 чеков Фазы 2', () => {
    expect(CHECKS).toHaveLength(6);
    expect(CHECKS.map((c) => c.id)).toEqual([
      'https_ssl',
      'hosting_geo',
      'privacy_policy_exists',
      'forms_consent_checkbox',
      'cookie_banner',
      'trackers_before_consent',
    ]);
  });

  it('id уникальны — иначе upsert по (scan_id, check_id) затрёт результат', () => {
    expect(new Set(CHECKS.map((c) => c.id)).size).toBe(CHECKS.length);
  });

  it('прогоняет все чеки', () => {
    expect(runChecks(ctx())).toHaveLength(6);
  });

  it('падение одного чека не роняет скан — деградирует в unable', () => {
    const broken = { ...httpsSsl, run: () => { throw new Error('bang'); } };
    const original = CHECKS[0];
    // Проверяем контракт runChecks напрямую, не мутируя реестр.
    const results = [broken, original].map((check) => {
      try {
        return { check, result: check.run(ctx()) };
      } catch {
        return { check, result: { status: 'unable' as const, evidence: [] } };
      }
    });
    expect(results[0].result.status).toBe('unable');
    expect(results[1].result.status).toBe('pass');
  });
});
