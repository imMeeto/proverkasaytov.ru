import type { FormInfo, PageSnapshot, ScanContext } from './types';

// Общие эвристики нескольких чеков. Держим здесь, чтобы B1/C2 и C1/C5
// не разъезжались в понимании «что такое ПДн-форма» и «где политика».

// ---- ПДн-формы (ПС-03 §6) ----

// `\bname\b` вместо подстроки `name` — иначе поле `username` формы логина метится как ПДн.
const PD_FIELD_RE = /\bname\b|имя|phone|телефон|\btel\b|email|mail|почта|фамили|address|адрес|\bfio\b|фио/i;

/**
 * Форма аутентификации (логин/простой вход) — НЕ форма сбора новых ПДн, отдельного
 * согласия по C1 не требует. Отличаем от регистрации по отсутствию явных ПДн-полей.
 */
export function isAuthForm(form: FormInfo): boolean {
  const hasPassword = form.fields.some(
    (f) => (f.type || '').toLowerCase() === 'password' || /pass|парол/i.test(f.name),
  );
  if (!hasPassword) return false;
  const hasRealPd = form.fields.some((f) => {
    const t = (f.type || '').toLowerCase();
    return t === 'tel' || /телефон|phone|фамили|отчеств|адрес|address/i.test(`${f.name} ${f.placeholder}`);
  });
  return !hasRealPd; // логин исключаем; богатую регистрацию с ПДн-полями — оставляем
}

/**
 * Форма собирает ПДн, если есть поле tel/email либо name/placeholder из словаря.
 * Поля password под ПДн-признак не подпадают (это аутентификация).
 */
export function isPdForm(form: FormInfo): boolean {
  return form.fields.some((f) => {
    const t = (f.type || '').toLowerCase();
    if (t === 'tel' || t === 'email') return true;
    if (['hidden', 'submit', 'button', 'checkbox', 'password'].includes(t)) return false;
    return PD_FIELD_RE.test(f.name) || PD_FIELD_RE.test(f.placeholder);
  });
}

/** Форма поиска — частый ложноположительный кандидат, исключаем явно. */
export function isSearchForm(form: FormInfo): boolean {
  if (isPdForm(form)) return false; // форма с tel/email/ПДн-полем — точно не поиск
  if (form.fields.some((f) => (f.type || '').toLowerCase() === 'search')) return true;
  // Маркер поиска ищем в селекторе/action, НЕ в innerText («найдите тур» ≠ форма поиска).
  const hay = `${form.selector} ${form.action}`.toLowerCase();
  return /search|поиск|найти/.test(hay) && form.fields.length <= 2;
}

export function pdForms(ctx: ScanContext): { page: PageSnapshot; form: FormInfo }[] {
  const out: { page: PageSnapshot; form: FormInfo }[] = [];
  for (const page of ctx.pages) {
    for (const form of page.forms) {
      if (isAuthForm(form)) continue;
      if (isSearchForm(form)) continue;
      if (isPdForm(form)) out.push({ page, form });
    }
  }
  return out;
}

// ---- Страница политики (ПС-03 §5, чек B1) ----

const POLICY_RE =
  /политик|конфиденциальн|персональн|privacy|policy|personal-data|(^|\/)pd(\/|$)|politika|personalnyh/i;

export function looksLikePolicyLink(href: string, anchor: string): boolean {
  return POLICY_RE.test(href) || POLICY_RE.test(anchor);
}

/** Все ссылки на политику со всех страниц. */
export function policyLinks(ctx: ScanContext): { pageUrl: string; href: string; anchor: string }[] {
  const out: { pageUrl: string; href: string; anchor: string }[] = [];
  const seen = new Set<string>();
  for (const page of ctx.pages) {
    for (const l of page.links) {
      if (!looksLikePolicyLink(l.href, l.anchor)) continue;
      if (seen.has(l.href)) continue;
      seen.add(l.href);
      out.push({ pageUrl: page.url, href: l.href, anchor: l.anchor });
    }
  }
  return out;
}

const MIN_POLICY_TEXT = 1000; // «болванка» короче 1000 символов = документа фактически нет

/**
 * Найденная и реально открывающаяся страница политики среди обойдённых.
 * null — ссылка есть, но страница битая/пустая, либо ссылок нет вовсе.
 */
export function findPolicyPage(ctx: ScanContext): PageSnapshot | null {
  const links = policyLinks(ctx);
  const hrefs = new Set(links.map((l) => normalize(l.href)));
  for (const page of ctx.pages) {
    // ПС-03 §5: строго > 1000 символов (ровно 1000 — «болванка»).
    if (page.status !== 200 || page.text.length <= MIN_POLICY_TEXT) continue;
    if (hrefs.has(normalize(page.url))) return page; // страница реально связана ссылкой-политикой
    // Не связана, но URL похож — засчитываем ТОЛЬКО при маркерах ПДн в тексте,
    // иначе /return-policy или посторонняя длинная страница дадут ложный pass B1.
    if (POLICY_RE.test(page.url) && /персональн|обработк[аи]? данн|152-ФЗ/i.test(page.text)) return page;
  }
  return null;
}

function normalize(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    u.search = '';
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1);
    return u.toString().toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

// ---- Прочее ----

/** Весь видимый текст скана — для поиска по сайту целиком. */
export function allText(ctx: ScanContext): string {
  return ctx.pages.map((p) => p.text).join('\n');
}

export const home = (ctx: ScanContext): PageSnapshot | undefined => ctx.pages[0];
