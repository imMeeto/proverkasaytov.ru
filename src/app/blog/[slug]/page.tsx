import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import * as React from 'react';
import { articles, getArticle, getNextArticle } from '@/lib/articles';

// Экран showArticle из docs/design-dev/PravoScan.dc.html (~строки 1045-1128).
// Шапка и футер — в layout. Server-компонент, инлайн-стили дословно из макета.
// Кнопки-ссылки (CTA → /#scan, «Читать дальше» → следующая статья) вместо onClick-навигации прототипа.

const dela = "'Dela Gothic One', sans-serif";
const mono = "'JetBrains Mono Variable', monospace";
const affect = "'Affect', sans-serif";

const skywash: React.CSSProperties = {
  background: 'linear-gradient(180deg, #d8ecf8 0%, #98c0ef 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const premiumShadow =
  'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px';

const cornerDot: React.CSSProperties = {
  position: 'absolute',
  width: 4,
  height: 4,
  borderRadius: 9999,
  background: '#d8ecf8',
  opacity: 0.5,
  boxShadow: '0 0 6px rgba(216,236,248,0.9)',
};

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: 'Статья не найдена' };
  return { title: article.title, description: article.teaser };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const next = getNextArticle(slug);

  return (
    <section style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 72px' }}>
      {/* Мета: дата · тег · N мин чтения */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontFamily: mono, fontSize: 14, letterSpacing: '0.06em', color: '#9da7ba' }}>
        <span>{article.date}</span>
        <span style={{ borderRadius: 6, background: 'rgba(199,211,234,0.12)', padding: '2px 8px', fontSize: 13, fontWeight: 500, color: '#d1e4fa', fontFamily: affect }}>{article.tag}</span>
        <span>·</span>
        <span>{article.read} чтения</span>
      </div>

      <h1 style={{ fontFamily: dela, fontWeight: 400, fontSize: 'clamp(24px, 3.4vw, 38px)', lineHeight: 1.1, textTransform: 'uppercase', margin: '20px 0 0', textWrap: 'balance', ...skywash }}>
        {article.title}
      </h1>
      <p style={{ margin: '20px 0 0', fontSize: 20, lineHeight: 1.6, color: '#c7d3ea', textWrap: 'pretty' }}>
        {article.lead}
      </p>

      {/* SVG-обложка с тегом */}
      <div style={{ marginTop: 28, borderRadius: 16, background: 'rgba(17,21,44,0.6)', boxShadow: 'rgba(186,215,247,0.1) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px', overflow: 'hidden' }}>
        <svg width="100%" height="150" viewBox="0 0 720 150" fill="none" preserveAspectRatio="xMidYMid slice">
          <g stroke="rgba(186,215,247,0.15)" strokeWidth="1.5" fill="none">
            <path d="M0 50 H288 M0 100 H288 M720 50 H432 M720 100 H432 M360 0 V33 M360 150 V117" />
            <path d="M60 50 V14 M148 100 V138 M580 50 V14 M650 100 V138" />
          </g>
          <g fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M0 50 H288" pathLength={100} strokeDasharray="16 84" stroke="#663af3" style={{ animation: 'traceFlow 3s linear infinite', filter: 'drop-shadow(0 0 4px rgba(102,58,243,0.9))' }} />
            <path d="M720 100 H432" pathLength={100} strokeDasharray="16 84" stroke="#b6d9fc" style={{ animation: 'traceFlow 3.4s linear infinite', animationDelay: '-1.5s', filter: 'drop-shadow(0 0 4px rgba(182,217,252,0.8))' }} />
            <path d="M360 0 V33" pathLength={100} strokeDasharray="40 60" stroke="#663af3" style={{ animation: 'traceFlow 2.2s linear infinite', animationDelay: '-0.8s', filter: 'drop-shadow(0 0 4px rgba(102,58,243,0.9))' }} />
          </g>
          <path d="M288 44 H280 M288 75 H280 M288 106 H280 M432 44 H440 M432 75 H440 M432 106 H440" stroke="rgba(186,215,247,0.3)" strokeWidth="2" />
          <rect x="288" y="33" width="144" height="84" rx="14" fill="rgba(17,21,44,0.95)" stroke="rgba(186,215,247,0.22)" />
          <rect x="296" y="41" width="128" height="68" rx="9" fill="rgba(102,58,243,0.12)" stroke="rgba(186,215,247,0.08)" />
          <circle cx="304" cy="49" r="2" fill="rgba(186,215,247,0.35)" />
          <text x="360" y="82" textAnchor="middle" fill="#d1e4fa" fontFamily={mono} fontSize="18" letterSpacing="1">{article.tag}</text>
        </svg>
      </div>

      {/* Callout — border-left оранжевый */}
      <div style={{ marginTop: 28, borderRadius: 16, borderLeft: '3px solid rgba(228,109,76,0.55)', background: 'linear-gradient(180deg, rgba(228,109,76,0.1), rgba(228,109,76,0.04))', boxShadow: 'rgba(228,109,76,0.25) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px', padding: '24px 28px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: dela, fontSize: 'clamp(26px, 3.4vw, 40px)', lineHeight: 1.05, color: '#e46d4c', whiteSpace: 'nowrap' }}>{article.calloutBig}</div>
        <div style={{ flex: 1, minWidth: 220, fontSize: 16, lineHeight: 1.5, color: '#c7d3ea', textWrap: 'pretty' }}>{article.calloutText}</div>
      </div>

      {/* Секции: H2 + параграф */}
      {article.sections.map((s) => (
        <div key={s.h}>
          <h2 style={{ fontFamily: dela, fontWeight: 400, fontSize: 'clamp(19px, 2.4vw, 25px)', lineHeight: 1.1, textTransform: 'uppercase', color: '#d8ecf8', margin: '44px 0 0' }}>{s.h}</h2>
          <p style={{ margin: '16px 0 0', fontSize: 18, lineHeight: 1.65, color: '#c7d3ea', textWrap: 'pretty' }}>{s.p}</p>
        </div>
      ))}

      {/* Что сделать прямо сейчас — зелёные галочки */}
      <div style={{ marginTop: 44, borderRadius: 16, background: 'rgba(17,21,44,0.97)', boxShadow: premiumShadow, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: 9999, background: '#269684', boxShadow: '0 0 12px rgba(38,150,132,0.8)', flexShrink: 0 }} />
          <div style={{ fontFamily: dela, fontSize: 19, lineHeight: 1.1, textTransform: 'uppercase', color: '#d8ecf8' }}>Что сделать прямо сейчас</div>
        </div>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 17, color: '#c7d3ea' }}>
          {article.todo.map((t) => (
            <div key={t} style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: '#269684' }}>✓</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA-карточка */}
      <div style={{ position: 'relative', marginTop: 28, borderRadius: 16, background: 'rgba(17,21,44,0.97)', boxShadow: `${premiumShadow}, rgba(102,58,243,0.28) 0px 0px 56px 0px`, padding: 32, textAlign: 'center' }}>
        <span style={{ ...cornerDot, top: -2, left: -2 }} />
        <span style={{ ...cornerDot, top: -2, right: -2 }} />
        <span style={{ ...cornerDot, bottom: -2, left: -2 }} />
        <span style={{ ...cornerDot, bottom: -2, right: -2 }} />
        <div style={{ fontFamily: dela, fontSize: 'clamp(20px, 2.6vw, 28px)', lineHeight: 1.1, textTransform: 'uppercase', ...skywash }}>А ваш сайт прошёл бы проверку?</div>
        <div style={{ marginTop: 12, fontSize: 17, color: '#9da7ba' }}>21 пункт проверки за 2 минуты. Балл риска и два критичных нарушения — бесплатно.</div>
        <Link href="/#scan" className="hover-cta" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 20, height: 54, padding: '0 32px', borderRadius: 999, background: '#663af3', boxShadow: '0 0 28px rgba(102,58,243,0.5)', color: '#ffffff', fontSize: 17, fontWeight: 700 }}>
          Проверить свой сайт бесплатно
        </Link>
      </div>

      {/* Читать дальше — следующая статья по кругу */}
      <div style={{ marginTop: 44 }}>
        <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#9da7ba', textTransform: 'uppercase' }}>Читать дальше</div>
        <Link
          href={`/blog/${next.slug}`}
          className="hover-lift"
          style={{ marginTop: 14, borderRadius: 16, background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))', boxShadow: 'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <span style={{ borderRadius: 6, background: 'rgba(199,211,234,0.12)', padding: '2px 8px', fontSize: 13, fontWeight: 500, color: '#d1e4fa', flexShrink: 0 }}>{next.tag}</span>
          <span style={{ flex: 1, fontSize: 17, fontWeight: 700, color: '#d8ecf8', lineHeight: 1.4 }}>{next.title}</span>
          <span style={{ color: '#b6d9fc', fontSize: 20, flexShrink: 0 }}>→</span>
        </Link>
      </div>

      <p style={{ margin: '36px 0 0', fontSize: 14, color: '#9da7ba', textWrap: 'pretty' }}>
        Материал носит информационный характер и не является юридической консультацией. Актуальность требований проверяйте на момент чтения.
      </p>
    </section>
  );
}
