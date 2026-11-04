import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ReactFlow, ReactFlowProvider, useNodesInitialized, useNodesState, useReactFlow, type Edge, type Node } from '@xyflow/react';
import { ArrowRight, Info, Maximize, Minus, Plus, RotateCcw, Sparkles, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/layout-blocks';
import { SearchInput } from '@/components/ui/form';
import { FilterChips } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/overlays';
import { useOrbit, useInsights } from '@/store/orbit';
import { buildUniverse, neighbours, type UFilter, type UNode } from '@/engine/universe';
import { nodeTypes, type UData, type VisualState } from './nodes';
import { NodeDrawer } from './NodeDrawer';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';
import { SKILL_BY_ID } from '@/data/catalog';

export default function UniversePage() {
  return (
    <ReactFlowProvider>
      <Universe />
    </ReactFlowProvider>
  );
}

const FILTERS: { value: UFilter; en: string; id: string }[] = [
  { value: 'all', en: 'All', id: 'Semua' },
  { value: 'career', en: 'Career', id: 'Karier' },
  { value: 'skills', en: 'Skills', id: 'Skill' },
  { value: 'experience', en: 'Experience', id: 'Pengalaman' },
  { value: 'opportunity', en: 'Opportunity', id: 'Peluang' },
  { value: 'learning', en: 'Learning', id: 'Belajar' },
  { value: 'people', en: 'People', id: 'Orang' },
  { value: 'gap', en: 'Gap', id: 'Gap' },
];

function Universe() {
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const insights = useInsights()!;
  const { t, l } = useT();
  const [params, setParams] = useSearchParams();
  const rf = useReactFlow();
  const initialized = useNodesInitialized();
  const graph = useMemo(() => buildUniverse(profile, quests), [profile, quests]);
  const byId = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);

  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<UFilter>('all');
  const [query, setQuery] = useState('');
  const [focusId, setFocusId] = useState<string | null>(() => params.get('focus'));
  const [legend, setLegend] = useState(() => window.innerWidth >= 1100);
  const didFit = useRef(false);

  const highlight = hover ?? selected ?? focusId;
  const hiSet = useMemo(() => (highlight && byId.has(highlight) ? neighbours(highlight, graph.edges) : null), [highlight, graph, byId]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(graph.nodes.filter((n) => n.cat !== 'you' && (l(n.label).toLowerCase().includes(q) || (n.sub && l(n.sub).toLowerCase().includes(q)))).map((n) => n.id));
  }, [query, graph, l]);

  const stateOf = useCallback(
    (n: UNode): VisualState => {
      if (matches) return matches.has(n.id) ? 'match' : n.cat === 'you' ? 'normal' : 'dim';
      if (hiSet) return n.id === highlight ? 'active' : hiSet.has(n.id) ? 'normal' : 'dim';
      if (filter !== 'all') return n.cat === 'you' || n.groups.includes(filter) ? 'normal' : 'dim';
      return 'normal';
    },
    [matches, hiSet, highlight, filter],
  );

  const derived = useMemo<Node<UData>[]>(
    () => [
      { id: '__ring', type: 'ring', position: { x: 0, y: 0 }, data: { cat: 'hub', label: '', state: 'normal', focus: false, delay: 0 } as UData, selectable: false, draggable: false, focusable: false },
      ...graph.nodes.map((n) => ({
        id: n.id,
        type: n.cat === 'you' ? 'you' : n.cat === 'hub' ? 'hub' : 'item',
        position: { x: n.x, y: n.y },
        draggable: n.cat !== 'you',
        ariaLabel: l(n.label),
        data: {
          cat: n.cat,
          hub: n.hub,
          label: l(n.label),
          sub: n.sub ? l(n.sub) : undefined,
          score: n.score !== undefined ? Math.round(n.score) : undefined,
          count: n.count,
          state: stateOf(n),
          focus: n.id === focusId && !selected,
          delay: Math.min(n.order * 0.025, 1.1),
          readiness: n.cat === 'you' ? insights.readiness : undefined,
        },
      })),
    ],
    [graph, l, stateOf, focusId, selected, insights.readiness],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<UData>>([]);
  useEffect(() => {
    setNodes((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      return derived.map((d) => {
        const p = map.get(d.id);
        return p ? { ...p, data: d.data, draggable: d.draggable } : d;
      });
    });
  }, [derived, setNodes]);

  const edges = useMemo<Edge[]>(
    () =>
      graph.edges.map((e) => {
        const on = hiSet ? hiSet.has(e.source) && hiSet.has(e.target) && (e.source === highlight || e.target === highlight) : false;
        const dim = (hiSet && !on) || (matches && !(matches.has(e.source) || matches.has(e.target))) || (filter !== 'all' && !hiSet && !matches && !(byId.get(e.target)?.groups.includes(filter)));
        const toGap = byId.get(e.target)?.cat === 'gap' || byId.get(e.source)?.cat === 'gap';
        const base = e.kind === 'spoke' ? { stroke: 'var(--border-strong)', strokeWidth: 1.6 } : e.kind === 'branch' ? { stroke: 'var(--border-strong)', strokeWidth: 1.1 } : { stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '3 5' };
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'straight',
          className: on ? 'edge-flow' : undefined,
          style: on ? { stroke: toGap ? '#FB9002' : '#0AB46A', strokeWidth: 2.2, opacity: 1 } : { ...base, opacity: dim ? 0.08 : e.kind === 'link' ? 0.45 : 0.9 },
          zIndex: on ? 1 : 0,
        };
      }),
    [graph, hiSet, highlight, matches, filter, byId],
  );

  // Fit once nodes are measured, then centre on a requested focus.
  useEffect(() => {
    if (!initialized || didFit.current) return;
    didFit.current = true;
    rf.fitView({ padding: 0.14, duration: 0, nodes: graph.nodes.map((n) => ({ id: n.id })) });
    const f = focusId ? byId.get(focusId) : null;
    if (f) setTimeout(() => rf.setCenter(f.x * 0.6, f.y * 0.6, { zoom: 0.95, duration: 900 }), 700);
  }, [initialized, rf, graph, focusId, byId]);

  useEffect(() => {
    if (!matches || matches.size === 0) return;
    rf.fitView({ nodes: [...matches].map((id) => ({ id })), duration: 500, padding: 0.8, maxZoom: 1.15 });
  }, [matches, rf]);

  const focusNode = (id: string) => {
    const n = byId.get(id);
    if (!n) return;
    setSelected(id);
    setFocusId(null);
    rf.setCenter(n.x, n.y, { zoom: 1.05, duration: 600 });
  };

  const reset = () => {
    setFilter('all');
    setQuery('');
    setSelected(null);
    setHover(null);
    setFocusId(null);
    setNodes(derived);
    if (params.get('focus')) setParams({}, { replace: true });
    setTimeout(() => rf.fitView({ padding: 0.14, duration: 600, nodes: graph.nodes.map((n) => ({ id: n.id })) }), 30);
  };

  const gaps = graph.nodes.filter((n) => n.cat === 'gap').length;
  const focusNodeData = focusId ? byId.get(focusId) : null;

  return (
    <div className="space-y-5">
      <PageHeader
        stage={t('Explore', 'Eksplorasi')}
        eyebrow="Career Universe"
        title={t('Everything connected to your career', 'Semua yang terhubung dengan kariermu')}
        description={t('{n} nodes · {e} connections · {g} open gaps. Hover to trace connections, click to see why it matters.', '{n} node · {e} koneksi · {g} gap terbuka. Arahkan kursor untuk melihat koneksi, klik untuk melihat alasannya.', {
          n: graph.nodes.length,
          e: graph.edges.length,
          g: gaps,
        })}
        actions={<SearchInput value={query} onChange={setQuery} placeholder={t('Search your Universe…', 'Cari di Universe-mu…')} className="w-full sm:w-72" count={matches?.size} />}
      />
      <FilterChips label={t('Filter the universe', 'Filter universe')} value={filter} onChange={(v) => { setFilter(v); setSelected(null); setFocusId(null); }} options={FILTERS.map((f) => ({ value: f.value, label: l(f) }))} />

      <div className="relative h-[68dvh] min-h-[480px] overflow-hidden rounded-[24px] border border-border bg-surface shadow-card lg:h-[calc(100dvh-300px)] lg:min-h-[560px]">
        <div className="pointer-events-none absolute inset-0 grid-dots opacity-50" aria-hidden />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          nodeOrigin={[0.5, 0.5]}
          minZoom={0.25}
          maxZoom={2.2}
          onNodeMouseEnter={(_, n) => n.id !== '__ring' && setHover(n.id)}
          onNodeMouseLeave={() => setHover(null)}
          onNodeClick={(_, n) => {
            if (n.id === '__ring') return;
            setSelected(n.id);
            setFocusId(null);
          }}
          onPaneClick={() => {
            setSelected(null);
            setFocusId(null);
          }}
          nodesConnectable={false}
          zoomOnScroll={false}
          preventScrolling={false}
          zoomOnDoubleClick={false}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          aria-label={t('Interactive Career Universe graph', 'Grafik Career Universe interaktif')}
          className="!bg-transparent"
        />

        {/* Controls */}
        <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-card backdrop-blur sm:right-4 sm:top-4">
          {[
            { icon: Plus, label: t('Zoom in', 'Perbesar'), fn: () => rf.zoomIn({ duration: 250 }) },
            { icon: Minus, label: t('Zoom out', 'Perkecil'), fn: () => rf.zoomOut({ duration: 250 }) },
            { icon: Maximize, label: t('Fit view', 'Sesuaikan tampilan'), fn: () => rf.fitView({ padding: 0.14, duration: 500, nodes: graph.nodes.map((n) => ({ id: n.id })) }) },
            { icon: RotateCcw, label: t('Reset', 'Reset'), fn: reset },
          ].map((c, i) => (
            <Tooltip key={c.label} content={c.label} side="left">
              <button type="button" onClick={c.fn} aria-label={c.label} className={cn('flex size-10 items-center justify-center text-muted-foreground transition hover:bg-surface-2 hover:text-foreground', i > 0 && 'border-t border-border')}>
                <c.icon className="size-[17px]" />
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 sm:bottom-4 sm:left-4">
          <AnimatePresence initial={false} mode="wait">
            {legend ? (
              <motion.div key="legend" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="w-[220px] rounded-2xl border border-border bg-surface/92 p-3.5 shadow-card backdrop-blur">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-subtle-foreground">{t('Legend', 'Legenda')}</span>
                  <button type="button" onClick={() => setLegend(false)} aria-label={t('Hide legend', 'Sembunyikan legenda')} className="rounded-md text-subtle-foreground hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] font-medium">
                  {[
                    { c: 'size-3 rounded-full bg-green', l: t('Skill', 'Skill') },
                    { c: 'size-3 rounded-full bg-orange ring-2 ring-orange/30 ring-offset-1 ring-offset-surface', l: t('Skill gap', 'Gap skill') },
                    { c: 'size-3 rounded-[4px] bg-[#13201a] dark:bg-[#e7efea]', l: t('Job', 'Pekerjaan') },
                    { c: 'size-2.5 rotate-45 rounded-[3px] bg-[#0f8a55]', l: t('Course', 'Kursus') },
                    { c: 'size-3 rounded-full bg-violet', l: t('Mentor', 'Mentor') },
                    { c: 'size-3 rounded-[4px] border-2 border-info', l: t('Event', 'Event') },
                    { c: 'size-3 rounded-[4px] bg-info', l: t('Experience', 'Pengalaman') },
                    { c: 'size-3 rounded-[4px] bg-violet/80', l: t('Project', 'Proyek') },
                  ].map((x) => (
                    <span key={x.l} className="flex items-center gap-2">
                      <span className={x.c} aria-hidden /> {x.l}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.button key="legend-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} type="button" onClick={() => setLegend(true)} className="flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface/90 px-3 text-[12.5px] font-semibold shadow-card backdrop-blur">
                <Info className="size-3.5" /> {t('Legend', 'Legenda')}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Focus callout */}
        <AnimatePresence>
          {focusNodeData && !selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease, delay: 0.9 }}
              className="absolute inset-x-3 bottom-3 z-20 mx-auto max-w-md sm:bottom-4"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-orange/30 bg-surface p-3.5 shadow-pop">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange text-white shadow-orange">
                  <Sparkles className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] font-bold uppercase tracking-wider text-orange-strong dark:text-orange">{t('Start here', 'Mulai dari sini')}</div>
                  <div className="truncate text-[14px] font-semibold">
                    {focusNodeData.refId && SKILL_BY_ID[focusNodeData.refId] ? t('{s} is your biggest opportunity', '{s} adalah peluang terbesarmu', { s: l(focusNodeData.label) }) : l(focusNodeData.label)}
                  </div>
                </div>
                <Button size="sm" onClick={() => focusNode(focusNodeData.id)}>
                  {t('Open', 'Buka')} <ArrowRight />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {matches && matches.size === 0 && (
          <div className="absolute inset-x-0 top-4 z-10 mx-auto w-fit rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-medium shadow-card">{t('Nothing in your Universe matches “{q}”', 'Tidak ada yang cocok dengan “{q}”', { q: query })}</div>
        )}
      </div>
      <p className="text-center text-[12.5px] text-subtle-foreground">{t('Ctrl + scroll or pinch to zoom · drag to pan · click a node for details', 'Ctrl + scroll atau cubit untuk zoom · geser untuk pindah · klik node untuk detail')}</p>

      <NodeDrawer node={selected ? (byId.get(selected) ?? null) : null} onClose={() => setSelected(null)} onFocus={focusNode} allNodes={graph.nodes} />
    </div>
  );
}
