import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LeadCapture } from '@/components/lead-capture';
import { SeoIcon } from './seo-icons';
import { SeoAuditForm } from './seo-audit-form';
import { SeoToolsCatalog } from './seo-tools-catalog';
import { SeoFaq } from './seo-faq';

// Хаб SEO-сервиса — точная копия экрана «Хаб SEO» (showHub) из docs/design-dev/SeoAudit.dc.html.
// Шапка/футер и фон страницы — в layout. Здесь секции героя и ниже.
// Интерактив вынесен в client-островки: seo-audit-form, seo-tools-catalog, seo-faq; лид-формы — LeadCapture.

export const metadata: Metadata = {
  title: 'SEO-аудит сайта онлайн: проверка скорости, SSL и мета-тегов',
  description:
    'Бесплатный экспресс-аудит страницы: 15 проверок — мета-теги, Core Web Vitals, SSL, безопасность. Без регистрации, за 30 секунд.',
};

const dela = "'Dela Gothic One', sans-serif";
const mono = "'JetBrains Mono Variable', monospace";

const skywash: React.CSSProperties = {
  background: 'linear-gradient(180deg, #d8ecf8 0%, #98c0ef 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const glassCard: React.CSSProperties = {
  borderRadius: 16,
  background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
  boxShadow: 'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
  padding: 24,
};

const h2Style: React.CSSProperties = {
  fontFamily: dela,
  fontWeight: 400,
  fontSize: 'clamp(28px, 4vw, 48px)',
  lineHeight: 1.05,
  textTransform: 'uppercase',
  color: '#d8ecf8',
  margin: '20px auto 0',
};

function Eyebrow({ children, maxW = 480 }: { children: React.ReactNode; maxW?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: maxW, margin: '0 auto' }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(186,215,247,0.12))' }} />
      <span style={{ fontFamily: mono, fontSize: 20, letterSpacing: '0.1em', color: '#c7d3ea', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(186,215,247,0.12), transparent)' }} />
    </div>
  );
}

// Анимированный коннектор-«дорожка» между секциями (мотив traceFlow из системы).
function Connector({ midY, left, right, pt = 56 }: { midY: number; left: number; right: number; pt?: number }) {
  const branchL = `M120 ${midY} H${left} V110`;
  const branchR = `M120 ${midY} H${right} V110`;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: pt, pointerEvents: 'none' }}>
      <svg width="240" height="110" viewBox="0 0 240 110" fill="none">
        <g stroke="rgba(186,215,247,0.13)" strokeWidth="1.5" fill="none">
          <path d="M120 0 V110" />
          <path d={branchL} />
          <path d={branchR} />
        </g>
        <g fill="none" strokeWidth="2" strokeLinecap="round">
          <path d="M120 0 V110" pathLength={300} strokeDasharray="24 276" stroke="#663af3" style={{ animation: 'traceFlow 2.6s linear infinite', filter: 'drop-shadow(0 0 5px rgba(102,58,243,0.9))' }} />
          <path d={branchL} pathLength={300} strokeDasharray="20 280" stroke="#b6d9fc" style={{ animation: 'traceFlow 3.2s linear infinite', animationDelay: '-1.3s', filter: 'drop-shadow(0 0 4px rgba(182,217,252,0.8))' }} />
          <path d={branchR} pathLength={300} strokeDasharray="20 280" stroke="#b6d9fc" style={{ animation: 'traceFlow 3.2s linear infinite', animationDelay: '-2.1s', filter: 'drop-shadow(0 0 4px rgba(182,217,252,0.8))' }} />
        </g>
        <g fill="rgba(216,236,248,0.45)">
          <circle cx="120" cy={midY} r="2.5" />
          <circle cx={left} cy="110" r="2" />
          <circle cx={right} cy="110" r="2" />
          <circle cx="120" cy="110" r="2" />
        </g>
      </svg>
    </div>
  );
}

const CornerDot = ({ pos }: { pos: React.CSSProperties }) => (
  <span style={{ position: 'absolute', width: 4, height: 4, borderRadius: 9999, background: '#d8ecf8', opacity: 0.5, boxShadow: '0 0 6px rgba(216,236,248,0.9)', ...pos }} />
);

function Check({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <span style={{ color: '#269684' }}>✓</span>
      <span>{children}</span>
    </div>
  );
}

const categories = [
  { name: 'Мета-теги', icon: 'ic-meta' },
  { name: 'Скорость и CWV', icon: 'ic-speed' },
  { name: 'SSL', icon: 'ic-ssl' },
  { name: 'Security-заголовки', icon: 'ic-shield' },
  { name: 'robots и sitemap', icon: 'ic-robots' },
  { name: 'Ссылки', icon: 'ic-link' },
];

const steps = [
  { n: '1', title: 'Вставьте адрес страницы', text: 'Любой URL вашего сайта. Регистрация не нужна.' },
  { n: '2', title: 'Робот проверяет по 15 параметрам', text: 'Загружает страницу в настоящем браузере и снимает метрики.' },
  { n: '3', title: 'Получите балл и список проблем', text: 'Балл из 100, светофор по категориям и что чинить в первую очередь.' },
];

const blog = [
  { date: '12.07.2026', tag: 'Core Web Vitals', title: 'Core Web Vitals в 2026: как скорость влияет на позиции', teaser: 'LCP, CLS и INP простыми словами — что замеряет Google и как быстро всё исправить.' },
  { date: '05.07.2026', tag: 'SEO', title: 'Мета-теги, которые крадут ваш трафик', teaser: 'Пустые Description и дубли Title режут кликабельность сниппета. Разбираем на примерах.' },
  { date: '28.06.2026', tag: 'Индексация', title: 'robots.txt и sitemap: как случайно закрыть сайт от поиска', teaser: 'Одна строка в robots.txt может убрать сайт из выдачи. Как проверить и не потерять трафик.' },
];

const cardDark: React.CSSProperties = {
  position: 'relative',
  borderRadius: 16,
  background: 'rgba(17,21,44,0.97)',
  boxShadow: 'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px',
};

export default function SeoHub() {
  return (
    <div style={{ position: 'relative' }}>
      {/* ============ HERO ============ */}
      <section style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '72px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Eyebrow maxW={620}>SEO-инструменты проверки сайтов</Eyebrow>

        <h1 style={{ ...skywash, fontFamily: dela, fontWeight: 400, fontSize: 'clamp(24px, 3.8vw, 46px)', lineHeight: 1.1, textTransform: 'uppercase', margin: '24px 0 0', maxWidth: 900, textWrap: 'balance' }}>
          Проверьте сайт онлайн: SEO, скорость, SSL и безопасность
        </h1>
        <p style={{ margin: '20px 0 0', maxWidth: 680, fontSize: 20, color: '#c7d3ea', textWrap: 'pretty' }}>
          Бесплатный экспресс-аудит страницы: 15 проверок — мета-теги, Core Web Vitals, SSL, безопасность. Без регистрации, за 30 секунд.
        </p>
        <p style={{ margin: '18px 0 0', maxWidth: 760, fontFamily: dela, fontWeight: 400, fontSize: 'clamp(16px, 1.8vw, 22px)', lineHeight: 1.3, color: '#e46d4c', textTransform: 'uppercase', textWrap: 'balance' }}>
          Узнайте, из-за чего вы теряете позиции и трафик в поиске
        </p>

        <SeoAuditForm />

        {/* service switcher — сегмент-контрол между сервисами (активна SEO) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <div style={{ display: 'inline-flex', gap: 3, borderRadius: 999, background: 'rgba(186,214,247,0.06)', boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset', padding: 4 }}>
            <Link href="/" style={{ borderRadius: 999, background: 'transparent', color: '#9da7ba', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, padding: '12px 26px', whiteSpace: 'nowrap' }}>
              Проверка на законы РФ
            </Link>
            <span style={{ borderRadius: 999, background: 'rgba(102,58,243,0.35)', color: '#ffffff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, padding: '12px 26px', whiteSpace: 'nowrap' }}>
              Проверка на SEO
            </span>
          </div>
        </div>

        {/* in-section connector */}
        <Connector midY={36} left={64} right={176} pt={8} />

        {/* circuit board: categories */}
        <div style={{ marginTop: 32, width: '100%' }}>
          <Eyebrow>Что проверяем</Eyebrow>
          <div style={{ position: 'relative', marginTop: 36, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'absolute', top: 32, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(186,215,247,0.16) 15%, rgba(186,215,247,0.16) 85%, transparent)', pointerEvents: 'none' }} />
            {categories.map((c) => (
              <div key={c.name} style={{ position: 'relative', width: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                <div style={{ width: 64, height: 64, borderRadius: 9999, background: 'rgba(17,21,44,0.97)', boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(102,58,243,0.12) 0px 0px 20px 0px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b6d9fc' }}>
                  <SeoIcon name={c.icon} size={26} />
                </div>
                <span style={{ fontSize: 15, color: '#c7d3ea', lineHeight: 1.3 }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <Connector midY={44} left={36} right={204} />
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0', textAlign: 'center' }}>
        <Eyebrow>Как это работает</Eyebrow>
        <h2 style={h2Style}>Три шага до результата</h2>
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, textAlign: 'left' }}>
          {steps.map((s) => (
            <div key={s.n} style={glassCard}>
              <div style={{ fontFamily: dela, fontSize: 34, color: '#b6d9fc', lineHeight: 1 }}>{s.n}</div>
              <div style={{ marginTop: 14, fontSize: 18, fontWeight: 700, color: '#d8ecf8' }}>{s.title}</div>
              <div style={{ marginTop: 8, fontSize: 15, color: '#9da7ba', textWrap: 'pretty' }}>{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <Connector midY={44} left={36} right={204} />
      <div id="seo-pricing" style={{ position: 'relative', top: -80 }} />
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0', textAlign: 'center' }}>
        <Eyebrow>Тарифы</Eyebrow>
        <h2 style={h2Style}>Лучшая стоимость тарифов среди конкурентов</h2>
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'center', textAlign: 'left' }}>
          {/* Экспресс-аудит */}
          <div style={{ ...glassCard, padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#9da7ba', textTransform: 'uppercase' }}>Экспресс-аудит</div>
            <div style={{ fontFamily: dela, fontSize: 30, fontWeight: 400, color: '#d8ecf8', marginTop: 10 }}>0 ₽</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 6, background: 'rgba(228,109,76,0.12)', boxShadow: 'rgba(228,109,76,0.3) 0px 0px 0px 1px inset', color: '#e46d4c', fontSize: 14, fontWeight: 700, padding: '4px 10px' }}>⚠ Проверяет только одну страницу</span>
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15, color: '#c7d3ea' }}>
              <Check>Аудит одной страницы</Check>
              <Check>15 проверок за 30 секунд</Check>
              <Check>Балл и светофор категорий</Check>
            </div>
            <div style={{ marginTop: 18 }}>
              <a href="#seo-express" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 46, borderRadius: 999, background: 'rgba(186,214,247,0.06)', boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset', color: '#ffffff', fontFamily: 'inherit', fontSize: 15, fontWeight: 500 }}>Проверить бесплатно</a>
            </div>
          </div>

          {/* Полный аудит */}
          <div style={{ ...cardDark, padding: '26px 28px' }}>
            <CornerDot pos={{ top: -2, left: -2 }} />
            <CornerDot pos={{ top: -2, right: -2 }} />
            <CornerDot pos={{ bottom: -2, left: -2 }} />
            <CornerDot pos={{ bottom: -2, right: -2 }} />
            <h3 style={{ fontFamily: dela, fontWeight: 400, fontSize: 'clamp(20px, 2.4vw, 26px)', lineHeight: 1.08, color: '#d8ecf8', textTransform: 'uppercase', margin: '14px 0 0' }}>Проверьте весь сайт целиком</h3>
            <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#9da7ba', textTransform: 'uppercase', marginTop: 8 }}>Полный аудит · доступ навсегда</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ ...skywash, fontFamily: dela, fontSize: 46, fontWeight: 400, lineHeight: 1 }}>от 390 ₽</div>
              <span style={{ borderRadius: 6, background: 'rgba(38,150,132,0.12)', boxShadow: 'rgba(38,150,132,0.3) 0px 0px 0px 1px inset', color: '#3fbca6', fontSize: 15, fontWeight: 700, padding: '4px 10px' }}>−80% в сравнении с агентством</span>
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15, color: '#c7d3ea' }}>
              <Check>50+ проверок на всех страницах сайта</Check>
              <Check>Приоритизация: что чинить первым</Check>
              <Check>PDF-отчёт для команды или подрядчика</Check>
            </div>
            <div style={{ marginTop: 20, borderTop: '1px solid rgba(186,215,247,0.08)', paddingTop: 18 }}>
              <label style={{ fontSize: 15, color: '#9da7ba' }}>Почта для получения отчёта</label>
              <LeadCapture placeholder="you@company.ru" buttonLabel="Открыть полный SEO отчёт" sentLabel="Отчёт отправлен на почту ✓" />
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', fontFamily: mono, fontSize: 13, letterSpacing: '0.06em', color: '#9da7ba', textTransform: 'uppercase' }}>
                <span>карта или СБП</span>
                <span>·</span>
                <span>без регистрации</span>
              </div>
            </div>
          </div>

          {/* Мониторинг */}
          <div style={{ ...cardDark, boxShadow: `${cardDark.boxShadow as string}, rgba(102,58,243,0.28) 0px 0px 56px 0px`, padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
            <CornerDot pos={{ top: -2, left: -2 }} />
            <CornerDot pos={{ top: -2, right: -2 }} />
            <CornerDot pos={{ bottom: -2, left: -2 }} />
            <CornerDot pos={{ bottom: -2, right: -2 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: dela, fontWeight: 400, fontSize: 'clamp(20px, 2.4vw, 26px)', lineHeight: 1.08, color: '#d8ecf8', textTransform: 'uppercase' }}>Мониторинг вашего сайта 24/7</div>
            </div>
            <div style={{ ...skywash, fontFamily: dela, fontSize: 30, fontWeight: 400, marginTop: 10 }}>от 199 ₽/мес</div>
            <div style={{ marginTop: 12 }}>
              <span style={{ display: 'inline-block', borderRadius: 999, background: 'rgba(102,58,243,0.2)', boxShadow: 'rgba(102,58,243,0.5) 0px 0px 0px 1px inset', color: '#cbbcff', fontSize: 12, fontWeight: 700, padding: '5px 12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Рекомендуем</span>
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15, color: '#c7d3ea' }}>
              <Check>Uptime и срок SSL — круглосуточно</Check>
              <Check>Отслеживание SEO-изменений</Check>
              <Check>Алерты в Telegram при проблемах</Check>
            </div>
            <div style={{ marginTop: 18 }}>
              <LeadCapture placeholder="телефон или @telegram" buttonLabel="Начать мониторинг" sentLabel="Заявка отправлена — свяжемся в течение рабочего дня" successBlock compact />
              <div style={{ marginTop: 10, fontSize: 14, color: '#9da7ba', textAlign: 'center' }}>Напишем или позвоним Вам сами в течение рабочего дня</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TOOLS CATALOG ============ */}
      <Connector midY={36} left={64} right={176} />
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <Eyebrow>Все инструменты</Eyebrow>
          <h2 style={{ ...h2Style, textAlign: 'center' }}>Бесплатные проверки сайта</h2>
        </div>
        <SeoToolsCatalog />
      </section>

      {/* ============ BLOG ============ */}
      <Connector midY={36} left={64} right={176} />
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0', textAlign: 'center' }}>
        <Eyebrow>Блог</Eyebrow>
        <h2 style={h2Style}>SEO простым языком</h2>
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, textAlign: 'left' }}>
          {blog.map((a) => (
            <Link key={a.title} href="/blog" className="hover-lift" style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ borderRadius: 10, background: 'rgba(17,21,44,0.6)', boxShadow: 'rgba(186,215,247,0.1) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px', overflow: 'hidden' }}>
                <svg width="100%" height="96" viewBox="0 0 320 96" fill="none">
                  <g stroke="rgba(186,215,247,0.15)" strokeWidth="1.5" fill="none"><path d="M0 34 H112 M0 62 H112 M320 34 H208 M320 62 H208" /></g>
                  <g fill="none" strokeWidth="2" strokeLinecap="round">
                    <path d="M0 34 H112" pathLength={100} strokeDasharray="22 78" stroke="#663af3" style={{ animation: 'traceFlow 2.6s linear infinite', filter: 'drop-shadow(0 0 4px rgba(102,58,243,0.9))' }} />
                    <path d="M320 62 H208" pathLength={100} strokeDasharray="22 78" stroke="#b6d9fc" style={{ animation: 'traceFlow 2.6s linear infinite', animationDelay: '-1.4s', filter: 'drop-shadow(0 0 4px rgba(182,217,252,0.8))' }} />
                  </g>
                  <path d="M112 28 H104 M112 48 H104 M112 68 H104 M208 28 H216 M208 48 H216 M208 68 H216" stroke="rgba(186,215,247,0.3)" strokeWidth="2" />
                  <rect x="112" y="16" width="96" height="64" rx="12" fill="rgba(17,21,44,0.95)" stroke="rgba(186,215,247,0.22)" />
                  <rect x="119" y="23" width="82" height="50" rx="8" fill="rgba(102,58,243,0.12)" stroke="rgba(186,215,247,0.08)" />
                  <circle cx="126" cy="30" r="2" fill="rgba(186,215,247,0.35)" />
                  <text x="160" y="53" textAnchor="middle" fill="#d1e4fa" fontFamily={mono} fontSize="13" letterSpacing="1">{a.tag}</text>
                </svg>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.06em', color: '#9da7ba' }}>{a.date}</span>
                <span style={{ borderRadius: 6, background: 'rgba(199,211,234,0.12)', padding: '2px 8px', fontSize: 13, fontWeight: 500, color: '#d1e4fa' }}>{a.tag}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#d8ecf8', lineHeight: 1.35, textWrap: 'pretty' }}>{a.title}</div>
              <div style={{ fontSize: 15, color: '#9da7ba', lineHeight: 1.5, textWrap: 'pretty' }}>{a.teaser}</div>
              <span style={{ marginTop: 'auto', fontSize: 14, fontWeight: 500, color: '#b6d9fc' }}>Читать →</span>
            </Link>
          ))}
        </div>
        <Link href="/blog" style={{ display: 'inline-block', marginTop: 28, borderRadius: 999, background: 'rgba(186,214,247,0.06)', boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset', color: '#ffffff', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, padding: '10px 24px' }}>Все статьи</Link>
      </section>

      {/* ============ LEGAL CROSS-SELL ============ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', borderRadius: 16, background: 'linear-gradient(180deg, rgba(186,214,247,0.09), rgba(186,214,247,0.035))', boxShadow: 'rgba(216,236,248,0.16) 0px 1px 1px 0px inset, rgba(186,215,247,0.2) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px, rgba(102,58,243,0.15) 0px 0px 48px 0px', padding: '40px 44px', display: 'flex', alignItems: 'center', gap: 30, flexWrap: 'wrap' }}>
          <div style={{ width: 76, height: 76, borderRadius: 9999, flexShrink: 0, background: 'rgba(186,214,247,0.06)', boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(102,58,243,0.15) 0px 0px 22px 0px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b6d9fc' }}>
            <SeoIcon name="ic-shield" size={36} />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontFamily: dela, fontWeight: 400, fontSize: 'clamp(24px, 2.8vw, 34px)', lineHeight: 1.08, color: '#d8ecf8', textTransform: 'uppercase' }}>Нужна проверка вашего сайта по законам РФ?</div>
            <div style={{ marginTop: 12, fontSize: 18, color: '#c7d3ea', textWrap: 'pretty' }}>152-ФЗ, cookie-баннер, оферта — бесплатный юридический скан по 21 пункту</div>
          </div>
          <Link href="/" style={{ flexShrink: 0, borderRadius: 999, background: '#663af3', boxShadow: '0 0 28px rgba(102,58,243,0.5)', color: '#ffffff', fontFamily: 'inherit', fontSize: 18, fontWeight: 700, padding: '18px 32px' }}>Проверить по законам РФ →</Link>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 0' }}>
        <Eyebrow>Вопросы и ответы</Eyebrow>
        <SeoFaq />
      </section>
    </div>
  );
}
