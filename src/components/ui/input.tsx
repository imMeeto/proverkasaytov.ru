import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-md bg-[rgba(199,211,234,0.06)] px-4 text-body text-white hairline outline-none transition-shadow',
        'focus:shadow-[inset_0_0_0_1px_rgba(186,215,247,0.28)]',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
