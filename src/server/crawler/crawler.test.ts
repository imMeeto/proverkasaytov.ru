import { describe, it, expect } from 'vitest';
import { parseRobots, isAllowedByRobots, EMPTY_ROBOTS } from './robots';
import { normalizeForDedup, isSameSite, parseSitemapLocs, selectPages } from './pages';

// robots.txt — публичное обещание на странице /bot. Если парсер врёт, мы нарушаем
// собственное обязательство, поэтому проверяем края, а не happy path.

describe('robots: парсинг', () => {
  it('читает Disallow и Sitemap для *', () => {
    const r = parseRobots(`
User-agent: *
Disallow: /admin
Disallow: /private/
Crawl-delay: 2

Sitemap: https://example.ru/sitemap.xml
`);
    expect(r.disallow).toEqual(['/admin', '/private/']);
    expect(r.crawlDelayMs).toBe(2000);
    expect(r.sitemaps).toEqual(['https://example.ru/sitemap.xml']);
  });

  it('наша группа вытесняет звёздочку', () => {
    const r = parseRobots(`
User-agent: *
Disallow: /

User-agent: ProverkaSaytovBot
Disallow: /secret
`);
    expect(r.disallow).toEqual(['/secret']); // не '/' — иначе не сканировали бы ничего
  });

  it('объединяет подряд идущие User-agent в одну группу', () => {
    const r = parseRobots(`
User-agent: Googlebot
User-agent: *
Disallow: /shared
`);
    expect(r.disallow).toEqual(['/shared']);
  });

  it('игнорирует комментарии и пустые значения', () => {
    const r = parseRobots(`
# комментарий
User-agent: *
Disallow:
Disallow: /x # хвостовой комментарий
`);
    expect(r.disallow).toEqual(['/x']);
  });

  it('ограничивает абсурдный Crawl-delay сверху', () => {
    expect(parseRobots('User-agent: *\nCrawl-delay: 3600').crawlDelayMs).toBe(10_000);
  });

  it('на мусоре не падает и не выдумывает правил', () => {
    expect(parseRobots('').disallow).toEqual([]);
    expect(parseRobots('какой-то текст без директив').disallow).toEqual([]);
  });
});

describe('robots: сопоставление путей', () => {
  const rules = parseRobots(`
User-agent: *
Disallow: /admin
Disallow: /*.pdf$
Allow: /admin/public
`);

  it('запрещает путь под Disallow', () => {
    expect(isAllowedByRobots(rules, '/admin')).toBe(false);
    expect(isAllowedByRobots(rules, '/admin/secret')).toBe(false);
  });

  it('более длинный Allow побеждает Disallow', () => {
    expect(isAllowedByRobots(rules, '/admin/public')).toBe(true);
  });

  it('понимает wildcard и якорь $', () => {
    expect(isAllowedByRobots(rules, '/files/doc.pdf')).toBe(false);
    expect(isAllowedByRobots(rules, '/files/doc.pdf.html')).toBe(true);
  });

  it('разрешает всё, чего нет в правилах', () => {
    expect(isAllowedByRobots(rules, '/')).toBe(true);
    expect(isAllowedByRobots(rules, '/contacts')).toBe(true);
    expect(isAllowedByRobots(EMPTY_ROBOTS, '/что-угодно')).toBe(true);
  });
});

describe('pages: нормализация и принадлежность сайту', () => {
  it('срезает якорь, utm и хвостовой слэш', () => {
    expect(normalizeForDedup('https://example.ru/a/?utm_source=ya&id=1#top')).toBe(
      'https://example.ru/a?id=1',
    );
  });

  it('главную не ломает', () => {
    expect(normalizeForDedup('https://example.ru/')).toBe('https://example.ru/');
  });

  it('отклоняет не-http схемы', () => {
    expect(normalizeForDedup('mailto:a@b.ru')).toBeNull();
    expect(normalizeForDedup('javascript:alert(1)')).toBeNull();
  });

  it('поддомены — свои, чужой домен — нет', () => {
    expect(isSameSite('https://www.example.ru/x', 'example.ru')).toBe(true);
    expect(isSameSite('https://shop.example.ru/x', 'example.ru')).toBe(true);
    expect(isSameSite('https://evil.com/x', 'example.ru')).toBe(false);
  });
});

describe('pages: sitemap', () => {
  it('вытаскивает loc', () => {
    expect(
      parseSitemapLocs(`<urlset><url><loc>https://example.ru/a</loc></url>
      <url><loc> https://example.ru/b </loc></url></urlset>`),
    ).toEqual(['https://example.ru/a', 'https://example.ru/b']);
  });
});

describe('pages: выбор страниц', () => {
  const base = {
    homeUrl: 'https://example.ru/',
    domain: 'example.ru',
    robots: EMPTY_ROBOTS,
    maxPages: 5,
    sitemapUrls: [] as string[],
  };

  it('главная всегда первая', () => {
    const r = selectPages({ ...base, homeLinks: [{ href: '/contacts', anchor: 'Контакты' }] });
    expect(r[0]).toBe('https://example.ru/');
  });

  it('политика приоритетнее каталога — без неё не работают B1/B2', () => {
    const r = selectPages({
      ...base,
      homeLinks: [
        { href: '/catalog', anchor: 'Каталог' },
        { href: '/privacy-policy', anchor: 'Политика' },
      ],
    });
    expect(r[1]).toBe('https://example.ru/privacy-policy');
  });

  it('соблюдает бюджет страниц', () => {
    const links = Array.from({ length: 50 }, (_, i) => ({ href: `/p${i}`, anchor: `p${i}` }));
    expect(selectPages({ ...base, homeLinks: links })).toHaveLength(5);
  });

  it('выкидывает чужие домены, файлы и запрещённое robots', () => {
    const r = selectPages({
      ...base,
      robots: parseRobots('User-agent: *\nDisallow: /admin'),
      homeLinks: [
        { href: 'https://evil.com/x', anchor: 'чужой' },
        { href: '/doc.pdf', anchor: 'файл' },
        { href: '/admin', anchor: 'закрыто robots' },
        { href: '/contacts', anchor: 'ок' },
      ],
    });
    expect(r).toEqual(['https://example.ru/', 'https://example.ru/contacts']);
  });

  it('дедуплицирует одну страницу в разных обёртках', () => {
    const r = selectPages({
      ...base,
      homeLinks: [
        { href: '/contacts', anchor: 'a' },
        { href: '/contacts/', anchor: 'b' },
        { href: '/contacts?utm_source=x', anchor: 'c' },
        { href: '/contacts#form', anchor: 'd' },
      ],
    });
    expect(r).toEqual(['https://example.ru/', 'https://example.ru/contacts']);
  });
});
