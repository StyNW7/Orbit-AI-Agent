import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold',
    'transition-[background-color,color,box-shadow,transform,border-color,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]',
    'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-green text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_20px_-10px_rgba(10,180,106,0.85)] hover:-translate-y-px hover:bg-green-strong hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_14px_28px_-12px_rgba(10,180,106,0.9)]',
        accent:
          'bg-orange text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_-10px_rgba(251,144,2,0.85)] hover:-translate-y-px hover:bg-orange-strong',
        gradient: 'orbit-gradient-button text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_26px_-12px_rgba(10,180,106,0.9)] hover:-translate-y-px hover:brightness-[1.06]',
        secondary:
          'border border-border bg-surface text-foreground shadow-xs hover:-translate-y-px hover:border-border-strong hover:bg-surface-2 hover:shadow-card',
        soft: 'bg-muted-green text-green-strong hover:bg-[color-mix(in_oklab,var(--muted-green),var(--orbit-green)_14%)] dark:text-green',
        'soft-orange': 'bg-muted-orange text-orange-strong hover:bg-[color-mix(in_oklab,var(--muted-orange),var(--orbit-orange)_14%)] dark:text-orange',
        ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
        outline: 'border border-border-strong bg-transparent text-foreground hover:bg-surface-2',
        danger: 'bg-danger text-white hover:brightness-95',
        'danger-soft': 'bg-muted-danger text-danger hover:brightness-95',
        link: 'h-auto px-0 text-green-strong underline-offset-4 hover:underline active:scale-100 dark:text-green',
        dark: 'bg-[#13201a] text-white hover:-translate-y-px hover:bg-[#1c2d25] dark:bg-white dark:text-[#13201a] dark:hover:bg-white/90',
      },
      size: {
        xs: 'h-8 rounded-[10px] px-3 text-[12.5px] [&_svg]:size-3.5',
        sm: 'h-9 rounded-[11px] px-3.5 text-[13px] [&_svg]:size-4',
        md: 'h-11 rounded-xl px-5 text-[14px] [&_svg]:size-4',
        lg: 'h-12 rounded-[14px] px-6 text-[15px] [&_svg]:size-[18px]',
        xl: 'h-14 rounded-2xl px-7 text-[16px] [&_svg]:size-5',
        icon: 'size-10 rounded-xl [&_svg]:size-[18px]',
        'icon-sm': 'size-9 rounded-[11px] [&_svg]:size-4',
        'icon-xs': 'size-8 rounded-[10px] [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  success?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, success = false, children, disabled, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <Loader2 className="animate-spin" aria-hidden /> : success ? <Check aria-hidden /> : null}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
