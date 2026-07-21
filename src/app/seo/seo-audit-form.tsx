'use client';

import * as React from 'react';
import { SeoIcon } from './seo-icons';

// Форма экспресс-аудита — точная копия hub-формы из docs/design-dev/SeoAudit.dc.html
// (строки 118-139). Визуально-интерактивная: клик показывает спиннер и сбрасывается,
// без реального сабмита (MVP — реальный запуск аудита отдельной фазой).

const mono = "'JetBrains Mono Variable', monospace";

const CornerDot = ({ pos }: { pos: React.CSSProperties }) => (
  <span style={{ position: 'absolute', width: 4, height: 4, borderRadius: 9999, background: '#d8ecf8', opacity: 0.5, boxShadow: '0 0 6px rgba(216,236,248,0.9)', ...pos }} />
);

export function SeoAuditForm() {
  const [url, setUrl] = React.useState('');
  const [auditing, setAuditing] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function runAudit() {
    if (auditing) return;
    setAuditing(true);
    timer.current = setTimeout(() => setAuditing(false), 1400);
  }

  return (
    <div
      id="seo-express"
      style={{
        position: 'relative',
        marginTop: 40,
        width: '100%',
        maxWidth: 780,
        borderRadius: 16,
        background: 'rgba(17,21,44,0.97)',
        boxShadow:
          'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px, rgba(102,58,243,0.15) 0px 0px 64px 0px',
        padding: '30px 32px 26px',
        textAlign: 'left',
        scrollMarginTop: 24,
      }}
    >
      <CornerDot pos={{ top: -2, left: -2 }} />
      <CornerDot pos={{ top: -2, right: -2 }} />
      <CornerDot pos={{ bottom: -2, left: -2 }} />
      <CornerDot pos={{ bottom: -2, right: -2 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <SeoIcon name="ic-globe" size={15} style={{ color: '#b6d9fc' }} />
        <span style={{ fontFamily: mono, fontSize: 16, letterSpacing: '0.12em', color: '#b6d9fc', textTransform: 'uppercase' }}>
          Введите адрес страницы — аудит начнётся сразу
        </span>
        <span style={{ width: 8, height: 14, background: '#663af3', animation: 'blinkDot 1.1s steps(1) infinite' }} />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 250, borderRadius: 8, animation: auditing ? undefined : 'inputPulse 2.6s ease-in-out infinite' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9da7ba', display: 'flex' }}>
            <SeoIcon name="ic-search" size={22} />
          </span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runAudit()}
            placeholder="mysite.ru/catalog"
            inputMode="url"
            aria-label="Адрес страницы"
            style={{
              width: '100%',
              height: 66,
              border: 'none',
              outline: 'none',
              borderRadius: 8,
              background: 'rgba(199,211,234,0.07)',
              boxShadow: 'rgba(102,58,243,0.5) 0px 0px 0px 1px inset',
              color: '#ffffff',
              fontSize: 24,
              fontFamily: 'inherit',
              padding: '0 18px 0 52px',
            }}
          />
        </div>
        <button
          onClick={runAudit}
          style={{
            height: 66,
            minWidth: 210,
            padding: '0 30px',
            border: 'none',
            borderRadius: 999,
            background: '#663af3',
            color: '#ffffff',
            fontFamily: 'inherit',
            fontSize: 20,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'transform 0.3s cubic-bezier(0.2,0.7,0.2,1), background 0.3s ease',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 28px rgba(102,58,243,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#744ef5'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#663af3'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {auditing && (
            <span style={{ width: 18, height: 18, borderRadius: 999, border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#ffffff', display: 'inline-block', animation: 'spinSlow 0.7s linear infinite' }} />
          )}
          {auditing ? 'Проверяем…' : 'Проверить бесплатно'}
        </button>
      </div>

      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid rgba(186,215,247,0.08)',
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          fontFamily: mono,
          fontSize: 13,
          letterSpacing: '0.08em',
          color: '#9da7ba',
          textTransform: 'uppercase',
        }}
      >
        <span>Без регистрации</span>
        <span>·</span>
        <span>15 проверок</span>
        <span>·</span>
        <span>~30 секунд</span>
      </div>
    </div>
  );
}
