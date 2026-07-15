import { redisPub } from './redis';
import { scanChannel, type ScanEvent } from '@/lib/constants';

// Публикация события прогресса скана в Redis-канал scan:{id} (ПС-04 §7).
// Вызывается воркером; app-процесс раздаёт событие в SSE через singleton-subscriber.
export async function publishScanEvent(scanId: string, event: ScanEvent): Promise<void> {
  await redisPub.publish(scanChannel(scanId), JSON.stringify(event));
}
