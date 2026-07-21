import * as React from 'react';

// Иконки-символы из макета docs/design-dev/SeoAudit.dc.html (<symbol id="ic-…">),
// перенесённые в inline-SVG. Используются и хабом (server), и каталогом (client).

const paths: Record<string, React.ReactNode> = {
  'ic-shield': (
    <>
      <path d="M12 2 L20 6 V11 C20 16.5 16.6 20.7 12 22 C7.4 20.7 4 16.5 4 11 V6 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12 L11 14 L15 9.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'ic-meta': <path d="M9.5 7 L4 12 L9.5 17 M14.5 7 L20 12 L14.5 17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  'ic-speed': (
    <>
      <path d="M4.5 18 a9 9 0 1 1 15 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 14 L16 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="14" r="1.4" fill="currentColor" />
    </>
  ),
  'ic-ssl': (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11 V7.5 a4 4 0 0 1 8 0 V11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />
    </>
  ),
  'ic-robots': (
    <>
      <rect x="5" y="8" width="14" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 5 V8 M9 13 h0.01 M15 13 h0.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1.2" fill="currentColor" />
    </>
  ),
  'ic-sitemap': (
    <>
      <rect x="9" y="3" width="6" height="5" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="16" width="6" height="5" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="15" y="16" width="6" height="5" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8 V12 M6 16 V12 H18 V16" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  'ic-redirect': <path d="M4 8 H16 a4 4 0 0 1 0 8 H9 M9 16 L12 13 M9 16 L12 19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  'ic-brokenlink': (
    <>
      <path d="M9 12 H15 M10 8 H8 a4 4 0 0 0 0 8 h2 M14 8 h2 a4 4 0 0 1 0 8 h-2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 3 V5 M12 19 V21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  'ic-globe': (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12 H21 M12 3 C15 6.5 15 17.5 12 21 C9 17.5 9 6.5 12 3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  'ic-link': <path d="M10 14 a4 4 0 0 0 6 0 l3 -3 a4 4 0 0 0 -6 -6 l-1.5 1.5 M14 10 a4 4 0 0 0 -6 0 l-3 3 a4 4 0 0 0 6 6 l1.5 -1.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
  'ic-search': (
    <>
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M21 21 L16.5 16.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
};

export function SeoIcon({ name, size = 24, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {paths[name] ?? null}
    </svg>
  );
}
