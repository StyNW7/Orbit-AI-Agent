import { useId } from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

/** Segmented control with an animated selection indicator. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = 'md',
  label,
  full,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentOption<T>[];
  className?: string;
  size?: 'sm' | 'md';
  label: string;
  full?: boolean;
}) {
  const id = useId();
  return (
    <div role="tablist" aria-label={label} className={cn('inline-flex rounded-[14px] border border-border bg-surface-2 p-1', full && 'flex w-full', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]',
              size === 'sm' ? 'h-8 px-3 text-[12.5px]' : 'h-9 px-4 text-[13.5px]',
              full && 'flex-1',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-[10px] bg-surface shadow-[0_1px_3px_rgba(16,32,24,0.1)] dark:bg-surface-3" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {o.icon && <o.icon className="size-4" aria-hidden />}
              {o.label}
              {o.count !== undefined && <span className="tabular text-[11.5px] text-subtle-foreground">{o.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Pill filter chips with an animated active background. */
export function FilterChips<T extends string>({
  value,
  onChange,
  options,
  className,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentOption<T>[];
  className?: string;
  label: string;
}) {
  const id = useId();
  return (
    <div role="tablist" aria-label={label} className={cn('no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13.5px] font-semibold transition-[color,border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]',
              active ? 'border-transparent text-white dark:text-[#0c1310]' : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground',
            )}
          >
            {active && <motion.span layoutId={`chip-${id}`} className="absolute inset-0 rounded-full bg-[#13201a] dark:bg-[#e7efea]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {o.icon && <o.icon className="size-4" aria-hidden />}
              {o.label}
              {o.count !== undefined && <span className={cn('tabular text-[11.5px]', active ? 'opacity-70' : 'text-subtle-foreground')}>{o.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
