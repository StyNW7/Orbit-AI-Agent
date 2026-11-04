import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { BookOpen, BriefcaseBusiness, CalendarDays, FileText, FolderKanban, GraduationCap, Layers, Target, Users, Sparkles, type LucideIcon } from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import type { HubKey, UCat } from '@/engine/universe';

export type VisualState = 'normal' | 'dim' | 'active' | 'match';

export interface UData extends Record<string, unknown> {
  cat: UCat;
  hub?: HubKey;
  label: string;
  sub?: string;
  score?: number;
  count?: number;
  state: VisualState;
  focus: boolean;
  delay: number;
  readiness?: number;
}

const HUB_ICON: Record<HubKey, LucideIcon> = {
  role: Target,
  skills: Layers,
  experience: BriefcaseBusiness,
  projects: FolderKanban,
  opportunities: Sparkles,
  courses: GraduationCap,
  mentors: Users,
  events: CalendarDays,
  books: BookOpen,
  research: FileText,
};

const handles = (top: number | string = '50%') => (
  <>
    <Handle type="target" position={Position.Top} style={{ top, left: '50%', transform: 'translate(-50%,-50%)' }} isConnectable={false} />
    <Handle type="source" position={Position.Bottom} style={{ top, left: '50%', bottom: 'auto', transform: 'translate(-50%,-50%)' }} isConnectable={false} />
  </>
);

const stateCls = (s: VisualState) =>
  cn('transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]', s === 'dim' && 'opacity-[0.18] saturate-50', s === 'active' && 'scale-[1.08]', s === 'match' && 'scale-[1.1]');

export const YouNode = memo(function YouNode({ data }: NodeProps<Node<UData>>) {
  return (
    <div style={{ animation: `orbit-pop 0.6s ${data.delay}s both cubic-bezier(0.22,1,0.36,1)` }}><div className={cn('relative flex flex-col items-center', stateCls(data.state === 'dim' ? 'normal' : data.state))}>
      {handles(56)}
      <span className="absolute left-1/2 top-[56px] size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green/20 blur-2xl" aria-hidden />
      <span className="absolute left-1/2 top-[56px] size-[112px] -translate-x-1/2 -translate-y-1/2 animate-pulse-ring rounded-full border-2 border-green/40" aria-hidden />
      <div className="orbit-gradient relative flex size-[112px] flex-col items-center justify-center rounded-full text-white shadow-[0_18px_40px_-12px_rgba(10,180,106,0.8)] ring-[6px] ring-surface">
        <span className="font-display text-[26px] font-extrabold leading-none tracking-tight">{initials(data.label)}</span>
        <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85">You</span>
      </div>
      <div className="mt-2.5 rounded-full border border-border bg-surface px-3 py-1 text-[12.5px] font-bold shadow-card">
        {data.label}
        {data.readiness !== undefined && <span className="ml-1.5 text-green-strong dark:text-green">· {Math.round(data.readiness)}%</span>}
      </div>
    </div></div>
  );
});

export const HubNode = memo(function HubNode({ data }: NodeProps<Node<UData>>) {
  const Icon = HUB_ICON[data.hub!];
  return (
    <div style={{ animation: `orbit-pop 0.5s ${data.delay}s both cubic-bezier(0.22,1,0.36,1)` }}><div className={stateCls(data.state)}>
      {handles()}
      <div
        className={cn(
          'flex items-center gap-2 whitespace-nowrap rounded-full border bg-surface py-1.5 pl-1.5 pr-3.5 shadow-card transition-colors',
          data.state === 'active' ? 'border-green ring-4 ring-green/15' : 'border-border hover:border-border-strong',
        )}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-[#13201a] text-white dark:bg-surface-3">
          <Icon className="size-3.5" aria-hidden />
        </span>
        <span className="text-[13px] font-bold">{data.label}</span>
        {data.count !== undefined && <span className="tabular rounded-full bg-surface-2 px-1.5 text-[11px] font-bold text-muted-foreground">{data.count}</span>}
      </div>
    </div></div>
  );
});

function Shape({ cat, label }: { cat: UCat; label: string }) {
  const base = 'relative flex items-center justify-center shadow-[0_6px_18px_-8px_rgba(16,32,24,0.45)] ring-[3px] ring-surface';
  switch (cat) {
    case 'role':
      return (
        <div className={cn(base, 'size-[54px] rounded-full bg-[#13201a] text-white dark:bg-[#e7efea] dark:text-[#13201a]')}>
          <span className="absolute -inset-[7px] rounded-full border-2 border-green" />
          <Target className="size-6" />
        </div>
      );
    case 'skill':
      return (
        <div className={cn(base, 'size-11 rounded-full bg-green text-white')}>
          <Layers className="size-[18px]" />
        </div>
      );
    case 'gap':
      return (
        <div className={cn(base, 'size-11 rounded-full bg-orange text-white')}>
          <span className="absolute -inset-[7px] rounded-full border-2 border-dashed border-orange/70" style={{ animation: 'orbit-spin 14s linear infinite' }} />
          <Target className="size-[18px]" />
        </div>
      );
    case 'experience':
      return (
        <div className={cn(base, 'size-11 rounded-[13px] bg-info text-white')}>
          <BriefcaseBusiness className="size-[18px]" />
        </div>
      );
    case 'project':
      return (
        <div className={cn(base, 'size-11 rounded-[13px] bg-violet text-white')}>
          <FolderKanban className="size-[18px]" />
        </div>
      );
    case 'opportunity':
      return (
        <div className={cn(base, 'size-11 rounded-[14px] bg-[#13201a] text-orange dark:bg-[#e7efea]')}>
          <BriefcaseBusiness className="size-[18px]" />
        </div>
      );
    case 'course':
      return (
        <div className={cn(base, 'size-10 rotate-45 rounded-[11px] bg-[#0f8a55] text-white')}>
          <GraduationCap className="size-[18px] -rotate-45" />
        </div>
      );
    case 'mentor':
      return <div className={cn(base, 'size-11 rounded-full bg-gradient-to-br from-violet to-[#a596f0] font-display text-[13px] font-bold text-white')}>{initials(label)}</div>;
    case 'event':
      return (
        <div className={cn(base, 'size-11 rounded-[13px] border-2 border-info bg-surface text-info')}>
          <CalendarDays className="size-[18px]" />
        </div>
      );
    case 'book':
      return (
        <div className={cn(base, 'h-11 w-9 rounded-[7px] bg-[#e9e3fb] text-violet dark:bg-[#2a2550]')}>
          <BookOpen className="size-[17px]" />
        </div>
      );
    default:
      return (
        <div className={cn(base, 'h-11 w-9 rounded-[7px] border border-border-strong bg-surface text-muted-foreground')}>
          <FileText className="size-[17px]" />
        </div>
      );
  }
}

export const ItemNode = memo(function ItemNode({ data }: NodeProps<Node<UData>>) {
  return (
    <div style={{ animation: `orbit-pop 0.5s ${data.delay}s both cubic-bezier(0.22,1,0.36,1)` }}><div className={cn('relative flex w-[132px] flex-col items-center', stateCls(data.state))}>
      {handles(data.cat === 'role' ? 27 : 22)}
      {data.focus && <span className="absolute left-1/2 top-[22px] size-14 -translate-x-1/2 -translate-y-1/2 animate-pulse-ring rounded-full bg-orange/40" aria-hidden />}
      <div className={cn('rounded-full transition-shadow', (data.state === 'active' || data.state === 'match') && 'shadow-[0_0_0_6px_color-mix(in_oklab,var(--orbit-green)_22%,transparent)]', data.state === 'match' && 'shadow-[0_0_0_6px_color-mix(in_oklab,var(--orbit-orange)_30%,transparent)]')}>
        <Shape cat={data.cat} label={data.label} />
      </div>
      <div className={cn('mt-2 max-w-[132px] rounded-md px-1.5 text-center text-[12px] font-semibold leading-tight', data.cat === 'role' && 'mt-3 text-[13px] font-bold')}>
        <span className="line-clamp-2 [text-shadow:0_0_6px_var(--background),0_0_10px_var(--background)]">{data.label}</span>
      </div>
      {data.score !== undefined && data.cat !== 'skill' && data.cat !== 'gap' && (
        <span className="tabular mt-0.5 text-[10.5px] font-bold text-green-strong [text-shadow:0_0_6px_var(--background)] dark:text-green">{data.score}%</span>
      )}
      {data.cat === 'gap' && <span className="mt-0.5 rounded-full bg-muted-orange px-1.5 text-[10px] font-bold uppercase tracking-wide text-orange-strong dark:text-orange">Gap</span>}
    </div></div>
  );
});

export const RingNode = memo(function RingNode() {
  const rings = [270, 580, 680];
  const size = 1500;
  return (
    <div className="pointer-events-none relative" style={{ width: size, height: size }} aria-hidden>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--orbit-green)_9%,transparent)_0%,transparent_55%)]" />
      {rings.map((r, i) => (
        <div
          key={r}
          className="absolute left-1/2 top-1/2 rounded-full border-[1.5px] border-dashed border-green/30 dark:border-green/25"
          style={{ width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, animation: `orbit-spin ${120 + i * 40}s linear infinite ${i % 2 ? 'reverse' : ''}` }}
        >
          <span className={cn('absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full', i === 1 ? 'bg-orange' : 'bg-green')} />
        </div>
      ))}
    </div>
  );
});

export const nodeTypes = { you: YouNode, hub: HubNode, item: ItemNode, ring: RingNode };
