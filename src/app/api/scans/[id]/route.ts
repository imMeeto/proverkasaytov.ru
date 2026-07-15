import { eq } from 'drizzle-orm';
import { db, scans, checkResults } from '@/server/db';
import { ok, fail, isUuid } from '@/lib/api';
import { toPublicScan, toPublicResults } from '@/server/report/serialize';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) {
    return fail('bad_id', 'Некорректный идентификатор отчёта', 400);
  }

  const scan = await db.query.scans.findFirst({ where: eq(scans.id, id) });
  if (!scan) {
    return fail('not_found', 'Отчёт не найден', 404);
  }

  const results = await db.select().from(checkResults).where(eq(checkResults.scanId, id));

  return ok({
    scan: toPublicScan(scan),
    results: toPublicResults(results, scan.isPaid),
  });
}
