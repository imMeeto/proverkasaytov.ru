import type IORedis from 'ioredis';
import crypto from 'node:crypto';
import { createRedis } from '@/server/realtime/redis';
import { env } from '@/lib/env';

// Rate-limit на Redis (ПС-08 §5). IP пользователя нигде не хранится в открытом виде —
// только SHA-256(ip + соль) в ключе с TTL (ПС-08 §7, CLAUDE.md §6).

const g = globalThis as unknown as { _rlRedis?: IORedis };
const redis = g._rlRedis ?? createRedis();
if (env.NODE_ENV !== 'production') g._rlRedis = redis;

export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(`${ip}:${env.IP_HASH_SALT}`).digest('hex').slice(0, 32);
}

/** IP клиента из заголовков прокси. За Caddy/nginx — x-forwarded-for/x-real-ip. */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || '0.0.0.0';
}

/**
 * Счётчик в окне (INCR + EXPIRE). ok=false → лимит превышен.
 * Redis недоступен → пропускаем (fail-open): доступность важнее строгости лимита.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  try {
    const k = `rl:${key}`;
    const n = await redis.incr(k);
    if (n === 1) await redis.expire(k, windowSec);
    return n <= limit;
  } catch {
    return true;
  }
}
