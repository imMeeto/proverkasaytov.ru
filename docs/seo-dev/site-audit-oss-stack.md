# OSS-стек для сервиса-аудита сайтов (аналог rechecker.ru)

> **Компаньон к** [site-audit-catalog.md](site-audit-catalog.md) (каталог проверок). Здесь — GitHub-репозитории, из которых берётся логика под каждую категорию.
> **Стек-цель:** Next.js 16 + Node.js + TypeScript + BullMQ + Redis + PostgreSQL.
> **Дата:** 2026-07-15. Звёзды/лицензии верифицированы агентами через GitHub API.

## Важное уточнение: «через какой GitHub делается проверка?»

Единого «GitHub-сервиса проверки» нет. Наш существующий отчёт [docs/performance/](../performance/2026-04-15-home/README.md) сгенерирован локально утилитой **Lighthouse CLI** (`google/lighthouse`, Apache-2.0) — не через сторонний сервис. Сам **rechecker.ru — проприетарный закрытый продукт**, исходников на GitHub нет. Похожий сервис собирается из ~30 open-source кирпичей ниже.

## Легенда лицензий (критично для закрытого SaaS)

| Метка | Что значит |
|---|---|
| 🟢 **MIT / Apache-2.0 / BSD / ISC** | Копируем, форкаем, встраиваем свободно (сохранить copyright-notice) |
| 🟡 **MPL-2.0** | File-level copyleft: как зависимость — свободно; открывать надо только изменённые файлы самой библиотеки, наш код не заражается |
| 🟠 **GPL-2.0 / GPL-3.0 / LGPL** | Код НЕ копировать в наш продукт. Можно вызывать как **отдельный бинарник/процесс** и парсить вывод; брать идеи/правила |
| 🔴 **AGPL-3.0** | ОСОБО ОПАСНО для SaaS: сетевое использование обязывает раскрыть исходники. Код не копировать, библиотеку не встраивать — только изучать архитектуру «глазами» |

---

## 1. Движок аудита и краулинг

| Репозиторий | ⭐ | Язык | Лиц. | Что брать | Интеграция |
|---|---|---|---|---|---|
| **GoogleChrome/lighthouse** | 30.5k | JS | 🟢 Apache-2.0 | Сам движок аудита (perf/SEO/a11y/best-practices) → JSON. Основа разовых проверок и мониторинга деградации | ⭐ npm-native, но тянет headless Chrome — в отдельном BullMQ-worker |
| **harlan-zw/unlighthouse** | 4.7k | TS | 🟢 MIT | **Ключевой.** Краулит весь сайт и гоняет Lighthouse на каждой странице (логика «аудит всего сайта», как у rechecker). Есть programmatic API | ⭐ Нативный TS, ложится на BullMQ |
| **apify/crawlee** | 24.7k | TS | 🟢 Apache-2.0 | **Ядро обхода.** RequestQueue, дедуп, автоскейл, единый API поверх Playwright/Puppeteer/Cheerio/HTTP | ⭐⭐ Нативный TS, лучший выбор для crawl-слоя |
| **StJudeWasHere/seonaut** | ~1k | Go | 🟢 MIT | **Цельный SEO-audit скелет с чистой лицензией.** Concurrent-краулер, модель «crawl → issues с severity» (битые ссылки, редирект-циклы, дубли meta, иерархия H, canonical) | 🔶 Go не копипастим, но архитектура issue-reporter переносится 1:1 |
| **GoogleChrome/lighthouse-ci** | 7.0k | JS | 🟢 Apache-2.0 | Хранение истории прогонов, тренды, diff-регрессий, budgets/assertions. Работает поверх Postgres — совпадает с нашей БД | ⭐ Взять схему хранения + assertion-движок |
| **GoogleChrome/web-vitals** | 8.5k | JS | 🟢 Apache-2.0 | Клиентский RUM-замер LCP/INP/CLS «как у юзера» — для field-подобных данных | ⭐ Крошечная, работает в браузере |
| **treosh/crux-api** | 68 | TS | 🟢 MIT | Обёртка над CrUX API (реальные field-данные Google по домену) — дополняет lab-данные | ⭐ Нативный TS, нужен API-ключ |
| **webhintio/hint** | 3.7k | TS | 🟢 Apache-2.0 | Плагинная архитектура правил (каждая проверка = плагин) — паттерн для нашего чек-листа | ⭐ Maintenance-mode (2024) — брать паттерны, не как зависимость |
| **bda-research/node-crawler** | 6.8k | TS | 🟢 MIT | Лёгкий краулер + rate-limit + Cheerio, если не нужен headless | ⭐⭐ Минимум зависимостей |
| ⛔ **viasite/site-audit-seo** | 296 | JS | 🔴 **AGPL** | Функционально ближайший аналог rechecker (crawl + Lighthouse всех страниц + отчёты) | **Код НЕ трогать.** Эталон списка проверок и формата отчёта — только смотреть |

---

## 2. Мета-теги / SEO-экстракция / robots / sitemap / CMS-детект

| Репозиторий | ⭐ | Язык | Лиц. | Что брать | Интеграция |
|---|---|---|---|---|---|
| **cheeriojs/cheerio** | 30.4k | TS | 🟢 MIT | Базовый HTML-парсер: title, description, H1/H2, canonical, hreflang, robots-meta, og:*, twitter:*, JSON-LD | ⭐⭐ Де-факто стандарт |
| **microlinkhq/metascraper** | 2.7k | JS | 🟢 MIT | Готовая SERP/social-preview карточка (OG + Twitter + JSON-LD + microdata + oEmbed), модульные rule-пакеты | ⭐⭐ Берём только нужные модули |
| **jshemas/openGraphScraper** | 753 | TS | 🟢 MIT | Минимал: fetch + парс OG/Twitter в один объект | ⭐⭐ Есть `-lite` под готовый HTML |
| **samclarke/robots-parser** | 167 | JS | 🟢 MIT | Полный парсер robots.txt (wildcard, crawl-delay, Sitemap-директивы, isAllowed) | ⭐⭐ Обязателен |
| **seantomburke/sitemapper** | 136 | TS | 🟢 MIT | Рекурсивный парсер sitemap.xml (index, gzip, lastmod/priority) | ⭐⭐ Как есть |
| **projectdiscovery/wappalyzergo** | 1.1k | Go | 🟢 MIT | Детект CMS/стека/CDN/аналитики (чистая MIT-лицензия) | 🔶 Go-микросервис / child_process |
| **enthec/webappanalyzer** | 541 | JSON | 🟠 GPL-3.0 | База фингерпринтов ~2500+ технологий (ДАННЫЕ для движка выше) | 🔶 Тянуть в рантайме как справочник |

---

## 3. Безопасность / SSL / DNS / WHOIS / email

| Репозиторий | ⭐ | Язык | Лиц. | Что брать | Интеграция |
|---|---|---|---|---|---|
| **dyaa/ssl-checker** | 112 | TS | 🟢 MIT | **SSL база нативно:** expiry, daysRemaining, issuer, validFrom/To, fingerprint, protocol, cipher, chain на `node:tls` | ⭐⭐ Чистый TS, копировать напрямую |
| **testssl/testssl.sh** | 9.1k | Shell | 🟠 GPL-2.0 | Эталон глубоких TLS-проверок: слабые шифры, CVE (ROBOT/Heartbleed), OCSP, версии протоколов | 🔶 Бинарник в Docker-воркере, парсить `--jsonfile` |
| **ssllabs/ssllabs-scan** | 1.7k | Go | 🟢 Apache-2.0 | Методология грейдинга A+…F — легально перенести формулу | ⭐ Переписать на TS |
| **mozilla/http-observatory** | 1.8k | Python | 🟡 MPL-2.0 | **Золотой стандарт скоринга security-заголовков** (CSP/HSTS/XFO/cookies/SRI/CORS + система баллов) | 🔶 Портировать правила на TS (MPL разрешает) |
| **OWASP/www-project-secure-headers** | 203 | md | 🟢 Apache-2.0 | Каноничные «правильные» значения заголовков + тексты рекомендаций | ⭐ Данные, не код |
| **google/csp-evaluator** | 400 | TS | 🟢 Apache-2.0 | **Готовый CSP-анализатор** (npm `csp_evaluator`): unsafe-inline, whitelist-bypass, nonce/strict-dynamic | ⭐⭐ Прямо под стек |
| `node:dns` (нативный) | — | — | — | A/AAAA/MX/TXT/NS/SOA/**CAA**/CNAME из коробки, ноль зависимостей | ⭐⭐ Тривиально |
| **lsongdev/dns2** | 593 | JS | 🟢 MIT | Кастомный резолвер/DoH, записи DNSKEY/RRSIG (сырьё для DNSSEC) | ⭐ Чистый JS |
| **LayeredStudio/whoiser** | 268 | TS | 🟢 MIT | WHOIS с авто-дискавери серверов по TLD + referral к registrar. ⚠️ для `.ru`/`.рф` возможно нужен RDAP | ⭐⭐ Нативный TS |
| **postalsys/mailauth** | 142 | JS | 🟢 MIT | **Email-движок:** SPF/DKIM/DMARC/ARC/BIMI/MTA-STS одной библиотекой | ⭐⭐ Нативный JS/TS |
| **domainaware/checkdmarc** | 317 | Python | 🟢 Apache-2.0 | Готовый список warning-ов по email (DMARC ослаблен, устаревшие теги) | 🔶 Правила копируются свободно |
| **RetireJS/retire.js** | 4.1k | JS | 🟢 Apache-2.0 | Детект уязвимых JS-либ + постоянно обновляемая БД сигнатур | ⭐⭐ Нативный JS |
| **projectdiscovery/nuclei** (+ templates) | 29.8k | Go | 🟢 MIT | ~4000 YAML-шаблонов: exposed `.git`/`.env`/`wp-config`, мисконфиги, CVE | 🔶 Шаблоны как данные переносятся; бинарник — в воркере |
| ⛔ **nabla-c0d3/sslyze** | 3.8k | Python | 🔴 **AGPL** | Полнейший TLS-скан | **Не копировать, не встраивать.** Только референс при разработке |

> **Нюанс exposed-файлов:** детектор должен читать ТЕЛО ответа и подтверждать сигнатуру (`.env` содержит `KEY=VALUE`, `.git/HEAD` — ref), а не верить статусу 200 — иначе SPA с catch-all даст лавину ложных срабатываний.
> **Нюанс Safe Browsing:** Google Safe Browsing v4 — non-commercial; для коммерческого сервиса нужен платный **Web Risk API**.

---

## 4. HTML-валидация / битые ссылки / Schema.org / a11y / изображения

| Репозиторий | ⭐ | Язык | Лиц. | Что брать | Интеграция |
|---|---|---|---|---|---|
| **html-validate/html-validate** | ~500k npm/нед | TS | 🟢 MIT | Нативная HTML-валидация, offline, богатый API, TS-типы (канон-репо на GitLab, GitHub — зеркало) | ⭐⭐ Встраивать в TS-воркер |
| **validator/validator** (vnu) | 1.9k | Java | 🟢 MIT | Эталон W3C-conformance (validator.w3.org). Server-mode `--http --format json` | 🔶 Java-бинарник/Docker когда нужна буква-в-букву точность |
| **htmlhint/HTMLHint** | 3.3k | JS | 🟢 MIT | HTML-линтер (best-practices: дубли id, обязательные alt) — быстрый первый проход | ⭐ Нативный JS |
| **JustinBeckwith/linkinator** | 1.2k | TS | 🟢 MIT | **Битые ссылки + redirect chains** нативно (следует по редиректам, внешн+локальн) | ⭐⭐ Импорт `check()` в воркер |
| **lycheeverse/lychee** | 3.8k | Rust | 🟢 Apache-2.0 | Самый быстрый линк-чекер для больших сайтов, `--format json` | 🔶 Бинарник/Docker когда нужен throughput |
| **sindresorhus/got** | 14.9k | TS | 🟢 MIT | Свой bulk-чекер статусов/редиректов: `response.redirectUrls`, таймауты, ретраи | ⭐⭐ Строительный блок |
| **google/schema-dts** | 1.2k | TS | 🟢 Apache-2.0 | TS-типы всего Schema.org → compile-time валидация формы JSON-LD | ⭐⭐ Нативный TS |
| **digitalbazaar/jsonld.js** | 1.8k | JS | 🟢 BSD-3 | JSON-LD процессор (expand/compact/normalize) — валидация синтаксиса | ⭐ Нативный JS |
| **dequelabs/axe-core** | 7.3k | JS | 🟡 MPL-2.0 | **A11y-движок №1** (на нём же a11y Lighthouse) — нарушения WCAG с селекторами | ⭐ Как движок — свободно (MPL file-level) |
| **IBMa/equal-access** | 766 | JS | 🟢 Apache-2.0 | A11y-движок IBM — **самая чистая лицензия** в категории | ⭐ Альтернатива axe без copyleft-нюансов |
| **lovell/sharp** | 32.5k | JS/C++ | 🟢 Apache-2.0 | Анализ изображений: формат/размеры/hasAlpha, детект не-next-gen, переразмеренные картинки. **Уже в нашем стеке** | ⭐⭐ Нативный Node-addon |
| ⚠️ **pa11y/pa11y** | 4.5k | JS | 🟠 LGPL-3.0 | A11y-обёртка над axe | Под капотом axe — **проще звать axe-core/IBM напрямую** |

---

## 5. Мониторинг / архитектура / расписание / отчёты / дашборды

| Репозиторий | ⭐ | Язык | Лиц. | Что брать | Интеграция |
|---|---|---|---|---|---|
| 🏆 **louislam/uptime-kuma** | 88.6k | JS/Vue | 🟢 MIT | **Скелет платного мониторингового ядра:** scheduler-per-monitor, heartbeat-модель, uptime% 24h/30d, SSL-expiry, 90+ нотификаций (Telegram нативно), maintenance-окна, status-страницы | 🔶 Стек чужой (Vue2/SQLite) — портируем **концепции** (модель монитора, heartbeat-таблицу, degradation-логику) |
| **towfiqi/serpbear** | 1.9k | **Next.js/TS** | 🟢 MIT | **Стек-близнец.** Rank-tracking: pluggable scraper-провайдеры (SerpAPI/Serper/custom), keyword→position→history, GSC-интеграция, Telegram-алерты | ⭐⭐ Тот же Next.js. Копируем scraper-слой; их HTTP-cron заменяем на BullMQ |
| **TwiN/gatus** | 10.6k | Go | 🟢 Apache-2.0 | Декларативная модель «проверка = набор условий» (`[STATUS]==200`, `[CERTIFICATE_EXPIRATION]>48h`) — образец для нашей Zod-схемы монитора | 🔶 Go не переносим, DSL условий — эталон |
| **taskforcesh/bullmq** | 8.8k | TS | 🟢 MIT | **Job Schedulers** (`upsertJobScheduler`, ≥5.16) — основа всего расписания. Уже наш стек | ⭐⭐ Нативно (`server/lib/bullmq.ts`) |
| **upptime/upptime** | 16k | TS | 🟢 MIT | Логика расчёта uptime/response-time из истории (сам паттерн git-as-db нам не подходит) | ⭐ Только идеи |
| **tremorlabs/tremor** | 16k | React/TS | 🟢 Apache-2.0 | **Дашборды трендов** (AreaChart/спарклайны/KPI) на Tailwind+Radix — совпадает с нашим Shadcn | ⭐⭐ Copy-paste в Next.js |
| **recharts** | 24k | React | 🟢 MIT | Композируемые SVG-графики деградации (низкоуровневая альтернатива Tremor) | ⭐⭐ React-native |
| **puppeteer** | Apache-2.0 | JS | 🟢 Apache-2.0 | HTML→PDF брендированных отчётов через тот же headless Chrome, что и Lighthouse | ⭐⭐ Переиспользуем браузер-инстанс |
| **pdfmake** | — | JS | 🟢 MIT | Табличные PDF-отчёты без браузера | ⭐ Легковеснее puppeteer |
| ⛔ **grafana/grafana** | 66k | Go/TS | 🔴 **AGPLv3** | С 2021 AGPL. Unmodified для внутреннего ops — можно; **встраивать в продукт = раскрыть исходники** | Клиентские дашборды — на Tremor, не Grafana |
| ⚠️ **statping-ng** | 1.9k | Go | 🟠 GPL-3.0 | Status-page + мониторинг | Код не копировать, идеи по SLA-отчётам |

### Паттерн планировщика (BullMQ Job Schedulers)
1. **Один scheduler на клиента-монитор** с детерминированным `schedulerId` (`monitor:${siteId}`) → идемпотентный upsert при смене тарифа/интервала.
2. `upsertJobScheduler` идемпотентен — зовём при каждом апдейте настроек.
3. Обязательный `backoff: { type: 'exponential', delay: 30_000+ }` на внешних проверках (тот же инвариант #12, что для Amvera-LLM) — иначе `attempts:3` = шторм запросов.
4. **Разделить очереди:** `checks` (быстрые uptime/SSL, высокий concurrency) · `audits` (тяжёлый Lighthouse/crawl, низкий concurrency) · `reports` (weekly Telegram).
5. Для еженедельных отчётов задавать `tz` в паттерне (DST).

---

## 6. Итоговый «green-light» стек под наш проект

Всё нативно на TS, лицензии 🟢/🟡 (безопасны для копирования):

| Слой | Пакеты |
|---|---|
| **Обход сайта** | `crawlee` (Apache) |
| **Аудит-движок** | `lighthouse` + `unlighthouse` (Apache/MIT), `crux-api` (MIT) — field-данные |
| **SEO-экстракция** | `cheerio` + `metascraper` (MIT), `robots-parser` + `sitemapper` (MIT) |
| **CMS-детект** | `wappalyzergo` (MIT, микросервис) + фингерпринты `webappanalyzer` |
| **SSL** | `ssl-checker` (MIT) + `node:tls`; глубокий — `testssl.sh` бинарником |
| **Заголовки** | скоринг из `http-observatory` (MPL) + тексты OWASP; CSP — `csp_evaluator` (Apache) |
| **DNS/WHOIS** | `node:dns` + `dns2` (MIT), `whoiser` (MIT) |
| **Email** | `mailauth` (MIT) + правила `checkdmarc` |
| **Уязвимости** | `retire.js` (Apache), сигнатуры exposed из `nuclei-templates` (MIT) |
| **HTML/ссылки** | `html-validate` + `linkinator` + `got` (MIT); vnu.jar/lychee — при масштабе |
| **Schema/a11y/img** | `schema-dts` + `jsonld.js`, `axe-core`/`equal-access`, `sharp` |
| **Мониторинг-ядро** | архитектура `uptime-kuma` (MIT) на `bullmq` Job Schedulers |
| **Rank/продукт-форма** | `serpbear` (MIT, Next.js) — scraper-слой |
| **Отчёты/дашборды** | `puppeteer`/`pdfmake`, `tremor` (Apache) |

### 🚩 Лицензионные красные флаги (НЕ копировать код в продукт)
- 🔴 **AGPL:** `viasite/site-audit-seo` (ближайший аналог rechecker — только смотреть), `sslyze`, `grafana` core.
- 🟠 **GPL:** `testssl.sh`, `sslscan`, `statping-ng`, JS-форки Wappalyzer, данные `webappanalyzer` — только как отдельный процесс/справочник.
- 🟠 **LGPL:** `pa11y` — заменить прямым вызовом `axe-core`/`equal-access`.

### Что ближе всего к готовому «скелету»
- **Платный мониторинг** → архитектура `uptime-kuma` (концепции) + `bullmq`.
- **SEO-модуль + форма продукта на нашем стеке** → `serpbear` (Next.js/TS).
- **SEO-краулер с issue-репортером** → `seonaut` (MIT, безопасен vs AGPL-аналоги).
- **Аудит-мотор** → `lighthouse` + `lighthouse-ci` (готовое хранение истории/тренды).
