import type { Page } from 'playwright';
import type { PageSnapshot } from '@/server/checks/types';

// Извлечение данных страницы (ПС-04 §5). Выполняется В КОНТЕКСТЕ БРАУЗЕРА,
// поэтому все хелперы объявлены внутри evaluate — замыкания снаружи недоступны.
//
// Отличие от ПС-04 §5: вместо hasCheckbox/checkboxText собираем массив checkboxes
// с флагом checked. Это обязательное условие чека C1 (v2): предустановленная
// галочка — самостоятельное нарушение, а не «чекбокс есть, значит порядок».

export async function collectSnapshot(
  page: Page,
  url: string,
  status: number,
  loadMs: number,
): Promise<PageSnapshot> {
  const raw = await page.evaluate(() => {
    const MAX_TEXT = 200_000;

    function cssPath(el: Element): string {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts: string[] = [];
      let cur: Element | null = el;
      let depth = 0;
      while (cur && depth < 4 && cur.nodeType === 1 && cur.nodeName !== 'BODY') {
        if (cur.id) {
          parts.unshift(`#${CSS.escape(cur.id)}`);
          break;
        }
        let sel = cur.nodeName.toLowerCase();
        const cls = (cur.getAttribute('class') || '')
          .trim()
          .split(/\s+/)
          .filter(Boolean)[0];
        if (cls) sel += `.${CSS.escape(cls)}`;
        const parent: Element | null = cur.parentElement;
        if (parent) {
          const tag = cur.nodeName;
          const sameTag = Array.from(parent.children).filter((c) => c.nodeName === tag);
          if (sameTag.length > 1) sel += `:nth-of-type(${sameTag.indexOf(cur) + 1})`;
        }
        parts.unshift(sel);
        cur = cur.parentElement;
        depth++;
      }
      return parts.join(' > ') || el.nodeName.toLowerCase();
    }

    // Текст, поясняющий чекбокс: сначала связанный label, затем label-обёртка,
    // затем родитель. По нему работают C1 (согласие) и C5 (склейка согласий).
    function textAround(el: Element): string {
      const id = el.getAttribute('id');
      if (id) {
        const escaped = CSS.escape(id);
        const forLabel = document.querySelector(`label[for="${escaped}"]`);
        if (forLabel) return (forLabel.textContent || '').trim().slice(0, 1000);
      }
      const wrap = el.closest('label');
      if (wrap) return (wrap.textContent || '').trim().slice(0, 1000);
      const parent = el.parentElement;
      if (parent) return (parent.textContent || '').trim().slice(0, 1000);
      return '';
    }

    function linksWithin(root: Element) {
      return Array.from(root.querySelectorAll('a[href]'))
        .slice(0, 30)
        .map((a) => ({
          href: (a as HTMLAnchorElement).href,
          anchor: (a.textContent || '').trim().slice(0, 200),
        }));
    }

    const forms = Array.from(document.querySelectorAll('form'))
      .slice(0, 30)
      .map((f) => {
        const fields = Array.from(f.querySelectorAll('input, textarea, select'))
          .slice(0, 50)
          .map((i) => {
            const el = i as HTMLInputElement;
            return {
              name: el.name || '',
              type: (el.type || el.tagName.toLowerCase() || '').toLowerCase(),
              placeholder: el.placeholder || '',
            };
          });

        const checkboxes = Array.from(f.querySelectorAll('input[type=checkbox]'))
          .slice(0, 20)
          .map((c) => {
            const el = c as HTMLInputElement;
            return {
              // el.checked — живое состояние после рендера JS, ловит и aria-предустановку
              checked: el.checked || el.getAttribute('aria-checked') === 'true',
              text: textAround(el),
              name: el.name || '',
            };
          });

        // Контейнер формы (до 3 уровней вверх) — ссылка на политику часто лежит рядом, а не внутри (C2).
        let container: Element = f;
        for (let i = 0; i < 3; i++) {
          const p: Element | null = container.parentElement;
          if (!p || p.nodeName === 'BODY') break;
          container = p;
        }

        return {
          selector: cssPath(f),
          action: f.getAttribute('action') || '',
          method: (f.getAttribute('method') || 'get').toLowerCase(),
          fields,
          checkboxes,
          innerText: ((f as HTMLElement).innerText || '').slice(0, 2000),
          nearbyLinks: linksWithin(container),
        };
      });

    const links = Array.from(document.querySelectorAll('a[href]'))
      .slice(0, 500)
      .map((a) => ({
        href: (a as HTMLAnchorElement).href,
        anchor: (a.textContent || '').trim().slice(0, 200),
      }));

    // Имена кук, выставленных ДО взаимодействия (робот не кликал «Принять»).
    const cookiesSet = document.cookie
      .split(';')
      .map((c) => c.split('=')[0].trim())
      .filter(Boolean);

    return {
      html: document.documentElement.outerHTML.slice(0, MAX_TEXT * 2),
      text: (document.body?.innerText || '').slice(0, MAX_TEXT),
      forms,
      links,
      cookiesSet,
    };
  });

  return { url, status, loadMs, ...raw };
}
