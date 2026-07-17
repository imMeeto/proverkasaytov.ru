import * as React from 'react';
import Link from 'next/link';
import { ScanForm } from '@/components/scan-form';
import { LeadCapture } from '@/components/lead-capture';
import { articles } from '@/lib/articles';

// Лендинг — точная копия showLanding из docs/design-dev/PravoScan.dc.html.
// Шапка и футер — в layout (SiteHeader/SiteFooter). Здесь — секции героя и ниже.

const dela = "'Dela Gothic One', sans-serif";
const mono = "'JetBrains Mono Variable', monospace";

const glassCard: React.CSSProperties = {
  borderRadius: 16,
  background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
  boxShadow: 'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
  padding: 24,
};

const skywash: React.CSSProperties = {
  background: 'linear-gradient(180deg, #d8ecf8 0%, #98c0ef 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const h2Style: React.CSSProperties = {
  fontFamily: dela,
  fontWeight: 400,
  fontSize: 'clamp(28px, 4vw, 48px)',
  lineHeight: 1.05,
  color: '#d8ecf8',
  margin: '20px auto 0',
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(186,215,247,0.12))' }} />
      <span style={{ fontFamily: mono, fontSize: 15, letterSpacing: '0.1em', color: '#c7d3ea', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(186,215,247,0.12), transparent)' }} />
    </div>
  );
}

// Анимированный коннектор-«циркуит» между секциями.
function Connector({ midY, left, right }: { midY: number; left: number; right: number }) {
  const branchL = `M120 ${midY} H${left} V110`;
  const branchR = `M120 ${midY} H${right} V110`;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 56, pointerEvents: 'none' }}>
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

const fearFacts = [
  { stat: 'до 15 млн ₽', text: 'штраф за утечку персональных данных для юрлиц — после ужесточения 152-ФЗ' },
  { stat: 'без предупреждения', text: 'Роскомнадзор проверяет сайты дистанционно — вы узнаете о нарушении из постановления' },
  { stat: '21 пункт проверки', text: 'формы, документы, cookie, счётчики, авторизация, реквизиты, реклама — всё, к чему цепляются при проверке' },
];

const steps = [
  { n: '01', title: 'Введите адрес сайта', text: 'Два чекбокса-подтверждения — и робот начинает обход. Никакой регистрации.' },
  { n: '02', title: 'Робот сканирует', text: 'До 10 страниц в настоящем браузере: формы, баннеры, скрипты, документы. 30–120 секунд.' },
  { n: '03', title: 'Получите балл и список', text: 'Балл из 100, светофор нарушений и два самых критичных — бесплатно и сразу.' },
];

const compareRows = [
  { crit: 'Цена', us: '700 ₽', lawyer: 'от 15 000 ₽', other: '~1 900 ₽' },
  { crit: 'Срок проверки', us: '30–120 секунд', lawyer: 'от недели', other: '~10 минут' },
  { crit: 'Обход в настоящем браузере', us: '✓ как живой посетитель', lawyer: '—', other: 'частично' },
  { crit: 'Готовые код-сниппеты для исправления', us: '✓', lawyer: '—', other: '—' },
  { crit: 'Требования 2026: авторизация, cookie', us: '✓', lawyer: 'зависит от юриста', other: 'редко' },
  { crit: 'Исправим за вас под ключ', us: '✓ от 20 000 ₽', lawyer: '✓ значительно дороже', other: '—' },
];

const laws = [
  { code: '152-ФЗ', desc: 'персональные данные', x: 72 },
  { code: '149-ФЗ', desc: 'авторизация-2026', x: 252 },
  { code: 'ЗОЗПП', desc: 'права потребителей', x: 432 },
  { code: '436-ФЗ', desc: 'защита детей', x: 612 },
  { code: '38-ФЗ', desc: 'реклама', x: 792 },
];

export default function Home() {
  return (
    <div style={{ position: 'relative' }}>
      {/* ============ HERO ============ */}
      <section style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '72px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -160, left: '50%', transform: 'translateX(-50%)', width: 820, maxWidth: '100vw', height: 680, pointerEvents: 'none', background: 'conic-gradient(from 180deg at 50% 0%, transparent 41%, rgba(186,215,247,0.07) 50%, transparent 59%)' }} />
        <span style={{ position: 'absolute', top: 190, left: '7%', fontFamily: mono, color: 'rgba(216,236,248,0.16)', fontSize: 20, pointerEvents: 'none' }}>×</span>
        <span style={{ position: 'absolute', top: 340, right: '9%', fontFamily: mono, color: 'rgba(216,236,248,0.16)', fontSize: 20, pointerEvents: 'none' }}>×</span>

        <Eyebrow>Проверка сайта по законам РФ</Eyebrow>

        <h1 style={{ ...skywash, fontFamily: dela, fontWeight: 400, fontSize: 'clamp(22px, 3.3vw, 42px)', lineHeight: 1.12, letterSpacing: '0.01em', textTransform: 'uppercase', margin: '24px 0 0' }}>
          Ваш сайт уже нарушает закон.
          <br />
          Вопрос — на сколько.
        </h1>
        <p style={{ margin: '18px 0 0', maxWidth: 760, fontFamily: dela, fontWeight: 400, fontSize: 'clamp(16px, 1.8vw, 22px)', lineHeight: 1.3, color: '#e46d4c', textTransform: 'uppercase' }}>
          Проверьте, за что вас могут оштрафовать уже сейчас до 6 000 000 ₽
        </p>
        <p style={{ margin: '22px 0 0', maxWidth: 680, fontSize: 20, color: '#c7d3ea' }}>
          Штрафы по 152-ФЗ выросли в разы, а Роскомнадзор проверяет сайты без предупреждения. Робот обойдёт до 10 страниц в настоящем браузере и за 30–120 секунд покажет, за что вас могут оштрафовать.
        </p>

        <div id="scan" style={{ width: '100%', display: 'flex', justifyContent: 'center', scrollMarginTop: 24 }}>
          <ScanForm />
        </div>

        {/* circuit board: законы как чипы */}
        <div id="laws" style={{ marginTop: 88, width: '100%', scrollMarginTop: 24 }}>
          <Eyebrow>21 пункт проверки</Eyebrow>
          <svg viewBox="0 0 960 400" style={{ width: '100%', maxWidth: 960, height: 'auto', display: 'block', margin: '20px auto 0' }}>
            <defs>
              <filter id="pGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.2" /></filter>
              <filter id="chipHalo" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="16" /></filter>
              <linearGradient id="chipFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c7d3ea" stopOpacity="0.12" /><stop offset="1" stopColor="#c7d3ea" stopOpacity="0.02" /></linearGradient>
            </defs>
            <circle cx="480" cy="66" r="42" fill="rgba(102,58,243,0.28)" filter="url(#chipHalo)" />
            <g fill="none" stroke="rgba(186,215,247,0.13)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M480 118 L480 182 L120 182 L120 296" />
              <path d="M480 118 L480 182 L300 182 L300 296" />
              <path d="M480 118 L480 296" />
              <path d="M480 118 L480 182 L660 182 L660 296" />
              <path d="M480 118 L480 182 L840 182 L840 296" />
            </g>
            <g fill="none" stroke="#b6d9fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#pGlow)">
              <path d="M480 118 L480 182 L120 182 L120 296" pathLength={300} strokeDasharray="16 284" style={{ animation: 'traceFlow 3s linear infinite' }} />
              <path d="M480 118 L480 182 L300 182 L300 296" pathLength={300} strokeDasharray="16 284" style={{ animation: 'traceFlow 3s linear infinite', animationDelay: '-0.6s' }} />
              <path d="M480 118 L480 296" pathLength={300} strokeDasharray="16 284" style={{ animation: 'traceFlow 3s linear infinite', animationDelay: '-1.2s' }} />
              <path d="M480 118 L480 182 L660 182 L660 296" pathLength={300} strokeDasharray="16 284" style={{ animation: 'traceFlow 3s linear infinite', animationDelay: '-1.8s' }} />
              <path d="M480 118 L480 182 L840 182 L840 296" pathLength={300} strokeDasharray="16 284" style={{ animation: 'traceFlow 3s linear infinite', animationDelay: '-2.4s' }} />
            </g>
            <g fill="rgba(216,236,248,0.4)">
              <circle cx="120" cy="182" r="2.5" /><circle cx="300" cy="182" r="2.5" /><circle cx="660" cy="182" r="2.5" /><circle cx="840" cy="182" r="2.5" />
            </g>
            <g transform="translate(430, 16)">
              <rect width="100" height="100" rx="16" fill="url(#chipFace)" stroke="rgba(186,215,247,0.22)" />
              <rect x="9" y="9" width="82" height="82" rx="11" fill="rgba(17,21,44,0.92)" stroke="rgba(186,215,247,0.1)" />
              <g transform="translate(32, 32) scale(1.5)">
                <path d="M12 2 L20 6 V11 C20 16.5 16.6 20.7 12 22 C7.4 20.7 4 16.5 4 11 V6 Z" fill="rgba(102,58,243,0.22)" stroke="#d1e4fa" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M9 12 L11 14 L15 9.5" fill="none" stroke="#d1e4fa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
            {laws.map((l) => (
              <g key={l.code} transform={`translate(${l.x}, 296)`}>
                <rect width="96" height="60" rx="12" fill="url(#chipFace)" stroke="rgba(186,215,247,0.18)" />
                <circle cx="14" cy="14" r="2" fill="rgba(186,215,247,0.3)" />
                <text x="48" y="37" textAnchor="middle" fill="#d1e4fa" fontFamily={mono} fontSize="17" letterSpacing="1">{l.code}</text>
                <text x="48" y="82" textAnchor="middle" fill="#9da7ba" fontFamily="'Affect', sans-serif" fontSize="13">{l.desc}</text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* ============ FEAR FACTS ============ */}
      <Connector midY={36} left={64} right={176} />
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {fearFacts.map((f) => (
            <div key={f.stat} style={glassCard}>
              <div style={{ ...skywash, fontFamily: dela, fontWeight: 400, fontSize: 34, lineHeight: 1.08 }}>{f.stat}</div>
              <div style={{ marginTop: 12, fontSize: 17, color: '#9da7ba' }}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <Connector midY={44} left={36} right={204} />
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0', textAlign: 'center' }}>
        <Eyebrow>Как это работает</Eyebrow>
        <h2 style={{ ...h2Style, maxWidth: 640 }}>Три минуты — и вы знаете свой риск</h2>
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, textAlign: 'left' }}>
          {steps.map((s) => (
            <div key={s.n} style={glassCard}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(180deg, rgba(199,211,234,0.12), rgba(199,211,234,0.03))', boxShadow: 'rgba(216,236,248,0.2) 0px 1px 1px 0px inset, rgba(186,215,247,0.12) 0px 0px 0px 1px inset, rgba(0,0,0,0.4) 0px 8px 16px 0px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: 16, color: '#d1e4fa' }}>{s.n}</div>
              <div style={{ marginTop: 16, fontSize: 20, fontWeight: 700, color: '#d8ecf8' }}>{s.title}</div>
              <div style={{ marginTop: 8, fontSize: 17, color: '#9da7ba' }}>{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ COMPARISON ============ */}
      <Connector midY={40} left={52} right={188} />
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0', textAlign: 'center' }}>
        <Eyebrow>Почему мы</Eyebrow>
        <h2 style={{ ...h2Style, textTransform: 'uppercase' }}>Чем мы отличаемся</h2>
        <div style={{ marginTop: 48, overflowX: 'auto', textAlign: 'left' }}>
          <div style={{ minWidth: 780, display: 'grid', gridTemplateColumns: '1.35fr 1.1fr 1fr 1fr', borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(180deg, rgba(186,214,247,0.06), rgba(186,214,247,0.02))', boxShadow: 'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px' }}>
            <div style={{ padding: '18px 20px' }} />
            <div style={{ padding: '18px 20px', background: 'rgba(102,58,243,0.14)', boxShadow: 'rgba(102,58,243,0.4) 0px 0px 0px 1px inset' }}>
              <span style={{ ...skywash, fontFamily: dela, fontSize: 13, letterSpacing: '0.02em' }}>ПРОВЕРКАСАЙТОВ.РФ</span>
            </div>
            <div style={{ padding: '18px 20px', fontSize: 15, color: '#9da7ba' }}>Юрист / агентство</div>
            <div style={{ padding: '18px 20px', fontSize: 15, color: '#9da7ba' }}>Другие сканеры</div>
            {compareRows.map((row) => (
              <div key={row.crit} style={{ display: 'contents' }}>
                <div style={{ padding: '16px 20px', fontSize: 16, color: '#9da7ba', boxShadow: 'rgba(186,215,247,0.09) 0px 1px 0px 0px inset' }}>{row.crit}</div>
                <div style={{ padding: '16px 20px', fontSize: 16, fontWeight: 500, color: '#d8ecf8', background: 'rgba(102,58,243,0.14)', boxShadow: 'rgba(102,58,243,0.4) 0px 0px 0px 1px inset' }}>{row.us}</div>
                <div style={{ padding: '16px 20px', fontSize: 16, color: '#c7d3ea', boxShadow: 'rgba(186,215,247,0.09) 0px 1px 0px 0px inset' }}>{row.lawyer}</div>
                <div style={{ padding: '16px 20px', fontSize: 16, color: '#c7d3ea', boxShadow: 'rgba(186,215,247,0.09) 0px 1px 0px 0px inset' }}>{row.other}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <Connector midY={36} left={64} right={176} />
      <section id="pricing" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0', textAlign: 'center', scrollMarginTop: 24 }}>
        <Eyebrow>Цена вопроса</Eyebrow>
        <h2 style={h2Style}>700 ₽ VS ШТРАФЫ</h2>
        <div style={{ position: 'relative', marginTop: 48, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', textAlign: 'left' }}>
          {/* 0 ₽ */}
          <div style={{ ...glassCard, flex: 1, minWidth: 280, maxWidth: 400, padding: 28 }}>
            <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#9da7ba', textTransform: 'uppercase' }}>Бесплатно</div>
            <div style={{ fontFamily: dela, fontSize: 38, color: '#d8ecf8', marginTop: 12 }}>0 ₽</div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, color: '#c7d3ea' }}>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span>Балл риска из 100</span></div>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span>Счётчики: нарушения / замечания / выполнено</span></div>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span>2 самых критичных нарушения полностью</span></div>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#9da7ba' }}>·</span><span style={{ color: '#9da7ba' }}>Остальные — только заголовки</span></div>
            </div>
          </div>
          {/* 700 ₽ */}
          <div style={{ ...glassCard, flex: 1, minWidth: 280, maxWidth: 400, padding: 28 }}>
            <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#c7d3ea', textTransform: 'uppercase' }}>Полный отчёт</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12 }}>
              <div style={{ ...skywash, fontFamily: dela, fontSize: 38 }}>700 ₽</div>
              <div style={{ fontSize: 16, color: '#9da7ba', textDecoration: 'line-through' }}>1 900 ₽ у конкурентов</div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, color: '#c7d3ea' }}>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span>Все нарушения: что нашли / что делать / статья закона</span></div>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span>Готовые код-сниппеты для исправления</span></div>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span>PDF-версия на почту</span></div>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span>Доступ по ссылке — без регистрации</span></div>
            </div>
          </div>
          {/* от 20 000 ₽ */}
          <div style={{ flex: 1, minWidth: 280, maxWidth: 400, borderRadius: 16, background: 'rgba(17,21,44,0.97)', boxShadow: 'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px, rgba(102,58,243,0.28) 0px 0px 56px 0px', padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#c7d3ea', textTransform: 'uppercase' }}>Исправим за вас</div>
              <span style={{ marginLeft: 'auto', borderRadius: 6, background: 'rgba(102,58,243,0.18)', boxShadow: 'rgba(102,58,243,0.45) 0px 0px 0px 1px inset', color: '#cbbcff', fontSize: 13, fontWeight: 700, padding: '4px 10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Рекомендуем</span>
            </div>
            <div style={{ ...skywash, fontFamily: dela, fontSize: 38, marginTop: 12 }}>от 20 000 ₽</div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, color: '#c7d3ea' }}>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span style={{ fontWeight: 700, color: '#d8ecf8' }}>Полный отчёт за 700 ₽ — уже включён</span></div>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span>Доработаем код сайта по всем пунктам отчёта</span></div>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span>Обновим документы: политика, оферта, согласия</span></div>
              <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#269684' }}>✓</span><span>Срок — от 5 рабочих дней, по договору</span></div>
            </div>
            <div style={{ marginTop: 20, borderTop: '1px solid rgba(186,215,247,0.08)', paddingTop: 18 }}>
              <LeadCapture placeholder="телефон или @telegram" buttonLabel="Оставить заявку" sentLabel="Заявка отправлена — свяжемся в течение рабочего дня" successBlock compact />
            </div>
          </div>
        </div>
      </section>

      {/* ============ BLOG ============ */}
      <Connector midY={44} left={36} right={204} />
      <section id="blog" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0', textAlign: 'center', scrollMarginTop: 24 }}>
        <Eyebrow>Блог</Eyebrow>
        <h2 style={{ ...h2Style, textTransform: 'uppercase' }}>Штрафы растут — узнавайте первыми</h2>
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, textAlign: 'left' }}>
          {articles.slice(0, 3).map((a) => (
            <Link key={a.slug} href={`/blog/${a.slug}`} className="hover-lift" style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ borderRadius: 10, background: 'rgba(17,21,44,0.6)', boxShadow: 'rgba(186,215,247,0.1) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px', overflow: 'hidden' }}>
                <svg width="100%" height="96" viewBox="0 0 320 96" fill="none">
                  <g stroke="rgba(186,215,247,0.15)" strokeWidth="1.5" fill="none"><path d="M0 34 H112 M0 62 H112 M320 34 H208 M320 62 H208" /></g>
                  <g fill="none" strokeWidth="2" strokeLinecap="round">
                    <path d="M0 34 H112" pathLength={100} strokeDasharray="22 78" stroke="#663af3" style={{ animation: 'traceFlow 2.6s linear infinite', filter: 'drop-shadow(0 0 4px rgba(102,58,243,0.9))' }} />
                    <path d="M320 62 H208" pathLength={100} strokeDasharray="22 78" stroke="#b6d9fc" style={{ animation: 'traceFlow 2.6s linear infinite', animationDelay: '-1.4s', filter: 'drop-shadow(0 0 4px rgba(182,217,252,0.8))' }} />
                  </g>
                  <rect x="112" y="16" width="96" height="64" rx="12" fill="rgba(17,21,44,0.95)" stroke="rgba(186,215,247,0.22)" />
                  <rect x="119" y="23" width="82" height="50" rx="8" fill="rgba(102,58,243,0.12)" stroke="rgba(186,215,247,0.08)" />
                  <text x="160" y="53" textAnchor="middle" fill="#d1e4fa" fontFamily={mono} fontSize="16" letterSpacing="1">{a.tag}</text>
                </svg>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.06em', color: '#9da7ba' }}>{a.date}</span>
                <span style={{ borderRadius: 6, background: 'rgba(199,211,234,0.12)', padding: '2px 8px', fontSize: 13, fontWeight: 500, color: '#d1e4fa' }}>{a.tag}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#d8ecf8', lineHeight: 1.4 }}>{a.title}</div>
              <div style={{ fontSize: 15, color: '#9da7ba' }}>{a.teaser}</div>
              <span style={{ color: '#b6d9fc', fontSize: 15 }}>Читать →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
