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

      // Подписываемся ДО чтения БД: иначе терминальное событие, опубликованное в окне
      // между SELECT и подпиской, потеряется, и клиент зависнет на прогрессе.
      unsub = subscribeScan(id, (event) => {
        send(event);
        if (event.stage === 'done' || event.stage === 'failed') {
          cleanup();
        }
      });

      // Текущий статус из БД — чтобы клиент, подключившийся после завершения, всё равно получил финал.
      const current = await db.query.scans.findFirst({ where: eq(scans.id, id) });
      if (!current) {
        send({ stage: 'failed', message: 'Отчёт не найден' });
        cleanup();
        return;
      }

      // 'running' отсутствует в ScanStage — маппим в осмысленную стадию обхода.
      const stage: ScanStage = current.status === 'running' ? 'crawl' : current.status;
      send({ stage, score: current.score ?? undefined });

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
