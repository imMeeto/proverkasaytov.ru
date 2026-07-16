import { promises as dns } from 'node:dns';
import { open, type Reader } from 'maxmind';
import type { CountryResponse, AsnResponse } from 'maxmind';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { isPrivateIp } from '@/server/security/ssrf';
import type { GeoInfo } from '@/server/checks/types';

// GeoIP по локальным базам GeoLite2 (ПС-04 §4) — без сетевых вызовов наружу.
// Питает чеки A2 (hosting_geo) и A3 (hosting_rkn_registry, Фаза 3).
//
// Базы может не быть (dev-окружение, не скачали) → возвращаем country: null,
// и чек A2 честно даёт unable. Отсутствие базы НЕ роняет скан (CLAUDE.md §4).

let countryReader: Reader<CountryResponse> | null = null;
let asnReader: Reader<AsnResponse> | null = null;
let initialized = false;

async function init(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (env.GEOIP_DB_PATH) {
    try {
      countryReader = await open<CountryResponse>(env.GEOIP_DB_PATH);
    } catch (e) {
      logger.warn({ path: env.GEOIP_DB_PATH, e }, 'GeoLite2-Country недоступна — A2 даст unable');
    }
  }
  if (env.GEOIP_ASN_DB_PATH) {
    try {
      asnReader = await open<AsnResponse>(env.GEOIP_ASN_DB_PATH);
    } catch (e) {
      logger.warn({ path: env.GEOIP_ASN_DB_PATH, e }, 'GeoLite2-ASN недоступна — A3 даст unable');
    }
  }
}

/** Первый публичный IPv4 домена. Приватные адреса отсекаются (SSRF уже проверил, это пояс и подтяжки). */
async function resolveIp(hostname: string): Promise<string | null> {
  try {
    const addrs = await dns.resolve4(hostname);
    return addrs.find((a) => !isPrivateIp(a)) ?? null;
  } catch {
    return null;
  }
}

export async function collectGeo(hostname: string): Promise<GeoInfo> {
  await init();

  const ip = await resolveIp(hostname);
  if (!ip) return { country: null, error: 'IP не определился' };

  if (!countryReader) return { country: null, ip, error: 'База GeoLite2 не подключена' };

  try {
    const country = countryReader.get(ip);
    const asn = asnReader?.get(ip);
    return {
      country: country?.country?.iso_code ?? country?.registered_country?.iso_code ?? null,
      ip,
      asn: asn?.autonomous_system_number ? `AS${asn.autonomous_system_number}` : undefined,
      provider: asn?.autonomous_system_organization ?? undefined,
    };
  } catch (e) {
    logger.warn({ ip, e }, 'ошибка GeoIP-поиска');
    return { country: null, ip, error: 'Ошибка поиска по базе GeoIP' };
  }
}
