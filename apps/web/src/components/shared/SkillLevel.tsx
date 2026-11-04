import { motion } from 'motion/react';
import { useId } from 'react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { LEVEL_LABEL } from '@/data/catalog';
import type { Level } from '@/data/types';

/** Five-step level picker with the target level marked. */
export function SkillLevelPicker({ value, onChange, target, label }: { value: Level; onChange: (l: Level) => void; target?: Level; label: string }) {
  const { l } = useT();
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-5 gap-1 rounded-xl bg-surface-2 p-1">
      {([0, 1, 2, 3, 4] as Level[]).map((lv) => {
        const active = value === lv;
        return (
          <button
            key={lv}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(lv)}
            className={cn(
              'relative h-8 rounded-[9px] text-[11.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]',
              active ? 'text-white' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && <motion.span layoutId={`lvl-${id}`} className={cn('absolute inset-0 rounded-[9px]', target !== undefined && lv < target ? 'bg-orange' : 'bg-green')} transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative z-10 hidden sm:inline">{l(LEVEL_LABEL[lv])}</span>
            <span className="relative z-10 sm:hidden">{lv}</span>
            {target === lv && !active && <span className="absolute -top-1 right-1 size-1.5 rounded-full bg-green" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

/** Compact level dots. */
export function LevelDots({ level, target, className }: { level: number; target?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 w-4 rounded-full',
            i <= level ? 'bg-green' : target !== undefined && i <= target ? 'bg-orange/35' : 'bg-surface-3',
          )}
        />
      ))}
    </span>
  );
}
