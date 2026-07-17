'use client';

import * as React from 'react';

// Островок копирования из макета (docs/design-dev/PravoScan.dc.html): кнопка
// «Копировать» → «Скопировано ✓» с navigator.clipboard. Используется для сниппетов,
// чек-листа и ссылки на отчёт на странице примера /example.

const clipboardIcon = (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15 V5 a2 2 0 0 1 2 -2 h10" />
  </svg>
);

export function CopyButton({
  text,
  label,
  copiedLabel = 'Скопировано ✓',
  style,
  hoverBg,
  withIcon,
}: {
  text: string;
  label: string;
  copiedLabel?: string;
  style: React.CSSProperties;
  hoverBg: string;
  withIcon?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const idleBg = String(style.background ?? '');

  const handleClick = () => {
    try {
      void navigator.clipboard?.writeText(text)?.catch(() => {});
    } catch {
      /* clipboard может быть недоступен вне защищённого контекста */
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={style}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = idleBg;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {withIcon ? clipboardIcon : null}
      {copied ? copiedLabel : label}
    </button>
  );
}
