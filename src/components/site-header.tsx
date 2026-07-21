'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Шапка — точная копия header из docs/design-dev (PravoScan.dc.html / SeoAudit.dc.html).
// Адаптивна по силосу: на /seo/* — навигация SEO-сервиса, иначе — юридического.

type NavItem = { label: string; href: string };

const lawNav: NavItem[] = [
  { label: 'Главная', href: '/' },
  { label: 'Тарифы', href: '/#pricing' },
  { label: 'Пример полного отчёта', href: '/example' },
  { label: 'Блог', href: '/blog' },
];

const seoNav: NavItem[] = [
  { label: 'Главная', href: '/seo' },
  { label: 'Инструменты', href: '/seo#tools' },
  { label: 'Тарифы', href: '/seo#pricing' },
  { label: 'Пример полного отчёта', href: '/seo/example' },
  { label: 'Блог', href: '/blog' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isSeo = pathname === '/seo' || pathname.startsWith('/seo/');
  const nav = isSeo ? seoNav : lawNav;
  const home = isSeo ? '/seo' : '/';
  const subtitle = isSeo ? 'ПО SEO ОПТИМИЗАЦИИ' : 'НА ЗАКОНЫ РФ';

  const isActive = (href: string) => {
    const base = href.split('#')[0];
    if (base === home) return pathname === home;
    return base !== '' && pathname === base;
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(17,21,44,0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(186,215,247,0.1)',
        padding: '20px max(24px, calc((100vw - 1280px) / 2))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <Link href={home} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: 9999,
            background: 'rgba(186,214,247,0.06)',
            boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1e4fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 L20 6 V11 C20 16.5 16.6 20.7 12 22 C7.4 20.7 4 16.5 4 11 V6 Z" />
            <path d="M9 12 L11 14 L15 9.5" />
          </svg>
        </span>
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
          <span
            style={{
              fontFamily: "'Dela Gothic One', sans-serif",
              fontSize: 17,
              letterSpacing: '0.02em',
              display: 'inline-flex',
              alignItems: 'baseline',
              textShadow: '0 0 18px rgba(152,192,239,0.35)',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(90deg, #98c0ef, #d8ecf8, #e5ddff, #d8ecf8, #98c0ef)',
                backgroundSize: '250% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'sheen 4.5s linear infinite',
              }}
            >
              ПРОВЕРКАСАЙТОВ
            </span>
            <span style={{ color: '#b6d9fc' }}>.РФ</span>
          </span>
          <span style={{ fontFamily: "'Dela Gothic One', sans-serif", fontSize: 11, letterSpacing: '0.16em', color: '#9da7ba' }}>
            {subtitle}
          </span>
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
                fontSize: 17,
                fontWeight: 500,
                padding: '9px 16px',
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
