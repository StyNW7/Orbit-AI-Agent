import * as React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { ease } from '@/lib/motion';

export function Card({ className, interactive, ...props }: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return <div className={cn('card', interactive && 'card-interactive', className)} {...props} />;
}

type Tone = 'green' | 'orange' | 'neutral' | 'danger' | 'info' | 'violet' | 'outline';

const TONES: Record<Tone, string> = {
  green: 'bg-muted-green text-green-strong dark:text-green',
  orange: 'bg-muted-orange text-orange-strong dark:text-orange',
  neutral: 'bg-surface-2 text-muted-foreground',
  danger: 'bg-muted-danger text-danger',
  info: 'bg-muted-info text-info',
  violet: 'bg-muted-violet text-violet',
  outline: 'border border-border text-muted-foreground',
};

export function Badge({ tone = 'neutral', className, dot, children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean }) {
  return (
    <span className={cn('inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-semibold leading-none', TONES[tone], className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function IconBox({ icon: Icon, tone = 'green', size = 'md', className }: { icon: LucideIcon; tone?: Tone; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'size-8 rounded-[10px] [&_svg]:size-4', md: 'size-10 rounded-xl [&_svg]:size-[18px]', lg: 'size-12 rounded-[14px] [&_svg]:size-[22px]' }[size];
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', s, TONES[tone], className)}>
      <Icon aria-hidden />
    </span>
  );
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <kbd className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-surface px-1.5 font-sans text-[11px] font-semibold text-muted-foreground shadow-xs', className)}>{children}</kbd>;
}

export function ProgressBar({
  value,
  className,
  tone = 'green',
  size = 'md',
  label,
  animate = true,
}: {
  value: number;
  className?: string;
  tone?: 'green' | 'orange' | 'gradient' | 'neutral';
  size?: 'xs' | 'sm' | 'md';
  label?: string;
  animate?: boolean;
}) {
  const h = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' }[size];
  const bg = { green: 'bg-green', orange: 'bg-orange', gradient: 'orbit-gradient', neutral: 'bg-foreground/40' }[tone];
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-surface-3', h, className)} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <motion.div
        className={cn('h-full rounded-full', bg)}
        initial={animate ? { width: 0 } : false}
        animate={{ width: `${v}%` }}
        transition={{ duration: 0.9, ease }}
      />
    </div>
  );
}

export function Avatar({ name, hue = 152, size = 36, className }: { name: string; hue?: number; size?: number; className?: string }) {
  return (
    <span
      className={cn('inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-bold text-white ring-2 ring-surface', className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, hsl(${hue} 78% 38%), hsl(${(hue + 40) % 360} 85% 50%))` }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />;
}

export function Divider({ className, vertical }: { className?: string; vertical?: boolean }) {
  return <div role="separator" className={cn(vertical ? 'w-px self-stretch bg-border' : 'h-px w-full bg-border', className)} />;
}

export function Dot({ className }: { className?: string }) {
  return <span aria-hidden className={cn('inline-block size-1 rounded-full bg-subtle-foreground', className)} />;
}
