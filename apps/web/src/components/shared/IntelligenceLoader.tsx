import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { OrbitMark } from '@/components/brand/brand';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';

const STEPS = [
  { en: 'Reading your career profile', id: 'Membaca profil kariermu' },
  { en: 'Mapping your skills', id: 'Memetakan skill-mu' },
  { en: 'Identifying priority gaps', id: 'Mengidentifikasi gap prioritas' },
  { en: 'Connecting opportunities', id: 'Menghubungkan peluang' },
  { en: 'Building your next best action', id: 'Menyusun next best action' },
];

/** Career Intelligence processing — subtle animated step transitions instead of a spinner. */
export function IntelligenceLoader({ onDone, stepMs = 640, className }: { onDone?: () => void; stepMs?: number; className?: string }) {
  const { l, t } = useT();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= STEPS.length) {
      const id = setTimeout(() => onDone?.(), 380);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setStep((s) => s + 1), stepMs);
    return () => clearTimeout(id);
  }, [step, stepMs, onDone]);
  const pct = Math.min(100, (step / STEPS.length) * 100);

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col items-center text-center', className)} role="status" aria-live="polite">
      <div className="relative mb-8 flex size-40 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-dashed border-green/35"
            style={{ inset: i * 18 }}
            animate={{ rotate: i % 2 ? -360 : 360 }}
            transition={{ duration: 14 + i * 6, repeat: Infinity, ease: 'linear' }}
          >
            <span className={cn('absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full', i === 1 ? 'bg-orange' : 'bg-green')} />
          </motion.span>
        ))}
        <div className="absolute inset-12 rounded-full bg-green/20 blur-2xl" />
        <OrbitMark className="relative size-16" animated />
      </div>
      <h2 className="font-display text-[22px] font-bold tracking-tight">{t('Orbit is analysing your career', 'Orbit sedang menganalisis kariermu')}</h2>
      <p className="mt-1.5 text-[14px] text-muted-foreground">{t('Career Intelligence takes a few seconds.', 'Career Intelligence hanya butuh beberapa detik.')}</p>
      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
        <motion.div className="orbit-gradient h-full rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease }} />
      </div>
      <ul className="mt-6 w-full space-y-2.5 text-left">
        {STEPS.map((s, i) => {
          const state = i < step ? 'done' : i === step ? 'active' : 'idle';
          return (
            <motion.li key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: state === 'idle' ? 0.4 : 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 text-[14px]">
              <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full transition-colors', state === 'done' ? 'bg-green text-white' : state === 'active' ? 'bg-muted-green' : 'bg-surface-2')}>
                {state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : state === 'active' ? <span className="size-2 animate-pulse rounded-full bg-green" /> : <span className="size-1.5 rounded-full bg-border-strong" />}
              </span>
              <span className={cn(state === 'active' ? 'font-semibold text-foreground' : state === 'done' ? 'text-muted-foreground' : 'text-subtle-foreground')}>{l(s)}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
