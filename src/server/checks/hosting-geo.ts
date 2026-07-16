import type { CheckDefinition, CheckResult, ScanContext } from './types';

// A2 · hosting_geo — локализация хостинга (ПС-03 §4), ч. 5 ст. 18 152-ФЗ.
//
// Честность важнее строгости: определяем страну по IP входной точки. За CDN
// (Cloudflare, Selectel CDN…) реальное место БД может отличаться — поэтому
// в тексте отчёта обязательна оговорка, а не приговор.

export const hostingGeo: CheckDefinition = {
  id: 'hosting_geo',
  title: 'Хостинг на территории РФ',
  category: 'infra',
  severity: 'major',
  lawRef: 'ч. 5 ст. 18 152-ФЗ',

  run(ctx: ScanContext): CheckResult {
    const { geo } = ctx;

    const extra: Record<string, string | number> = {};
    if (geo.ip) extra.ip = geo.ip;
    if (geo.country) extra.country = geo.country;
    if (geo.provider) extra.provider = geo.provider;
    if (geo.asn) extra.asn = geo.asn;

    if (!geo.country) {
      return {
        status: 'unable',
        evidence: [
          {
            pageUrl: ctx.targetUrl,
            detail: geo.error
              ? `Не удалось определить страну размещения: ${geo.error}`
              : 'Не удалось определить страну размещения сайта',
            extra,
          },
        ],
      };
    }

    if (geo.country !== 'RU') {
      return {
        status: 'fail',
        evidence: [
          {
            pageUrl: ctx.targetUrl,
            detail:
              `Сайт размещён за пределами РФ (страна по IP: ${geo.country}` +
              (geo.provider ? `, провайдер: ${geo.provider}` : '') +
              '). Определено по IP входной точки — если используется CDN или прокси, ' +
              'фактическое место хранения базы данных может отличаться, проверьте у хостера.',
            extra,
          },
        ],
      };
    }

    return {
      status: 'pass',
      evidence: [
        {
          pageUrl: ctx.targetUrl,
          detail:
            'Входная точка сайта размещена в РФ' + (geo.provider ? ` (${geo.provider})` : ''),
          extra,
        },
      ],
    };
  },
};
