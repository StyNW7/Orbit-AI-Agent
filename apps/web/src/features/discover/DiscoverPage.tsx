import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { BellRing, Bookmark, Compass, Inbox, SearchX, Send, Trash2, X, Award, MessagesSquare, Sparkles } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared/layout-blocks';
import { SearchInput, Select } from '@/components/ui/form';
import { FilterChips, Segmented } from '@/components/ui/tabs';
import { Badge, Card } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { ReminderModal, type ReminderTarget } from '@/components/shared/ReminderModal';
import { useOrbit } from '@/store/orbit';
import { setStatus, toggleSave } from '@/store/actions';
import { OPPORTUNITIES, OPP_BY_ID, TYPE_LABEL, TYPE_PLURAL } from '@/data/opportunities';
import { SKILL_BY_ID } from '@/data/catalog';
import type { AppStatus, OpportunityType } from '@/data/types';
import { matchOpportunity } from '@/engine/intelligence';
import { useT } from '@/lib/i18n';
import { APP_STATUS } from './status';
import { cn, daysFromNow, deadlineLabel, relative } from '@/lib/utils';
import { OpportunityCard, TYPE_TONE } from './OpportunityCard';
import { OpportunityDrawer } from './OpportunityDrawer';

type Sort = 'match' | 'impact' | 'newest' | 'deadline';
type TypeFilter = OpportunityType | 'all';


const TYPES: TypeFilter[] = ['all', 'job', 'internship', 'course', 'event', 'mentor', 'book', 'research'];

export default function DiscoverPage() {
  const [params, setParams] = useSearchParams();
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const saved = useOrbit((s) => s.saved);
  const { t, l } = useT();
  const view = params.get('view') === 'saved' ? 'saved' : 'explore';
  const type = (params.get('type') as TypeFilter) || 'all';
  const skill = params.get('skill');
  const openId = params.get('open');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('match');
  const [remind, setRemind] = useState<ReminderTarget | null>(null);

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === '' || v === 'all') next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  const scored = useMemo(() => OPPORTUNITIES.map((o) => ({ o, m: matchOpportunity(o, profile, quests) })), [profile, quests]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: scored.length };
    scored.forEach(({ o }) => (c[o.type] = (c[o.type] ?? 0) + 1));
    return c;
  }, [scored]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scored
      .filter(({ o }) => type === 'all' || o.type === type)
      .filter(({ o }) => !skill || o.skills.includes(skill))
      .filter(({ o }) => !q || `${o.title} ${o.org} ${l(o.summary)} ${o.skills.map((s) => l(SKILL_BY_ID[s].name)).join(' ')}`.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === 'impact') return b.o.readinessImpact - a.o.readinessImpact;
        if (sort === 'newest') return a.o.postedDaysAgo - b.o.postedDaysAgo;
        if (sort === 'deadline') return (a.o.deadlineInDays ?? 999) - (b.o.deadlineInDays ?? 999);
        return b.m.score - a.m.score;
      });
  }, [scored, type, skill, query, sort, l]);

  const savedCount = Object.keys(saved).length;

  return (
    <div className="space-y-6">
      <PageHeader
        stage={t('Explore', 'Eksplorasi')}
        eyebrow={t('Opportunity Intelligence', 'Opportunity Intelligence')}
        title={t('Opportunities that move you forward', 'Peluang yang membawamu maju')}
        description={t('Jobs, internships, courses, mentors and events — ranked by fit, and every match explained.', 'Pekerjaan, magang, kursus, mentor, dan event — diurutkan berdasarkan kecocokan, dan setiap match dijelaskan.')}
        actions={
          <Segmented
            label={t('Discover view', 'Tampilan discover')}
            value={view}
            onChange={(v) => setParam('view', v === 'saved' ? 'saved' : null)}
            options={[
              { value: 'explore', label: t('Explore', 'Jelajahi'), icon: Compass },
              { value: 'saved', label: t('Saved & applied', 'Tersimpan & dilamar'), icon: Bookmark, count: savedCount },
            ]}
          />
        }
      />

      {view === 'explore' ? (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchInput value={query} onChange={setQuery} placeholder={t('Search title, company or skill…', 'Cari judul, perusahaan, atau skill…')} className="w-full lg:w-[380px]" count={list.length} />
            <div className="flex items-center gap-2 lg:ml-auto [&>div]:flex-1 lg:[&>div]:flex-none">
              <label htmlFor="sort" className="shrink-0 text-[13px] font-semibold text-muted-foreground">
                {t('Sort by', 'Urutkan')}
              </label>
              <Select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10 w-full lg:w-48">
                <option value="match">{t('Best match', 'Paling cocok')}</option>
                <option value="impact">{t('Highest impact', 'Dampak tertinggi')}</option>
                <option value="newest">{t('Newest', 'Terbaru')}</option>
                <option value="deadline">{t('Deadline soon', 'Deadline terdekat')}</option>
              </Select>
            </div>
          </div>
          <FilterChips label={t('Opportunity type', 'Jenis peluang')} value={type} onChange={(v) => setParam('type', v)} options={TYPES.map((ty) => ({ value: ty, label: l(TYPE_PLURAL[ty]), count: counts[ty] ?? 0 }))} />
          {skill && SKILL_BY_ID[skill] && (
            <div className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
              {t('Showing opportunities connected to', 'Menampilkan peluang terkait')}
              <span className="inline-flex items-center gap-1 rounded-full bg-muted-green py-1 pl-3 pr-1 font-semibold text-green-strong dark:text-green">
                {l(SKILL_BY_ID[skill].name)}
                <button type="button" onClick={() => setParam('skill', null)} aria-label={t('Clear skill filter', 'Hapus filter skill')} className="flex size-6 items-center justify-center rounded-full hover:bg-green/15">
                  <X className="size-3.5" />
                </button>
              </span>
            </div>
          )}
          {list.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title={t('No opportunities match yet', 'Belum ada peluang yang cocok')}
                description={t('Try another keyword or clear the filters.', 'Coba kata kunci lain atau hapus filter.')}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery('');
                      setParams({}, { replace: true });
                    }}
                  >
                    {t('Clear filters', 'Hapus filter')}
                  </Button>
                }
              />
            </Card>
          ) : (
            <motion.div layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {list.map(({ o, m }, i) => (
                  <OpportunityCard key={o.id} o={o} m={m} index={i} onOpen={() => setParam('open', o.id)} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      ) : (
        <SavedView onOpen={(id) => setParam('open', id)} onRemind={setRemind} onExplore={() => setParam('view', null)} />
      )}

      <OpportunityDrawer id={openId && OPP_BY_ID[openId] ? openId : null} onClose={() => setParam('open', null)} onRemind={setRemind} />
      <ReminderModal target={remind} onClose={() => setRemind(null)} />
    </div>
  );
}

function SavedView({ onOpen, onRemind, onExplore }: { onOpen: (id: string) => void; onRemind: (t: ReminderTarget) => void; onExplore: () => void }) {
  const saved = useOrbit((s) => s.saved);
  const profile = useOrbit((s) => s.profile)!;
  const { t, l } = useT();
  const [filter, setFilter] = useState<AppStatus | 'all'>('all');
  const items = Object.values(saved).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const shown = items.filter((s) => filter === 'all' || s.status === filter);
  const count = (st: AppStatus) => items.filter((i) => i.status === st).length;

  if (items.length === 0)
    return (
      <Card>
        <EmptyState
          icon={Inbox}
          title={t('Nothing saved yet.', 'Belum ada yang disimpan.')}
          description={t('Explore opportunities matched to your skills and career goals.', 'Jelajahi peluang yang cocok dengan skill dan tujuan kariermu.')}
          action={<Button onClick={onExplore}>{t('Explore Opportunities', 'Jelajahi Peluang')}</Button>}
        />
      </Card>
    );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { st: 'saved' as AppStatus, icon: Bookmark, tone: 'text-muted-foreground' },
          { st: 'applied' as AppStatus, icon: Send, tone: 'text-info' },
          { st: 'interview' as AppStatus, icon: MessagesSquare, tone: 'text-orange' },
          { st: 'offer' as AppStatus, icon: Award, tone: 'text-green' },
        ].map(({ st, icon: Icon, tone }) => (
          <button key={st} type="button" onClick={() => setFilter(filter === st ? 'all' : st)} className={cn('card flex items-center gap-3 p-4 text-left transition hover:border-border-strong', filter === st && 'border-green ring-4 ring-green/10')}>
            <Icon className={cn('size-5', tone)} />
            <div>
              <div className="tabular font-display text-[22px] font-bold leading-none">{count(st)}</div>
              <div className="mt-1 text-[12.5px] text-muted-foreground">{l(APP_STATUS[st])}</div>
            </div>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[minmax(0,2fr)_0.8fr_1fr_180px_auto] gap-4 border-b border-border bg-surface-2/60 px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-wider text-subtle-foreground md:grid">
          <span>{t('Opportunity', 'Peluang')}</span>
          <span>{t('Match', 'Cocok')}</span>
          <span>{t('Deadline', 'Deadline')}</span>
          <span>{t('Status', 'Status')}</span>
          <span className="w-[76px]" />
        </div>
        <ul className="divide-y divide-border">
          <AnimatePresence initial={false}>
            {shown.map((s) => {
              const o = OPP_BY_ID[s.oppId];
              if (!o) return null;
              const m = matchOpportunity(o, profile);
              const trackable = o.type === 'job' || o.type === 'internship';
              return (
                <motion.li key={s.oppId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 40 }} className="grid gap-3 p-4 md:grid-cols-[minmax(0,2fr)_0.8fr_1fr_180px_auto] md:items-center md:gap-4 md:px-5">
                  <button type="button" onClick={() => onOpen(o.id)} className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <Badge tone={TYPE_TONE[o.type]} className="h-5 text-[11px]">
                        {l(TYPE_LABEL[o.type])}
                      </Badge>
                      <span className="text-[12px] text-subtle-foreground">{relative(s.updatedAt)}</span>
                    </div>
                    <div className="mt-1 truncate text-[14.5px] font-semibold hover:text-green-strong dark:hover:text-green">{o.title}</div>
                    <div className="truncate text-[12.5px] text-muted-foreground">{o.org}</div>
                    {s.note && <div className="mt-1 truncate text-[12.5px] italic text-muted-foreground">“{s.note}”</div>}
                  </button>
                  <div className="flex items-center gap-2 text-[13px] md:block">
                    <span className="text-muted-foreground md:hidden">{t('Match', 'Cocok')}:</span>
                    <span className="tabular font-bold text-green-strong dark:text-green">{m.score}%</span>
                  </div>
                  <div className={cn('text-[13px]', o.deadlineInDays !== undefined && o.deadlineInDays <= 7 ? 'font-semibold text-orange-strong dark:text-orange' : 'text-muted-foreground')}>
                    {o.deadlineInDays !== undefined ? deadlineLabel(daysFromNow(o.deadlineInDays)) : '—'}
                  </div>
                  <div>
                    {trackable ? (
                      <Select aria-label={t('Application status', 'Status lamaran')} value={s.status} onChange={(e) => setStatus(o.id, e.target.value as AppStatus)} className="h-9 text-[13px]">
                        {(Object.keys(APP_STATUS) as AppStatus[]).map((st) => (
                          <option key={st} value={st}>
                            {l(APP_STATUS[st])}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                        <Sparkles className="size-3.5 text-green" /> {t('Saved resource', 'Sumber tersimpan')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost" aria-label={t('Create reminder', 'Buat pengingat')} onClick={() => onRemind({ title: o.title, oppId: o.id, suggestedDate: o.deadlineInDays ? daysFromNow(Math.max(o.deadlineInDays - 2, 1)) : undefined })}>
                      <BellRing />
                    </Button>
                    <Button size="icon-sm" variant="ghost" aria-label={t('Remove', 'Hapus')} onClick={() => toggleSave(o.id)} className="hover:bg-muted-danger hover:text-danger">
                      <Trash2 />
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        {shown.length === 0 && <EmptyState compact icon={Inbox} title={t('Nothing here yet', 'Belum ada di sini')} description={t('Update a status to see it in this list.', 'Ubah status untuk melihatnya di daftar ini.')} />}
      </Card>
    </div>
  );
}
