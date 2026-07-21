// Каталог SEO-инструментов Сервиса Б — единый источник для хаба /seo/ и страниц /seo/[slug].
// Тексты и иконки сверены с макетом docs/design-dev/SeoAudit.dc.html (массив tools в <script>).

export type SeoToolCategory = 'SEO' | 'Скорость' | 'Безопасность' | 'Индексация' | 'Ссылки';

export interface SeoTool {
  slug: string;
  name: string;
  desc: string;
  category: SeoToolCategory;
  icon: string;
  free: boolean;
  price?: string;
}

export const seoTools: SeoTool[] = [
  { slug: 'meta-tags', name: 'Проверка мета-тегов', desc: 'Title, Description, H1 — длина, дубли и пропуски глазами поисковика.', category: 'SEO', icon: 'ic-meta', free: true },
  { slug: 'speed', name: 'Скорость (Core Web Vitals)', desc: 'LCP, CLS, INP и время до интерактивности на мобильных и десктопе.', category: 'Скорость', icon: 'ic-speed', free: true },
  { slug: 'ssl', name: 'Проверка SSL-сертификата', desc: 'Срок действия, цепочка доверия и корректность HTTPS.', category: 'Безопасность', icon: 'ic-ssl', free: true },
  { slug: 'security-headers', name: 'Security-заголовки', desc: 'HSTS, CSP, X-Frame-Options и другие заголовки защиты.', category: 'Безопасность', icon: 'ic-shield', free: true },
  { slug: 'robots', name: 'Проверка robots.txt', desc: 'Что вы случайно закрыли от поисковых роботов.', category: 'Индексация', icon: 'ic-robots', free: true },
  { slug: 'sitemap', name: 'Валидатор sitemap.xml', desc: 'Корректность карты сайта и доступность всех URL.', category: 'Индексация', icon: 'ic-sitemap', free: true },
  { slug: 'redirects', name: 'Проверка редиректов', desc: 'Цепочки и циклы 301/302, которые теряют вес страниц.', category: 'SEO', icon: 'ic-redirect', free: true },
  { slug: 'broken-links', name: 'Поиск битых ссылок', desc: 'Внутренние и внешние ссылки, ведущие на 404.', category: 'Ссылки', icon: 'ic-brokenlink', free: true },
  { slug: 'hreflang', name: 'Проверка hreflang', desc: 'Правильность языковых и региональных версий страниц.', category: 'SEO', icon: 'ic-globe', free: true },
];

export function getSeoTool(slug: string): SeoTool | undefined {
  return seoTools.find((t) => t.slug === slug);
}

export const seoCategories: SeoToolCategory[] = ['SEO', 'Скорость', 'Безопасность', 'Индексация', 'Ссылки'];
