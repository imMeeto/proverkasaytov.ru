// Стоп-лист КИИ (ПС-08 §8.2, дельта правового ресёрча 07.2026).
//
// Сканирование объектов критической информационной инфраструктуры — риск по ст. 274.1 УК
// (до 10 лет), причём НЕЗАВИСИМО от заявки «я владелец». Владелец банка не приходит
// проверять сайт за 700 ₽ — значит, любая такая заявка либо ошибка, либо злоупотребление.
//
// Дисциплина: список заведомо неполный и это нормально. Лучше отказать лишнему сайту,
// чем один раз просканировать объект КИИ. Ложный отказ стоит дёшево, ложный проход — нет.
// Владелец расширяет список по мере необходимости.

// Доменные суффиксы: госорганы и госсистемы.
const KII_SUFFIXES: readonly string[] = [
  'gov.ru',
  'gosuslugi.ru',
  'mil.ru',
  'gosuslugi.rf',
  'edu.ru',
  'kremlin.ru',
  'duma.gov.ru',
  'council.gov.ru',
  'sudrf.ru',
  'arbitr.ru',
  'nalog.ru',
  'nalog.gov.ru',
  'roskazna.ru',
  'cbr.ru',
];

// Домены (eTLD+1) — банки, операторы связи, энергетика, транспорт.
const KII_DOMAINS: ReadonlySet<string> = new Set([
  // Банки и платёжные системы
  'sberbank.ru',
  'sber.ru',
  'vtb.ru',
  'alfabank.ru',
  'gazprombank.ru',
  'gpb.ru',
  'tinkoff.ru',
  'tbank.ru',
  'open.ru',
  'raiffeisen.ru',
  'psbank.ru',
  'rshb.ru',
  'sovcombank.ru',
  'mkb.ru',
  'uralsib.ru',
  'rosbank.ru',
  'nspk.ru',
  'mironline.ru',
  // Операторы связи
  'rt.ru',
  'rostelecom.ru',
  'mts.ru',
  'beeline.ru',
  'megafon.ru',
  'tele2.ru',
  'yota.ru',
  'transtelecom.ru',
  // Энергетика, транспорт, промышленность
  'rosatom.ru',
  'rosenergoatom.ru',
  'rushydro.ru',
  'rosseti.ru',
  'transneft.ru',
  'gazprom.ru',
  'lukoil.ru',
  'rosneft.ru',
  'rzd.ru',
  'aeroflot.ru',
  'so-ups.ru',
]);

// Маркеры в имени хоста: осторожная эвристика для явных госресурсов.
const KII_HOST_MARKERS: readonly RegExp[] = [
  /(^|\.)gov\./i,
  /(^|\.)gosuslugi\./i,
  /(^|\.)mvd\./i,
  /(^|\.)fsb\./i,
  /(^|\.)mchs\./i,
  /(^|\.)minfin\./i,
  /(^|\.)pfr\./i,
  /(^|\.)sfr\./i,
];

export type KiiVerdict = { blocked: false } | { blocked: true; reason: string };

/**
 * Проверка домена на принадлежность к КИИ.
 * @param domain eTLD+1 (из normalizeUrl)
 * @param hostname полное имя хоста
 */
export function checkKii(domain: string, hostname: string): KiiVerdict {
  const d = domain.toLowerCase().replace(/\.$/, '');
  const h = hostname.toLowerCase().replace(/\.$/, '');

  if (KII_DOMAINS.has(d)) {
    return { blocked: true, reason: 'Домен относится к критической информационной инфраструктуре' };
  }
  for (const suffix of KII_SUFFIXES) {
    if (d === suffix || h === suffix || h.endsWith('.' + suffix)) {
      return { blocked: true, reason: 'Домен относится к государственным информационным системам' };
    }
  }
  for (const re of KII_HOST_MARKERS) {
    if (re.test(h)) {
      return { blocked: true, reason: 'Домен выглядит как государственный ресурс' };
    }
  }
  return { blocked: false };
}

// Текст отказа для пользователя: честный, без обвинений — заявка могла быть ошибкой.
export const KII_REFUSAL_MESSAGE =
  'Мы не проверяем сайты государственных органов, банков, операторов связи и других объектов ' +
  'критической информационной инфраструктуры. Если это ваш сайт, напишите нам — обсудим отдельно.';
