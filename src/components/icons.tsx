import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
};

export function ShieldIcon(props: IconProps) {
  return (
    <svg width={20} height={20} {...base} {...props}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props} className={`animate-spin ${props.className ?? ''}`}>
      <path d="M12 3a9 9 0 109 9" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
