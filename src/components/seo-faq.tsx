'use client';

import * as React from 'react';

// FAQ-аккордеон — визуальная копия блока «Вопросы и ответы» из
// docs/design-dev/SeoAudit.dc.html (строки 397-409). Первый пункт раскрыт.

export interface FaqItem {
  q: string;
  a: string;
}

export function SeoFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = React.useState(0);

  return (
    <div
      style={{
        marginTop: 40,
        borderRadius: 16,
        background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
        boxShadow:
          'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
        overflow: 'hidden',
      }}
    >
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            onClick={() => setOpen(isOpen ? -1 : i)}
            style={{
              padding: '20px 24px',
              borderTop: `1px solid ${i === 0 ? 'transparent' : 'rgba(186,215,247,0.1)'}`,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#d8ecf8' }}>{f.q}</span>
              <span
                style={{
                  color: '#b6d9fc',
                  flexShrink: 0,
                  display: 'inline-block',
                  transform: `rotate(${isOpen ? '180deg' : '0deg'})`,
                  transition: 'transform 0.3s ease',
                }}
              >
                ▾
              </span>
            </div>
            {isOpen && (
              <div style={{ marginTop: 12, fontSize: 16, color: '#c7d3ea', lineHeight: 1.6, textWrap: 'pretty' }}>
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
