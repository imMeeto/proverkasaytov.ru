import { EventEmitter } from 'node:events';
import { redisSub } from './redis';
import { logger } from '@/lib/logger';
import type { ScanEvent } from '@/lib/constants';

// Паттерн trava.pro: один Redis-subscriber на процесс, fan-out через EventEmitter,
// никаких psubscribe на каждый HTTP-запрос (ПС-01 §4, ПС-04 §7).

const globalForSse = globalThis as unknown as {
  _scanEmitter?: EventEmitter;
  _sseAttached?: boolean;
};

export const scanEmitter = globalForSse._scanEmitter ?? new EventEmitter();
scanEmitter.setMaxListeners(0); // много одновременных SSE-соединений
globalForSse._scanEmitter = scanEmitter;

function attachSubscriberHandlers(): void {
  if (globalForSse._sseAttached) return;
  globalForSse._sseAttached = true;

  redisSub.psubscribe('scan:*').catch((err) => {
    globalForSse._sseAttached = false;
    logger.error({ err }, 'psubscribe scan:* failed');
  });

  redisSub.on('pmessage', (_pattern: string, channel: string, message: string) => {
    const scanId = channel.slice('scan:'.length);
    let event: ScanEvent;
    try {
      event = JSON.parse(message) as ScanEvent;
    } catch {
      return;
    }
    scanEmitter.emit(scanId, event);
  });
}

// Активируем подписку при первом импорте модуля (app-процесс).
attachSubscriberHandlers();

// Подписка одного SSE-соединения на события конкретного скана. Возвращает отписку.
export function subscribeScan(scanId: string, handler: (e: ScanEvent) => void): () => void {
  scanEmitter.on(scanId, handler);
  return () => {
    scanEmitter.off(scanId, handler);
  };
}
