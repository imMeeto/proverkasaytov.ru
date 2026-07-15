// Серверный доступ к переменным окружения. Импортировать ТОЛЬКО в серверном коде.
// Не бросаем на этапе импорта (иначе билд падает без .env) — проверяем лениво там, где значение нужно.

function num(name: string, fallback: number): number {
  const v = process.env[name];
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  APP_INTERNAL_URL: process.env.APP_INTERNAL_URL ?? 'http://localhost:3000',

  WORKER_CONCURRENCY: num('WORKER_CONCURRENCY', 2),
  SCAN_MAX_PAGES: num('SCAN_MAX_PAGES', 10),
  SCAN_TOTAL_TIMEOUT_MS: num('SCAN_TOTAL_TIMEOUT_MS', 150_000),

  GEOIP_DB_PATH: process.env.GEOIP_DB_PATH ?? '',
  GEOIP_ASN_DB_PATH: process.env.GEOIP_ASN_DB_PATH ?? '',

  REPORT_PRINT_SECRET: process.env.REPORT_PRINT_SECRET ?? '',
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH ?? '',
  IP_HASH_SALT: process.env.IP_HASH_SALT ?? 'dev-salt',

  SMARTCAPTCHA_SERVER_KEY: process.env.SMARTCAPTCHA_SERVER_KEY ?? '',

  PRICE_FULL_REPORT_KOPECKS: num('PRICE_FULL_REPORT_KOPECKS', 70_000),
  YOOKASSA_SHOP_ID: process.env.YOOKASSA_SHOP_ID ?? '',
  YOOKASSA_SECRET_KEY: process.env.YOOKASSA_SECRET_KEY ?? '',
  WEBHOOK_IP_CHECK: process.env.WEBHOOK_IP_CHECK === '1',

  S3_ENDPOINT: process.env.S3_ENDPOINT ?? '',
  S3_BUCKET: process.env.S3_BUCKET ?? '',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ?? '',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY ?? '',

  SMTP_HOST: process.env.SMTP_HOST ?? '',
  SMTP_PORT: num('SMTP_PORT', 587),
  SMTP_USER: process.env.SMTP_USER ?? '',
  SMTP_PASS: process.env.SMTP_PASS ?? '',
  MAIL_FROM: process.env.MAIL_FROM ?? '',

  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;

export function requireEnv(name: keyof typeof env): string {
  const v = env[name];
  if (v === '' || v === undefined || v === null) {
    throw new Error(`Не задана обязательная переменная окружения: ${name}`);
  }
  return String(v);
}
