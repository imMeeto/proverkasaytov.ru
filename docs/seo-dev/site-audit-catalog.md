# Каталог проверок сайта — reChecker.ru vs наши отчёты (ТЗ-референс)

> **Назначение:** сбор требований для разработки собственного сервиса-аналога reChecker.ru — экспресс-аудита сайта с бесплатными инструментами и платным ежемесячным мониторингом.
> **Дата:** 2026-07-15.
> **Источники:** (1) разведка конкурента [rechecker.ru](https://rechecker.ru/) (главная + `/pricing` + `/tools` = 141 инструмент + закрытый `/profile`); (2) отраслевой канон технического/SEO-аудита (Google, Sitebulb, Semrush, Backlinko, WebAIM/WCAG, OWASP); (3) наши текущие отчёты `docs/performance/2026-04-15-home/`.
> **Приоритет данных:** ЭТАЛОН со скриншотов пользователя > WebFetch > доинтерпретация. Неподтверждённые цифры помечены `(unverified)`.

---

## 1. Что проверяют наши отчёты сегодня

Единственный существующий артефакт аудита: [`docs/performance/2026-04-15-home/`](../performance/2026-04-15-home/README.md).

- **Инструмент:** Lighthouse 13.1.0 CLI, Chrome headless. 3 прогона × 2 профиля (desktop/mobile), медиана.
- **Скоуп — ТОЛЬКО `--only-categories=performance`.** SEO / Accessibility / Best-Practices **явно исключены** (§10 scope-boundaries отчёта).
- **Core Web Vitals (lab):** Performance Score, FCP, LCP (+ `lcp-breakdown-insight`, `lcp-discovery-insight`), TBT, CLS, Speed Index, TTI, TTFB, INP-lab.
- **Диагностики:** `third-parties-insight`, `cache-insight`, `modern-http-insight`, `legacy-javascript-insight`, `total-byte-weight`, `render-blocking-insight`, `unused-css-rules`, `unused-javascript`, `bootup-time`, `mainthread-work-breakdown`, `image-delivery-insight`, `font-display-insight`, `dom-size`, `csp-xss` (упомянут).
- **Формат:** markdown README + сырые Lighthouse HTML/JSON.

**Чего у нас НЕТ:** SEO-мета-аудита, SSL/DNS/WHOIS, robots/sitemap, битых ссылок и картинок, HTML-валидации, security-заголовков как отдельного отчёта, uptime/непрерывного мониторинга, массовой проверки URL, dev-утилит, микроразметки, доступности, международного SEO, ссылочного аудита.

> **Вывод:** мы закрываем ~1.5 из 16 категорий канона (Производительность глубоко + Мобильность частично), и только в lab-режиме без field/CrUX-данных.

---

## 2. reChecker.ru — БЕСПЛАТНЫЕ инструменты

### 2.1. Точно как на скриншоте (авторитетный эталон)

| Инструмент | Лимит |
|---|---|
| Экспресс-аудит одной страницы | **28 проверок**, 1 страница, ~30 сек, без регистрации |
| Мета-теги и SERP / OG Preview | 1 страница |
| SSL, DNS, WHOIS проверки | 1 домен |
| HTTP-заголовки и безопасность | 1 страница |
| Robots.txt и sitemap | **до 500 URL** |
| Массовая проверка URL (Bulk) | **до 500 URL** |
| Битые изображения | **до 50 страниц** |
| Битые ссылки | **на одной странице** |
| HTML Validation | **до 5 страниц** |
| Web Vitals и проверка редиректов | 1 страница |
| CSS генераторы, палитры, border-radius | без лимита |
| JSON, Regex, JWT, Diff, Escape инструменты | без лимита |
| «И другие — десятки инструментов» | — |

### 2.2. Расшифровка «десятков инструментов» (из `/tools` — 141 инструмент, 8 категорий)

**SEO (24, free):** Полная проверка сайта (28 проверок), SERP Preview, Open Graph Preview, Schema Validator (JSON-LD), Проверка мета-тегов (Title/Description/OG/Twitter Card), Анализ ключевых слов (плотность), Проверка редиректов (301/302 цепочки), Проверка sitemap (до 500 URL), HTML-валидация W3C (до 5 стр), Анализатор robots.txt, Проверка изображений (alt/размеры/форматы), Битые изображения (до 50 стр), Определение CMS/стека, Анализ читабельности, Web Vitals (LCP/FID/CLS), Hreflang Checker, Анализатор ссылок (внутр/внешн/nofollow), Canonical Checker, Генератор robots.txt, Генератор FAQ Schema, Битые ссылки (404, 1 стр), Bulk-проверка ответов сервера (до 500 URL), Проверка Favicon, AI Анализ конкурента *(paid, 19 ₽)*.

**Security (12, free):** Password Strength Checker, SSL Certificate Checker (валидность/цепочка/TLS/шифр), Security Headers Analyzer, HTTP Headers Analyzer, CSP Analyzer, DNS Lookup, WHOIS Lookup, Email Deliverability (SPF/DKIM/DMARC), HTTP/2 & Brotli Checker, IP Information Tool (геолокация), Cookie Analyzer (GDPR/Secure/HttpOnly), CORS Checker.

**CSS (21, free):** Border Radius, Palette from Image, Clip-Path, Glassmorphism, CSS Filter Playground, CSS→SCSS, PX→REM, Specificity Calculator, Typography Scale, Flexbox Playground, Grid Generator, CSS→Tailwind, HTML→React, Gradient, Box Shadow, Color Converter, Color Contrast (WCAG), Palette Extractor (по URL), CSS Sprite, Design Tokens, Responsive Tester.

**DevOps (24, free):** JSON Formatter, Regex Tester, JWT Decoder, Diff Checker, .htaccess Gen, Nginx Gen, Docker Compose Builder, Code Minifier, PHP Editor, PHP Version Detector, Markdown Preview, Cron Gen, CSV↔JSON, YAML↔JSON, SQL Formatter, XML Formatter, URL Parser, Escape/Unescape, JSON Schema Validator, Cron Parser, JSONPath Tester, TOML↔JSON, PEM Viewer, GraphQL Formatter.

**Utilities (32, free):** Password Gen, QR Gen, Favicon Gen, Image Compressor, SVG Encoder, Base64, URL Encoder, Транслитерация/slug, Timestamp Converter, Lorem Ipsum, Word Counter, Emoji Search, Screenshot Tool, Case Converter, Hash Gen (SHA), UUID Gen, Image Resizer, Reading Time, Text Sorter, Unit Converter, Image Format Converter, Image Crop, Find & Replace (regex), Barcode Gen, QR Decoder, Random Data Gen, Timezone Converter, Stopwatch, Cipher Tools, HTML Entities, CSV Validator, Advanced Lorem Ipsum.

**Design (1, free):** Color Picker (HEX/RGB/HSL/HSV + контраст).

> **Бонус:** при регистрации начисляется **50 ₽** на баланс. Модель — pay-as-you-go токенами без обязательной подписки.

---

## 3. reChecker.ru — ПЛАТНЫЙ мониторинг (₽/мес)

### 3.1. Подписки-мониторы (эталон = fetch)

| Монитор | Цена | Что делает | Канал алертов |
|---|---|---|---|
| **Uptime Monitor** | **50 ₽/мес** | Доступность каждые ~5 мин, uptime %, алерт при падении | Telegram |
| **SEO Monitor** | **20 ₽/мес** | Отслеживание изменений Title / Description / H1 / canonical (OK/Changed) | Telegram |
| **SSL Monitor** | **30 ₽/мес** | Контроль срока/валидности SSL, предупреждение до истечения | Telegram / email |
| **Еженедельный SEO-отчёт** | **99 ₽/мес** | Авто-аудит (28 проверок), деградация метрик, битые ссылки, скорость — по понедельникам | Telegram |
| **«Полный контроль» (bundle)** `(unverified)` | **199 ₽/мес** | Все 4 монитора в одном пакете | — |

### 3.2. Разовые платные позиции (из `/pricing`, не на скриншоте)

- **Полный аудит сайта (разово):** до 25 стр — 49 ₽; до 100 стр — 149 ₽; до 500 стр — 499 ₽ (28 проверок + дубли + ошибки индексации).
- **Батч-проверки (разово):** Sitemap до 5 000 URL — 99 ₽ / до 25 000 — 299 ₽; Массовая проверка URL так же; Битые изображения до 500 стр — 149 ₽ / до 2 000 — 499 ₽; Битые ссылки до 100 стр — 149 ₽ / до 500 — 499 ₽; HTML Validation до 25 стр — 99 ₽ / до 100 — 299 ₽.
- **AI-инструменты (23 шт., с баланса):** базовые 9 ₽ (Regex, мета-теги, Schema.org, Alt-тексты, заголовки, краткое содержание, теги, переводчик, парафраз, посты для соцсетей); расширенные 19 ₽ (анализ конкурента, копирайтер, рерайт, FAQ, апскейл 4x, озвучка); генератор картинок 29–99 ₽; транскрипция Whisper 79 ₽; портрет 99 ₽.
- **REST API (pay-per-request):** мета-теги / SSL / HTTP Headers / WHOIS / Sitemap / Robots.txt — 1 ₽; битые ссылки/изображения — 2 ₽; Web Vitals — 3 ₽; редиректы — 1 ₽.
- **Пополнение баланса:** Starter 100 ₽→100 ₽; Standard 500 ₽→550 ₽; Pro 1500 ₽→1800 ₽; Agency 4000 ₽→5000 ₽.

---

## 4. Каталог ВСЕХ пунктов проверки сайта (главный deliverable)

> Исчерпывающий чек-лист по категориям. Метки: `free` = бесплатно на rechecker · `paid` = платный монитор/разово · `канон` = отраслевой стандарт (может отсутствовать у rechecker — потенциальный gap/фича для нас) · `у нас` = уже покрыто нашим Lighthouse-отчётом.

### 4.1. Мета-теги и SERP

- Title: единственный, не пустой, 50–60 симв. (+ **px-усечение в SERP**, не только символы), primary keyword ближе к началу, уникален по сайту, без дублей `free / канон`
- Meta description: ~140–160 симв. (+ px-усечение), call-to-action, уникальна, не пустая, без дублей `free / канон`
- H1: ровно один, содержит focus keyword, не дублирует title дословно `free / канон`
- Иерархия заголовков H1>H2>H3 без пропусков уровней `канон`
- **Дублирующиеся мета-теги** — два `<title>`, два `canonical`, несколько `description` на странице `канон`
- Open Graph: og:title/description/image/type/url `free`; **+ og:site_name, og:locale, article:published_time/author** для статей `канон`
- **og:image**: размеры (1200×630), вес, доступность (битая/мелкая = плохое превью) `канон`
- Twitter Card `free`; **+ twitter:site / creator / image:alt** `канон`
- **Конфликт canonical ↔ og:url** `канон`
- **X-Robots-Tag (HTTP-заголовок)** — noindex/nofollow на уровне заголовка (скрытый деиндекс) `канон`
- SERP Preview / OG-Social Preview `free`
- Meta viewport, charset, robots, keywords (наличие/устаревание) `канон`
- **Site-verification мета** (google-site-verification, yandex-verification) `канон`

### 4.2. Техническое SEO (robots / sitemap / canonical / hreflang / редиректы)

- **robots.txt:** существует, доступен, парсится, корректные User-agent/Disallow/Allow/Sitemap, нет случайного `Disallow: /`, ссылка на sitemap `free`
- **Генератор robots.txt** (визуальный редактор) `free`
- **Блокировка AI-ботов** (GPTBot, CCBot, ClaudeBot, PerplexityBot) — явная проверка `канон`
- **crawl-delay, noindex в robots.txt (deprecated)** — обнаружение устаревших директив `канон`
- **llms.txt** — новый стандарт для AI-краулеров (emerging) `канон`
- **XML sitemap:** валиден, `<lastmod>`, только indexable-URL, <50k URL / <50MB, sitemap index `free (до 500) / paid (батч до 25k)`
- **Image / Video / News sitemap**, `changefreq`/`priority`, `.gz`-компрессия, HTML-sitemap страница `канон`
- **Кросс-чек robots↔sitemap:** URL из sitemap не Disallow'нуты; sitemap-URL реально открывается (200) `канон`
- **rel=canonical:** наличие, корректность, self-referencing, нет конфликта с noindex/hreflang/sitemap `free`
- **Canonical edge-cases:** uppercase/lowercase, index.html vs `/`, UTM/параметры; canonical→redirect/404/noindex («висячий»); cross-domain; противоречивые сигналы `канон`
- **hreflang:** синтаксис (ISO 639-1 + ISO 3166-1), return-tags, x-default, соответствие sitemap/canonical `free`
- **Редиректы:** цепочка 301/302/307/308, коды, целевые адреса, без цепочек >2 хопов, без петель, 301 vs 302 `free`
- **meta-refresh / JS-редиректы** как антипаттерн; **принудительный http→https 301** с сохранением пути `канон`
- **HTTP-статусы:** важные=200, старые=301, нет случайных 404/5xx/**soft-404** — Bulk-проверка `free (до 500) / paid`
- **Пагинация** (rel=prev/next), **Custom 404**, **Breadcrumbs** `канон`
- **Определение CMS / технологического стека** `free`

### 4.3. Индексация и структура сайта

- Index coverage (published vs indexed — требует GSC) `канон`
- Orphan pages (без внутренних ссылок), crawl depth, crawl budget `канон`
- Дубли контента: параметры URL, www/non-www, http/https, trailing slash, thin/duplicate `free (частично) / канон`
- Структура URL и ИА (короткие, keyword, дефисы, lowercase, без сессий) `канон`
- JS-рендеринг (SSR/CSR, rendered vs raw HTML, hydration), mobile-first indexing `канон`
- Log file analysis (что краулят боты, фокус Googlebot) `канон`

### 4.4. Производительность / Web Vitals

- **LCP < 2.5s / INP < 200ms / CLS < 0.1** `free / у нас (lab)`
- Доп. метрики: TTFB, FCP, TBT, Speed Index, TTI `free / у нас`
- **Field/CrUX (origin-level) + гео-разбивка TTFB, CDN edge, многорегиональность** `канон / у нас только lab`
- Оптимизация изображений: WebP/AVIF, srcset, lazy-load, explicit width/height (против CLS), **oversized images**, GIF→video, video preload/poster `free / у нас (image-delivery)`
- Минификация/сплиттинг/tree-shaking CSS/JS, **text-compression coverage, неиспользуемый preload, Long Tasks** `у нас (unused-css/js, legacy-js)`
- Кеширование (browser + CDN), gzip/brotli `у нас (cache-insight, modern-http)`
- Render-blocking, critical CSS, defer/async JS `у нас (render-blocking)`
- preconnect/preload/prefetch, **fetchpriority / priority hints, 103 Early Hints**, шрифты (font-display, self-host) `у нас (font-display)`
- Server response time, **HTTP/2, HTTP/3 / QUIC, Brotli** `free / у нас (modern-http)`
- Third-party скрипты, bootup-time, main-thread work, DOM size, total byte weight, **кол-во HTTP-запросов** `у нас`

### 4.5. Ссылки (внутренние / внешние / битые)

- Анализатор ссылок: внутренние / внешние / **nofollow / sponsored / ugc** `free`
- Внутренняя перелинковка (anchor, распределение link equity, topical authority) `канон`
- Битые ссылки (404, сетевые сбои, редиректы), **битые якоря `#anchor`, пустые/JS-only, ссылки на non-canonical, внутренние редирект-цепочки, >100 ссылок/стр** `free (1 стр) / paid (батч)`
- Исходящие ссылки на битые/спам-ресурсы `канон`
- **Backlink audit** (профиль внешних ссылок, referring domains), **toxic links** (PBN, exact-match anchor, спам-ниша), **anchor distribution, follow/nofollow ratio, link velocity, disavow** `канон — GAP у обоих`

### 4.6. Изображения и медиа

- Alt-тексты (наличие, описательность, keyword) `free`
- Размеры и форматы (WebP/AVIF), explicit width/height, lazy-load, srcset `free / у нас`
- Битые изображения `free (до 50 стр) / paid (до 2000 стр)`
- Медиа-обогащение контента (видео, инфографика) `канон`

### 4.7. HTML / код-валидация

- HTML-валидация W3C `free (до 5 стр) / paid (до 100 стр)`
- Семантическая корректность разметки `канон`
- XML Formatter, JSON Schema Validator, CSV Validator `free`

### 4.8. Безопасность (SSL / заголовки / mixed-content)

- **SSL:** валидность, цепочка доверия, версия TLS, шифр, срок; **отсутствие TLS 1.0/1.1, TLS 1.3, HSTS preload-list, OCSP stapling, Certificate Transparency** `free / канон`
- **Mixed content** (http-ресурсы на https) `канон`
- **Security Headers:** HSTS, CSP, X-Content-Type-Options, X-Frame-Options/frame-ancestors, Referrer-Policy, Permissions-Policy, COOP/COEP/CORP `free`
- **HTTP Headers Analyzer, CSP Analyzer** `free`
- Скрытие версий (Server, X-Powered-By) `канон`
- Cookie-флаги (Secure, HttpOnly, SameSite) — Cookie Analyzer; **cookie-consent/CMP-баннер, cookies до согласия (GDPR фактический)** `free / канон`
- CORS Checker, Email Deliverability (SPF/DKIM/DMARC), Password Strength `free`
- **Malware / blocklist** (Google Safe Browsing, VirusTotal), **exposed-файлы** (`.env`, `.git/`, wp-config, phpinfo, directory listing), **SRI, уязвимые JS-либы (retire.js), subdomain takeover, port scan, WAF detect** `канон — GAP`

### 4.9. DNS / домен / WHOIS

- DNS Lookup (A/AAAA/MX/TXT/CNAME/NS), WHOIS Lookup, IP Information (геолокация), HTTP/2 & Brotli `free`
- **DNSSEC, CAA, PTR/reverse DNS, TTL, DNS-propagation, redundancy NS, DNS blacklist/RBL, IPv6/AAAA reachability** `канон — GAP`
- **Domain expiry monitoring** (алерт до истечения регистрации — отдельно от SSL) `канон — GAP`

### 4.10. Микроразметка / Schema.org

- Наличие JSON-LD / Microdata / RDFa, Schema Validator (синтаксис) `free`
- **Rich Results eligibility** + обязательные/рекомендованные свойства per-type, корректные типы данных `free / канон`
- Типы: Organization, WebSite (searchbox), BreadcrumbList, Article/NewsArticle, Product+Offer+AggregateRating, FAQPage, HowTo, LocalBusiness, Event, VideoObject, Person; **+ Review, Recipe, JobPosting, Course, SoftwareApplication, QAPage, Dataset, ImageObject, Speakable** `free / канон`
- Соответствие видимому контенту (**нет спам-AggregateRating без отзывов, hidden markup**) `канон`
- Генератор FAQ Schema `free`

### 4.11. Доступность (a11y, WCAG 2.1/2.2)

- Принципы POUR, уровни A/AA/AAA (цель AA) `канон — GAP`
- Контраст цвета (4.5:1 текст, 3:1 крупный) — Color Contrast Checker `free`
- Alt-тексты, клавиатурная навигация (порядок, видимый focus, нет trap), screen reader, семантика (landmarks/headings/ARIA), формы (labels/errors), мультимедиа (субтитры/транскрипты), zoom 200–400%, link text, `lang`, skip-links, accessibility statement `канон — GAP (окно дифференциации)`

### 4.12. Контент

- Уникальность и соответствие search intent, E-E-A-T, глубина/полнота, **thin-content порог/word count** `канон`
- Дубли и **каннибализация ключей** (детект пересечений), плотность ключей `free / канон`
- Анализ читабельности (**Flesch**, spelling & grammar) `free / канон`
- Свежесть/обновление, авторство/дата, топикальные кластеры `канон`

### 4.13. Мобильность / UX

- Mobile-friendly test, responsive layout + viewport `канон`
- Responsive Tester (превью на устройствах) `free`
- Tap-target размеры/overlap, нет горизонтального скролла, читабельный шрифт `канон`
- **Intrusive interstitials / autoplay-медиа** (риск Google penalty) `канон`
- Скорость на мобильном (mobile-профиль CWV) `free / у нас`
- **Trust-сигналы:** Privacy Policy / Terms / Contact / Impressum, copyright year `канон`

### 4.14. Локальное / международное SEO

- hreflang (см. 4.2) `free`
- Отдельные URL на язык/регион (ccTLD / subdomain / subdirectory), геотаргетинг GSC, локализация валюты/языка, дубли между локалями `канон`
- **LocalBusiness schema, NAP-консистентность** `канон — GAP`

### 4.15. Утилиты разработчика

- JSON (Formatter, Schema Validator, JSONPath), Regex Tester, JWT Decoder, Diff Checker, Escape/Unescape `free`
- Конвертеры: CSV↔JSON, YAML↔JSON, TOML↔JSON, SQL/XML/GraphQL Formatter `free`
- Генераторы конфигов: .htaccess, Nginx, Docker Compose, Cron (+ Parser); Code Minifier, URL Parser, PEM Viewer, Markdown Preview `free`
- CSS-генераторы: Border Radius, Gradient, Box Shadow, Clip-Path, Glassmorphism, Grid, Flexbox, Filter, палитры, PX→REM, Specificity, Typography Scale, CSS→SCSS/Tailwind, HTML→React `free`
- Общие: Password/QR/Favicon/UUID/Hash/Barcode Gen, Base64/URL Encoder, транслитерация, Timestamp/Timezone/Unit Converter, Word Counter, Lorem Ipsum, Case Converter, Image Compressor/Resizer/Crop/Format Converter, Screenshot, Cipher Tools `free`

### 4.16. Favicon / PWA / брендинг

- Favicon (наличие, форматы, множественные размеры), **apple-touch-icon, theme-color, maskable icons** `free / канон`
- **Web App Manifest (manifest.json)** — наличие, валидность, installability `канон`
- **Service Worker / offline-режим** — детект `канон`

### 4.17. AMP

- AMP-валидация, `<link rel=amphtml>`, соответствие AMP↔canonical `канон`

### 4.18. Аналитика / теги отслеживания

- Детект GA4 / GTM / Яндекс.Метрики / пикселей — наличие и **дубли счётчиков** `канон`

### 4.19. Спам / манипуляция (сигналы penalty)

- Cloaking, hidden text, keyword stuffing, doorway-страницы, sneaky redirects `канон`
- Auto-generated/AI-контент детект, плейсхолдеры («lorem ipsum», «under construction») `канон`

### 4.20. Рейтинги / SERP

- **Rank tracking** (позиции по ключам), SERP-features, competitor rank comparison `канон — GAP` (у rechecker только разовый AI-анализ конкурента)

### 4.21. Архив / история

- Wayback / индекс-история домена `канон`

### 4.22. Мониторинг (uptime / SEO / SSL / отчёты)

- **Uptime Monitor** — доступность каждые ~5 мин, uptime %, Telegram-алерт `paid 50 ₽/мес`
- **SEO Monitor** — изменения Title/Description/H1/canonical (**+ broader content-change**) `paid 20 ₽/мес`
- **SSL Monitor** — срок/валидность, предупреждение `paid 30 ₽/мес`
- **Еженедельный SEO-отчёт** — авто-аудит 28 проверок, деградация, битые ссылки, скорость `paid 99 ₽/мес`
- Bundle «Полный контроль» `paid 199 ₽/мес (unverified)`
- **Расширения канона:** domain-expiry monitor, blacklist/defacement monitor, multi-location uptime, server error-rate/5xx `канон — GAP`
- Каналы: Telegram (основной), email, веб-дашборд

---

## 5. Матрица покрытия: мы vs rechecker

| Категория | Есть у нас | Есть у rechecker | Gap / приоритет |
|---|---|---|---|
| Мета-теги и SERP | ❌ | ✅ free | **Полный gap** — базовый must-have |
| Техническое SEO | ❌ | ✅ free (+paid батч) | **Полный gap** |
| Индексация и структура | ❌ | ⚠️ частично | Gap; глубина требует GSC |
| Производительность / Web Vitals | ✅ **lab (Lighthouse)** | ✅ free | **Мы сильнее в диагностике**; добавить CrUX |
| Ссылки | ❌ | ✅ free внутр/битые | Gap; backlink-аудит — нет у обоих |
| Изображения и медиа | ⚠️ (delivery-insight) | ✅ free | Частичный gap (alt/форматы) |
| HTML/код-валидация | ❌ | ✅ free | Полный gap |
| Безопасность | ⚠️ (csp-xss упомянут) | ✅ free | **Крупный gap** |
| DNS/домен/WHOIS | ❌ | ✅ free | Полный gap |
| Микроразметка/Schema | ❌ | ✅ free | Полный gap |
| Доступность (a11y) | ❌ (исключено) | ⚠️ только контраст | Gap у обоих — **окно дифференциации** |
| Контент | ❌ | ⚠️ частично | Частичный gap |
| Мобильность | ✅ mobile CWV | ✅ free | Паритет по скорости |
| Локальное/международное SEO | ❌ | ⚠️ hreflang | Gap; LocalBusiness — нет у обоих |
| Утилиты | ❌ | ✅ free (~80) | Полный gap, низкий бизнес-приоритет |
| Мониторинг | ❌ | ✅ paid 20–99 ₽/мес | **Полный gap — их модель монетизации** |

**Итог:** мы покрываем ~1.5 категории из 16. rechecker покрывает 14–15 из 16 бесплатно, монетизируя непрерывный мониторинг и AI. Наше единственное преимущество сегодня — **глубина perf-диагностики** (insights-уровень Lighthouse), которой у rechecker в публичном виде нет.

---

## 6. Рекомендации по разбивке free/paid для нашего сервиса

### 6.1. Бесплатный слой (разовый анализ, без регистрации — «крючок»)

- **Экспресс-аудит одной страницы (28+ проверок)** — флагман. Один прогон: мета-теги, H1/заголовки, OG/Twitter, SSL, security-заголовки, robots/sitemap, canonical, редиректы, Core Web Vitals (наш козырь — глубже конкурента), alt-изображений, HTML-валидность, mixed-content, Schema.org наличие.
- **Точечные чекеры:** SSL, DNS, WHOIS, HTTP-заголовки, robots+sitemap (до 500), редиректы, битые ссылки (1 стр), битые изображения (до 50 стр), HTML-валидация (до 5 стр), Schema Validator, hreflang, SERP/OG Preview.
- **Массовая проверка URL до 500** — бесплатно (как эталон).
- **Dev-утилиты** (JSON/Regex/JWT/Diff/CSS-генераторы) — дёшевы, держат аудиторию и SEO-трафик по низкочастотке. Пакетом, но не приоритет №1.
- **Бонус 50 ₽ при регистрации** — конверсия в платный баланс.

### 6.2. Платный ежемесячный мониторинг (recurring — ядро монетизации)

- **Uptime Monitor** — 50 ₽/мес: проверка каждые 1–5 мин, uptime %, Telegram/email-алерт.
- **SSL Monitor** — 30 ₽/мес: ежедневная проверка срока, алерт за N дней.
- **SEO Monitor** — 20 ₽/мес: снапшоты Title/Description/H1/canonical, diff-алерты.
- **Еженедельный отчёт** — 99 ₽/мес: полный авто-аудит по расписанию, история/тренды, битые ссылки, скорость. Telegram + email + веб-дашборд.
- **Bundle «Полный контроль»** — ~199 ₽/мес: все мониторы со скидкой (upsell-якорь).

### 6.3. Платный разовый (батч / тяжёлые задачи — pay-as-you-go с баланса)

- Полный аудит: до 25 / 100 / 500 страниц (49 / 149 / 499 ₽).
- Батч: sitemap до 25k URL, битые ссылки/изображения до сотен-тысяч страниц, HTML-валидация до 100 стр.
- AI-инструменты (мета-теги, alt, Schema, копирайтинг, анализ конкурента) — 9–99 ₽/генерация.
- REST API — pay-per-request (1–3 ₽), канал для агентств/интеграторов.

### 6.4. Дифференциация от rechecker (где обгонять)

1. **Глубина Web Vitals** — сохранить наш insights-уровень Lighthouse + добавить **field/CrUX-данные**, которых у конкурента нет.
2. **Доступность (WCAG 2.1/2.2)** — у обоих почти нет; полноценный a11y-аудит (axe-движок) = уникальное преимущество.
3. **Backlink-аудит** — отсутствует у rechecker; ниша для платного модуля.
4. **История и тренды** — не разовый снимок, а графики деградации метрик во времени (усиливает подписку).
5. **Интеграция с GSC/GA4** — index coverage, orphan pages, log-file analysis — то, что чистый краулер без API дать не может.

### 6.5. Приоритет реализации (roadmap-набросок)

| Приоритет | Блок | Обоснование |
|---|---|---|
| P0 | Экспресс-аудит (мета + технич. SEO + SSL/headers + CWV) | Флагман, максимальный охват при минимуме компонентов |
| P0 | Uptime + SSL Monitor + Telegram-алерты | Ядро recurring-выручки, технически простое |
| P1 | robots/sitemap/canonical/hreflang/редиректы/битые ссылки | Паритет с rechecker |
| P1 | Еженедельный отчёт + история метрик | Главный upsell-драйвер |
| P2 | Schema.org validator, HTML-валидация, DNS/WHOIS | Закрытие оставшихся gap |
| P2 | a11y-аудит (WCAG) | Дифференциация |
| P3 | Dev-утилиты, AI-инструменты, REST API, backlink-аудит | Long-tail SEO-трафик и доп. монетизация |

---

## Приложение. Оговорки по достоверности

- **Авторитетны:** списки free/paid и 4 цены мониторинга (50/20/30/99 ₽/мес) — подтверждены скриншотами пользователя.
- **Требуют ручной сверки на сайте:** число «141 инструмент» и конкретные названия из `/tools`; разовые цены (49/149/499 ₽ и батчи); bundle 199 ₽/мес; бонус 50 ₽; лимит «полного аудита до 25 стр» (fetch расходится с эталоном). SPA-выдача WebFetch частично доинтерпретирована малой моделью.
- **Проверить перед ТЗ:** зайти в `rechecker.ru/tools` и `rechecker.ru/pricing` вручную, сверить точные названия и тарифы.
