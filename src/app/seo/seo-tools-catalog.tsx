'use client';

import * as React from 'react';
import Link from 'next/link';
import { seoTools, seoCategories } from '@/lib/seo-tools';
import { SeoIcon } from './seo-icons';

// Каталог инструментов с фильтром по категориям — копия секции «Все инструменты»
// из docs/design-dev/SeoAudit.dc.html (строки 293-325). 9 карточек, табы-фильтры.

const filterNames = ['Все', ...seoCategories] as const;

export function SeoToolsCatalog() {
  const [filter, setFilter] = React.useState<string>('Все');
  const visible = filter === 'Все' ? seoTools : seoTools.filter((t) => t.category === filter);

  return (
    <>
      <div style={{ marginTop: 40, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {filterNames.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                border: 'none',
                borderRadius: 999,
                background: active ? 'rgba(186,214,247,0.12)' : 'rgba(186,214,247,0.04)',
                boxShadow: active ? 'rgba(186,215,247,0.28) 0px 0px 0px 1px inset' : 'rgba(186,215,247,0.1) 0px 0px 0px 1px inset',
                color: active ? '#ffffff' : '#9da7ba',
                fontFamily: 'inherit',
                fontSize: 15,
                fontWeight: 500,
                padding: '8px 18px',
                cursor: 'pointer',
                transition: 'background 0.3s ease, color 0.2s ease, transform 0.3s cubic-bezier(0.2,0.7,0.2,1)',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#9da7ba'; }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {visible.map((t) => (
          <Link
            key={t.slug}
            href={`/seo/${t.slug}`}
            style={{
              borderRadius: 16,
              background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
              boxShadow: 'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(0.2,0.7,0.2,1), background 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(186,214,247,0.07)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 9999, background: 'rgba(186,214,247,0.06)', boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#b6d9fc' }}>
                <SeoIcon name={t.icon} size={24} />
              </div>
              <span style={{ borderRadius: 6, background: 'rgba(38,150,132,0.12)', boxShadow: 'rgba(38,150,132,0.3) 0px 0px 0px 1px inset', color: '#3fbca6', fontSize: 13, fontWeight: 500, padding: '4px 10px', whiteSpace: 'nowrap' }}>
                Бесплатно
              </span>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#d8ecf8' }}>{t.name}</div>
              <div style={{ marginTop: 6, fontSize: 15, color: '#9da7ba', lineHeight: 1.5, textWrap: 'pretty' }}>{t.desc}</div>
            </div>
            <div style={{ marginTop: 'auto', fontSize: 14, fontWeight: 500, color: '#b6d9fc' }}>Открыть →</div>
          </Link>
        ))}
      </div>
    </>
  );
}
