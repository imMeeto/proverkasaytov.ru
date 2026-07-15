import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Кнопки дизайн-системы (design-dev): pill-радиус, hairline-бордер, единственный акцент — фиолетовый.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none transition-[background,filter,box-shadow] duration-150 disabled:opacity-45 disabled:pointer-events-none focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(102,58,243,0.6)]',
  {
    variants: {
      variant: {
        ghost:
          'rounded-full bg-[rgba(186,214,247,0.06)] text-white hairline hover:bg-[rgba(186,214,247,0.12)]',
        outline:
          'rounded-full bg-transparent text-frost-glow hairline hover:bg-[rgba(186,214,247,0.06)]',
        primary:
          'rounded-full bg-void-violet text-white hover:brightness-110 shadow-[0_0_24px_rgba(102,58,243,0.35)]',
      },
      size: {
        sm: 'h-9 px-4 text-body-sm',
        md: 'h-11 px-6 text-body-sm',
        lg: 'h-12 px-8 text-body',
      },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
