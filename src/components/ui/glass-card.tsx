import * as React from 'react';
import { cn } from '@/lib/utils';

// Фростед-стеклянная карточка (feature). Для приподнятых поверхностей — variant="modal".
export function GlassCard({
  className,
  variant = 'feature',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'feature' | 'modal' }) {
  return (
    <div
      className={cn(variant === 'modal' ? 'glass-modal p-6 sm:p-8' : 'glass-card', className)}
      {...props}
    />
  );
}
