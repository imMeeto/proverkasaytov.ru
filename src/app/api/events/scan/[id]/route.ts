import { eq } from 'drizzle-orm';
import { db, scans } from '@/server/db';
import { subscribeScan } from '@/server/realtime/sse';
import { isUuid } from '@/lib/api';
import type { ScanEvent, ScanStage } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) {
    return new Response('bad id', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      let unsub: () => void = () => {};
      const send = (event: ScanEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      const ping = setInterval(() => {
        if (closed) return;
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 25_000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(ping);
        unsub();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      // Текущий статус из БД — чтобы клиент, подключившийся после завершения, всё равно получил финал.
      const current = await db.query.scans.findFirst({ where: eq(scans.id, id) });
      if (!current) {
        send({ stage: 'failed', message: 'Отчёт не найден' });
        cleanup();
        return;
      }
      send({ stage: current.status as ScanStage, score: current.score ?? undefined });

      unsub = subscribeScan(id, (event) => {
        send(event);
        if (event.stage === 'done' || event.stage === 'failed') {
          cleanup();
        }
      });

      if (current.status === 'done' || current.status === 'failed') {
        cleanup();
        return;
      }

      req.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
