import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Серверные пакеты, которые нельзя бандлить (нативные модули / worker-threads).
  serverExternalPackages: [
    "pino",
    "pino-pretty",
    "thread-stream",
    "bullmq",
    "ioredis",
    "postgres",
  ],
  // Заголовки безопасности (ПС-08 §7). HSTS — на прокси. connect/frame/script заранее
  // разрешают Метрику (после согласия) и SmartCaptcha/ЮKassa. 'unsafe-inline' — Next
  // инлайнит стили/скрипты; 'unsafe-eval' только в dev (нужен HMR).
  async headers() {
    const dev = process.env.NODE_ENV !== "production";
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://mc.yandex.ru https://smartcaptcha.yandexcloud.net",
      "frame-src https://smartcaptcha.yandexcloud.net https://yookassa.ru https://*.yookassa.ru",
      `script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://smartcaptcha.yandexcloud.net${dev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
