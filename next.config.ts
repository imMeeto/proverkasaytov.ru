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
  // Безопасные заголовки (ПС-08 §7). Полный CSP с frame-src для SmartCaptcha и виджета
  // оплаты — в Фазе 5, когда эти origin появятся (сейчас неверный CSP сломал бы приложение).
  // HSTS — на прокси (ПС-08 §7).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
