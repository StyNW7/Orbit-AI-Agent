import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowUpRight, BookOpenCheck, Check, ChevronRight, Copy, Eye, FileUp, GraduationCap, Hammer, Layers, Library, MessageCircleQuestion, Presentation, Route, Target } from 'lucide-react';
import { Badge, Card } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/form';
import { Sheet } from '@/components/ui/overlays';
import { FilterChips, Segmented } from '@/components/ui/tabs';
import { EmptyState, SectionHeader, StatCard } from '@/components/shared/layout-blocks';
import { LevelDots } from '@/components/shared/SkillLevel';
import { LEVEL_LABEL, ROLES, ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import { BAND_LABEL, COURSE_LEVEL_LABEL, careersFor, courseRelevance, courseStatus, curriculumFor, relevanceBand, skillLinks, type Course, type CourseStatus, type RelevanceBand } from '@/data/courses';
import type { Profile, RoleId } from '@/data/types';
import { useOrbit } from '@/store/orbit';
import { requestClassQuest } from '@/store/actions';
import { useUi } from '@/store/ui';
import { useIsDesktop } from '@/hooks/use-media';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, stagger } from '@/lib/motion';

type Filter = 'all' | CourseStatus | 'gaps';
type Sort = 'semester' | 'relevance';

const BAND_COLOR: Record<RelevanceBand, string> = { core: '#078A51', strong: '#0AB46A', useful: '#FB9002', indirect: 'var(--border-strong)' };
const BAND_TONE: Record<RelevanceBand, 'green' | 'orange' | 'neutral'> = { core: 'green', strong: 'green', useful: 'orange', indirect: 'neutral' };

function RelevanceRing({ score, size = 46 }: { score: number; size?: number }) {
  const stroke = size >= 60 ? 6 : 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} aria-hidden>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={BAND_COLOR[relevanceBand(score)]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (score / 100) * c }}
          transition={{ duration: 0.9, ease }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className={cn('tabular absolute font-bold', size >= 60 ? 'text-[17px]' : 'text-[12px]')}>{score}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: CourseStatus }) {
  const { t } = useT();
  if (status === 'done') return <Badge tone="green" dot>{t('Completed', 'Selesai')}</Badge>;
  if (status === 'current') return <Badge tone="orange" dot>{t('This semester', 'Semester ini')}</Badge>;
  return <Badge tone="outline">{t('Upcoming', 'Akan datang')}</Badge>;
}

interface Row {
  course: Course;
  score: number;
  status: CourseStatus;
  gaps: string[];
}

/** The curriculum, class by class, read against a career lens. Rendered inside the Learn hub. */
export function LearningMapView({ initialCourse }: { initialCourse?: string }) {
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const { t, l } = useT();
  const desktop = useIsDesktop();
  const [lens, setLens] = useState<RoleId>(profile.targetRole);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('semester');
  const [semester, setSemester] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(initialCourse ?? null);
  const [sheetOpen, setSheetOpen] = useState(Boolean(initialCourse) && !desktop);
  const role = ROLE_BY_ID[lens];

  const rows: Row[] = useMemo(
    () =>
      curriculumFor(profile.major).map((course) => ({
        course,
        score: courseRelevance(course, lens),
        status: courseStatus(course, profile.semester),
        gaps: skillLinks(course, profile, lens)
          .filter((s) => s.isGap)
          .map((s) => s.skill),
      })),
    [profile, lens],
  );

  const started = useMemo(() => new Set(quests.filter((q) => q.templateId?.startsWith('class:')).map((q) => q.templateId!.slice(6))), [quests]);

  const counts = {
    all: rows.length,
    done: rows.filter((r) => r.status === 'done').length,
    current: rows.filter((r) => r.status === 'current').length,
    next: rows.filter((r) => r.status === 'next').length,
    gaps: rows.filter((r) => r.gaps.length > 0).length,
  };

  const visible = rows
    .filter((r) => (filter === 'all' ? true : filter === 'gaps' ? r.gaps.length > 0 : r.status === filter))
    .filter((r) => semester === null || r.course.semester === semester)
    .sort((a, b) => (sort === 'relevance' ? b.score - a.score : a.course.semester - b.course.semester || b.score - a.score));

  // Keep a sensible course in the desktop panel: the explicit pick, else the most relevant current class.
  const fallback = [...rows].sort((a, b) => Number(b.status === 'current') - Number(a.status === 'current') || b.score - a.score)[0];
  const active = rows.find((r) => r.course.id === selected) ?? fallback;

  const semesters = Array.from({ length: 8 }, (_, i) => i + 1).map((n) => {
    const inSem = rows.filter((r) => r.course.semester === n);
    const avg = inSem.length ? Math.round(inSem.reduce((s, r) => s + r.score, 0) / inSem.length) : 0;
    const state: CourseStatus = profile.semester >= 9 || n < profile.semester ? 'done' : n === profile.semester ? 'current' : 'next';
    return { n, count: inSem.length, avg, state };
  });

  const open = (id: string) => {
    setSelected(id);
    if (!desktop) setSheetOpen(true);
  };

  const strong = rows.filter((r) => r.score >= 40).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-r from-mint to-cream p-4 sm:p-5 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-green-strong shadow-xs dark:text-green">
            <Presentation className="size-5" aria-hidden />
          </span>
          <p className="min-w-0 flex-1 text-[14px] leading-relaxed">
            <strong className="font-semibold">{t('Your lecturers teach. Orbit shows where it leads.', 'Dosenmu mengajar. Orbit menunjukkan arahnya.')}</strong>{' '}
            <span className="text-muted-foreground">
              {lens !== profile.targetRole
                ? t('You are exploring through the {role} lens — your goal stays the same.', 'Kamu sedang menjelajah lewat lensa {role} — tujuanmu tidak berubah.', { role: l(role.name) })
                : t('Your {major} curriculum, read against your goal. Switch the lens to see where else a class leads.', 'Kurikulum {major}-mu, dibaca terhadap tujuanmu. Ganti lensa untuk melihat ke mana lagi sebuah kelas membawamu.', { major: profile.major })}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="lens" className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
            <Eye className="size-4" aria-hidden /> {t('Lens', 'Lensa')}
          </label>
          <Select id="lens" value={lens} onChange={(e) => setLens(e.target.value as RoleId)} className="h-10 w-[270px] max-w-full">
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {l(r.name)}
                {r.id === profile.targetRole ? ` (${t('your goal', 'tujuanmu')})` : ''}
              </option>
            ))}
          </Select>
          {lens !== profile.targetRole && (
            <Button size="sm" variant="secondary" onClick={() => setLens(profile.targetRole)}>
              <Target /> {t('Back to my goal', 'Kembali ke tujuanku')}
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: GraduationCap, label: t('Classes mapped', 'Mata kuliah terpetakan'), value: rows.length, hint: t('{n} completed so far', '{n} sudah selesai', { n: counts.done }), tone: 'green' as const },
          { icon: Target, label: t('Directly power this career', 'Langsung mendukung karier ini'), value: strong, hint: t('Strong or core relevance', 'Relevansi kuat atau inti'), tone: 'green' as const },
          { icon: Layers, label: t('Train your open gaps', 'Melatih gap-mu'), value: counts.gaps, hint: t('Skills still below target', 'Skill yang masih di bawah target'), tone: 'orange' as const },
          { icon: Hammer, label: t('Applied projects started', 'Proyek terapan dimulai'), value: started.size, hint: t('Classes turned into evidence', 'Pelajaran yang jadi bukti nyata'), tone: 'info' as const },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <StatCard icon={s.icon} label={s.label} value={s.value} hint={s.hint} tone={s.tone} className="h-full" />
          </motion.div>
        ))}
      </motion.div>

      <Card className="p-5 sm:p-6">
        <SectionHeader
          icon={Route}
          title={t('Semester by semester', 'Semester demi semester')}
          description={t('Bar height = average relevance of that semester’s classes to {role}. Select a semester to filter.', 'Tinggi batang = rata-rata relevansi mata kuliah semester itu untuk {role}. Pilih semester untuk memfilter.', { role: l(role.name) })}
          action={
            semester !== null ? (
              <Button size="xs" variant="ghost" onClick={() => setSemester(null)}>
                {t('Show all', 'Tampilkan semua')}
              </Button>
            ) : undefined
          }
        />
        <div className="no-scrollbar -mx-1 overflow-x-auto px-1 pb-1">
          <ol className="grid min-w-[660px] grid-cols-8 gap-2" aria-label={t('Semesters', 'Semester')}>
            {semesters.map((s) => {
              const on = semester === s.n;
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    aria-pressed={on}
                    disabled={s.count === 0}
                    onClick={() => setSemester(on ? null : s.n)}
                    aria-label={t('Semester {n}: {c} classes, {a}% average relevance', 'Semester {n}: {c} mata kuliah, rata-rata relevansi {a}%', { n: s.n, c: s.count, a: s.avg })}
                    className={cn(
                      'group flex w-full flex-col items-center gap-2 rounded-2xl border p-2.5 transition-[border-color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:cursor-default disabled:opacity-45',
                      on ? 'border-green bg-muted-green/60 shadow-card' : s.state === 'current' ? 'border-orange/50 bg-muted-orange/40' : 'border-border hover:border-border-strong hover:bg-surface-2',
                    )}
                  >
                    <span className="flex h-[72px] w-full items-end justify-center rounded-xl bg-surface-2/80 px-3 pb-1.5 pt-2">
                      <motion.span
                        className={cn('w-full max-w-[26px] rounded-md', s.state === 'done' ? 'bg-green' : s.state === 'current' ? 'bg-orange' : 'bg-border-strong')}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(s.count ? 8 : 0, s.avg)}%` }}
                        transition={{ duration: 0.8, ease, delay: s.n * 0.04 }}
                      />
                    </span>
                    <span className="font-display text-[13.5px] font-bold">S{s.n}</span>
                    <span className="-mt-1.5 whitespace-nowrap text-[11px] text-muted-foreground">{s.state === 'current' ? t('Now', 'Sekarang') : s.count === 1 ? t('1 class', '1 kelas') : t('{n} classes', '{n} kelas', { n: s.count })}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <FilterChips
              className="min-w-0 max-w-full"
              label={t('Filter classes', 'Filter mata kuliah')}
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: t('All', 'Semua'), count: counts.all },
                { value: 'current', label: t('This semester', 'Semester ini'), count: counts.current },
                { value: 'next', label: t('Upcoming', 'Akan datang'), count: counts.next },
                { value: 'done', label: t('Completed', 'Selesai'), count: counts.done },
                { value: 'gaps', label: t('Trains a gap', 'Melatih gap'), count: counts.gaps },
              ]}
            />
            <Segmented
              size="sm"
              label={t('Sort', 'Urutkan')}
              value={sort}
              onChange={setSort}
              options={[
                { value: 'semester', label: t('Semester', 'Semester') },
                { value: 'relevance', label: t('Relevance', 'Relevansi') },
              ]}
              className="shrink-0"
            />
          </div>

          {visible.length === 0 ? (
            <Card>
              <EmptyState
                compact
                icon={BookOpenCheck}
                title={t('No classes match this view', 'Tidak ada mata kuliah di tampilan ini')}
                description={t('Try another filter or semester.', 'Coba filter atau semester lain.')}
                action={
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setFilter('all');
                      setSemester(null);
                    }}
                  >
                    {t('Reset filters', 'Reset filter')}
                  </Button>
                }
              />
            </Card>
          ) : (
            <ul className="space-y-2.5">
              <AnimatePresence initial={false}>
                {visible.map((r) => {
                  const on = desktop && active?.course.id === r.course.id;
                  const band = relevanceBand(r.score);
                  return (
                    <motion.li key={r.course.id} layout="position" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease }}>
                      <button
                        type="button"
                        onClick={() => open(r.course.id)}
                        aria-pressed={desktop ? on : undefined}
                        className={cn(
                          'card card-interactive flex w-full items-center gap-4 p-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] sm:p-[18px]',
                          on && 'border-green/60 ring-1 ring-green/30',
                        )}
                      >
                        <RelevanceRing score={r.score} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-display text-[15.5px] font-bold leading-snug">{l(r.course.name)}</span>
                            {started.has(r.course.id) && (
                              <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-green-strong dark:text-green">
                                <Check className="size-3.5" strokeWidth={3} aria-hidden /> {t('Project in Journey', 'Proyek di Journey')}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                            {r.course.level === 'co' ? l(COURSE_LEVEL_LABEL.co) : t('Semester {n}', 'Semester {n}', { n: r.course.semester })}
                            {r.course.credits > 0 && ` · ${r.course.credits} ${t('credits', 'SKS')}`} · <span className={cn(band === 'core' || band === 'strong' ? 'font-semibold text-green-strong dark:text-green' : '')}>{l(BAND_LABEL[band])}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {r.course.skills.slice(0, 3).map((s) => {
                              const gap = r.gaps.includes(s.skill);
                              return (
                                <span key={s.skill} className={cn('inline-flex h-6 items-center rounded-full px-2 text-[11.5px] font-semibold', gap ? 'bg-muted-orange text-orange-strong dark:text-orange' : 'bg-surface-2 text-muted-foreground')}>
                                  {l(SKILL_BY_ID[s.skill].name)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="hidden shrink-0 sm:block">
                          <StatusBadge status={r.status} />
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-subtle-foreground" aria-hidden />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {desktop && active && (
          <aside className="scrollbar-thin sticky top-[88px] max-h-[calc(100dvh-104px)] overflow-y-auto overscroll-contain rounded-[20px]" aria-label={t('Class details', 'Detail mata kuliah')}>
            <Card className="overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${active.course.id}-${lens}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease }} className="p-6">
                  <CourseDetail row={active} profile={profile} lens={lens} onLens={setLens} started={started.has(active.course.id)} />
                </motion.div>
              </AnimatePresence>
            </Card>
          </aside>
        )}
      </div>

      {!desktop && (
        <Sheet open={sheetOpen && Boolean(active)} onOpenChange={setSheetOpen} title={active ? l(active.course.name) : ''} description={active ? l(COURSE_LEVEL_LABEL[active.course.level]) : undefined}>
          {active && <CourseDetail row={active} profile={profile} lens={lens} onLens={setLens} started={started.has(active.course.id)} hideTitle />}
        </Sheet>
      )}
    </div>
  );
}

function CourseDetail({ row, profile, lens, onLens, started, hideTitle }: { row: Row; profile: Profile; lens: RoleId; onLens: (r: RoleId) => void; started: boolean; hideTitle?: boolean }) {
  const { t, l } = useT();
  const { course, score, status } = row;
  const role = ROLE_BY_ID[lens];
  const allMaterials = useOrbit((s) => s.materials);
  const openAdd = useUi((s) => s.openAddMaterial);
  const navigate = useNavigate();
  const classMaterials = allMaterials.filter((m) => m.courseId === course.id);
  const band = relevanceBand(score);
  const links = skillLinks(course, profile, lens);
  const careers = careersFor(course);
  const focusSkill = links.find((s) => s.isGap)?.skill ?? links.find((s) => s.target !== null)?.skill;
  const tip =
    status === 'done'
      ? t('Already passed? This project turns the grade into evidence recruiters can see.', 'Sudah lulus kelas ini? Proyek ini mengubah nilai menjadi bukti yang bisa dilihat rekruter.')
      : status === 'current'
        ? t('Taking it now: pair the project with your class assignment so one effort counts twice.', 'Sedang diambil: gabungkan proyek dengan tugas kuliah agar satu usaha bernilai ganda.')
        : t('Coming up: skim these skills early so the class lands faster when it starts.', 'Segera datang: pelajari sekilas skill ini lebih awal agar kelasnya lebih mudah diikuti.');

  const copyAsk = async () => {
    try {
      await navigator.clipboard.writeText(l(course.ask));
      toast.success(t('Question copied', 'Pertanyaan disalin'), { description: t('Bring it to your next class or advising session.', 'Bawa ke kelas atau sesi bimbingan berikutnya.') });
    } catch {
      toast(t('Copy is not available here', 'Salin tidak tersedia di sini'), { description: l(course.ask) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        {!hideTitle && (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow">{l(COURSE_LEVEL_LABEL[course.level])}</span>
              <StatusBadge status={status} />
            </div>
            <h2 className="mt-2 font-display text-[22px] font-extrabold leading-tight tracking-tight">{l(course.name)}</h2>
          </>
        )}
        {hideTitle && <StatusBadge status={status} />}
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-surface-2/60 p-4">
          <RelevanceRing score={score} size={64} />
          <div className="min-w-0">
            <div className="text-[14px] font-semibold leading-snug">{t('{s}% relevant to {role}', '{s}% relevan untuk {role}', { s: score, role: l(role.name) })}</div>
            <div className="mt-1">
              <Badge tone={BAND_TONE[band]}>{l(BAND_LABEL[band])}</Badge>
            </div>
            <p className="mt-1.5 text-[12px] text-muted-foreground">{t('Based on how strongly this class trains the skills the role relies on.', 'Berdasarkan seberapa kuat kelas ini melatih skill yang dibutuhkan peran tersebut.')}</p>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{l(course.why)}</p>
      </div>

      <section>
        <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t('Skills it builds — you vs. {role}', 'Skill yang dibangun — kamu vs. {role}', { role: l(role.name) })}</h3>
        <ul className="mt-3 space-y-2.5">
          {links.map((s) => (
            <li key={s.skill} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[13.5px] font-semibold">
                  <span className="truncate">{l(SKILL_BY_ID[s.skill].name)}</span>
                  {s.isGap && <Badge tone="orange" className="h-5 px-2 text-[11px]">{t('Gap', 'Gap')}</Badge>}
                </div>
                <div className="mt-0.5 text-[12px] text-muted-foreground">
                  {s.target === null
                    ? t('Not required for {role}', 'Tidak dibutuhkan untuk {role}', { role: l(role.name) })
                    : t('You: {a} · Target: {b}', 'Kamu: {a} · Target: {b}', { a: l(LEVEL_LABEL[s.level]), b: l(LEVEL_LABEL[s.target]) })}
                </div>
              </div>
              <LevelDots level={s.level} target={s.target ?? undefined} className="shrink-0" />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t('Where else this class leads', 'Ke mana lagi kelas ini membawa')}</h3>
        <ul className="mt-3 space-y-2">
          {careers.map(({ role: r, score: s }) => {
            const on = r.id === lens;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onLens(r.id)}
                  aria-pressed={on}
                  className={cn('grid w-full grid-cols-[minmax(0,1fr)_96px_40px] items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[13px] transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]', on && 'bg-muted-green/60')}
                >
                  <span className={cn('truncate', on ? 'font-bold' : 'font-medium')}>
                    {l(r.name)}
                    {r.id === profile.targetRole && <span className="ml-1.5 text-[11px] font-semibold text-green-strong dark:text-green">· {t('goal', 'tujuan')}</span>}
                  </span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <motion.span className="block h-full rounded-full orbit-gradient" initial={{ width: 0 }} animate={{ width: `${s}%` }} transition={{ duration: 0.7, ease }} />
                  </span>
                  <span className="tabular text-right font-bold">{s}%</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[12px] text-subtle-foreground">{t('Tap a career to view the whole map through its lens.', 'Ketuk karier untuk melihat seluruh peta lewat lensanya.')}</p>
      </section>

      <section className="rounded-2xl border border-green/30 bg-gradient-to-br from-mint to-surface p-4">
        <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-green-strong dark:text-green">
          <Hammer className="size-3.5" aria-hidden /> {t('Turn it into evidence', 'Jadikan bukti nyata')}
        </div>
        <p className="mt-2 text-[14px] font-medium leading-relaxed">{l(course.project)}</p>
        <p className="mt-2 text-[12.5px] text-muted-foreground">{tip}</p>
        {started ? (
          <Button asChild size="sm" variant="soft" className="mt-3">
            <Link to="/app/journey">
              <Check /> {t('In your Journey — open', 'Ada di Journey — buka')} <ArrowUpRight />
            </Link>
          </Button>
        ) : (
          <Button size="sm" className="mt-3" onClick={() => requestClassQuest(course, focusSkill)}>
            <Route /> {t('Add as a Journey quest', 'Tambah sebagai quest Journey')}
          </Button>
        )}
      </section>

      <section className="rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          <Library className="size-3.5" aria-hidden /> {t('Your materials for this class', 'Materimu untuk kelas ini')}
        </div>
        {classMaterials.length ? (
          <ul className="mt-2 space-y-1">
            {classMaterials.slice(0, 3).map((m) => (
              <li key={m.id} className="truncate text-[13.5px] font-medium">
                · {m.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13px] text-muted-foreground">{t('Add slides, notes or assignments from this class — Orbit reads them for skill evidence.', 'Tambahkan slide, catatan, atau tugas dari kelas ini — Orbit membacanya sebagai bukti skill.')}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="xs" variant="secondary" onClick={() => openAdd(course.id)}>
            <FileUp /> {t('Add material', 'Tambah materi')}
          </Button>
          {classMaterials.length > 0 && (
            <Button size="xs" variant="ghost" onClick={() => navigate('/app/learning?view=vault')}>
              {t('Open Vault ({n})', 'Buka Vault ({n})', { n: classMaterials.length })}
            </Button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            <MessageCircleQuestion className="size-3.5" aria-hidden /> {t('Bring this to your lecturer', 'Bawa ke dosenmu')}
          </div>
          <Button size="icon-xs" variant="ghost" onClick={copyAsk} aria-label={t('Copy question', 'Salin pertanyaan')}>
            <Copy />
          </Button>
        </div>
        <p className="mt-2 text-[14px] italic leading-relaxed">“{l(course.ask)}”</p>
        <p className="mt-2 text-[12px] text-subtle-foreground">{t('Your lecturer knows the class best — Orbit just helps you ask a sharper question.', 'Dosenmu paling memahami kelasnya — Orbit hanya membantumu bertanya dengan lebih tajam.')}</p>
      </section>
    </div>
  );
}
