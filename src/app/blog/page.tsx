import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';
import { articles } from '@/lib/articles';

// Экран showBlog из docs/design-dev/PravoScan.dc.html (~строки 989-1042).
// Шапка и футер — в layout (SiteHeader/SiteFooter). Здесь только контент-секция.
// Server-компонент, инлайн-стили дословно из макета; hover-подъём карточек — через класс .hover-lift.

const dela = "'Dela Gothic One', sans-serif";
const mono = "'JetBrains Mono Variable', monospace";

const skywash: React.CSSProperties = {
  background: 'linear-gradient(180deg, #d8ecf8 0%, #98c0ef 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

export const metadata: Metadata = {
  title: 'Блог',
  description:
    'Что меняется в законах и за что штрафуют сайты — простым языком, без юридического тумана.',
};

export default function BlogPage() {
  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(186,215,247,0.12))' }} />
        <span style={{ fontFamily: mono, fontSize: 15, letterSpacing: '0.1em', color: '#c7d3ea', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Блог
        </span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(186,215,247,0.12), transparent)' }} />
      </div>

      <h1 style={{ fontFamily: dela, fontWeight: 400, fontSize: 'clamp(24px, 3.6vw, 38px)', lineHeight: 1.05, textTransform: 'uppercase', textAlign: 'center', margin: '20px 0 0', ...skywash }}>
        Штрафы, законы, проверки
      </h1>
      <p style={{ margin: '14px auto 0', maxWidth: 520, textAlign: 'center', fontSize: 17, color: '#9da7ba', textWrap: 'pretty' }}>
        Что меняется в законах и за что штрафуют сайты — простым языком, без юридического тумана.
      </p>

      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/blog/${a.slug}`}
            className="hover-lift"
            style={{ borderRadius: 16, background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))', boxShadow: 'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px', padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}
          >
            <div style={{ borderRadius: 10, background: 'rgba(17,21,44,0.6)', boxShadow: 'rgba(186,215,247,0.1) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px', overflow: 'hidden', flexShrink: 0, width: 168 }}>
              <svg width="168" height="110" viewBox="0 0 168 110" fill="none">
                <g stroke="rgba(186,215,247,0.15)" strokeWidth="1.5" fill="none">
                  <path d="M0 40 H36 M0 66 H36 M168 40 H132 M168 66 H132 M84 0 V22 M84 110 V88" />
                </g>
                <g fill="none" strokeWidth="2" strokeLinecap="round">
                  <path d="M84 0 V22" pathLength={100} strokeDasharray="40 60" stroke="#663af3" style={{ animation: 'traceFlow 2.2s linear infinite', filter: 'drop-shadow(0 0 4px rgba(102,58,243,0.9))' }} />
                  <path d="M0 66 H36" pathLength={100} strokeDasharray="34 66" stroke="#b6d9fc" style={{ animation: 'traceFlow 2.8s linear infinite', animationDelay: '-1.2s', filter: 'drop-shadow(0 0 4px rgba(182,217,252,0.8))' }} />
                </g>
                <path d="M36 34 H28 M36 55 H28 M36 76 H28 M132 34 H140 M132 55 H140 M132 76 H140" stroke="rgba(186,215,247,0.3)" strokeWidth="2" />
                <rect x="36" y="22" width="96" height="66" rx="12" fill="rgba(17,21,44,0.95)" stroke="rgba(186,215,247,0.22)" />
                <rect x="43" y="29" width="82" height="52" rx="8" fill="rgba(102,58,243,0.12)" stroke="rgba(186,215,247,0.08)" />
                <circle cx="50" cy="36" r="2" fill="rgba(186,215,247,0.35)" />
                <text x="84" y="60" textAnchor="middle" fill="#d1e4fa" fontFamily={mono} fontSize="16" letterSpacing="1">{a.tag}</text>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.06em', color: '#9da7ba' }}>{a.date}</span>
                <span style={{ borderRadius: 6, background: 'rgba(199,211,234,0.12)', padding: '2px 8px', fontSize: 13, fontWeight: 500, color: '#d1e4fa' }}>{a.tag}</span>
              </div>
              <div style={{ marginTop: 10, fontSize: 22, fontWeight: 700, color: '#d8ecf8', lineHeight: 1.4, textWrap: 'pretty' }}>{a.title}</div>
              <div style={{ marginTop: 8, fontSize: 16, color: '#9da7ba', lineHeight: 1.55, textWrap: 'pretty' }}>{a.teaser}</div>
              <div style={{ marginTop: 12, fontSize: 15, fontWeight: 500, color: '#b6d9fc' }}>Читать →</div>
            </div>
          </Link>
        ))}
      </div>

      <p style={{ margin: '40px 0 0', textAlign: 'center', fontSize: 14, color: '#9da7ba' }}>
        Материалы блога носят информационный характер и не являются юридической консультацией.
      </p>
    </section>
  );
}
