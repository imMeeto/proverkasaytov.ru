'use client';

import * as React from 'react';

// Островок «обзор SEO-отчёта» из макета docs/design-dev/SeoAudit.dc.html
// (экран data-screen-label="SEO-отчёт", блоки report header + PageSpeed lighthouse).
// Единственное интерактивное место экрана — табы «Компьютер / Мобильные устройства»:
// переключают набор демо-данных (балл, кольца категорий, лабораторные метрики), как в
// прототипе (state.reportDevice). Данные и формулы колец — дословно из <script> макета.

const dela = "'Dela Gothic One', sans-serif";
const mono = "'JetBrains Mono Variable', monospace";

type Tok = 'gold' | 'red' | 'green';
const COLOR: Record<Tok, string> = { gold: '#d9a84c', red: '#e46d4c', green: '#269684' };
const GLOW: Record<Tok, string> = {
  gold: 'rgba(217,168,76,0.9)',
  red: 'rgba(228,109,76,0.9)',
  green: 'rgba(38,150,132,0.9)',
};

// Балл → цвет: ≥90 зелёный, ≥50 жёлтый, иначе красный (scoreDot/scoreGlow из макета).
function scoreTok(n: number): Tok {
  return n >= 90 ? 'green' : n >= 50 ? 'gold' : 'red';
}

interface DeviceData {
  seoScore: number;
  psTitle: string;
  lighthouse: { name: string; score: number }[];
  lab: [string, string, string, Tok][]; // [аббревиатура, полное имя, значение, цвет]
}

const DATA: Record<'desktop' | 'mobile', DeviceData> = {
  desktop: {
    seoScore: 68,
    psTitle: 'Оценки по методике проверки скорости · на компьютере',
    lighthouse: [
      { name: 'Производительность', score: 64 },
      { name: 'Доступность', score: 88 },
      { name: 'Лучшие практики', score: 78 },
      { name: 'SEO', score: 82 },
    ],
    lab: [
      ['FCP', 'First Contentful Paint', '1,8 с', 'gold'],
      ['Speed Index', 'Индекс скорости', '3,4 с', 'gold'],
      ['LCP', 'Largest Contentful Paint', '4,1 с', 'red'],
      ['TBT', 'Total Blocking Time', '320 мс', 'gold'],
      ['CLS', 'Cumulative Layout Shift', '0,08', 'green'],
      ['TTI', 'Time to Interactive', '4,6 с', 'red'],
    ],
  },
  mobile: {
    seoScore: 51,
    psTitle: 'Оценки по методике проверки скорости · на мобильных устройствах',
    lighthouse: [
      { name: 'Производительность', score: 42 },
      { name: 'Доступность', score: 85 },
      { name: 'Лучшие практики', score: 74 },
      { name: 'SEO', score: 80 },
    ],
    lab: [
      ['FCP', 'First Contentful Paint', '2,9 с', 'gold'],
      ['Speed Index', 'Индекс скорости', '6,1 с', 'red'],
      ['LCP', 'Largest Contentful Paint', '5,8 с', 'red'],
      ['TBT', 'Total Blocking Time', '610 мс', 'red'],
      ['CLS', 'Cumulative Layout Shift', '0,12', 'gold'],
      ['TTI', 'Time to Interactive', '7,2 с', 'red'],
    ],
  },
};

const modalShadow =
  'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px';

const tabs: { key: 'desktop' | 'mobile'; label: string }[] = [
  { key: 'desktop', label: 'Компьютер' },
  { key: 'mobile', label: 'Мобильные устройства' },
];

export function SeoReportOverview() {
  const [device, setDevice] = React.useState<'desktop' | 'mobile'>('desktop');
  const d = DATA[device];
  const scoreOffset = 540 * (1 - d.seoScore / 100);

  return (
    <div>
      {/* Табы устройства */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div
          style={{
            display: 'inline-flex',
            gap: 3,
            borderRadius: 999,
            background: 'rgba(186,214,247,0.06)',
            boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
            padding: 4,
          }}
        >
          {tabs.map((t) => {
            const active = device === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setDevice(t.key)}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  background: active ? 'rgba(102,58,243,0.35)' : 'transparent',
                  color: active ? '#ffffff' : '#9da7ba',
                  fontFamily: 'inherit',
                  fontSize: 18,
                  fontWeight: 700,
                  padding: '14px 30px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease, background 0.3s ease',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Шапка отчёта: домен + дата + вердикт + кольцо балла */}
      <div
        style={{
          borderRadius: 16,
          background: 'rgba(17,21,44,0.97)',
          boxShadow: modalShadow,
          padding: 32,
          display: 'flex',
          gap: 36,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1
            style={{
              fontFamily: dela,
              fontWeight: 400,
              fontSize: 'clamp(22px, 2.6vw, 28px)',
              lineHeight: 1.1,
              color: '#d8ecf8',
              margin: 0,
            }}
          >
            mysite.ru
          </h1>
          <div style={{ marginTop: 10, fontFamily: mono, fontSize: 14, letterSpacing: '0.06em', color: '#9da7ba' }}>
            Аудит главной страницы · 20.07.2026
          </div>
          <div
            style={{
              marginTop: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              borderRadius: 6,
              background: 'rgba(217,168,76,0.1)',
              boxShadow: 'rgba(217,168,76,0.28) 0px 0px 0px 1px inset',
              padding: '8px 14px',
              fontSize: 15,
              fontWeight: 700,
              color: '#d9a84c',
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 9999,
                background: '#d9a84c',
                boxShadow: '0 0 10px rgba(217,168,76,0.9)',
              }}
            />
            Средний уровень — есть что улучшить
          </div>
        </div>
        <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
          <svg width="180" height="180" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(186,215,247,0.1)" strokeWidth="12" />
            <circle
              cx="100"
              cy="100"
              r="86"
              fill="none"
              stroke="#d9a84c"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="540"
              strokeDashoffset={scoreOffset}
              transform="rotate(-90 100 100)"
              style={{ filter: 'drop-shadow(0 0 6px rgba(217,168,76,0.6))' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontFamily: dela, fontSize: 50, fontWeight: 400, lineHeight: 1, color: '#d9a84c' }}>
              {d.seoScore}
            </div>
            <div style={{ fontSize: 13, color: '#9da7ba', marginTop: 4 }}>из 100</div>
          </div>
        </div>
      </div>

      {/* PageSpeed / Lighthouse: под-кольца категорий + лабораторные метрики */}
      <div style={{ marginTop: 16, borderRadius: 16, background: 'rgba(17,21,44,0.97)', boxShadow: modalShadow, padding: 28 }}>
        <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#9da7ba', textTransform: 'uppercase' }}>
          {d.psTitle}
        </div>
        <div
          style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
          }}
        >
          {d.lighthouse.map((l) => {
            const tok = scoreTok(l.score);
            const offset = 314 * (1 - l.score / 100);
            return (
              <div key={l.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', width: 110, height: 110 }}>
                  <svg width="110" height="110" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(186,215,247,0.1)" strokeWidth="9" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={COLOR[tok]}
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="314"
                      strokeDashoffset={offset}
                      transform="rotate(-90 60 60)"
                      style={{ filter: `drop-shadow(0 0 5px ${GLOW[tok]})` }}
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: dela,
                      fontSize: 30,
                      color: COLOR[tok],
                    }}
                  >
                    {l.score}
                  </div>
                </div>
                <span style={{ fontSize: 14, color: '#c7d3ea', textAlign: 'center', lineHeight: 1.3 }}>{l.name}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(186,215,247,0.1)' }}>
          <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#9da7ba', textTransform: 'uppercase' }}>
            Лабораторные метрики
          </div>
          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 10,
            }}
          >
            {d.lab.map((m) => {
              const [name, full, val, tok] = m;
              return (
                <div
                  key={name}
                  style={{
                    borderRadius: 12,
                    background: 'rgba(199,211,234,0.05)',
                    boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 9999,
                        background: COLOR[tok],
                        boxShadow: `0 0 8px ${GLOW[tok]}`,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontFamily: mono, fontSize: 13, letterSpacing: '0.04em', color: '#9da7ba' }}>{name}</span>
                  </div>
                  <div style={{ marginTop: 8, fontFamily: dela, fontSize: 22, color: '#d8ecf8' }}>{val}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#9da7ba' }}>{full}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
