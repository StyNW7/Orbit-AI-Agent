import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowUpRight, BellRing, Check, Flag, Trash2, Zap } from 'lucide-react';
import { Sheet } from '@/components/ui/overlays';
import { Badge, ProgressBar } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/tabs';
import { Input } from '@/components/ui/form';
import { ImpactPill } from '@/components/shared/layout-blocks';
import { useOrbit } from '@/store/orbit';
import { deleteQuest, moveQuest } from '@/store/actions';
import { KIND_LABEL, MILESTONE_BY_ID } from '@/data/journey';
import { OPP_BY_ID, TYPE_LABEL } from '@/data/opportunities';
import { SKILL_BY_ID } from '@/data/catalog';
import type { QuestStatus } from '@/data/types';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { KIND_ICON, KIND_TONE, STATUS_LABEL } from './shared';
import type { ReminderTarget } from '@/components/shared/ReminderModal';

export function QuestDrawer({ questId, onClose, onRemind }: { questId: string | null; onClose: () => void; onRemind: (t: ReminderTarget) => void }) {
  const quest = useOrbit((s) => s.quests.find((q) => q.id === questId));
  const toggleStep = useOrbit((s) => s.toggleStep);
  const updateQuest = useOrbit((s) => s.updateQuest);
  const navigate = useNavigate();
  const { t, l } = useT();
  const open = Boolean(questId && quest);
  const q = quest;
  const Icon = q ? KIND_ICON[q.kind] : Zap;
  const done = q ? q.steps.filter((s) => s.done).length : 0;
  const opp = q?.resourceId ? OPP_BY_ID[q.resourceId] : undefined;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={q ? l(q.title) : ''}
      width={480}
      header={
        q && (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold', KIND_TONE[q.kind])}>
                <Icon className="size-3.5" /> {l(KIND_LABEL[q.kind])}
              </span>
              <Badge tone="neutral">
                <Flag className="size-3" /> {l(MILESTONE_BY_ID[q.milestoneId].title)}
              </Badge>
            </div>
            <h2 className="mt-2.5 font-display text-[21px] font-bold leading-tight tracking-tight">{l(q.title)}</h2>
          </div>
        )
      }
      footer={
        q && (
          <div className="flex gap-2">
            {q.status !== 'done' ? (
              <Button className="flex-1" onClick={() => moveQuest(q.id, 'done')}>
                <Check /> {t('Mark complete', 'Tandai selesai')}
              </Button>
            ) : (
              <Button className="flex-1" variant="secondary" onClick={() => moveQuest(q.id, 'doing')}>
                {t('Reopen quest', 'Buka lagi quest')}
              </Button>
            )}
            <Button variant="secondary" onClick={() => onRemind({ title: l(q.title), questId: q.id, suggestedDate: q.due })} aria-label={t('Create reminder', 'Buat pengingat')}>
              <BellRing />
            </Button>
            <Button
              variant="danger-soft"
              onClick={() => {
                onClose();
                deleteQuest(q.id);
              }}
              aria-label={t('Delete quest', 'Hapus quest')}
            >
              <Trash2 />
            </Button>
          </div>
        )
      }
    >
      {q && (
        <div className="space-y-5">
          <p className="text-[14px] leading-relaxed text-muted-foreground">{l(q.description)}</p>
          <Segmented<QuestStatus>
            full
            label={t('Status', 'Status')}
            value={q.status}
            onChange={(v) => moveQuest(q.id, v)}
            options={(['todo', 'doing', 'done'] as QuestStatus[]).map((s) => ({ value: s, label: l(STATUS_LABEL[s]) }))}
          />
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl border border-border bg-surface-2/50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">XP</div>
              <div className="tabular mt-1 font-display text-[18px] font-bold text-orange-strong dark:text-orange">+{q.xp}</div>
            </div>
            <div className="rounded-2xl border border-border bg-surface-2/50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">{t('Impact', 'Dampak')}</div>
              <div className="mt-1.5">
                <ImpactPill value={q.impact} />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface-2/50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">{t('Skill', 'Skill')}</div>
              <div className="mt-1 truncate text-[13.5px] font-semibold">{q.skill && SKILL_BY_ID[q.skill] ? l(SKILL_BY_ID[q.skill].name) : '—'}</div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-subtle-foreground">{t('Steps', 'Langkah')}</span>
              <span className="tabular text-[12.5px] font-semibold text-muted-foreground">
                {done}/{q.steps.length}
              </span>
            </div>
            <ProgressBar value={q.steps.length ? (done / q.steps.length) * 100 : 0} size="sm" className="mb-3" label={t('Steps completed', 'Langkah selesai')} />
            <ul className="space-y-1.5">
              {q.steps.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => toggleStep(q.id, s.id)} aria-pressed={s.done} className="flex w-full items-center gap-3 rounded-xl border border-border px-3.5 py-3 text-left transition hover:border-border-strong hover:bg-surface-2/50">
                    <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition', s.done ? 'border-green bg-green text-white' : 'border-border-strong')}>
                      {s.done && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check className="size-3" strokeWidth={3.5} />
                        </motion.span>
                      )}
                    </span>
                    <span className={cn('text-[14px]', s.done && 'text-muted-foreground line-through')}>{l(s.title)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label htmlFor="q-due" className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-subtle-foreground">
              {t('Due date', 'Tenggat')}
            </label>
            <Input id="q-due" type="date" value={q.due ?? ''} onChange={(e) => updateQuest(q.id, { due: e.target.value || undefined })} />
          </div>

          {opp && (
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/app/discover?open=${opp.id}`);
              }}
              className="group flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left transition hover:border-border-strong hover:bg-surface-2/50"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-bold uppercase tracking-wider text-subtle-foreground">
                  {t('Linked', 'Terhubung')} {l(TYPE_LABEL[opp.type]).toLowerCase()}
                </div>
                <div className="truncate text-[14.5px] font-semibold">{opp.title}</div>
                <div className="truncate text-[12.5px] text-muted-foreground">{opp.org}</div>
              </div>
              <ArrowUpRight className="size-4 text-subtle-foreground transition group-hover:text-foreground" />
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}
