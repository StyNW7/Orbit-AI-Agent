import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Award, Check, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { tr, tx } from '@/lib/i18n';
import { ACHIEVEMENTS } from '@/engine/achievements';

function Burst() {
  const dots = Array.from({ length: 10 });
  return (
    <span className="pointer-events-none absolute left-7 top-7" aria-hidden>
      {dots.map((_, i) => {
        const a = (i / dots.length) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute size-1.5 rounded-full"
            style={{ background: i % 3 === 0 ? '#FB9002' : '#0AB46A' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * 30, y: Math.sin(a) * 30, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />
        );
      })}
    </span>
  );
}

/** The quest-completed moment: satisfying but subtle. */
export function celebrateQuest({ title, xp, delta }: { title: string; xp: number; delta: number }) {
  toast.custom(
    () => (
      <div className="relative flex w-[356px] max-w-[calc(100vw-32px)] items-start gap-3.5 overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-pop">
        <Burst />
        <motion.div
          initial={{ scale: 0.4, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          className="relative flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-green text-white shadow-green"
        >
          <Check className="size-5" strokeWidth={3} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[15px] font-bold">{tr('Quest completed', 'Quest selesai')}</div>
          <div className="truncate text-[13px] text-muted-foreground">{title}</div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="tabular inline-flex h-6 items-center gap-1 rounded-full bg-muted-orange px-2 text-[12px] font-bold text-orange-strong dark:text-orange">
              <Zap className="size-3" />+{xp} XP
            </span>
            {delta > 0 && (
              <span className="tabular inline-flex h-6 items-center gap-1 rounded-full bg-muted-green px-2 text-[12px] font-bold text-green-strong dark:text-green">
                <TrendingUp className="size-3" />
                {tr('Career Readiness', 'Career Readiness')} +{delta}%
              </span>
            )}
          </div>
        </div>
      </div>
    ),
    { duration: 4200 },
  );
}

export function announceAchievements(ids: string[]) {
  ids.forEach((id, i) => {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return;
    setTimeout(() => {
      toast.custom(
        () => (
          <div className="flex w-[356px] max-w-[calc(100vw-32px)] items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-pop">
            <motion.div
              initial={{ scale: 0.5, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 16 }}
              className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-orange to-[#ffb547] text-white shadow-orange"
            >
              <Award className="size-5" />
            </motion.div>
            <div className="min-w-0">
              <div className="text-[11.5px] font-bold uppercase tracking-wider text-orange-strong dark:text-orange">{tr('Achievement unlocked', 'Achievement terbuka')}</div>
              <div className="font-display text-[15px] font-bold">{tx(a.title)}</div>
              <div className="truncate text-[12.5px] text-muted-foreground">{tx(a.description)}</div>
            </div>
          </div>
        ),
        { duration: 4500 },
      );
    }, 900 + i * 700);
  });
}

export function sparkleToast(title: string, description?: string, action?: { label: string; onClick: () => void }) {
  toast.success(title, {
    description,
    icon: <Sparkles className="size-4 text-green" />,
    action: action ? { label: action.label, onClick: action.onClick } : undefined,
  });
}
