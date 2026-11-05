import { motion } from 'motion/react';
import { CalendarDays, Check, Flag, Plus } from 'lucide-react';
import { useOrbit } from '@/store/orbit';
import { moveQuest } from '@/store/actions';
import { MILESTONES } from '@/data/journey';
import { ProgressBar } from '@/components/ui/primitives';
import { Tooltip } from '@/components/ui/overlays';
import { useT } from '@/lib/i18n';
import { cn, friendlyDate } from '@/lib/utils';
import { ease } from '@/lib/motion';
import { KIND_ICON, KIND_TONE } from './shared';

export function Roadmap({ highlight, onOpen, onAdd }: { highlight: string | null; onOpen: (id: string) => void; onAdd: (milestone: string) => void }) {
  const quests = useOrbit((s) => s.quests);
  const { t, l } = useT();
  const currentIdx = MILESTONES.findIndex((m) => quests.some((q) => q.milestoneId === m.id && q.status !== 'done'));

  return (
    <ol className="relative space-y-4">
      {MILESTONES.map((m, i) => {
        const qs = quests.filter((q) => q.milestoneId === m.id).sort((a, b) => ({ doing: 0, todo: 1, done: 2 })[a.status] - ({ doing: 0, todo: 1, done: 2 })[b.status] || a.order - b.order);
        const done = qs.filter((q) => q.status === 'done').length;
        const pct = qs.length ? (done / qs.length) * 100 : 0;
        const complete = qs.length > 0 && done === qs.length;
        const current = i === currentIdx;
        const last = i === MILESTONES.length - 1;
        return (
          <motion.li
            key={m.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: i * 0.06 }}
            className="relative grid grid-cols-[40px_1fr] gap-3 sm:grid-cols-[56px_1fr] sm:gap-5"
          >
            {/* Route */}
            <div className="relative flex justify-center">
              {!last && (
                <div className="absolute left-1/2 top-12 bottom-[-20px] w-[3px] -translate-x-1/2 overflow-hidden rounded-full bg-surface-3">
                  <motion.div className="w-full rounded-full bg-gradient-to-b from-green to-green-soft" initial={{ height: 0 }} animate={{ height: complete ? '100%' : current ? `${pct}%` : '0%' }} transition={{ duration: 1, ease, delay: 0.3 + i * 0.1 }} />
                </div>
              )}
              <div
                className={cn(
                  'relative z-10 mt-4 flex size-10 items-center justify-center rounded-full font-display text-[14px] font-bold ring-[5px] ring-background transition-colors sm:size-12',
                  complete ? 'bg-green text-white' : current ? 'bg-orange text-white' : 'border-2 border-border-strong bg-surface text-muted-foreground',
                )}
              >
                {current && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-orange/40" aria-hidden />}
                {complete ? <Check className="size-5" strokeWidth={3} /> : i + 1}
              </div>
            </div>

            {/* Milestone */}
            <div className={cn('card p-4 sm:p-5', current && 'border-orange/35 shadow-hover')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="eyebrow text-[11px]">{t('Stage {n}', 'Tahap {n}', { n: i + 1 })}</span>
                    {current && <span className="rounded-full bg-muted-orange px-2 py-0.5 text-[11px] font-bold text-orange-strong dark:text-orange">{t('You are here', 'Kamu di sini')}</span>}
                    {complete && <span className="rounded-full bg-muted-green px-2 py-0.5 text-[11px] font-bold text-green-strong dark:text-green">{t('Completed', 'Selesai')}</span>}
                  </div>
                  <h3 className="mt-1 font-display text-[18px] font-bold tracking-tight">{l(m.title)}</h3>
                  <p className="text-[13.5px] text-muted-foreground">{l(m.description)}</p>
                </div>
                <div className="flex w-full items-end gap-3 sm:w-auto">
                  <div className="min-w-[140px] flex-1 sm:w-44 sm:flex-none">
                    <div className="mb-1.5 flex justify-between text-[12px] font-semibold text-muted-foreground">
                      <span>{t('Progress', 'Progres')}</span>
                      <span className="tabular">
                        {done}/{qs.length}
                      </span>
                    </div>
                    <ProgressBar value={pct} size="sm" tone={complete ? 'green' : current ? 'orange' : 'neutral'} label={l(m.title)} />
                  </div>
                  <Tooltip content={t('Add a quest to this stage', 'Tambah quest ke tahap ini')}>
                    <button
                      type="button"
                      onClick={() => onAdd(m.id)}
                      aria-label={t('Add quest to {m}', 'Tambah quest ke {m}', { m: l(m.title) })}
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-dashed border-border-strong text-muted-foreground transition hover:border-green hover:bg-muted-green hover:text-green-strong dark:hover:text-green"
                    >
                      <Plus className="size-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              <ul className="mt-4 grid gap-2 lg:grid-cols-2">
                {qs.map((q, qi) => {
                  const Icon = KIND_ICON[q.kind];
                  const hi = highlight === q.id;
                  // An odd last quest spans both columns so no card ever sits alone in half a row.
                  const lone = qs.length % 2 === 1 && qi === qs.length - 1 && qs.length > 1;
                  return (
                    <motion.li
                      layout
                      key={q.id}
                      id={`quest-${q.id}`}
                      className={cn('group flex items-center gap-3 rounded-xl border bg-surface px-3 py-2.5 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-xs', hi ? 'border-orange ring-4 ring-orange/25' : 'border-border', lone && 'lg:col-span-2')}
                    >
                      <button
                        type="button"
                        onClick={() => moveQuest(q.id, q.status === 'done' ? 'doing' : 'done')}
                        aria-label={q.status === 'done' ? t('Reopen “{q}”', 'Buka lagi “{q}”', { q: l(q.title) }) : t('Complete “{q}”', 'Selesaikan “{q}”', { q: l(q.title) })}
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                          q.status === 'done' ? 'border-green bg-green text-white' : q.status === 'doing' ? 'border-orange hover:bg-muted-orange' : 'border-border-strong hover:border-green hover:bg-muted-green',
                        )}
                      >
                        {q.status === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : q.status === 'doing' ? <span className="size-2 rounded-full bg-orange" /> : null}
                      </button>
                      <button type="button" onClick={() => onOpen(q.id)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                        <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', KIND_TONE[q.kind])}>
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn('block truncate text-[13.5px] font-semibold', q.status === 'done' && 'text-muted-foreground line-through')}>{l(q.title)}</span>
                          <span className="flex items-center gap-2 text-[11.5px] text-subtle-foreground">
                            <span className="tabular font-semibold text-orange-strong dark:text-orange">{q.xp} XP</span>
                            <span className="tabular font-semibold text-green-strong dark:text-green">+{q.impact}%</span>
                            {q.due && q.status !== 'done' && (
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="size-3" />
                                {friendlyDate(q.due)}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
                {qs.length === 0 && (
                  <li className="lg:col-span-2">
                    <button type="button" onClick={() => onAdd(m.id)} className="flex min-h-[56px] w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-[13px] font-semibold text-subtle-foreground transition hover:border-green/50 hover:text-green-strong dark:hover:text-green">
                      <Plus className="size-4" /> {t('No quests yet — add the first one', 'Belum ada quest — tambahkan yang pertama')}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </motion.li>
        );
      })}
      <li className="grid grid-cols-[40px_1fr] gap-3 sm:grid-cols-[56px_1fr] sm:gap-5">
        <div className="flex justify-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#13201a] text-white sm:size-12 dark:bg-surface-3">
            <Flag className="size-4" />
          </span>
        </div>
        <div className="flex items-center text-[14px] font-semibold text-muted-foreground">{t('Career-ready — your first role.', 'Siap berkarier — peran pertamamu.')}</div>
      </li>
    </ol>
  );
}
