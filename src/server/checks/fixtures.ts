import type {
  FormInfo,
  GeoInfo,
  NetworkRequest,
  PageSnapshot,
  ScanContext,
  SslInfo,
} from './types';

// Фабрики фикстур для тестов чеков (ПС-03: минимум pass- и fail-фикстура на чек).
// Чек — чистая функция от ScanContext, поэтому браузер в тестах не нужен.

export const okSsl = (over: Partial<SslInfo> = {}): SslInfo => ({
  valid: true,
  httpsReachable: true,
  redirectsToHttps: true,
  validTo: new Date(Date.now() + 90 * 86_400_000).toISOString(),
  daysLeft: 90,
  issuer: "Let's Encrypt",
  ...over,
});

export const ruGeo = (over: Partial<GeoInfo> = {}): GeoInfo => ({
  country: 'RU',
  ip: '5.255.255.70',
  asn: 'AS13238',
  provider: 'YANDEX LLC',
  ...over,
});

export const page = (over: Partial<PageSnapshot> = {}): PageSnapshot => ({
  url: 'https://example.ru/',
  status: 200,
  html: '<html><body></body></html>',
  text: '',
  forms: [],
  links: [],
  cookiesSet: [],
  loadMs: 100,
  ...over,
});

export const form = (over: Partial<FormInfo> = {}): FormInfo => ({
  selector: 'form#callback',
  action: '/send',
  method: 'post',
  fields: [
    { name: 'name', type: 'text', placeholder: 'Ваше имя' },
    { name: 'phone', type: 'tel', placeholder: '+7' },
  ],
  checkboxes: [],
  innerText: 'Оставьте заявку',
  nearbyLinks: [],
  ...over,
});

export const consentCheckbox = (checked = false) => ({
  checked,
  text: 'Я даю согласие на обработку персональных данных',
  name: 'consent',
});

export const net = (requestUrl: string, over: Partial<NetworkRequest> = {}): NetworkRequest => ({
  pageUrl: 'https://example.ru/',
  requestUrl,
  domain: (() => {
    try {
      return new URL(requestUrl).hostname.split('.').slice(-2).join('.');
    } catch {
      return 'unknown';
    }
  })(),
  type: 'script',
  beforeConsent: true,
  ...over,
});

export const ctx = (over: Partial<ScanContext> = {}): ScanContext => ({
  targetUrl: 'https://example.ru/',
  domain: 'example.ru',
  pages: [page()],
  network: [],
  ssl: okSsl(),
  geo: ruGeo(),
  rkn: { status: 'unavailable' },
  hostingRegistry: { status: 'unavailable' },
  innFound: null,
  ...over,
});

/** Достаточно длинный текст политики: порог B1 — 1000 символов. */
export const policyText = (): string =>
  'Политика обработки персональных данных. Оператор ИНН 7712345678. '.repeat(30);
