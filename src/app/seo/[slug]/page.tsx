import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import * as React from 'react';
import { seoTools, getSeoTool, type SeoTool } from '@/lib/seo-tools';
import { SeoToolForm } from '@/components/seo-tool-form';
import { SeoFaq, type FaqItem } from '@/components/seo-faq';

// Экран showTool (data-screen-label="Инструмент") из docs/design-dev/SeoAudit.dc.html
// (строки 417-519). Server-компонент, инлайн-стили дословно из макета.
// Шапка/футер/фон — в layout сегмента /seo. Динамический маршрут по seoTools.
// Форма и FAQ — 'use client'-островки. Контент результата/описания генерируется
// из данных инструмента: meta-tags воспроизводит макет дословно, остальные 8 —
// по тому же шаблону из name/desc/category.

const dela = "'Dela Gothic One', sans-serif";
const mono = "'JetBrains Mono Variable', monospace";

// Светофор статусов проверок — цвета и свечение точек из макета.
const GREEN = { dot: '#269684', glow: 'rgba(38,150,132,0.9)' };
const GOLD = { dot: '#d9a84c', glow: 'rgba(217,168,76,0.9)' };
const RED = { dot: '#e46d4c', glow: 'rgba(228,109,76,0.9)' };

interface Check {
  status: typeof GREEN;
  title: string;
  note: string;
  fix: string;
  code?: string;
}

interface ToolContent {
  heroTitle: string;
  heroSub: string;
  resultSummary: string;
  checks: Check[];
  tips: string[];
  tipsTitle: string;
  seoH2: string;
  seoParas: string[];
}

// FAQ — данные раздела «Вопросы и ответы» из макета (строки 958-964), общие для всех инструментов.
const faqItems: FaqItem[] = [
  {
    q: 'Экспресс-аудит правда бесплатный?',
    a: 'Да. Проверка одной страницы по 15 параметрам бесплатна и без ограничений по количеству. Платный только полный аудит всего сайта и мониторинг.',
  },
  {
    q: 'Нужна ли регистрация?',
    a: 'Нет. Вставьте адрес страницы и сразу получите результат. Почта нужна только если хотите PDF-отчёт полного аудита.',
  },
  {
    q: 'Чем экспресс-аудит отличается от полного?',
    a: 'Экспресс проверяет одну страницу и показывает основные проблемы. Полный аудит обходит весь сайт, находит проблемы на всех страницах и расставляет приоритеты по влиянию на трафик.',
  },
  {
    q: 'Как часто проверять сайт?',
    a: 'Разовую проверку — после каждого крупного обновления. Для рабочих сайтов удобнее мониторинг: он сам следит за скоростью, SSL и SEO-изменениями и присылает алерты.',
  },
  {
    q: 'Вы храните данные моего сайта?',
    a: 'Мы сохраняем только отчёт, чтобы вы могли открыть его по ссылке. Данные обрабатываются на серверах в России.',
  },
];

// Дословный контент экрана «Инструмент» для примера — проверка мета-тегов (строки 428-501, 972-982).
const metaTagsContent: ToolContent = {
  heroTitle: 'Проверьте мета-теги страницы: Title, Description, H1',
  heroSub: 'Робот загрузит страницу в настоящем браузере и покажет, что видит поисковик: длину заголовков, дубли и пропуски.',
  resultSummary: '3 из 5 проверок с замечаниями',
  checks: [
    {
      status: GOLD,
      title: 'Title — 62 символа',
      note: 'Длинновато: в выдаче обрежется после ~57 символов.',
      fix: 'Сократите до 50–57 символов, вынесите главный запрос в начало. Например: «Купить диван в Москве — доставка за 1 день».',
      code: '<title>Купить диван в Москве — доставка за 1 день</title>',
    },
    {
      status: RED,
      title: 'Description — отсутствует',
      note: 'Мета-описание не задано — поисковик составит сниппет сам, часто неудачно.',
      fix: 'Добавьте описание на 150–160 символов с выгодой и призывом. Оно повышает кликабельность в выдаче.',
      code: '<meta name="description" content="…150–160 символов…">',
    },
    {
      status: GREEN,
      title: 'H1 — 1 шт.',
      note: 'На странице ровно один заголовок H1 — как и требуется.',
      fix: 'Всё в порядке. Убедитесь, что H1 совпадает по смыслу с Title и содержит ключевой запрос.',
    },
  ],
  tipsTitle: 'Как выжать максимум из мета-тегов',
  tips: [
    'Делайте Title уникальным для каждой страницы — дубли путают поисковик.',
    'В Description добавляйте выгоду и призыв к действию, а не перечисление ключей.',
    'Один H1 на страницу, заголовки h2–h3 — по смысловым блокам.',
    'Проверяйте, как сниппет выглядит на мобильных: там обрезка жёстче.',
  ],
  seoH2: 'Зачем проверять мета-теги',
  seoParas: [
    'Title и Description — это то, что человек видит в результатах поиска ещё до перехода на сайт. Слишком длинный заголовок обрежется, отсутствующее описание поисковик придумает сам — и часто неудачно. Оба фактора напрямую влияют на кликабельность сниппета.',
    'H1 задаёт тему страницы. Когда их несколько или нет вовсе, поисковику труднее понять, о чём страница. Инструмент проверяет наличие ровно одного H1 и его связь с Title.',
  ],
};

// Генератор контента по данным инструмента — для остальных 8 инструментов.
function genericContent(tool: SeoTool): ToolContent {
  const lower = tool.name.charAt(0).toLowerCase() + tool.name.slice(1);
  return {
    heroTitle: tool.name,
    heroSub: `${tool.desc} Робот загрузит страницу в настоящем браузере и покажет результат так, как его видит поисковик.`,
    resultSummary: 'Пример результата проверки',
    checks: [
      {
        status: GREEN,
        title: `${tool.name}: базовое требование выполнено`,
        note: `Ключевые параметры категории «${tool.category}» настроены корректно — критичных ошибок не найдено.`,
        fix: 'Всё в порядке. Перепроверяйте после каждого крупного обновления страницы.',
      },
      {
        status: GOLD,
        title: 'Есть замечание',
        note: tool.desc,
        fix: 'Мы покажем конкретные строки и что именно поправить, чтобы поисковик считал страницу корректной.',
      },
      {
        status: RED,
        title: 'Найдена критичная проблема',
        note: `Один из параметров проверки «${lower}» настроен неверно и мешает поисковой оптимизации.`,
        fix: 'Исправьте по инструкции — это напрямую влияет на позиции сайта в выдаче.',
      },
    ],
    tipsTitle: `Как улучшить: ${lower}`,
    tips: [
      'Проверяйте страницу после каждого крупного изменения — регрессии случаются незаметно.',
      `Сверяйтесь с требованиями поисковых систем по теме «${tool.category}».`,
      'Исправляйте сначала красные пункты — они сильнее всего влияют на трафик.',
      'Полный аудит покажет те же проблемы сразу по всем страницам сайта.',
    ],
    seoH2: `Зачем нужна ${lower}`,
    seoParas: [
      `${tool.desc} Инструмент делает это автоматически: загружает страницу в настоящем браузере и снимает параметры так, как их видит поисковый робот.`,
      'Разовая проверка полезна после доработок сайта. Для рабочих проектов удобнее полный аудит и мониторинг: они находят проблемы сразу по всем страницам и следят за изменениями.',
    ],
  };
}

function contentFor(tool: SeoTool): ToolContent {
  return tool.slug === 'meta-tags' ? metaTagsContent : genericContent(tool);
}

// 3 «похожие проверки» — следующие инструменты по кругу, исключая текущий.
function relatedTools(slug: string): SeoTool[] {
  const idx = seoTools.findIndex((t) => t.slug === slug);
  const rest: SeoTool[] = [];
  for (let i = 1; i <= seoTools.length && rest.length < 3; i++) {
    const t = seoTools[(idx + i) % seoTools.length];
    if (t.slug !== slug) rest.push(t);
  }
  return rest;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(186,215,247,0.12))' }} />
      <span style={{ fontFamily: mono, fontSize: 20, letterSpacing: '0.1em', color: '#c7d3ea', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(186,215,247,0.12), transparent)' }} />
    </div>
  );
}

export function generateStaticParams() {
  return seoTools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getSeoTool(slug);
  if (!tool) return { title: 'Инструмент не найден' };
  return { title: `${tool.name} — бесплатный SEO-инструмент`, description: tool.desc };
}

export default async function SeoToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getSeoTool(slug);
  if (!tool) notFound();
  const c = contentFor(tool);
  const related = relatedTools(slug);

  return (
    <section style={{ position: 'relative', maxWidth: 960, margin: '0 auto', padding: '32px 24px 72px' }}>
      {/* Хлебные крошки */}
      <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.06em', color: '#9da7ba' }}>
        Проверка сайтов → SEO-инструменты → {tool.name}
      </div>

      {/* Hero */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Eyebrow>Бесплатный инструмент</Eyebrow>
        <h1 style={{ fontFamily: dela, fontWeight: 400, fontSize: 'clamp(22px, 3vw, 34px)', lineHeight: 1.1, textTransform: 'uppercase', color: '#d8ecf8', margin: '20px auto 0', maxWidth: 760, textWrap: 'balance' }}>
          {c.heroTitle}
        </h1>
        <p style={{ margin: '16px auto 0', maxWidth: 620, fontSize: 18, color: '#c7d3ea', textWrap: 'pretty' }}>
          {c.heroSub}
        </p>
      </div>

      {/* Форма — client-островок */}
      <SeoToolForm />

      {/* Блок результата */}
      <div style={{ margin: '24px auto 0', maxWidth: 720, borderRadius: 16, background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))', boxShadow: 'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.08em', color: '#9da7ba', textTransform: 'uppercase' }}>Результат · mysite.ru/catalog</div>
          <div style={{ fontSize: 14, color: '#9da7ba' }}>{c.resultSummary}</div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' }}>
          {c.checks.map((r) => (
            <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderTop: '1px solid rgba(186,215,247,0.08)' }}>
              <span style={{ marginTop: 5, width: 10, height: 10, borderRadius: 9999, background: r.status.dot, boxShadow: `0 0 10px ${r.status.glow}`, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#d1e4fa' }}>{r.title}</div>
                <div style={{ marginTop: 2, fontSize: 15, color: '#9da7ba', textWrap: 'pretty' }}>{r.note}</div>
                <div style={{ marginTop: 10, borderRadius: 10, background: 'rgba(102,58,243,0.08)', boxShadow: 'rgba(102,58,243,0.28) 0px 0px 0px 1px inset', padding: '10px 14px' }}>
                  <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.08em', color: '#cbbcff', textTransform: 'uppercase' }}>Рекомендация</div>
                  <div style={{ marginTop: 4, fontSize: 15, color: '#c7d3ea', textWrap: 'pretty' }}>{r.fix}</div>
                  {r.code && (
                    <pre style={{ margin: '10px 0 0', borderRadius: 8, background: 'rgba(199,211,234,0.06)', boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset', padding: '10px 12px', fontFamily: mono, fontSize: 13, lineHeight: 1.5, color: '#b6d9fc', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{r.code}</pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Советы */}
        <div style={{ marginTop: 18, borderRadius: 12, background: 'rgba(17,21,44,0.6)', boxShadow: 'rgba(186,215,247,0.1) 0px 0px 0px 1px inset', padding: '18px 20px' }}>
          <div style={{ fontFamily: mono, fontSize: 13, letterSpacing: '0.1em', color: '#b6d9fc', textTransform: 'uppercase' }}>{c.tipsTitle}</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {c.tips.map((t) => (
              <div key={t} style={{ display: 'flex', gap: 10, fontSize: 15, color: '#c7d3ea' }}>
                <span style={{ color: '#b6d9fc' }}>→</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Кросс-селл в полный аудит */}
        <Link
          href="/seo"
          className="hover-lift"
          style={{ marginTop: 16, height: 48, borderRadius: 999, background: 'rgba(186,214,247,0.06)', boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset', color: '#ffffff', fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
        >
          Полный аудит этой страницы — 50+ проверок →
        </Link>
      </div>

      {/* Врезки состояний формы */}
      <div style={{ margin: '20px auto 0', maxWidth: 720, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ borderRadius: 12, background: 'rgba(17,21,44,0.6)', boxShadow: 'rgba(186,215,247,0.1) 0px 0px 0px 1px inset', padding: 16 }}>
          <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.08em', color: '#9da7ba', textTransform: 'uppercase' }}>Состояние · загрузка</div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#c7d3ea' }}>
            <span style={{ width: 16, height: 16, borderRadius: 999, border: '2.5px solid rgba(255,255,255,0.25)', borderTopColor: '#b6d9fc', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            Загружаем страницу…
          </div>
          <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: 'rgba(186,215,247,0.1)', overflow: 'hidden' }}>
            <div style={{ width: '40%', height: '100%', borderRadius: 999, background: '#663af3', boxShadow: '0 0 12px rgba(102,58,243,0.7)', animation: 'barIndet 1.3s ease-in-out infinite' }} />
          </div>
        </div>
        <div style={{ borderRadius: 12, background: 'rgba(17,21,44,0.6)', boxShadow: 'rgba(186,215,247,0.1) 0px 0px 0px 1px inset', padding: 16 }}>
          <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.08em', color: '#9da7ba', textTransform: 'uppercase' }}>Состояние · ошибка</div>
          <div style={{ marginTop: 12, position: 'relative', borderRadius: 8 }}>
            <input value="htp://bad" disabled style={{ width: '100%', height: 40, border: 'none', borderRadius: 8, background: 'rgba(199,211,234,0.06)', boxShadow: 'rgba(228,109,76,0.5) 0px 0px 0px 1px inset', color: '#c7d3ea', fontSize: 14, fontFamily: 'inherit', padding: '0 12px' }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#e46d4c' }}>Проверьте адрес: похоже, это не ссылка на сайт</div>
        </div>
      </div>

      {/* SEO-текст */}
      <div style={{ maxWidth: 720, margin: '64px auto 0' }}>
        <h2 style={{ fontFamily: dela, fontWeight: 400, fontSize: 'clamp(18px, 2.2vw, 24px)', lineHeight: 1.1, textTransform: 'uppercase', color: '#d8ecf8' }}>{c.seoH2}</h2>
        {c.seoParas.map((p, i) => (
          <p key={i} style={{ margin: i === 0 ? '16px 0 0' : '14px 0 0', fontSize: 17, lineHeight: 1.65, color: '#d1e4fa', textWrap: 'pretty' }}>{p}</p>
        ))}
      </div>

      {/* FAQ — client-островок, первый раскрыт */}
      <div style={{ maxWidth: 720, margin: '64px auto 0' }}>
        <Eyebrow>Вопросы и ответы</Eyebrow>
        <SeoFaq items={faqItems} />
      </div>

      {/* Похожие проверки */}
      <div style={{ maxWidth: 960, margin: '64px auto 0' }}>
        <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: '0.1em', color: '#c7d3ea', textTransform: 'uppercase' }}>Похожие проверки</div>
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {related.map((t) => (
            <Link
              key={t.slug}
              href={`/seo/${t.slug}`}
              className="hover-lift"
              style={{ borderRadius: 16, background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))', boxShadow: 'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px', padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 9999, background: 'rgba(186,214,247,0.06)', boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b6d9fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="4" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#d8ecf8' }}>{t.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
