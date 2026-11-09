import { useEffect, useRef, type ReactNode } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useT, intlLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';
import { SOURCE_BY_ID } from './data';

/** Count-up number formatted for the active locale (7.38 / 7,38). */
export function Num({ value, decimals = 0, prefix = '', className, duration = 1.6 }: { value: number; decimals?: number; prefix?: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const { locale } = useT();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${prefix}${v.toLocaleString(intlLocale(locale), { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`);
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, value, { duration, ease });
    return c.stop;
  }, [inView, mv, value, duration]);
  return (
    <motion.span ref={ref} className={cn('tabular', className)}>
      {text}
    </motion.span>
  );
}

/** Chapter marker: “01 — The facts”. */
export function Chapter({ n, label, tone = 'green', center, light }: { n: string; label: string; tone?: 'green' | 'orange'; center?: boolean; light?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease }}
      className={cn('flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.16em]', center && 'justify-center')}
    >
      <span className={cn('tabular', tone === 'green' ? 'text-green' : 'text-orange')}>{n}</span>
      <span className={cn('h-px w-10', light ? 'bg-white/25' : 'bg-border-strong')} aria-hidden />
      <span className={light ? 'text-white/60' : 'text-muted-foreground'}>{label}</span>
    </motion.div>
  );
}

export function Heading({ children, className, center }: { children: ReactNode; className?: string; center?: boolean }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.6, ease }}
      className={cn('mt-4 font-display text-[32px] font-extrabold leading-[1.06] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]', center && 'mx-auto text-center', className)}
    >
      {children}
    </motion.h2>
  );
}

export function Lead({ children, className, center }: { children: ReactNode; className?: string; center?: boolean }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.6, ease, delay: 0.08 }}
      className={cn('mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground sm:text-[18px]', center && 'mx-auto text-center', className)}
    >
      {children}
    </motion.p>
  );
}

/** Small citation chip linking to the source. */
export function SourceChip({ id, className, light }: { id: string; className?: string; light?: boolean }) {
  const s = SOURCE_BY_ID[id];
  const { t } = useT();
  if (!s) return null;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        'group inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition',
        light ? 'border-white/15 text-white/70 hover:border-white/30 hover:text-white' : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground',
        className,
      )}
      aria-label={t('Source: {org}, {year} (opens in a new tab)', 'Sumber: {org}, {year} (buka di tab baru)', { org: s.org, year: s.year })}
    >
      <span className="truncate">
        {s.org} · {s.year}
      </span>
      <ArrowUpRight className="size-3 shrink-0 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
    </a>
  );
}
