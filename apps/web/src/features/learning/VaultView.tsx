import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight,
  BookOpenCheck,
  Check,
  CircleDashed,
  ClipboardCheck,
  ExternalLink,
  FileUp,
  FolderKanban,
  GraduationCap,
  Library,
  Link2,
  NotebookText,
  Plus,
  Presentation,
  Route,
  Sparkles,
  Target,
  Trash2,
  Wand2,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Card, ProgressBar } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/form';
import { Sheet } from '@/components/ui/overlays';
import { FilterChips } from '@/components/ui/tabs';
import { SectionHeader, StatCard } from '@/components/shared/layout-blocks';
import { ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import { COURSE_BY_ID } from '@/data/courses';
import { OPP_BY_ID } from '@/data/opportunities';
import type { Material, MaterialKind } from '@/data/types';
import { KIND_LABEL, materialRelevance, studyPicks, vaultCoverage } from '@/engine/knowledge';
import { bestCourseFor } from '@/engine/intelligence';
import { useOrbit } from '@/store/orbit';
import { useUi } from '@/store/ui';
import { deleteMaterial, questForOpportunity, requestAddToJourney, requestEvidenceQuest } from '@/store/actions';
import { useT } from '@/lib/i18n';
import { cn, relative } from '@/lib/utils';
import { ease, fadeUp, stagger } from '@/lib/motion';

const KIND_ICON: Record<MaterialKind, LucideIcon> = { slides: Presentation, notes: NotebookText, assignment: ClipboardCheck, project: FolderKanban, link: Link2 };
const KIND_TONE: Record<MaterialKind, string> = {
  slides: 'bg-muted-orange text-orange-strong dark:text-orange',
  notes: 'bg-muted-info text-info',
  assignment: 'bg-muted-green text-green-strong dark:text-green',
  project: 'bg-muted-violet text-violet',
  link: 'bg-surface-2 text-muted-foreground',
};

type KindFilter = 'all' | MaterialKind;

export function VaultView() {
  const profile = useOrbit((s) => s.profile)!;
  const materials = useOrbit((s) => s.materials);
  const openAdd = useUi((s) => s.openAddMaterial);
  const openAgent = useUi((s) => s.openAgent);
  const navigate = useNavigate();
  const { t, l } = useT();
  const [filter, setFilter] = useState<KindFilter>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const role = ROLE_BY_ID[profile.targetRole];

  const coverage = useMemo(() => vaultCoverage(materials, profile), [materials, profile]);
  const picks = useMemo(() => studyPicks(materials, profile), [materials, profile]);
  const covered = coverage.filter((c) => c.covered).length;
  const skillsEvidenced = new Set(materials.flatMap((m) => m.skills.filter((s) => s.score >= 55).map((s) => s.skill))).size;

  const counts = (['slides', 'notes', 'assignment', 'project', 'link'] as MaterialKind[]).map((k) => ({ k, n: materials.filter((m) => m.kind === k).length }));
  const q = query.trim().toLowerCase();
  const visible = materials.filter(
    (m) =>
      (filter === 'all' || m.kind === filter) &&
      (!q || m.title.toLowerCase().includes(q) || m.keywords.some((k) => k.includes(q)) || m.skills.some((s) => l(SKILL_BY_ID[s.skill].name).toLowerCase().includes(q)) || (m.courseId && l(COURSE_BY_ID[m.courseId]?.name ?? '').toLowerCase().includes(q))),
  );
  const open = materials.find((m) => m.id === openId);

  if (materials.length === 0) {
    return (
      <Card className="relative overflow-hidden p-6 text-center sm:p-12">
        <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-green/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-lg">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted-green text-green-strong dark:text-green">
            <Library className="size-6" aria-hidden />
          </span>
          <h2 className="mt-5 font-display text-[22px] font-extrabold tracking-tight">{t('Your Knowledge Vault is empty', 'Knowledge Vault-mu masih kosong')}</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
            {t(
              'Add lecture slides, notes, assignments or projects. Orbit reads them, finds the skills inside and tells you what to learn next for {role}.',
              'Tambahkan slide kuliah, catatan, tugas, atau proyek. Orbit membacanya, menemukan skill di dalamnya, dan memberi tahu apa yang perlu dipelajari berikutnya untuk {role}.',
              { role: l(role.name) },
            )}
          </p>
          <ol className="mx-auto mt-6 grid max-w-md gap-2 text-left sm:grid-cols-3">
            {[t('Add a material', 'Tambah materi'), t('Orbit analyses it', 'Orbit menganalisis'), t('Get a study plan', 'Dapat rencana belajar')].map((s, i) => (
              <li key={s} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-[13px] font-semibold">
                <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-full bg-green text-[11px] font-bold text-white">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button size="lg" onClick={() => openAdd()}>
              <FileUp /> {t('Add your first material', 'Tambah materi pertama')}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Library, label: t('Materials', 'Materi'), value: materials.length, hint: t('{n} from your classes', '{n} dari mata kuliahmu', { n: materials.filter((m) => m.courseId).length }), tone: 'green' as const },
          { icon: Sparkles, label: t('Skills evidenced', 'Skill terbukti'), value: skillsEvidenced, hint: t('Found with good confidence', 'Ditemukan dengan keyakinan baik'), tone: 'green' as const },
          { icon: Target, label: t('Goal coverage', 'Cakupan tujuan'), value: `${covered}/${coverage.length}`, hint: t('Skills {role} needs', 'Skill yang dibutuhkan {role}', { role: l(role.name) }), tone: 'orange' as const },
          { icon: BookOpenCheck, label: t('Study next', 'Pelajari berikutnya'), value: picks.length, hint: t('Gaps your materials miss', 'Gap yang belum ada di materimu'), tone: 'info' as const },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <StatCard icon={s.icon} label={s.label} value={s.value} hint={s.hint} tone={s.tone} className="h-full" />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterChips
              className="min-w-0 max-w-full"
              label={t('Filter materials', 'Filter materi')}
              value={filter}
              onChange={setFilter}
              options={[{ value: 'all' as KindFilter, label: t('All', 'Semua'), count: materials.length }, ...counts.filter((c) => c.n > 0).map((c) => ({ value: c.k as KindFilter, label: l(KIND_LABEL[c.k]), count: c.n }))]}
            />
            <Button size="sm" onClick={() => openAdd()} className="shrink-0">
              <Plus /> {t('Add material', 'Tambah materi')}
            </Button>
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder={t('Search titles, skills, classes…', 'Cari judul, skill, mata kuliah…')} label={t('Search your materials', 'Cari materimu')} />

          {visible.length === 0 ? (
            <Card className="p-8 text-center text-[14px] text-muted-foreground">{t('Nothing matches — try another filter or search.', 'Tidak ada yang cocok — coba filter atau pencarian lain.')}</Card>
          ) : (
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {visible.map((m) => (
                  <motion.li key={m.id} layout="position" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25, ease }}>
                    <MaterialCard m={m} onOpen={() => setOpenId(m.id)} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-[88px]">
          <Card className="p-5">
            <SectionHeader icon={Sparkles} title={t('Study next', 'Pelajari berikutnya')} description={t('Gaps for {role} your materials don’t cover yet', 'Gap {role} yang belum ada di materimu', { role: l(role.name) })} />
            {picks.length === 0 ? (
              <p className="flex items-start gap-2 rounded-xl bg-muted-green/60 p-3 text-[13.5px]">
                <Check className="mt-0.5 size-4 shrink-0 text-green" />
                {t('Your materials already show evidence for every gap. Turn the best ones into portfolio case studies.', 'Materimu sudah membuktikan semua gap. Ubah yang terbaik menjadi studi kasus portofolio.')}
              </p>
            ) : (
              <ol className="space-y-3">
                {picks.map((p, i) => {
                  const opp = p.oppId ? OPP_BY_ID[p.oppId] : undefined;
                  const inJourney = opp ? Boolean(questForOpportunity(opp.id)) : false;
                  return (
                    <li key={p.skill} className="rounded-2xl border border-border p-3.5">
                      <div className="flex items-start gap-2.5">
                        <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-full bg-orange text-[11px] font-bold text-white">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-semibold">{l(SKILL_BY_ID[p.skill].name)}</div>
                          <div className="text-[12.5px] text-muted-foreground">{p.reason === 'uncovered-gap' ? t('A gap with no material yet', 'Gap yang belum punya materi') : t('A gap with only weak evidence', 'Gap yang buktinya masih lemah')}</div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5 text-[12.5px]">
                        {p.courseId && COURSE_BY_ID[p.courseId] && (
                          <button type="button" onClick={() => navigate(`/app/learning?view=map&course=${p.courseId}`)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-surface-2">
                            <GraduationCap className="size-3.5 shrink-0 text-green" aria-hidden />
                            <span className="min-w-0 flex-1 truncate">
                              <span className="text-muted-foreground">{t('Your class:', 'Kelasmu:')}</span> <span className="font-semibold">{l(COURSE_BY_ID[p.courseId].name)}</span>
                            </span>
                            <ArrowUpRight className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
                          </button>
                        )}
                        {opp && (
                          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                            <BookOpenCheck className="size-3.5 shrink-0 text-orange" aria-hidden />
                            <span className="min-w-0 flex-1 truncate">
                              <span className="text-muted-foreground">{t('Course:', 'Kursus:')}</span> <span className="font-semibold">{opp.title}</span>
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {opp && (
                          <Button size="xs" variant={inJourney ? 'soft' : 'primary'} onClick={() => (inJourney ? navigate('/app/journey') : requestAddToJourney(opp.id))}>
                            {inJourney ? <Check /> : <Route />} {inJourney ? t('In Journey', 'Ada di Journey') : t('Add to Journey', 'Tambah ke Journey')}
                          </Button>
                        )}
                        <Button size="xs" variant="secondary" onClick={() => openAdd(p.courseId)}>
                          <Plus /> {t('Add a material', 'Tambah materi')}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
            <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => openAgent({ text: t('What should I study next from my materials?', 'Apa yang harus saya pelajari berikutnya dari materi saya?'), intent: 'materials' })}>
              <Sparkles className="text-orange" /> {t('Ask Orbit Agent for a study plan', 'Minta rencana belajar ke Orbit Agent')}
            </Button>
          </Card>

          <Card className="p-5">
            <SectionHeader icon={Target} title={t('Goal coverage', 'Cakupan tujuan')} description={t('{c} of {n} skills for {role} have evidence', '{c} dari {n} skill untuk {role} sudah ada buktinya', { c: covered, n: coverage.length, role: l(role.name) })} />
            <ProgressBar value={(covered / Math.max(1, coverage.length)) * 100} tone="gradient" size="sm" label={t('Goal coverage', 'Cakupan tujuan')} />
            <ul className="mt-4 space-y-2">
              {coverage.map((c) => (
                <li key={c.skill} className="flex items-center gap-2.5 text-[13px]">
                  {c.covered ? <Check className="size-4 shrink-0 text-green" strokeWidth={2.6} aria-hidden /> : <CircleDashed className={cn('size-4 shrink-0', c.materials ? 'text-orange' : 'text-subtle-foreground')} aria-hidden />}
                  <span className={cn('min-w-0 flex-1 truncate', c.covered ? 'font-medium' : 'text-muted-foreground')}>{l(SKILL_BY_ID[c.skill].name)}</span>
                  <span className="tabular shrink-0 text-[12px] text-subtle-foreground">{c.materials ? t('{n} file', '{n} file', { n: c.materials }) : '—'}</span>
                  <span className="sr-only">{c.covered ? t('covered', 'tercakup') : t('not covered', 'belum tercakup')}</span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      <Sheet open={Boolean(open)} onOpenChange={(o) => !o && setOpenId(null)} title={open?.title ?? ''} description={open ? l(KIND_LABEL[open.kind]) : undefined} width={500}>
        {open && <MaterialDetail m={open} onDeleted={() => setOpenId(null)} />}
      </Sheet>
    </div>
  );
}

function MaterialCard({ m, onOpen }: { m: Material; onOpen: () => void }) {
  const profile = useOrbit((s) => s.profile)!;
  const { t, l } = useT();
  const Icon = KIND_ICON[m.kind];
  const reqs = ROLE_BY_ID[profile.targetRole].requirements;
  const rel = materialRelevance(m, profile.targetRole);
  return (
    <button type="button" onClick={onOpen} className="card card-interactive flex h-full w-full flex-col p-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]">
      <div className="flex items-start gap-3">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', KIND_TONE[m.kind])}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 font-display text-[15px] font-bold leading-snug">{m.title}</div>
          <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
            {m.courseId && COURSE_BY_ID[m.courseId] ? l(COURSE_BY_ID[m.courseId].name) : t('Not linked to a class', 'Tidak terhubung ke kelas')} · {relative(m.addedAt)}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {m.skills.slice(0, 3).map((s) => {
          const r = reqs.find((x) => x.skill === s.skill);
          const gap = r ? (profile.skills[s.skill] ?? 0) < r.target : false;
          return (
            <span key={s.skill} className={cn('inline-flex h-6 items-center rounded-full px-2 text-[11.5px] font-semibold', gap ? 'bg-muted-orange text-orange-strong dark:text-orange' : r ? 'bg-muted-green text-green-strong dark:text-green' : 'bg-surface-2 text-muted-foreground')}>
              {l(SKILL_BY_ID[s.skill].name)}
            </span>
          );
        })}
        {m.skills.length === 0 && <span className="text-[12px] text-subtle-foreground">{t('No skills detected', 'Tidak ada skill terdeteksi')}</span>}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[12px]">
        <span className="text-muted-foreground">{l(KIND_LABEL[m.kind])}</span>
        <span className="tabular font-bold text-green-strong dark:text-green">{t('{r}% relevant', '{r}% relevan', { r: rel })}</span>
      </div>
    </button>
  );
}

function MaterialDetail({ m, onDeleted }: { m: Material; onDeleted: () => void }) {
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const openAgent = useUi((s) => s.openAgent);
  const navigate = useNavigate();
  const { t, l } = useT();
  const role = ROLE_BY_ID[profile.targetRole];
  const rel = materialRelevance(m, profile.targetRole);
  const course = m.courseId ? COURSE_BY_ID[m.courseId] : undefined;
  const gapSkill = m.skills.find((s) => {
    const r = role.requirements.find((x) => x.skill === s.skill);
    return r && (profile.skills[s.skill] ?? 0) < r.target;
  });
  const opp = gapSkill ? bestCourseFor(gapSkill.skill, profile.targetRole) : undefined;
  const oppInJourney = opp ? Boolean(questForOpportunity(opp.id)) : false;
  const evidence = m.kind === 'assignment' || m.kind === 'project';
  const evidenceQuest = quests.some((q) => q.templateId === `mat:${m.id}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
        <Badge tone="green">{t('{r}% relevant to {role}', '{r}% relevan untuk {role}', { r: rel, role: l(role.name) })}</Badge>
        <span>{relative(m.addedAt)}</span>
        {m.fileName && <span className="truncate">· {m.fileName}</span>}
        {m.source === 'sample' && <span>· {t('sample', 'contoh')}</span>}
      </div>
      {m.url && (
        <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 text-[13px] font-semibold text-green-strong hover:underline dark:text-green">
          <ExternalLink className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{m.url.replace(/^https?:\/\//, '')}</span>
        </a>
      )}
      {m.summary && <p className="text-[14.5px] leading-relaxed">{m.summary}</p>}

      <section>
        <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t('Skills inside', 'Skill di dalamnya')}</h3>
        <ul className="mt-3 space-y-2.5">
          {m.skills.map((s) => {
            const r = role.requirements.find((x) => x.skill === s.skill);
            const gap = r ? (profile.skills[s.skill] ?? 0) < r.target : false;
            return (
              <li key={s.skill} className="grid grid-cols-[minmax(0,1fr)_100px_34px] items-center gap-3 text-[13.5px]">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{l(SKILL_BY_ID[s.skill].name)}</span>
                  {gap ? <Badge tone="orange" className="h-5 px-1.5 text-[10.5px]">{t('Gap', 'Gap')}</Badge> : r ? <Badge tone="green" className="h-5 px-1.5 text-[10.5px]">{t('Goal', 'Tujuan')}</Badge> : null}
                </span>
                <span className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <motion.span className="block h-full rounded-full orbit-gradient" initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ duration: 0.7, ease }} />
                </span>
                <span className="tabular text-right text-[12.5px] font-bold">{s.score}</span>
              </li>
            );
          })}
        </ul>
        {m.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {m.keywords.map((k) => (
              <span key={k} className="rounded-full bg-surface-2 px-2 py-0.5 text-[12px] text-muted-foreground">
                #{k}
              </span>
            ))}
          </div>
        )}
      </section>

      {course && (
        <button type="button" onClick={() => navigate(`/app/learning?view=map&course=${course.id}`)} className="flex w-full items-center gap-3 rounded-2xl border border-border p-3.5 text-left transition hover:border-border-strong hover:bg-surface-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted-green text-green-strong dark:text-green">
            <GraduationCap className="size-[18px]" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] text-muted-foreground">{t('From your class', 'Dari mata kuliahmu')}</span>
            <span className="block truncate text-[14px] font-semibold">{l(course.name)}</span>
          </span>
          <ArrowUpRight className="size-4 shrink-0 text-subtle-foreground" aria-hidden />
        </button>
      )}

      <section>
        <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t('What Orbit recommends', 'Rekomendasi Orbit')}</h3>
        <ul className="mt-3 space-y-2.5">
          {opp && gapSkill && (
            <li className="rounded-2xl border border-orange/30 bg-muted-orange/30 p-3.5">
              <div className="text-[13.5px] font-semibold">{t('Go deeper on {s}', 'Dalami {s}', { s: l(SKILL_BY_ID[gapSkill.skill].name) })}</div>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">{t('This material touches a gap for {role}. {c} closes it.', 'Materi ini menyentuh gap {role}. {c} menutupnya.', { role: l(role.name), c: opp.title })}</p>
              <Button size="xs" className="mt-2.5" variant={oppInJourney ? 'soft' : 'primary'} onClick={() => (oppInJourney ? navigate('/app/journey') : requestAddToJourney(opp.id))}>
                {oppInJourney ? <Check /> : <Route />} {oppInJourney ? t('In Journey', 'Ada di Journey') : t('Add course to Journey', 'Tambah kursus ke Journey')}
              </Button>
            </li>
          )}
          {evidence && (
            <li className="rounded-2xl border border-green/30 bg-muted-green/30 p-3.5">
              <div className="text-[13.5px] font-semibold">{t('Turn it into portfolio evidence', 'Jadikan bukti portofolio')}</div>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">{t('Recruiters read case studies, not grades. A short write-up makes this count.', 'Rekruter membaca studi kasus, bukan nilai. Tulisan singkat membuat ini berarti.')}</p>
              <Button size="xs" className="mt-2.5" variant={evidenceQuest ? 'soft' : 'primary'} onClick={() => (evidenceQuest ? navigate('/app/journey') : requestEvidenceQuest(m))}>
                {evidenceQuest ? <Check /> : <Wand2 />} {evidenceQuest ? t('In Journey', 'Ada di Journey') : t('Add portfolio quest', 'Tambah quest portofolio')}
              </Button>
            </li>
          )}
          <li className="rounded-2xl border border-border p-3.5">
            <div className="text-[13.5px] font-semibold">{t('Plan your next study session', 'Rencanakan sesi belajar berikutnya')}</div>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">{t('Orbit Agent reads your whole Vault and your goal.', 'Orbit Agent membaca seluruh Vault dan tujuanmu.')}</p>
            <Button size="xs" variant="secondary" className="mt-2.5" onClick={() => openAgent({ text: t('What should I study next from my materials?', 'Apa yang harus saya pelajari berikutnya dari materi saya?'), intent: 'materials' })}>
              <Sparkles className="text-orange" /> {t('Ask Orbit Agent', 'Tanya Orbit Agent')}
            </Button>
          </li>
        </ul>
      </section>

      <div className="border-t border-border pt-4">
        <Button
          variant="danger-soft"
          size="sm"
          onClick={() => {
            deleteMaterial(m.id);
            onDeleted();
          }}
        >
          <Trash2 /> {t('Remove from Vault', 'Hapus dari Vault')}
        </Button>
      </div>
    </div>
  );
}
