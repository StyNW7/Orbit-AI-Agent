import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, Check, CheckCircle2, Circle, GripVertical, MoreHorizontal, Play, Plus, Trash2, Zap } from 'lucide-react';
import { useOrbit } from '@/store/orbit';
import { deleteQuest, moveQuest } from '@/store/actions';
import { MILESTONE_BY_ID } from '@/data/journey';
import type { Quest, QuestStatus } from '@/data/types';
import { useT } from '@/lib/i18n';
import { cn, daysUntil, friendlyDate } from '@/lib/utils';
import { DropdownContent, DropdownItem, DropdownMenu, DropdownSeparator, DropdownTrigger } from '@/components/ui/overlays';
import { ProgressBar } from '@/components/ui/primitives';
import { COLUMNS, KIND_ICON, KIND_TONE, STATUS_LABEL } from './shared';

const COL_STYLE: Record<QuestStatus, { dot: string; icon: typeof Circle; ring: string }> = {
  todo: { dot: 'bg-subtle-foreground', icon: Circle, ring: 'ring-border-strong' },
  doing: { dot: 'bg-orange', icon: Play, ring: 'ring-orange/40' },
  done: { dot: 'bg-green', icon: CheckCircle2, ring: 'ring-green/40' },
};

function QuestCardView({ q, dragging, highlight, onOpen, handleProps }: { q: Quest; dragging?: boolean; highlight?: boolean; onOpen?: () => void; handleProps?: Record<string, unknown> }) {
  const { t, l } = useT();
  const Icon = KIND_ICON[q.kind];
  const done = q.steps.filter((s) => s.done).length;
  const d = daysUntil(q.due);
  return (
    <div
      className={cn(
        'group relative rounded-2xl border bg-surface p-4 shadow-xs transition-[box-shadow,border-color,transform]',
        dragging ? 'rotate-[1.5deg] scale-[1.02] border-green shadow-pop' : 'border-border hover:border-border-strong hover:shadow-card',
        highlight && 'ring-4 ring-orange/40',
        q.status === 'done' && 'bg-surface/70',
      )}
    >
      {highlight && <span className="absolute -right-1.5 -top-1.5 size-3 animate-pulse rounded-full bg-orange" aria-hidden />}
      <div className="flex items-start gap-2.5">
        <button type="button" {...handleProps} className="-ml-1.5 mt-0.5 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-subtle-foreground opacity-60 transition hover:bg-surface-2 hover:opacity-100 active:cursor-grabbing" aria-label={t('Drag to move', 'Seret untuk memindahkan')}>
          <GripVertical className="size-4" />
        </button>
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn('inline-flex h-5 items-center gap-1 rounded-full px-2 text-[11px] font-semibold', KIND_TONE[q.kind])}>
              <Icon className="size-3" />
              {l(MILESTONE_BY_ID[q.milestoneId].title)}
            </span>
          </div>
          <div className={cn('mt-2 text-[14.5px] font-semibold leading-snug', q.status === 'done' && 'text-muted-foreground line-through decoration-subtle-foreground/60')}>{l(q.title)}</div>
        </button>
        <DropdownMenu>
          <DropdownTrigger asChild>
            <button type="button" className="-mr-1.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-subtle-foreground transition hover:bg-surface-2 hover:text-foreground" aria-label={t('Quest actions', 'Aksi quest')}>
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownTrigger>
          <DropdownContent>
            {q.status !== 'todo' && (
              <DropdownItem onSelect={() => moveQuest(q.id, 'todo')}>
                <Circle /> {t('Move to To do', 'Pindah ke To do')}
              </DropdownItem>
            )}
            {q.status !== 'doing' && (
              <DropdownItem onSelect={() => moveQuest(q.id, 'doing')}>
                <Play /> {q.status === 'done' ? t('Reopen', 'Buka lagi') : t('Start quest', 'Mulai quest')}
              </DropdownItem>
            )}
            {q.status !== 'done' && (
              <DropdownItem onSelect={() => moveQuest(q.id, 'done')}>
                <Check /> {t('Mark complete', 'Tandai selesai')}
              </DropdownItem>
            )}
            <DropdownSeparator />
            <DropdownItem danger onSelect={() => deleteQuest(q.id)}>
              <Trash2 /> {t('Delete', 'Hapus')}
            </DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      </div>
      {q.steps.length > 0 && q.status !== 'done' && (
        <div className="mt-3 flex items-center gap-2 pl-6">
          <ProgressBar value={(done / q.steps.length) * 100} size="xs" tone={q.status === 'doing' ? 'orange' : 'neutral'} label={t('Steps', 'Langkah')} animate={false} />
          <span className="tabular shrink-0 text-[11px] font-semibold text-subtle-foreground">
            {done}/{q.steps.length}
          </span>
        </div>
      )}
      <div className="mt-3 flex items-center gap-3 pl-6 text-[12px]">
        <span className="tabular inline-flex items-center gap-1 font-semibold text-orange-strong dark:text-orange">
          <Zap className="size-3" />
          {q.xp} XP
        </span>
        <span className="tabular font-semibold text-green-strong dark:text-green">+{q.impact}%</span>
        {q.due && q.status !== 'done' && (
          <span className={cn('ml-auto inline-flex items-center gap-1', d !== null && d <= 3 ? 'font-semibold text-orange-strong dark:text-orange' : 'text-subtle-foreground')}>
            <CalendarDays className="size-3" /> {friendlyDate(q.due)}
          </span>
        )}
        {q.status === 'done' && (
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-green-strong dark:text-green">
            <Check className="size-3" /> {t('Done', 'Selesai')}
          </span>
        )}
      </div>
    </div>
  );
}

function SortableQuest({ q, highlight, onOpen }: { q: Quest; highlight: boolean; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id, data: { column: q.status } });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && 'opacity-30')}
      {...attributes}
      id={`quest-${q.id}`}
    >
      <QuestCardView q={q} highlight={highlight} onOpen={onOpen} handleProps={listeners} />
    </div>
  );
}

function Column({ status, quests, over, highlight, onOpen, onAdd }: { status: QuestStatus; quests: Quest[]; over: boolean; highlight: string | null; onOpen: (id: string) => void; onAdd: () => void }) {
  const { setNodeRef } = useDroppable({ id: `col:${status}`, data: { column: status } });
  const { t, l } = useT();
  const st = COL_STYLE[status];
  const xp = quests.reduce((s, q) => s + q.xp, 0);
  return (
    <section
      ref={setNodeRef}
      aria-label={l(STATUS_LABEL[status])}
      className={cn(
        'flex w-[84vw] max-w-[380px] shrink-0 snap-center flex-col rounded-[22px] border bg-surface-2/50 p-3 transition-[background-color,border-color] sm:w-[340px] lg:w-auto lg:max-w-none',
        over ? 'border-green/50 bg-muted-green/50' : 'border-border',
      )}
    >
      <header className="flex items-center justify-between px-2 pb-3 pt-1">
        <div className="flex items-center gap-2">
          <span className={cn('size-2 rounded-full', st.dot)} />
          <h2 className="text-[13px] font-bold uppercase tracking-wider">{l(STATUS_LABEL[status])}</h2>
          <span className="tabular rounded-full bg-surface px-2 py-0.5 text-[11.5px] font-bold text-muted-foreground shadow-xs">{quests.length}</span>
        </div>
        <span className="tabular text-[11.5px] font-semibold text-subtle-foreground">{xp} XP</span>
      </header>
      <SortableContext items={quests.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[140px] flex-1 flex-col gap-2.5">
          {quests.map((q) => (
            <SortableQuest key={q.id} q={q} highlight={highlight === q.id} onOpen={() => onOpen(q.id)} />
          ))}
          {quests.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-4 py-8 text-center text-[13px] text-subtle-foreground">
              <st.icon className="mb-2 size-5" />
              {status === 'done' ? t('Drop a quest here to complete it', 'Letakkan quest di sini untuk menyelesaikannya') : status === 'doing' ? t('Drag a quest here to start', 'Seret quest ke sini untuk memulai') : t('Nothing planned', 'Belum ada rencana')}
            </div>
          )}
        </div>
      </SortableContext>
      {status === 'todo' && (
        <button type="button" onClick={onAdd} className="mt-2.5 flex h-10 items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold text-muted-foreground transition hover:bg-surface hover:text-foreground">
          <Plus className="size-4" /> {t('Add quest', 'Tambah quest')}
        </button>
      )}
    </section>
  );
}

export function Board({ highlight, onOpen, onAdd }: { highlight: string | null; onOpen: (id: string) => void; onAdd: () => void }) {
  const quests = useOrbit((s) => s.quests);
  const [active, setActive] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<QuestStatus | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const columns = useMemo(() => Object.fromEntries(COLUMNS.map((c) => [c, quests.filter((q) => q.status === c).sort((a, b) => a.order - b.order)])) as Record<QuestStatus, Quest[]>, [quests]);
  const activeQuest = active ? quests.find((q) => q.id === active) : null;

  const columnOf = (overId: string | number | undefined, data?: { column?: QuestStatus }): QuestStatus | null => {
    if (data?.column) return data.column;
    if (typeof overId === 'string' && overId.startsWith('col:')) return overId.slice(4) as QuestStatus;
    return null;
  };

  const onDragStart = (e: DragStartEvent) => setActive(String(e.active.id));
  const onDragOver = (e: DragOverEvent) => setOverCol(columnOf(e.over?.id, e.over?.data.current as { column?: QuestStatus }));
  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    setOverCol(null);
    const id = String(e.active.id);
    const target = columnOf(e.over?.id, e.over?.data.current as { column?: QuestStatus });
    if (!target) return;
    const q = quests.find((x) => x.id === id);
    if (!q) return;
    const overId = e.over?.id && !String(e.over.id).startsWith('col:') ? String(e.over.id) : null;
    if (q.status === target && (!overId || overId === id)) return;
    moveQuest(id, target, overId === id ? null : overId);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => { setActive(null); setOverCol(null); }}>
      <div data-lenis-prevent className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {COLUMNS.map((c) => (
          <Column key={c} status={c} quests={columns[c]} over={overCol === c && activeQuest?.status !== c} highlight={highlight} onOpen={onOpen} onAdd={onAdd} />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22,1,0.36,1)' }}>{activeQuest ? <QuestCardView q={activeQuest} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}
