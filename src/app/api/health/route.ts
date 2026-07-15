import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { redisPub } from '@/server/realtime/redis';
import { scanQueue } from '@/server/queue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = { db: false, redis: false, queue: -1 };

  try {
    await db.execute(sql`select 1`);
    checks.db = true;
  } catch {
    /* db down */
  }

  try {
    const pong = await redisPub.ping();
    checks.redis = pong === 'PONG';
  } catch {
    /* redis down */
  }

  try {
    checks.queue = await scanQueue.count();
  } catch {
    /* queue unavailable */
  }

  const healthy = checks.db && checks.redis;
  return NextResponse.json({ ok: healthy, data: checks }, { status: healthy ? 200 : 503 });
}
