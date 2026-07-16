import type { Evidence } from '@/server/db/types';

// Контракт движка проверок (ПС-03 §1–§2).
//
// Железное правило: чек — ЧИСТАЯ функция от ScanContext, без I/O. Весь сбор данных
// (краулинг, TLS, GeoIP, реестры) делает пайплайн ДО чеков и кладёт сюда.
// Исключение — rkn_registry: сетевой шаг пайплайна, чек лишь читает готовый результат.

export type CheckStatus = 'pass' | 'warn' | 'fail' | 'unable' | 'not_applicable';
export type Severity = 'critical' | 'major' | 'minor';
export type CheckCategory = 'infra' | 'docs' | 'forms' | 'cookies' | 'auth' | 'registry';

export type CheckResult = {
  status: CheckStatus;
  evidence: Evidence[];
};

export type CheckDefinition = {
  id: string;
  title: string;
  category: CheckCategory;
  severity: Severity;
  lawRef: string;
  run(ctx: ScanContext): CheckResult;
};

// ---- Данные страницы ----

export type FormField = {
  name: string;
  type: string;
  placeholder: string;
};

export type FormCheckbox = {
  /** Предустановлена ли галочка. Нужно чеку C1 (v2): checked = не согласие. */
  checked: boolean;
  /** Текст label/родителя рядом с чекбоксом — по нему работают C1 и C5. */
  text: string;
  name: string;
};

export type FormInfo = {
  selector: string;
  action: string;
  method: string;
  fields: FormField[];
  checkboxes: FormCheckbox[];
  innerText: string;
  /** Ссылки внутри формы и её контейнера (до 3 уровней вверх) — для чека C2. */
  nearbyLinks: PageLink[];
};

export type PageLink = { href: string; anchor: string };

export type PageSnapshot = {
  url: string;
  status: number;
  /** HTML после рендера JS. Живёт только в памяти скана — в БД не сохраняется (ПС-08 §8.3). */
  html: string;
  text: string;
  forms: FormInfo[];
  links: PageLink[];
  /** Имена кук, поставленных ДО взаимодействия. */
  cookiesSet: string[];
  loadMs: number;
};

export type NetworkRequest = {
  pageUrl: string;
  requestUrl: string;
  /** eTLD+1 запроса. */
  domain: string;
  /** script | xhr | font | image | ... */
  type: string;
  /** В MVP собираем только запросы до взаимодействия — робот не кликал «Принять». */
  beforeConsent: true;
};

// ---- Данные инфраструктуры ----

export type SslInfo = {
  /** Сертификат валиден и цепочка построена. */
  valid: boolean;
  httpsReachable: boolean;
  /** Редиректит ли http:// на https://. */
  redirectsToHttps: boolean;
  validTo?: string;
  daysLeft?: number;
  issuer?: string;
  error?: string;
};

export type GeoInfo = {
  /** ISO-код страны или null, если определить не удалось → чек A2 даст unable. */
  country: string | null;
  ip?: string;
  asn?: string;
  provider?: string;
  error?: string;
};

// Внешние реестры (Фаза 3). Дисциплина ПС-04 §6: любое сомнение → 'unavailable',
// чек превращает это в unable. Ложный fail недопустим.
export type RknLookup = {
  status: 'found' | 'not_found' | 'unavailable';
  inn?: string;
  name?: string;
};

export type HostingLookup = {
  status: 'found' | 'not_found' | 'unavailable';
  provider?: string;
  inn?: string;
};

export type ScanContext = {
  targetUrl: string;
  /** eTLD+1 проверяемого сайта. */
  domain: string;
  pages: PageSnapshot[];
  /** ВСЕ запросы всех страниц ДО взаимодействия. */
  network: NetworkRequest[];
  ssl: SslInfo;
  geo: GeoInfo;
  rkn: RknLookup;
  hostingRegistry: HostingLookup;
  innFound: string | null;
};
