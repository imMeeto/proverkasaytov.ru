// Клиент-безопасные данные бренда. NEXT_PUBLIC_* инлайнятся в бандл на этапе сборки.
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Проверка сайтов';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Короткое имя без «по законам РФ» — для узких мест интерфейса.
export const SITE_SHORT_NAME = 'Проверка сайтов';

export const PRICE_FULL_REPORT_RUB = 700;

// Робот-краулер (ПС-08 §6). Единый источник правды: используется краулером (Фаза 2)
// и страницей /bot. UA обязан идентифицировать сервис и вести на страницу о роботе.
export const BOT_NAME = 'ProverkaSaytovBot';
export const BOT_USER_AGENT = `Mozilla/5.0 (compatible; ${BOT_NAME}/1.0; +${SITE_URL}/bot)`;

// Лимиты робота — публично обещаем их на /bot, соблюдаем в краулере.
export const BOT_MAX_PAGES = 10;
export const BOT_MIN_INTERVAL_HOURS = 1;
