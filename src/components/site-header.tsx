'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Шапка — точная копия header из docs/design-dev/PravoScan.dc.html (строки 44-57).
// Пункты навигации из макета ведут на реальные экраны.

const nav = [
  { label: 'Главная', href: '/' },
  { label: 'Блог', href: '/blog' },
  { label: 'Оплата', href: '/pay' },
  { label: 'Пример полного отчёта', href: '/example' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  return (
    <header
      style={{
        position: 'relative',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          width: 11,
          height: 11,
          borderRadius: 3,
          background: 'linear-gradient(180deg, rgba(216,236,248,0.4), rgba(152,192,239,0.15))',
          boxShadow: '0 0 10px rgba(186,207,247,0.45)',
        }}
      />
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 9999,
            background: 'rgba(186,214,247,0.06)',
            boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1e4fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 L20 6 V11 C20 16.5 16.6 20.7 12 22 C7.4 20.7 4 16.5 4 11 V6 Z" />
            <path d="M9 12 L11 14 L15 9.5" />
          </svg>
        </span>
        <span
          style={{
            fontFamily: "'Dela Gothic One', sans-serif",
            fontWeight: 400,
            fontSize: 15,
            letterSpacing: '0.02em',
            display: 'inline-flex',
            alignItems: 'baseline',
            textShadow: '0 0 18px rgba(152,192,239,0.35)',
          }}
        >
          <span className="text-skywash">ПРОВЕРКАСАЙТОВ</span>
          <span style={{ color: '#b6d9fc' }}>.РФ</span>
        </span>
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {nav.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.label}
              href={n.href}
              style={{
                borderRadius: 999,
                background: active ? 'rgba(102,58,243,0.35)' : 'transparent',
                color: active ? '#ffffff' : '#9da7ba',
                fontSize: 15,
                fontWeight: 500,
                padding: '7px 14px',
                whiteSpace: 'nowrap',
              }}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
