import { parse } from 'tldts';
import { isAllowedByRobots, type RobotsRules } from './robots';
import type { PageLink } from '@/server/checks/types';

// Выбор страниц для обхода (ПС-04 §2). Бюджет мал (10 страниц), поэтому важно
// потратить его на страницы, которые реально нужны чекам, а не на случайные.

// Приоритеты по убыванию веса. Политика — критична: без неё не работают B1/B2.
const PRIORITY: readonly (readonly [RegExp, number])[] = [
  [/privacy|policy|konfiden|конфиденц|персональн|personal-data|politika|политик/i, 100],
  [/contact|контакт|feedback|обратн/i, 60],
  [/requisite|реквизит|about|о-нас|o-nas|о-компании|company/i, 50],
  [/offer|оферт|dogovor|договор|usloviya|услови/i, 45],
  [/cart|basket|корзин|checkout|заказ|order/i, 40],
  [/delivery|доставк|возврат|return|oplata|оплат/i, 30],
  [/price|цен|услуг|service|catalog|каталог|shop|magazin/i, 20],
  [/cookie|куки/i, 15],
] as const;

function scoreUrl(url: string): number {
  let best = 0;
  for (const [re, weight] of PRIORITY) {
    if (re.test(url)) best = Math.max(best, weight);
  }
  return best;
}

/** Нормализация для дедупа: убираем якорь, utm, завершающий слэш, приводим хост к нижнему регистру. */
export function normalizeForDedup(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    u.hash = '';
    for (const k of [...u.searchParams.keys()]) {
      if (/^utm_/i.test(k) || ['yclid', 'gclid', 'fbclid', 'from'].includes(k)) {
        u.searchParams.delete(k);
      }
    }
    u.hostname = u.hostname.toLowerCase();
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1);
    return u.toString();
  } catch {
    return null;
  }
}

/** Тот же сайт? Поддомены допускаются (www и подобные), чужие домены — нет. */
export function isSameSite(url: string, domain: string): boolean {
  try {
    const host = new URL(url).hostname;
    return (parse(host).domain ?? host) === domain;
  } catch {
    return false;
  }
}

// Расширения, которые бессмысленно открывать браузером.
const SKIP_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|gz|tar|jpe?g|png|gif|svg|webp|ico|mp[34]|avi|mov|css|js|json|xml|rss|woff2?|ttf|eot)$/i;

/** Разбор sitemap.xml (и sitemap-индекса). Без XML-зависимости: нам нужны только <loc>. */
export function parseSitemapLocs(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

async function fetchText(url: string, userAgent: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(10_000),
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.length > 5_000_000 ? null : text;
  } catch {
    return null;
  }
}

/** URL из sitemap: до 200 штук, только свой домен. Индекс раскрываем на один уровень. */
export async function collectSitemapUrls(
  sitemaps: string[],
  domain: string,
  userAgent: string,
): Promise<string[]> {
  const out: string[] = [];
  for (const sm of sitemaps.slice(0, 3)) {
    if (!isSameSite(sm, domain)) continue;
    const xml = await fetchText(sm, userAgent);
    if (!xml) continue;

    const locs = parseSitemapLocs(xml);
    const isIndex = /<sitemapindex/i.test(xml);
    if (isIndex) {
      for (const child of locs.slice(0, 3)) {
        if (!isSameSite(child, domain)) continue;
        const childXml = await fetchText(child, userAgent);
        if (childXml) out.push(...parseSitemapLocs(childXml));
        if (out.length >= 200) break;
      }
    } else {
      out.push(...locs);
    }
    if (out.length >= 200) break;
  }
  return out.slice(0, 200);
}

/**
 * Итоговый список страниц: главная всегда первая, дальше — по приоритету словаря.
 * Отфильтровано: чужие домены, файлы, запрещённое robots.txt.
 */
export function selectPages(opts: {
  homeUrl: string;
  domain: string;
  homeLinks: PageLink[];
  sitemapUrls: string[];
  robots: RobotsRules;
  maxPages: number;
}): string[] {
  const { homeUrl, domain, homeLinks, sitemapUrls, robots, maxPages } = opts;

  const home = normalizeForDedup(homeUrl);
  const seen = new Set<string>(home ? [home] : []);
  const candidates: { url: string; score: number }[] = [];

  // robots.txt читается для origin главной; по RFC 9309 он действует только на СВОЙ хост.
  // Поэтому обходим лишь тот же хост (www и apex — один хост); другие поддомены пропускаем.
  const bareHost = (u: string) => {
    try {
      return new URL(u).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      return '';
    }
  };
  const homeHost = bareHost(homeUrl);

  const consider = (raw: string) => {
    let abs: string;
    try {
      abs = new URL(raw, homeUrl).toString();
    } catch {
      return;
    }
    const norm = normalizeForDedup(abs);
    if (!norm || seen.has(norm)) return;
    if (bareHost(norm) !== homeHost || !isSameSite(norm, domain)) return;
    if (SKIP_EXT.test(new URL(norm).pathname)) return;
    if (!isAllowedByRobots(robots, new URL(norm).pathname)) return; // публичное обещание на /bot
    seen.add(norm);
    candidates.push({ url: norm, score: scoreUrl(norm) });
  };

  for (const l of homeLinks) consider(l.href);
  for (const u of sitemapUrls) consider(u);

  // Стабильная сортировка: сначала вес словаря, при равенстве — короткий URL
  // (короткий путь обычно и есть «та самая» страница, а не глубокая карточка).
  candidates.sort((a, b) => b.score - a.score || a.url.length - b.url.length);

  const result = home ? [home] : [];
  for (const c of candidates) {
    if (result.length >= maxPages) break;
    result.push(c.url);
  }
  return result;
}
