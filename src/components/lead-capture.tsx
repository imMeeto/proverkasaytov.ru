'use client';

import * as React from 'react';

// Лид-форма из макета: input + фиолетовая кнопка, после отправки — зелёный success-блок.
// MVP: submit только меняет локальное состояние (как в прототипе). Реальная доставка
// заявок/подписок — отдельная фаза; визуально идентично docs/design-dev.

export function LeadCapture({
  placeholder,
  buttonLabel,
  sentLabel,
  successBlock,
  consent,
  compact,
}: {
  placeholder: string;
  buttonLabel: string;
  sentLabel: string;
  successBlock?: boolean;
  consent?: React.ReactNode;
  compact?: boolean;
}) {
  const [value, setValue] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [agreed, setAgreed] = React.useState(!consent);

  if (sent && successBlock) {
    return (
      <div
        style={{
          marginTop: 20,
          borderRadius: 6,
          background: 'rgba(38,150,132,0.08)',
          boxShadow: 'rgba(38,150,132,0.25) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
          padding: '12px 14px',
          fontSize: 15,
          color: '#c7d3ea',
        }}
      >
        <span style={{ color: '#269684' }}>✓</span> {sentLabel}
      </div>
    );
  }

  const h = compact ? 44 : 46;

  return (
    <div style={{ marginTop: compact ? 14 : 10 }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: h,
          border: 'none',
          outline: 'none',
          borderRadius: 6,
          background: 'rgba(199,211,234,0.06)',
          boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
          color: '#ffffff',
          fontSize: 17,
          fontFamily: 'inherit',
          padding: '0 14px',
        }}
      />
      {consent && (
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, fontSize: 13, color: '#9da7ba', cursor: 'pointer' }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: '#663af3' }} />
          <span>{consent}</span>
        </label>
      )}
      <button
        onClick={() => value.trim() && agreed && setSent(true)}
        style={{
          marginTop: 10,
          width: '100%',
          height: h,
          border: 'none',
          borderRadius: 999,
          background: '#663af3',
          boxShadow: '0 0 22px rgba(102,58,243,0.4)',
          color: '#ffffff',
          fontFamily: 'inherit',
          fontSize: 17,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'transform 0.3s cubic-bezier(0.2,0.7,0.2,1), background 0.3s ease',
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
        {sent ? sentLabel : buttonLabel}
      </button>
    </div>
  );
}
