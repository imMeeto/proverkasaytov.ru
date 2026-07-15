// Типы JSONB-полей БД (ПС-02 §2, §3).

// meta скана. consents фиксируются при создании; остальное дописывает воркер.
export type ScanMeta = {
  ip?: string; // IP проверяемого сайта (не пользователя!)
  geo?: { country: string; asn?: string; provider?: string };
  ssl?: { valid: boolean; validTo?: string; daysLeft?: number; issuer?: string };
  pagesCrawled?: { url: string; status: number; ms: number }[];
  loadMs?: number;
  innFound?: string | null;
  consents: { pd: true; ownership: true };
  userAgentUsed?: string;
};

// Единый формат находки для всех чеков — из него строится веб-отчёт и PDF.
export type Evidence = {
  pageUrl: string;
  detail: string;
  selector?: string;
  extra?: Record<string, string | number>;
};
