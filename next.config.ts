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
};

export default nextConfig;
