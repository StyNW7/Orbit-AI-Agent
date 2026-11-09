import { useEffect, useId, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { bandOf } from '@/engine/intelligence';
import orbitLogo from '@/assets/orbit-logo.png';

/**
 * Orbit mark — the official logo (assets/orbit-logo.png). `plate` sets it on a white disc so it
 * stays legible on dark or green surfaces; `animated` adds a gentle breathing motion.
 */
export function OrbitMark({ className, animated = false, plate = false }: { className?: string; animated?: boolean; plate?: boolean }) {
  const img = <img src={orbitLogo} alt="" aria-hidden draggable={false} className={cn('size-full select-none object-contain', animated && 'animate-logo-breathe')} />;
  return (
    <span className={cn('inline-flex size-8 shrink-0 items-center justify-center', plate && 'rounded-full bg-white p-[12%] shadow-sm', className)} aria-hidden>
      {img}
    </span>
  );
}

export function Logo({ className, compact = false, markClassName }: { className?: string; compact?: boolean; markClassName?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <OrbitMark className={markClassName} />
      {!compact && <span className="font-display text-[19px] font-extrabold tracking-[-0.03em] text-foreground">Orbit</span>}
    </span>
  );
}

/** Animated number that counts to `value` (and re-animates on change). */
export function AnimatedNumber({ value, decimals = 0, className, suffix = '', prefix = '', duration = 1.1 }: { value: number; decimals?: number; className?: string; suffix?: string; prefix?: string; duration?: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`);
  useEffect(() => {
    const c = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return c.stop;
  }, [mv, value, duration]);
  return <motion.span className={cn('tabular', className)}>{text}</motion.span>;
}

/** Counts up only once the element scrolls into view. */
export function CountUp({ value, decimals = 0, suffix = '', prefix = '', className }: { value: number; decimals?: number; suffix?: string; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  return (
    <span ref={ref} className={className}>
      <AnimatedNumber value={inView ? value : 0} decimals={decimals} suffix={suffix} prefix={prefix} duration={1.4} />
    </span>
  );
}

/** Career Readiness ring with the Orbit gradient. */
export function ReadinessRing({
  score,
  size = 168,
  stroke = 12,
  showBand = true,
  className,
  label,
  track = 'var(--surface-3)',
  textClassName,
}: {
  score: number;
  size?: number;
  stroke?: number;
  showBand?: boolean;
  className?: string;
  label?: string;
  track?: string;
  textClassName?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { t, l } = useT();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const f = requestAnimationFrame(() => setDrawn(Math.max(0, Math.min(100, score))));
    return () => cancelAnimationFrame(f);
  }, [score]);
  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label ?? t('Career Readiness', 'Career Readiness')}: ${Math.round(score)}%`}>
        <defs>
          <linearGradient id={`rg-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0AB46A" />
            <stop offset="60%" stopColor="#3FC06A" />
            <stop offset="100%" stopColor="#FB9002" />
          </linearGradient>
          <filter id={`rgf-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={stroke * 0.6} />
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#rg-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (drawn / 100) * c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          opacity={0.35}
          filter={`url(#rgf-${id})`}
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#rg-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (drawn / 100) * c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn('font-display font-extrabold leading-none tracking-[-0.04em]', textClassName)} style={{ fontSize: size * 0.25 }}>
          <AnimatedNumber value={Math.round(score)} />
          <span className="ml-0.5 align-top text-[0.42em] font-bold text-muted-foreground">%</span>
        </span>
        {showBand && size >= 120 && <span className="mt-1.5 text-[12px] font-semibold text-muted-foreground">{l(bandOf(score))}</span>}
      </div>
    </div>
  );
}

/** Small radial match indicator used on opportunity cards. */
export function MatchRing({ score, size = 44, className }: { score: number; size?: number; className?: string }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 85 ? '#0AB46A' : score >= 70 ? '#3FC06A' : '#FB9002';
  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center', className)} style={{ width: size, height: size }} aria-hidden>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (score / 100) * c }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="tabular absolute text-[12px] font-bold">{score}</span>
    </div>
  );
}
