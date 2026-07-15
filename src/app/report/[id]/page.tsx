import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, scans, checkResults } from '@/server/db';
import { toPublicScan, toPublicResults } from '@/server/report/serialize';
import { isUuid } from '@/lib/api';
import { ReportView } from '@/components/report-view';

// Приватная ссылка — не индексируем (ПС-05 §5).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Отчёт проверки',
};

export const dynamic = 'force-dynamic';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const scan = await db.query.scans.findFirst({ where: eq(scans.id, id) });
  if (!scan) notFound();

  const rows = await db.select().from(checkResults).where(eq(checkResults.scanId, id));

  return (
    <div className="mx-auto max-w-[820px] px-5 py-12">
      <ReportView
        initialScan={toPublicScan(scan)}
        initialResults={toPublicResults(rows, scan.isPaid)}
      />
    </div>
  );
}
