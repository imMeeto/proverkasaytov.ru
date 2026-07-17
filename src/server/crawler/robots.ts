import { BOT_NAME } from '@/lib/site';

// robots.txt (ПС-04 §2 + дельта ресёрча 07.2026).
//
// Раньше robots.txt читался только ради sitemap. Теперь мы ОБЯЗАНЫ соблюдать Disallow:
// на странице /bot это публичное обещание, а игнорирование robots формирует «картину
// недобросовестности» в гражданском споре (ресёрч, Блок 1).
//
// Парсер намеренно простой и снисходительный: robots.txt в реальном мире кривой.
// Не смогли разобрать → считаем, что всё разрешено (robots — не средство защиты,
// от приватных зон нас страхует SSRF-фильтр, а не эта эвристика).

export type RobotsRules = {
  disallow: string[];
  allow: string[];
  crawlDelayMs: number | null;
  sitemaps: string[];
};

export const EMPTY_ROBOTS: RobotsRules = {
  disallow: [],
  allow: [],
  crawlDelayMs: null,
  sitemaps: [],
};

/**
 * Разбирает robots.txt. Берём директивы для нашего User-Agent, а если его нет — для `*`.
 * Более специфичная группа (наш UA) полностью вытесняет `*` — так требует стандарт.
 */
export function parseRobots(text: string): RobotsRules {
  const groups = new Map<string, { disallow: string[]; allow: string[]; delay: number | null }>();
  const sitemaps: string[] = [];

  let currentAgents: string[] = [];
  let lastLineWasAgent = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;

    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === 'sitemap') {
      if (value) sitemaps.push(value);
      continue;
    }

    if (field === 'user-agent') {
      const agent = value.toLowerCase();
      // Подряд идущие User-agent объединяются в одну группу.
      if (!lastLineWasAgent) currentAgents = [];
      currentAgents.push(agent);
      if (!groups.has(agent)) groups.set(agent, { disallow: [], allow: [], delay: null });
      lastLineWasAgent = true;
      continue;
    }

    lastLineWasAgent = false;
    if (currentAgents.length === 0) continue;

    for (const agent of currentAgents) {
      const g = groups.get(agent);
      if (!g) continue;
      if (field === 'disallow') {
        if (value) g.disallow.push(value);
      } else if (field === 'allow') {
        if (value) g.allow.push(value);
      } else if (field === 'crawl-delay') {
        const n = Number(value.replace(',', '.'));
        if (Number.isFinite(n) && n >= 0) g.delay = n;
      }
    }
  }

  // Наша группа приоритетнее звёздочки.
  const ours = groups.get(BOT_NAME.toLowerCase()) ?? groups.get('*') ?? null;
  if (!ours) return { ...EMPTY_ROBOTS, sitemaps };

  return {
    disallow: ours.disallow,
    allow: ours.allow,
    // Ограничиваем сверху: сайт с Crawl-delay 3600 не должен вешать наш воркер.
    crawlDelayMs: ours.delay === null ? null : Math.min(ours.delay * 1000, 10_000),
    sitemaps,
  };
}

// Сопоставление пути с шаблоном robots: поддержаны * и $.
function patternToRegex(pattern: string): RegExp {
  let out = '';
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '*') out += '.*';
    else if (ch === '$' && i === pattern.length - 1) out += '$';
    else out += ch.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + out);
}

function matchLength(path: string, patterns: string[]): number {
  let best = -1;
  for (const p of patterns) {
    if (patternToRegex(p).test(path)) best = Math.max(best, p.length);
  }
  return best;
}

/**
 * Разрешён ли путь. По стандарту при конфликте выигрывает более длинный (специфичный)
 * шаблон, а при равной длине — Allow.
 */
export function isAllowedByRobots(rules: RobotsRules, pathname: string): boolean {
  const path = pathname || '/';
  const dis = matchLength(path, rules.disallow);
  if (dis === -1) return true;
  const allow = matchLength(path, rules.allow);
  return allow >= dis;
}

/** Скачивание robots.txt. Любая ошибка → «правил нет», скан продолжается. */
export async function fetchRobots(origin: string, userAgent: string): Promise<RobotsRules> {
  try {
    const res = await fetch(new URL('/robots.txt', origin), {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(10_000),
      redirect: 'follow',
    });
    if (!res.ok) return EMPTY_ROBOTS;
    const text = await res.text();
    if (text.length > 512_000) return EMPTY_ROBOTS;
    // Часть серверов отдаёт валидный robots.txt с ошибочным Content-Type text/html.
    // Отбрасываем только тело, которое похоже на HTML и НЕ содержит директив robots.
    const looksHtml = /^\s*<(?:!doctype|html|head|body)/i.test(text);
    const hasDirectives = /^\s*(user-agent|disallow|allow|sitemap|crawl-delay)\s*:/im.test(text);
    if (looksHtml && !hasDirectives) return EMPTY_ROBOTS;
    return parseRobots(text);
  } catch {
    return EMPTY_ROBOTS;
  }
}
