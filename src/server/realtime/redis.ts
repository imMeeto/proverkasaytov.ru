import IORedis from 'ioredis';
import { env } from '@/lib/env';

// Фабрика соединений. maxRetriesPerRequest: null — обязательно для BullMQ.
export function createRedis(): IORedis {
  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
}

const globalForRedis = globalThis as unknown as {
  _redisPub?: IORedis;
  _redisSub?: IORedis;
};

// Публикатор (обычные команды PUBLISH). Используется воркером.
export const redisPub = globalForRedis._redisPub ?? createRedis();
// Подписчик — отдельное соединение (в subscribe-режиме другие команды слать нельзя).
export const redisSub = globalForRedis._redisSub ?? createRedis();

if (env.NODE_ENV !== 'production') {
  globalForRedis._redisPub = redisPub;
  globalForRedis._redisSub = redisSub;
}
