'use client';

import * as React from 'react';

// Форма инструмента — визуальная копия карточки формы экрана «Инструмент»
// из docs/design-dev/SeoAudit.dc.html (строки 432-444). Заглушка: ввод URL +
// фиолетовая кнопка + бейджи. Реальная логика проверки будет подключена позже.

const mono = "'JetBrains Mono Variable', monospace";

const CornerDot = ({ pos }: { pos: React.CSSProperties }) => (
  <span
    style={{
      position: 'absolute',
      width: 4,
      height: 4,
      borderRadius: 9999,
      background: '#d8ecf8',
      opacity: 0.5,
      boxShadow: '0 0 6px rgba(216,236,248,0.9)',
      ...pos,
    }}
  />
);

export function SeoToolForm() {
  const [url, setUrl] = React.useState('');

  return (
    <div
      style={{
        position: 'relative',
        margin: '32px auto 0',
        maxWidth: 720,
        borderRadius: 16,
        background: 'rgba(17,21,44,0.97)',
        boxShadow:
          'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px, rgba(102,58,243,0.15) 0px 0px 64px 0px',
        padding: '26px 28px',
      }}
    >
      <CornerDot pos={{ top: -2, left: -2 }} />
      <CornerDot pos={{ top: -2, right: -2 }} />
      <CornerDot pos={{ bottom: -2, left: -2 }} />
      <CornerDot pos={{ bottom: -2, right: -2 }} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240, borderRadius: 8 }}>
          <svg
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9da7ba"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21 L16.5 16.5" />
          </svg>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="mysite.ru/catalog"
            inputMode="url"
            aria-label="Адрес страницы"
            style={{
              width: '100%',
              height: 58,
              border: 'none',
              outline: 'none',
              borderRadius: 8,
              background: 'rgba(199,211,234,0.07)',
              boxShadow: 'rgba(102,58,243,0.5) 0px 0px 0px 1px inset',
              color: '#ffffff',
              fontSize: 20,
              fontFamily: 'inherit',
              padding: '0 16px 0 46px',
            }}
          />
        </div>
        <button
          type="button"
          style={{
            height: 58,
            padding: '0 28px',
            border: 'none',
            borderRadius: 999,
            background: '#663af3',
            color: '#ffffff',
            fontFamily: 'inherit',
            fontSize: 17,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'transform 0.3s cubic-bezier(0.2,0.7,0.2,1), background 0.3s ease',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 28px rgba(102,58,243,0.45)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#744ef5';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#663af3';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Проверить
        </button>
      </div>
      <div
        style={{
          marginTop: 14,
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
        <span>Бесплатно</span>
        <span>·</span>
        <span>Без регистрации</span>
      </div>
    </div>
  );
}
