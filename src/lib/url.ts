import { parse } from 'tldts';

export type NormalizedUrl = { url: string; domain: string; hostname: string };

// Нормализация введённого URL + выделение eTLD+1 (домен для дедупа, ПС-05 §1).
export function normalizeUrl(input: string): NormalizedUrl | null {
  let raw = (input ?? '').trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (!u.hostname) return null;

  // отсекаем якорь и utm-параметры
  u.hash = '';
  for (const key of [...u.searchParams.keys()]) {
    if (/^utm_/i.test(key) || key === 'yclid' || key === 'gclid' || key === 'fbclid') {
      u.searchParams.delete(key);
    }
  }

  const parsed = parse(u.hostname);
  const domain = parsed.domain ?? u.hostname;

  return { url: u.toString(), domain, hostname: u.hostname };
}
