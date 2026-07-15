// Клиент-безопасные данные бренда. NEXT_PUBLIC_* инлайнятся в бандл на этапе сборки.
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Проверка сайтов';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Короткое имя без «по законам РФ» — для узких мест интерфейса.
export const SITE_SHORT_NAME = 'Проверка сайтов';

export const PRICE_FULL_REPORT_RUB = 700;
