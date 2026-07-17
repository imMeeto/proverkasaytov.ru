import { chromium, type Browser, type BrowserContext } from 'playwright';
import { parse } from 'tldts';
import { BOT_USER_AGENT } from '@/lib/site';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { assertPublicUrl, isForbiddenHostname } from '@/server/security/ssrf';
import { collectSsl } from './tls';
import { collectGeo } from './geoip';
import { fetchRobots, isAllowedByRobots, type RobotsRules } from './robots';
import { collectSitemapUrls, selectPages } from './pages';
import { collectSnapshot } from './snapshot';
import type { NetworkRequest, PageSnapshot, ScanContext } from '@/server/checks/types';

// Пайплайн краулинга (ПС-04). Всё тяжёлое живёт только здесь, в воркере — app никогда
// не запускает Playwright.
//
// Железные правила:
//  · НИКАКИХ кликов и скроллов — ctx.network обязан остаться «до согласия» (чек D3).
//  · Шрифты и скрипты НЕ блокируем — они нужны чекам D3/D5.
//  · Каждый под-запрос проходит SSRF-фильтр (ПС-08 §4).

const PAGE_TIMEOUT_MS = 20_000;
const SETTLE_MS = 2_000; // добираем ленивые скрипты и cookie-баннеры
const POLITE_PAUSE_MS = 500; // пауза между страницами одного сайта (ПС-08 §6)
const PAGE_BYTE_BUDGET = 25 * 1024 * 1024; // бюджет загрузки страницы (ПС-04 §3): не даём сайту дренировать воркер

export type CrawlProgress = (stage: {
  stage: 'infra' | 'pages' | 'crawl';
  i?: number;
  total?: number;
  page?: string;
  message?: string;
}) => Promise<void>;

let browserSingleton: Browser | null = null;
let scansSinceRestart = 0;
let activeContexts = 0;
let launchPromise: Promise<Browser> | null = null;
const RESTART_EVERY = 50; // профилактика утечек (ПС-04 §8)

async function getBrowser(): Promise<Browser> {
  const alive = browserSingleton?.isConnected() ?? false;
  // Профилактический рестарт — ТОЛЬКО когда нет активных обходов, иначе убьём чужой контекст.
  const needsRestart = alive && scansSinceRestart >= RESTART_EVERY && activeContexts === 0;
  if (alive && !needsRestart) return browserSingleton!;

  // Мьютекс: при concurrency=2 два скана не должны запустить два браузера (утечка Chromium).
  if (launchPromise) return launchPromise;
  launchPromise = (async () => {
    if (browserSingleton && (needsRestart || !browserSingleton.isConnected())) {
      await browserSingleton.close().catch(() => {});
    }
    scansSinceRestart = 0;
    browserSingleton = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    return browserSingleton;
  })();
  try {
    return await launchPromise;
  } finally {
    launchPromise = null;
  }
}

export async function closeBrowser(): Promise<void> {
  await browserSingleton?.close().catch(() => {});
  browserSingleton = null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function toNetworkRequest(pageUrl: string, requestUrl: string, type: string): NetworkRequest | null {
  try {
    const host = new URL(requestUrl).hostname;
    return {
      pageUrl,
      requestUrl,
      domain: parse(host).domain ?? host,
      type,
      beforeConsent: true,
    };
  } catch {
    return null;
  }
}

/** Ошибка, из-за которой скан не имеет смысла продолжать (главная недоступна, небезопасный редирект). */
export class CrawlFatalError extends Error {}

async function newContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({
    userAgent: BOT_USER_AGENT,
    viewport: { width: 1366, height: 900 },
    locale: 'ru-RU',
    serviceWorkers: 'block',
    ignoreHTTPSErrors: true, // невалидный серт — находка чека A1, а не повод падать
  });

  // Шим __name. Воркер запускается через tsx (и в dev, и в проде): esbuild компилирует
  // с keepNames и вставляет в тела функций вызовы хелпера __name. Playwright сериализует
  // функцию в браузер, а определения хелпера там нет → ReferenceError и пустой снапшот.
  // Передаём строкой, а НЕ функцией: функцию esbuild трансформирует так же, и шим сам
  // упадёт с той же ошибкой. Не затираем существующий __name сайта (||=).
  await context.addInitScript({
    content: 'globalThis.__name = globalThis.__name || function (f) { return f; };',
  });

  return context;
}

/** Обход одной страницы. Ошибка загрузки не роняет скан — страница помечается статусом. */
async function crawlPage(
  context: BrowserContext,
  url: string,
  network: NetworkRequest[],
): Promise<PageSnapshot> {
  const page = await context.newPage();
  const started = Date.now();
  let bytesLoaded = 0;

  page.on('request', (r) => {
    const nr = toNetworkRequest(url, r.url(), r.resourceType());
    if (nr) network.push(nr);
  });
  // Учёт объёма загрузки для бюджета страницы (ПС-04 §3).
  page.on('response', (resp) => {
    const len = Number(resp.headers()['content-length'] ?? 0);
    if (Number.isFinite(len) && len > 0) bytesLoaded += len;
  });

  // SSRF-фильтр на под-запросы: проверяемый сайт может сам дёргать 10.0.0.5 из своего JS.
  // Резолвить DNS на каждый запрос дорого — синхронной проверки хватает,
  // от остального страхует сетевая изоляция контейнера (ПС-08 §4, ПС-10 §4).
  await page.route('**/*', (route) => {
    const reqUrl = route.request().url();
    let u: URL;
    try {
      u = new URL(reqUrl);
    } catch {
      return route.abort();
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return route.abort();
    if (isForbiddenHostname(u.hostname)) return route.abort();
    // Исчерпан бюджет страницы (>5 МБ на ресурс content-length при накоплении) — не тянем дальше.
    if (bytesLoaded > PAGE_BYTE_BUDGET) return route.abort();
    // Тяжёлое медиа не нужно ни одному чеку.
    if (route.request().resourceType() === 'media') return route.abort();
    return route.continue();
  });

  try {
    // domcontentloaded надёжен; networkidle желателен (добираем ленивые трекеры для D3),
    // но на сайтах с long-poll/websocket не наступает — ждём его лучшими усилиями,
    // не проваливая живую страницу в status 0.
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT_MS });
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
    await page.waitForTimeout(SETTLE_MS);

    // Конечный URL после всех редиректов проверяем ВСЕГДА (ПС-08 §3): редирект мог увести
    // на приватный адрес, а DNS хоста — смениться между предпроверкой и загрузкой (rebinding).
    const finalUrl = page.url();
    const verdict = await assertPublicUrl(finalUrl);
    if (!verdict.ok) throw new CrawlFatalError(`unsafe_redirect: ${verdict.reason}`);

    const snapshot = await collectSnapshot(page, finalUrl, res?.status() ?? 0, Date.now() - started);
    return snapshot;
  } catch (e) {
    if (e instanceof CrawlFatalError) throw e;
    logger.warn({ url, err: (e as Error).message }, 'страница не загрузилась, продолжаем скан');
    return {
      url,
      status: 0,
      html: '',
      text: '',
      forms: [],
      links: [],
      cookiesSet: [],
      loadMs: Date.now() - started,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

/**
 * Полный сбор ScanContext (шаги 1–3 пайплайна ПС-04 §1).
 * Шаг 4 (реестры РКН) и шаг 5 (чеки) — снаружи, в воркере.
 */
export async function crawlSite(
  targetUrl: string,
  domain: string,
  onProgress: CrawlProgress,
  signal?: AbortSignal,
): Promise<Omit<ScanContext, 'rkn' | 'hostingRegistry' | 'innFound'>> {
  const hostname = new URL(targetUrl).hostname;

  // ---- Шаг 1: TLS + GeoIP (без браузера) ----
  await onProgress({ stage: 'infra', message: 'Проверяю соединение и сертификат' });
  const [ssl, geo] = await Promise.all([collectSsl(hostname, BOT_USER_AGENT), collectGeo(hostname)]);

  // ---- Шаг 2: robots.txt + выбор страниц ----
  await onProgress({ stage: 'pages', message: 'Выбираю страницы для обхода' });
  const origin = new URL(targetUrl).origin;
  const robots: RobotsRules = await fetchRobots(origin, BOT_USER_AGENT);

  if (!isAllowedByRobots(robots, new URL(targetUrl).pathname)) {
    throw new CrawlFatalError('robots_disallow');
  }

  const browser = await getBrowser();
  scansSinceRestart++;
  const context = await newContext(browser);
  activeContexts++; // рестарт браузера не тронет активный обход, пока refcount > 0
  const network: NetworkRequest[] = [];
  const pages: PageSnapshot[] = [];

  try {
    // Главная — всегда первая: её ссылки нужны для выбора остальных страниц.
    const home = await crawlPage(context, targetUrl, network);
    // Недоступна главная (ПС-04 §3): нет ответа, 5xx, либо антибот/ошибка 4xx (403/429/404).
    // Скорить чеки по challenge-заглушке нельзя.
    if (home.status === 0 || home.status >= 400) {
      throw new CrawlFatalError('site_unreachable');
    }
    pages.push(home);

    const sitemapUrls = await collectSitemapUrls(robots.sitemaps, domain, BOT_USER_AGENT);
    const selected = selectPages({
      homeUrl: targetUrl,
      domain,
      homeLinks: home.links,
      sitemapUrls,
      robots,
      maxPages: env.SCAN_MAX_PAGES,
    });

    const rest = selected.slice(1);
    const total = rest.length + 1;
    await onProgress({ stage: 'pages', total, message: `Выбрано страниц: ${total}` });

    const pause = robots.crawlDelayMs ?? POLITE_PAUSE_MS;
    let i = 1;
    for (const url of rest) {
      if (signal?.aborted) break; // глобальный таймаут — прекращаем обход, finally закроет контекст
      i++;
      await onProgress({ stage: 'crawl', i, total, page: url, message: `Обхожу страницу ${i} из ${total}` });
      await sleep(pause); // параллельно страницы одного сайта не грузим (ПС-08 §6)
      pages.push(await crawlPage(context, url, network));
    }

    return { targetUrl, domain, pages, network, ssl, geo };
  } finally {
    activeContexts--;
    await context.close().catch(() => {});
  }
}
