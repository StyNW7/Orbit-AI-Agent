import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BellRing,
  Bookmark,
  CalendarClock,
  Check,
  CheckCircle2,
  Compass,
  Flame,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Play,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { ReadinessRing, AnimatedNumber } from '@/components/brand/brand';
import { Badge, Card, ProgressBar } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { CardLink, EmptyState, ImpactPill, SectionHeader } from '@/components/shared/layout-blocks';
import { useOrbit, useInsights } from '@/store/orbit';
import { useUi } from '@/store/ui';
import { moveQuest, requestAddToJourney } from '@/store/actions';
import { DIMENSIONS, DIM_LABEL, DIM_SHORT, levelInfo, matchOpportunity, nextBestAction, skillProfile } from '@/engine/intelligence';
import { ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import { MILESTONES } from '@/data/journey';
import { BAND_LABEL, courseRelevance, courseStatus, curriculumFor, relevanceBand } from '@/data/courses';
import { OPPORTUNITIES, OPP_BY_ID, TYPE_LABEL } from '@/data/opportunities';
import { useT } from '@/lib/i18n';
import { GettingStarted } from './GettingStarted';
import { cn, daysFromNow, daysUntil, deadlineLabel, formatDate, friendlyDate, greetingFor, relative } from '@/lib/utils';
import { ease, fadeUp, stagger } from '@/lib/motion';

export default function TodayPage() {
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const missions = useOrbit((s) => s.missions);
  const toggleMission = useOrbit((s) => s.toggleMission);
  const xp = useOrbit((s) => s.xp);
  const streak = useOrbit((s) => s.streak);
  const r30 = useOrbit((s) => s.readiness30dAgo);
  const insights = useInsights()!;
  const openAgent = useUi((s) => s.openAgent);
  const navigate = useNavigate();
  const { t, l } = useT();
  const role = ROLE_BY_ID[profile.targetRole];
  const nba = useMemo(() => nextBestAction(profile, quests), [profile, quests]);
  const lvl = levelInfo(xp);
  const delta = Math.round((insights.readiness - r30) * 10) / 10;
  const topGap = insights.opportunity;
  const doneMissions = missions.filter((m) => m.done).length;

  const nbaPrimary = () => {
    if (!nba) return navigate('/app/discover');
    if (nba.stage === 'add' && nba.oppId) return requestAddToJourney(nba.oppId, (qid) => navigate(`/app/journey?quest=${qid}`));
    if (nba.stage === 'start' && nba.questId) return moveQuest(nba.questId, 'doing');
    if (nba.questId) return navigate(`/app/journey?quest=${nba.questId}`);
  };

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-6">
      {/* Greeting */}
      <motion.section variants={fadeUp} className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="eyebrow">{formatDate(new Date(), 'EEEE, d MMMM yyyy')}</div>
          <h1 className="mt-2 font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[40px]">
            {greetingFor()}, {profile.name.split(' ')[0]}.
          </h1>
          <p className="mt-2 text-[17px] font-semibold sm:text-[19px]">
            {t('You are', 'Kamu')} <span className="orbit-gradient-text">{Math.round(insights.readiness)}% {t('ready', 'siap')}</span> {t('for', 'untuk')} {l(role.name)}.
          </p>
          <p className="mt-1 max-w-2xl text-[14.5px] text-muted-foreground">
            {t('Your strongest area is {s}.', 'Area terkuatmu adalah {s}.', { s: l(DIM_LABEL[insights.strength.dim]).toLowerCase() })}{' '}
            {topGap && t('Your biggest growth opportunity is {g}.', 'Peluang pertumbuhan terbesarmu adalah {g}.', { g: l(SKILL_BY_ID[topGap.skill].name) })}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] gap-2 lg:flex">
          <Link to="/app/progress" className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-3.5 py-2.5 shadow-xs transition hover:border-border-strong hover:shadow-card">
            <span className="flex size-8 items-center justify-center rounded-xl bg-muted-orange text-orange">
              <Flame className="size-4" />
            </span>
            <div>
              <div className="tabular text-[15px] font-bold leading-none">{t('{n} days', '{n} hari', { n: streak })}</div>
              <div className="mt-1 text-[11.5px] text-muted-foreground">{t('Growth streak', 'Growth streak')}</div>
            </div>
          </Link>
          <Link to="/app/progress" className="flex min-w-0 items-center gap-3 rounded-2xl lg:min-w-[220px] border border-border bg-surface px-3.5 py-2.5 shadow-xs transition hover:border-border-strong hover:shadow-card">
            <span className="flex size-8 items-center justify-center rounded-xl bg-muted-green text-green-strong dark:text-green">
              <Zap className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-bold leading-none">
                  Lv. {lvl.level} · {l(lvl.title)}
                </span>
              </div>
              <ProgressBar value={lvl.progress} size="xs" tone="gradient" className="mt-1.5" label="XP" />
              <div className="tabular mt-1 text-[11.5px] text-muted-foreground">
                {xp.toLocaleString('en-US')} / {lvl.ceil.toLocaleString('en-US')} XP
              </div>
            </div>
          </Link>
        </div>
      </motion.section>

      <motion.div variants={fadeUp}>
        <GettingStarted />
      </motion.div>

      {/* Readiness + Next Best Action */}
      <div className="grid gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <motion.div variants={fadeUp} className="lg:col-span-7">
          <Card className="relative flex h-full flex-col justify-center overflow-hidden p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-green/8 blur-3xl" aria-hidden />
            <div className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center">
                <ReadinessRing score={insights.readiness} size={176} stroke={13} />
                <div className={cn('mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-bold', delta >= 0 ? 'bg-muted-green text-green-strong dark:text-green' : 'bg-muted-danger text-danger')}>
                  <TrendingUp className="size-3.5" />
                  <AnimatedNumber value={delta} decimals={1} suffix="%" prefix={delta >= 0 ? '+' : ''} />
                  <span className="font-medium opacity-80">· {t('30 days', '30 hari')}</span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="eyebrow">{t('Career Readiness', 'Career Readiness')}</div>
                <div className="mt-1 font-display text-[22px] font-bold tracking-tight">{l(role.name)}</div>
                <p className="mt-1 text-[13.5px] text-muted-foreground">{t('Six dimensions, each explained. Tap through for the full analysis.', 'Enam dimensi, semuanya dijelaskan. Buka analisis lengkap untuk detailnya.')}</p>
                <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
                  {DIMENSIONS.map((d) => (
                    <div key={d}>
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="truncate font-medium text-muted-foreground">{l(DIM_SHORT[d])}</span>
                        <span className="tabular font-bold">{Math.round(insights.dims[d])}</span>
                      </div>
                      <ProgressBar value={insights.dims[d]} size="sm" tone={d === insights.priorityGap.dim ? 'orange' : 'green'} className="mt-1" label={l(DIM_LABEL[d])} />
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <CardLink to="/app/intelligence">{t('See the full analysis', 'Lihat analisis lengkap')}</CardLink>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-5">
          <div className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-[#1e3a2c] bg-[#0f1d16] p-6 text-white shadow-pop sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-green/30 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full bg-orange/20 blur-3xl" aria-hidden />
            <svg className="pointer-events-none absolute -right-16 top-10 size-64 opacity-[0.12]" viewBox="0 0 200 200" aria-hidden>
              <ellipse cx="100" cy="100" rx="90" ry="38" transform="rotate(-25 100 100)" stroke="white" fill="none" strokeDasharray="3 6" />
              <ellipse cx="100" cy="100" rx="60" ry="24" transform="rotate(-25 100 100)" stroke="white" fill="none" />
            </svg>
            <div className="relative flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-orange">
              <Sparkles className="size-4" /> {t('Next Best Action', 'Next Best Action')}
            </div>
            {nba ? (
              <>
                <h2 className="relative mt-3 font-display text-[24px] font-bold leading-tight tracking-tight text-white sm:text-[26px]">{l(nba.title)}</h2>
                <p className="relative mt-2 text-[14px] leading-relaxed text-white/70">{l(nba.reason)}</p>
                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                    <div className="text-[11.5px] font-semibold uppercase tracking-wider text-white/50">{t('Estimated impact', 'Perkiraan dampak')}</div>
                    <div className="tabular mt-1 font-display text-[22px] font-bold text-[#4ee39a]">+{nba.impact}%</div>
                    <div className="text-[11.5px] text-white/50">{t('career readiness', 'career readiness')}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                    <div className="text-[11.5px] font-semibold uppercase tracking-wider text-white/50">{t('Status', 'Status')}</div>
                    <div className="mt-1 font-display text-[15px] font-bold leading-snug">
                      {nba.stage === 'add' ? t('Not in journey yet', 'Belum di journey') : nba.stage === 'start' ? t('Ready to start', 'Siap dimulai') : t('In progress', 'Sedang berjalan')}
                    </div>
                    <div className="mt-1 text-[11.5px] text-white/50">{nba.oppId && OPP_BY_ID[nba.oppId] ? `${l(TYPE_LABEL[OPP_BY_ID[nba.oppId].type])} · ${OPP_BY_ID[nba.oppId].org}` : ''}</div>
                  </div>
                </div>
                <div className="relative mt-auto flex flex-wrap gap-2 pt-6">
                  <Button variant="primary" size="md" onClick={nbaPrimary}>
                    {nba.stage === 'add' ? (
                      <>
                        <Target /> {t('Add to Journey', 'Tambah ke Journey')}
                      </>
                    ) : nba.stage === 'start' ? (
                      <>
                        <Play /> {t('Start quest', 'Mulai quest')}
                      </>
                    ) : (
                      <>
                        {t('Continue quest', 'Lanjutkan quest')} <ArrowRight />
                      </>
                    )}
                  </Button>
                  {nba.stage === 'complete' && nba.questId ? (
                    <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white" onClick={() => moveQuest(nba.questId!, 'done')}>
                      <Check /> {t('Mark complete', 'Tandai selesai')}
                    </Button>
                  ) : (
                    <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white" onClick={() => openAgent({ text: t('Show me alternatives', 'Tunjukkan alternatif'), intent: 'alternatives', arg: nba.skill })}>
                      <Compass /> {t('Explore Alternatives', 'Lihat Alternatif')}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p className="relative mt-3 text-white/70">{t('Your journey is complete. Explore new opportunities to keep growing.', 'Journey-mu sudah selesai. Jelajahi peluang baru untuk terus bertumbuh.')}</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Missions + Journey */}
      <div className="grid gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <motion.div variants={fadeUp} className="lg:col-span-5">
          <Card className="h-full p-5 sm:p-6">
            <SectionHeader
              icon={ListChecks}
              title={t('Today’s missions', 'Misi hari ini')}
              description={t('{a} of {b} completed', '{a} dari {b} selesai', { a: doneMissions, b: missions.length })}
              action={<span className="tabular rounded-full bg-muted-orange px-2.5 py-1 text-[12px] font-bold text-orange-strong dark:text-orange">+{missions.filter((m) => !m.done).reduce((s, m) => s + m.xp, 0)} XP</span>}
            />
            <ProgressBar value={(doneMissions / Math.max(missions.length, 1)) * 100} size="sm" className="mb-4" label={t('Missions completed', 'Misi selesai')} />
            <ul className="space-y-1.5">
              {missions.map((m) => (
                <li key={m.id}>
                  <div className={cn('group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-2', m.done && 'opacity-70')}>
                    <button
                      type="button"
                      onClick={() => toggleMission(m.id)}
                      aria-pressed={m.done}
                      aria-label={m.done ? t('Mark “{m}” as not done', 'Tandai “{m}” belum selesai', { m: l(m.title) }) : t('Complete “{m}”', 'Selesaikan “{m}”', { m: l(m.title) })}
                      className={cn('flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-all', m.done ? 'scale-100 border-green bg-green text-white' : 'border-border-strong hover:scale-110 hover:border-green')}
                    >
                      {m.done && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check className="size-3" strokeWidth={3.5} />
                        </motion.span>
                      )}
                    </button>
                    <Link to={m.to ?? '/app'} className={cn('min-w-0 flex-1 truncate text-[14px] font-medium', m.done && 'text-muted-foreground line-through')}>
                      {l(m.title)}
                    </Link>
                    <span className="shrink-0 text-[12px] text-subtle-foreground">{m.minutes}m</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp} className="lg:col-span-7">
          <JourneyPulse />
        </motion.div>
      </div>

      {/* Deadlines + Saved + Agent */}
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3 [&>*]:min-w-0">
        <motion.div variants={fadeUp}>
          <Deadlines />
        </motion.div>
        <motion.div variants={fadeUp}>
          <SavedOpps />
        </motion.div>
        <motion.div variants={fadeUp} className="md:col-span-2 2xl:col-span-1">
          <AgentInsight />
        </motion.div>
      </div>

      {/* Classes → career */}
      <motion.div variants={fadeUp}>
        <FromYourClasses />
      </motion.div>

      {/* Growth + Resources */}
      <div className="grid gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <motion.div variants={fadeUp} className="lg:col-span-5">
          <RecentGrowth />
        </motion.div>
        <motion.div variants={fadeUp} className="lg:col-span-7">
          <Resources />
        </motion.div>
      </div>
    </motion.div>
  );
}

function JourneyPulse() {
  const quests = useOrbit((s) => s.quests);
  const profile = useOrbit((s) => s.profile)!;
  const { t, l } = useT();
  const total = quests.length;
  const done = quests.filter((q) => q.status === 'done').length;
  const doing = quests.filter((q) => q.status === 'doing');
  const current = MILESTONES.find((m) => quests.some((q) => q.milestoneId === m.id && q.status !== 'done')) ?? MILESTONES[MILESTONES.length - 1];
  if (!total)
    return (
      <Card className="h-full">
        <EmptyState
          icon={Route}
          title={t('Your journey starts with one goal.', 'Journey-mu dimulai dari satu tujuan.')}
          description={t('Add your Next Best Action and Orbit will help map the steps.', 'Tambahkan Next Best Action dan Orbit akan membantu memetakan langkahnya.')}
          action={
            <Button asChild>
              <Link to="/app/journey">{t('Open Journey', 'Buka Journey')}</Link>
            </Button>
          }
        />
      </Card>
    );
  return (
    <Card className="@container h-full p-5 sm:p-6">
      <SectionHeader
        icon={Route}
        title={t('Journey progress', 'Progres journey')}
        description={t('{role} Career Path · {d} of {n} quests done', '{role} Career Path · {d} dari {n} quest selesai', { role: l(ROLE_BY_ID[profile.targetRole].name), d: done, n: total })}
        action={<CardLink to="/app/journey">{t('Open', 'Buka')}</CardLink>}
      />
      <div className="grid grid-cols-3 gap-1.5 @2xl:grid-cols-6">
        {MILESTONES.map((m) => {
          const qs = quests.filter((q) => q.milestoneId === m.id);
          const pct = qs.length ? (qs.filter((q) => q.status === 'done').length / qs.length) * 100 : 0;
          const isCurrent = m.id === current.id;
          return (
            <div key={m.id} title={l(m.title)} className={cn('flex flex-col rounded-xl border p-2.5 transition-colors', isCurrent ? 'border-green/40 bg-muted-green/60' : 'border-border')}>
              <div className={cn('line-clamp-2 min-h-[2lh] text-[11.5px] font-bold leading-tight', isCurrent ? 'text-green-strong dark:text-green' : 'text-muted-foreground')}>{l(m.title)}</div>
              <ProgressBar value={pct} size="xs" className="mt-2" label={l(m.title)} />
              <div className="tabular mt-1.5 text-[11px] text-subtle-foreground">
                {qs.filter((q) => q.status === 'done').length}/{qs.length}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5">
        <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-subtle-foreground">{t('In progress', 'Sedang berjalan')}</div>
        {doing.length === 0 ? (
          <p className="text-[13.5px] text-muted-foreground">{t('Nothing in progress. Start your Next Best Action.', 'Belum ada yang berjalan. Mulai Next Best Action-mu.')}</p>
        ) : (
          <ul className="space-y-2">
            {doing.slice(0, 3).map((q) => {
              const pct = q.steps.length ? (q.steps.filter((s) => s.done).length / q.steps.length) * 100 : 0;
              return (
                <li key={q.id}>
                  <Link to={`/app/journey?quest=${q.id}`} className="group flex items-center gap-3 rounded-xl border border-border p-3 transition hover:border-border-strong hover:bg-surface-2/50">
                    <span className="relative flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-muted-orange text-orange">
                      <Play className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold">{l(q.title)}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <ProgressBar value={pct} size="xs" tone="orange" className="max-w-[160px]" label={l(q.title)} />
                        <span className="tabular text-[11.5px] text-subtle-foreground">{Math.round(pct)}%</span>
                      </div>
                    </div>
                    <ImpactPill value={q.impact} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}

function Deadlines() {
  const reminders = useOrbit((s) => s.reminders);
  const saved = useOrbit((s) => s.saved);
  const quests = useOrbit((s) => s.quests);
  const navigate = useNavigate();
  const { t, l } = useT();
  const items = useMemo(() => {
    const out: { key: string; title: string; meta: string; date: string; tone: 'orange' | 'green' | 'info'; to: string }[] = [];
    reminders.filter((r) => !r.done).forEach((r) => out.push({ key: r.id, title: r.title, meta: `${t('Reminder', 'Pengingat')} · ${r.time}`, date: r.date, tone: 'info', to: r.oppId ? `/app/discover?open=${r.oppId}` : '/app' }));
    Object.values(saved).forEach((s) => {
      const o = OPP_BY_ID[s.oppId];
      if (o?.deadlineInDays && s.status === 'saved') out.push({ key: o.id, title: o.title, meta: `${o.org} · ${deadlineLabel(daysFromNow(o.deadlineInDays))}`, date: daysFromNow(o.deadlineInDays), tone: 'orange', to: `/app/discover?open=${o.id}` });
    });
    quests.filter((q) => q.due && q.status !== 'done').forEach((q) => out.push({ key: q.id, title: l(q.title), meta: t('Quest due', 'Tenggat quest'), date: q.due!, tone: 'green', to: `/app/journey?quest=${q.id}` }));
    return out.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  }, [reminders, saved, quests, t, l]);
  return (
    <Card className="h-full p-5 sm:p-6">
      <SectionHeader icon={CalendarClock} title={t('Upcoming deadlines', 'Deadline mendatang')} description={t('Reminders, applications and quests', 'Pengingat, lamaran, dan quest')} />
      {items.length === 0 ? (
        <EmptyState compact icon={BellRing} title={t('No deadlines ahead', 'Tidak ada deadline')} description={t('Create reminders from opportunities you save.', 'Buat pengingat dari peluang yang kamu simpan.')} />
      ) : (
        <ul className="space-y-1">
          {items.map((it) => {
            const d = daysUntil(it.date) ?? 0;
            return (
              <li key={it.key}>
                <button type="button" onClick={() => navigate(it.to)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-surface-2">
                  <div className={cn('flex w-11 shrink-0 flex-col items-center rounded-xl py-1.5', it.tone === 'orange' ? 'bg-muted-orange text-orange-strong dark:text-orange' : it.tone === 'info' ? 'bg-muted-info text-info' : 'bg-muted-green text-green-strong dark:text-green')}>
                    <span className="text-[10px] font-bold uppercase">{formatDate(it.date, 'MMM')}</span>
                    <span className="tabular font-display text-[17px] font-bold leading-none">{formatDate(it.date, 'd')}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-[14px] font-semibold" title={it.title}>{it.title}</div>
                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[12.5px]">
                      <span className={cn('shrink-0 font-semibold', d <= 3 ? 'text-orange-strong dark:text-orange' : 'text-foreground/70')}>{friendlyDate(it.date)}</span>
                      <span className="text-subtle-foreground" aria-hidden>·</span>
                      <span className="truncate text-muted-foreground">{it.meta}</span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function SavedOpps() {
  const saved = useOrbit((s) => s.saved);
  const profile = useOrbit((s) => s.profile)!;
  const navigate = useNavigate();
  const { t, l } = useT();
  const list = Object.values(saved)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);
  const STATUS: Record<string, string> = { saved: t('Saved', 'Disimpan'), applied: t('Applied', 'Dilamar'), interview: t('Interview', 'Wawancara'), offer: t('Offer', 'Tawaran'), closed: t('Closed', 'Ditutup') };
  return (
    <Card className="h-full p-5 sm:p-6">
      <SectionHeader icon={Bookmark} title={t('Saved opportunities', 'Peluang tersimpan')} description={t('{n} tracked', '{n} dilacak', { n: Object.keys(saved).length })} action={<CardLink to="/app/discover?view=saved">{t('All', 'Semua')}</CardLink>} />
      {list.length === 0 ? (
        <EmptyState
          compact
          icon={Bookmark}
          title={t('Nothing saved yet.', 'Belum ada yang disimpan.')}
          description={t('Explore opportunities matched to your skills and career goals.', 'Jelajahi peluang yang cocok dengan skill dan tujuan kariermu.')}
          action={
            <Button size="sm" asChild>
              <Link to="/app/discover">{t('Explore Opportunities', 'Jelajahi Peluang')}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {list.map((s) => {
            const o = OPP_BY_ID[s.oppId];
            if (!o) return null;
            const m = matchOpportunity(o, profile);
            return (
              <li key={s.oppId}>
                <button type="button" onClick={() => navigate(`/app/discover?open=${o.id}`)} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-border-strong hover:bg-surface-2/50">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold">{o.title}</div>
                    <div className="truncate text-[12.5px] text-muted-foreground">
                      {l(TYPE_LABEL[o.type])} · {o.org}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="tabular text-[12.5px] font-bold text-green-strong dark:text-green">{m.score}%</span>
                    <Badge tone={s.status === 'saved' ? 'neutral' : s.status === 'offer' ? 'green' : 'info'} className="h-5 text-[11px]">
                      {STATUS[s.status]}
                    </Badge>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function AgentInsight() {
  const profile = useOrbit((s) => s.profile)!;
  const openAgent = useUi((s) => s.openAgent);
  const insights = useInsights()!;
  const { t, l } = useT();
  const gap = skillProfile(profile).find((g) => g.isGap);
  const pd = insights.priorityGap;
  return (
    <div className="relative h-full overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-mint via-surface to-cream p-5 shadow-card sm:p-6">
      <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-green-strong dark:text-green">
        <Lightbulb className="size-4" /> {t('Orbit Agent insight', 'Insight Orbit Agent')}
      </div>
      <p className="mt-3 font-display text-[18px] font-bold leading-snug">
        {t('{d} is your weakest dimension at {s}%.', '{d} adalah dimensi terlemahmu di {s}%.', { d: l(DIM_LABEL[pd.dim]), s: Math.round(pd.score) })}
      </p>
      <p className="mt-2 text-[13.5px] text-muted-foreground">
        {gap
          ? t('Pair {g} practice with one mock interview this week — together they lift two dimensions at once.', 'Gabungkan latihan {g} dengan satu mock interview minggu ini — keduanya menaikkan dua dimensi sekaligus.', { g: l(SKILL_BY_ID[gap.skill].name) })
          : t('One recorded mock interview this week would lift this dimension fastest.', 'Satu mock interview terekam minggu ini akan menaikkan dimensi ini paling cepat.')}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => openAgent({ text: t('How can I improve my readiness?', 'Bagaimana cara meningkatkan kesiapan saya?') })}>
          <Sparkles /> {t('Ask Orbit why', 'Tanya Orbit kenapa')}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => openAgent({ text: t('Build me a learning plan.', 'Buatkan saya rencana belajar.') })}>
          {t('Build a plan', 'Buat rencana')}
        </Button>
      </div>
    </div>
  );
}

/** The classes a learner is taking now, read against their career goal. */
function FromYourClasses() {
  const profile = useOrbit((s) => s.profile)!;
  const { t, l } = useT();
  const { items, mode } = useMemo(() => {
    const all = curriculumFor(profile.major).map((c) => ({ c, score: courseRelevance(c, profile.targetRole), status: courseStatus(c, profile.semester) }));
    const current = all.filter((x) => x.status === 'current');
    const next = all.filter((x) => x.status === 'next');
    const pool = current.length ? current : next.length ? next : all;
    return { items: [...pool].sort((a, b) => b.score - a.score).slice(0, 3), mode: current.length ? 'current' : next.length ? 'next' : 'done' };
  }, [profile]);
  if (!items.length) return null;
  const role = l(ROLE_BY_ID[profile.targetRole].name);
  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        icon={GraduationCap}
        title={t('From your classes', 'Dari mata kuliahmu')}
        description={
          mode === 'current'
            ? t('This semester’s classes, read against your {role} goal', 'Mata kuliah semester ini, dibaca terhadap tujuan {role}-mu', { role })
            : mode === 'next'
              ? t('Coming up next — and what they will do for your {role} goal', 'Berikutnya — dan manfaatnya untuk tujuan {role}-mu', { role })
              : t('Classes you have finished that power your {role} goal', 'Mata kuliah yang sudah selesai dan mendukung tujuan {role}-mu', { role })
        }
        action={<CardLink to="/app/learning?view=map">Learning Map</CardLink>}
      />
      <div className="grid gap-3 md:grid-cols-3">
        {items.map(({ c, score }) => {
          const band = relevanceBand(score);
          return (
            <Link key={c.id} to={`/app/learning?view=map&course=${c.id}`} className="card-interactive group flex flex-col rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <Badge tone={band === 'core' || band === 'strong' ? 'green' : band === 'useful' ? 'orange' : 'neutral'}>{l(BAND_LABEL[band])}</Badge>
                <span className="tabular text-[12.5px] font-bold text-green-strong dark:text-green">{score}%</span>
              </div>
              <div className="mt-3 font-display text-[15px] font-bold leading-snug">{l(c.name)}</div>
              <div className="mt-1 truncate text-[12.5px] text-muted-foreground">{c.skills.slice(0, 3).map((s) => l(SKILL_BY_ID[s.skill].name)).join(' · ')}</div>
              <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">{t('Applied idea:', 'Ide terapan:')}</span> {l(c.project)}
              </p>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function RecentGrowth() {
  const activity = useOrbit((s) => s.activity);
  const { t, l } = useT();
  return (
    <Card className="h-full p-5 sm:p-6">
      <SectionHeader icon={TrendingUp} title={t('Recent growth', 'Pertumbuhan terbaru')} action={<CardLink to="/app/progress">{t('Progress', 'Progress')}</CardLink>} />
      <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-border">
        {activity.slice(0, 5).map((a, i) => (
          <motion.li key={a.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.3, ease }} className="relative flex gap-3 pl-0">
            <span className={cn('relative z-10 mt-0.5 flex size-[23px] shrink-0 items-center justify-center rounded-full ring-4 ring-surface', a.kind === 'achievement' ? 'bg-orange text-white' : 'bg-green text-white')}>
              <CheckCircle2 className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium leading-snug">{l(a.title)}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-subtle-foreground">
                <span>{relative(a.at)}</span>
                {a.detail && <span>· {l(a.detail)}</span>}
                {a.xp ? <span className="font-semibold text-orange-strong dark:text-orange">+{a.xp} XP</span> : null}
                {a.readiness ? <span className="font-semibold text-green-strong dark:text-green">+{a.readiness}% {t('readiness', 'kesiapan')}</span> : null}
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
    </Card>
  );
}

function Resources() {
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const navigate = useNavigate();
  const { t, l } = useT();
  const list = useMemo(() => {
    const gaps = new Set(skillProfile(profile).filter((g) => g.isGap).map((g) => g.skill));
    return OPPORTUNITIES.filter((o) => ['course', 'mentor', 'book', 'event'].includes(o.type) && o.skills.some((s) => gaps.has(s)))
      .map((o) => ({ o, m: matchOpportunity(o, profile, quests) }))
      .sort((a, b) => b.m.score - a.m.score)
      .slice(0, 4);
  }, [profile, quests]);
  return (
    <Card className="h-full p-5 sm:p-6">
      <SectionHeader icon={Sparkles} title={t('Recommended for your gaps', 'Rekomendasi untuk gap-mu')} description={t('Courses, mentors and events that close what matters most', 'Kursus, mentor, dan event yang menutup gap terpenting')} action={<CardLink to="/app/discover">{t('Discover', 'Discover')}</CardLink>} />
      <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
        {list.map(({ o, m }) => (
          <button
            key={o.id}
            type="button"
            onClick={() => navigate(`/app/discover?open=${o.id}`)}
            className="card-interactive group w-[78%] shrink-0 snap-start rounded-2xl border border-border bg-surface p-4 text-left sm:w-auto"
          >
            <div className="flex items-center justify-between gap-2">
              <Badge tone={o.type === 'course' ? 'green' : o.type === 'mentor' ? 'violet' : o.type === 'event' ? 'info' : 'neutral'}>{l(TYPE_LABEL[o.type])}</Badge>
              <span className="tabular text-[12.5px] font-bold text-green-strong dark:text-green">{m.score}%</span>
            </div>
            <div className="mt-3 line-clamp-2 font-display text-[15px] font-bold leading-snug">{o.title}</div>
            <div className="mt-1 truncate text-[12.5px] text-muted-foreground">{o.org}</div>
            {m.closes && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-orange-strong dark:text-orange">
                <Target className="size-3.5" />
                {t('Closes {g}', 'Menutup {g}', { g: l(SKILL_BY_ID[m.closes].name) })}
              </div>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}
