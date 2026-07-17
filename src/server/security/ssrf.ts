import { promises as dns } from 'node:dns';
import net from 'node:net';

// SSRF-защита (ПС-08 §2–§4). Наш робот по команде пользователя ходит по произвольным URL —
// это готовый SSRF-вектор. Дисциплина: любое сомнение → отказ.
//
// Используется трижды:
//   1) API перед постановкой в очередь (быстрая предпроверка);
//   2) воркер перед goto (DNS мог смениться — rebinding);
//   3) route-фильтр на каждый под-запрос страницы (синхронный isForbiddenHostname).

export type SsrfVerdict = { ok: true; addresses: string[] } | { ok: false; reason: string };

// Запрещённые IPv4-диапазоны: приватные, служебные, loopback, link-local,
// CGNAT, тестовые, multicast и зарезервированные (ПС-08 §2).
const V4_BLOCKS: readonly (readonly [string, number])[] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10], // CGNAT
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local, сюда же metadata-сервисы облаков
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24], // TEST-NET-1
  ['192.168.0.0', 16],
  ['198.18.0.0', 15], // benchmarking
  ['198.51.100.0', 24], // TEST-NET-2
  ['203.0.113.0', 24], // TEST-NET-3
  ['224.0.0.0', 4], // multicast
  ['240.0.0.0', 4], // reserved + broadcast
] as const;

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = ((n << 8) | v) >>> 0;
  }
  return n >>> 0;
}

function inV4Block(ip: number, base: string, bits: number): boolean {
  const b = ipv4ToInt(base);
  if (b === null) return false;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return ((ip & mask) >>> 0) === ((b & mask) >>> 0);
}

export function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return true; // не распарсили → считаем небезопасным
  return V4_BLOCKS.some(([base, bits]) => inV4Block(n, base, bits));
}

export function isPrivateIPv6(ip: string): boolean {
  const s = ip.toLowerCase().split('%')[0]; // отбросить zone id (fe80::1%eth0)
  if (s === '::' || s === '::1') return true;

  // IPv4-mapped (::ffff:10.0.0.1) и IPv4-compatible в точечной форме.
  const mapped = s.match(/^::(?:ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return isPrivateIPv4(mapped[1]);

  // КРИТИЧНО: WHATWG-парсер URL сериализует встроенный IPv4 в HEX-форму —
  // new URL('http://[::ffff:169.254.169.254]/').hostname === '::ffff:a9fe:a9fe'.
  // Разбираем два младших хекстета в IPv4 и проверяем как IPv4, иначе mapped-адрес
  // (в т.ч. cloud metadata 169.254.169.254) обходит фильтр на всех трёх слоях.
  const hexMapped = s.match(/^::(?:ffff:)?([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hexMapped) {
    const hi = parseInt(hexMapped[1], 16);
    const lo = parseInt(hexMapped[2], 16);
    return isPrivateIPv4(`${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`);
  }

  const head = s.startsWith('::') ? 0 : parseInt(s.split(':')[0] || '', 16);
  if (Number.isNaN(head)) return true;
  if ((head & 0xfe00) === 0xfc00) return true; // fc00::/7 — unique local
  if ((head & 0xffc0) === 0xfe80) return true; // fe80::/10 — link-local
  return false;
}

export function isPrivateIp(ip: string): boolean {
  const v = net.isIP(ip);
  if (v === 4) return isPrivateIPv4(ip);
  if (v === 6) return isPrivateIPv6(ip);
  return true; // не IP → небезопасно
}

// Синхронная проверка имени хоста — без DNS. Годится для route-фильтра под-запросов (ПС-08 §4).
export function isForbiddenHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.home.arpa')) return true;
  if (net.isIP(h)) return isPrivateIp(h);
  return false;
}

async function resolveAll(hostname: string): Promise<string[]> {
  const out: string[] = [];
  const [v4, v6] = await Promise.allSettled([dns.resolve4(hostname), dns.resolve6(hostname)]);
  if (v4.status === 'fulfilled') out.push(...v4.value);
  if (v6.status === 'fulfilled') out.push(...v6.value);
  return out;
}

function ownHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Полная проверка URL перед обходом (ПС-08 §2).
 * Резолвит DNS и требует, чтобы ВСЕ полученные адреса были публичными:
 * один приватный адрес среди ответов — уже вектор атаки.
 */
export async function assertPublicUrl(rawUrl: string): Promise<SsrfVerdict> {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return { ok: false, reason: 'Некорректный адрес' };
  }

  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return { ok: false, reason: 'Поддерживаются только http и https' };
  }
  if (u.username || u.password) {
    return { ok: false, reason: 'Адрес не должен содержать логин и пароль' };
  }
  if (u.port && u.port !== '80' && u.port !== '443') {
    return { ok: false, reason: 'Допустимы только стандартные порты 80 и 443' };
  }

  const hostname = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (isForbiddenHostname(hostname)) {
    return { ok: false, reason: 'Адрес указывает на внутреннюю сеть' };
  }

  const own = ownHostname();
  if (own && (hostname === own || hostname.endsWith('.' + own))) {
    return { ok: false, reason: 'Этот адрес принадлежит самому сервису' };
  }

  // IP-литерал уже проверен в isForbiddenHostname — резолвить нечего.
  if (net.isIP(hostname)) return { ok: true, addresses: [hostname] };

  let addresses: string[];
  try {
    addresses = await resolveAll(hostname);
  } catch {
    return { ok: false, reason: 'Не удалось определить адрес сайта' };
  }
  if (addresses.length === 0) {
    return { ok: false, reason: 'Домен не существует или не резолвится' };
  }
  if (addresses.some(isPrivateIp)) {
    return { ok: false, reason: 'Домен указывает на внутреннюю сеть' };
  }

  return { ok: true, addresses };
}
