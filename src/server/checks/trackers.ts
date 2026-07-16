// Словарь трекеров (ПС-03 §7). Питает чеки D3 (до согласия) и D4 (иностранные).
//
// Ключевой факт из ПС-11 §2: РОССИЙСКИЕ счётчики — тоже нарушение, если стартуют
// до согласия. IP и cookie-идентификаторы практика РКН относит к ПДн, поэтому
// Метрика без баннера = сбор ПДн без согласия. Флаг foreign отвечает только
// за трансграничку (D4), а не за «можно/нельзя до согласия».

export type TrackerDef = {
  name: string;
  /** true → трансграничная передача (ст. 12 152-ФЗ), чек D4. */
  foreign: boolean;
  /** Хост или его суффикс. */
  hosts: readonly string[];
  /** Доп. условие по пути, если сам хост нейтрален (vk.com → только /rtrg). */
  urlPattern?: RegExp;
};

// ПОРЯДОК ВАЖЕН: matchTracker возвращает первое совпадение.
// mc.yandex.ru обязан стоять выше yandex.ru, иначе Метрика определится как Директ.
export const TRACKERS: readonly TrackerDef[] = [
  { name: 'Яндекс.Метрика', foreign: false, hosts: ['mc.yandex.ru', 'mc.yandex.com'] },
  {
    name: 'Google Analytics',
    foreign: true,
    hosts: ['google-analytics.com', 'analytics.google.com'],
  },
  { name: 'Google Tag Manager', foreign: true, hosts: ['googletagmanager.com'] },
  { name: 'Meta Pixel', foreign: true, hosts: ['connect.facebook.net'] },
  { name: 'TikTok Analytics', foreign: true, hosts: ['analytics.tiktok.com'] },
  { name: 'Criteo', foreign: true, hosts: ['criteo.com', 'criteo.net'] },
  { name: 'Top.Mail.ru', foreign: false, hosts: ['top.mail.ru', 'top-fwz1.mail.ru'] },
  { name: 'VK Пиксель', foreign: false, hosts: ['vk.com', 'vk.ru'], urlPattern: /\/rtrg/i },
  { name: 'Яндекс.Директ', foreign: false, hosts: ['an.yandex.ru'] },
  { name: 'Яндекс.Реклама', foreign: false, hosts: ['yandex.ru'], urlPattern: /\/ads/i },
] as const;

function hostMatches(hostname: string, hosts: readonly string[]): boolean {
  const h = hostname.toLowerCase();
  return hosts.some((x) => h === x || h.endsWith('.' + x));
}

/** Определяет трекер по URL запроса. null — не трекер. */
export function matchTracker(requestUrl: string): TrackerDef | null {
  let host: string;
  try {
    host = new URL(requestUrl).hostname;
  } catch {
    return null;
  }
  for (const t of TRACKERS) {
    if (!hostMatches(host, t.hosts)) continue;
    if (t.urlPattern && !t.urlPattern.test(requestUrl)) continue;
    return t;
  }
  return null;
}

// Иностранные ресурсы (шрифты, капчи, embed, CDN) — чек D5. Не счётчики,
// но IP посетителя всё равно уходит за рубеж (ст. 12 152-ФЗ).
export const FOREIGN_RESOURCES: readonly { name: string; hosts: readonly string[] }[] = [
  { name: 'Google Fonts', hosts: ['fonts.googleapis.com', 'fonts.gstatic.com'] },
  { name: 'Google reCAPTCHA', hosts: ['www.google.com/recaptcha', 'www.gstatic.com/recaptcha'] },
  { name: 'YouTube', hosts: ['youtube.com', 'youtu.be', 'ytimg.com'] },
  { name: 'Vimeo', hosts: ['player.vimeo.com'] },
  { name: 'Cloudflare CDN', hosts: ['cdnjs.cloudflare.com'] },
  { name: 'unpkg', hosts: ['unpkg.com'] },
  { name: 'jsDelivr', hosts: ['cdn.jsdelivr.net'] },
] as const;
