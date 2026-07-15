import * as React from 'react';
import { cn } from '@/lib/utils';

// Eyebrow-лейбл секции: трекнутые капсы, по бокам — гаснущие линии (design-dev).
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      <span className="hidden h-px w-16 bg-gradient-to-r from-transparent to-[rgba(186,215,247,0.12)] sm:block" />
      <span className="eyebrow">{children}</span>
      <span className="hidden h-px w-16 bg-gradient-to-l from-transparent to-[rgba(186,215,247,0.12)] sm:block" />
    </div>
  );
}
