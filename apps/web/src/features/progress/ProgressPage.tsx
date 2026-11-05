import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { Award, BookOpenCheck, CheckCircle2, Feather, Flag, Flame, Layers, Lock, Radar, Rocket, Route, Send, TrendingUp, Users, Zap, type LucideIcon } from 'lucide-react';
import { PageHeader, SectionHeader, StatCard } from '@/components/shared/layout-blocks';
import { Card, ProgressBar } from '@/components/ui/primitives';
import { AnimatedNumber, CountUp } from '@/components/brand/brand';
import { useOrbit, useInsights, useHistory } from '@/store/orbit';
import { useIsDark } from '@/store/ui';
import { ACHIEVEMENTS } from '@/engine/achievements';
import { levelInfo, readinessOf, baseDims } from '@/engine/intelligence';
import { MILESTONES } from '@/data/journey';
import { ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import { useT, intlLocale } from '@/lib/i18n';
import { cn, formatDate, relative } from '@/lib/utils';
import { ease, fadeUp, stagger } from '@/lib/motion';

const ACH_ICON: Record<string, LucideIcon> = { route: Route, layers: Layers, radar: Radar, rocket: Rocket, flame: Flame, users: Users, feather: Feather, send: Send };

export default function ProgressPage() {
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const saved = useOrbit((s) => s.saved);
  const journal = useOrbit((s) => s.journal);
  const streak = useOrbit((s) => s.streak);
  const xp = useOrbit((s) => s.xp);
  const activity = useOrbit((s) => s.activity);
  const insights = useInsights()!;
  const history = useHistory();
  const dark = useIsDark();
  const { t, l, locale } = useT();
  const lvl = levelInfo(xp);

  const chart = useMemo(() => {
    const now = new Date();
    return history.map((p, i) => {
      const isNow = i === history.length - 1;
      const d = new Date(now.getFullYear(), now.getMonth() - (history.length - 1 - i), 1);
      return { label: isNow ? t('Now', 'Kini') : d.toLocaleDateString(intlLocale(locale), { month: 'short' }), value: p.value };
    });
  }, [history, t, locale]);

  const first = chart[0]?.value ?? 0;
  const current = insights.readiness;
  const gained = Math.round((current - first) * 10) / 10;
  const doneQuests = quests.filter((q) => q.status === 'done');
  const learning = doneQuests.filter((q) => q.kind === 'learn').length;
  const applications = Object.values(saved).filter((s) => s.status !== 'saved').length;
  const milestonesDone = MILESTONES.filter((m) => {
    const qs = quests.filter((q) => q.milestoneId === m.id);
    return qs.length > 0 && qs.every((q) => q.status === 'done');
  }).length;
  const advanced = Object.values(profile.skills).filter((v) => v >= 3).length;
  const base = baseDims(profile);
  const sinceBaseline = Math.round((current - readinessOf(base)) * 10) / 10;
  const state = { profile, quests, saved, journal, streak, readiness: current };

  const topSkills = Object.entries(profile.skills).filter(([, v]) => v >= 3).slice(0, 2).map(([k]) => l(SKILL_BY_ID[k]?.name ?? k));
  const drivers = [
    { label: t('Completed projects', 'Proyek yang diselesaikan'), detail: t('{n} projects now prove your skills', '{n} proyek kini membuktikan skill-mu', { n: profile.projects.length }), icon: CheckCircle2 },
    { label: t('Stronger core skills', 'Skill inti makin kuat'), detail: topSkills.length ? t('{s} at Advanced', '{s} di level Mahir', { s: topSkills.join(' & ') }) : t('Keep building core skills', 'Terus bangun skill inti'), icon: TrendingUp },
    { label: t('Added internship experience', 'Menambah pengalaman magang'), detail: profile.experiences.find((e) => e.kind === 'internship') ? `${profile.experiences.find((e) => e.kind === 'internship')!.title} · ${profile.experiences.find((e) => e.kind === 'internship')!.org}` : t('Your first internship', 'Magang pertamamu'), icon: Flag },
  ];

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-6">
      <PageHeader stage={t('Grow', 'Tumbuh')} eyebrow={t('Progress', 'Progress')} title={t('Your growth, made visible', 'Pertumbuhanmu, terlihat jelas')} description={t('Every quest, skill and application adds up. Here is how far you have come.', 'Setiap quest, skill, dan lamaran berkontribusi. Ini sejauh mana kamu melangkah.')} />

      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[1.6fr_1fr]">
            <div className="p-5 sm:p-7">
              <div className="eyebrow">{t('Career Readiness trend', 'Tren Career Readiness')}</div>
              <h2 className="mt-2 font-display text-[22px] font-bold leading-snug tracking-tight sm:text-[26px]">
                {gained >= 0 ? t('You improved your readiness by {n} points this year.', 'Kesiapanmu naik {n} poin tahun ini.', { n: Math.round(gained) }) : t('Your readiness changed by {n} points.', 'Kesiapanmu berubah {n} poin.', { n: gained })}
              </h2>
              <div className="mt-5 h-[260px] sm:h-[300px]" role="img" aria-label={t('Readiness from {a}% to {b}%', 'Kesiapan dari {a}% ke {b}%', { a: first, b: Math.round(current) })}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0AB46A" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#0AB46A" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="rl" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0AB46A" />
                        <stop offset="100%" stopColor="#3FC06A" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={dark ? '#212e28' : '#e9efec'} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: dark ? '#9aa9a1' : '#5f6d66', fontSize: 12 }} />
                    <YAxis domain={[40, 100]} ticks={[40, 55, 70, 85, 100]} tickLine={false} axisLine={false} tick={{ fill: dark ? '#6f7f77' : '#8a9690', fontSize: 11 }} />
                    <ReferenceLine y={85} stroke="#FB9002" strokeDasharray="5 5" label={{ value: t('Ready to apply', 'Siap melamar'), position: 'insideTopRight', fill: '#FB9002', fontSize: 11, fontWeight: 600 }} />
                    <RTooltip
                      cursor={{ stroke: dark ? '#2d3d35' : '#d0dad5' }}
                      contentStyle={{ borderRadius: 12, border: `1px solid ${dark ? '#212e28' : '#e4ebe7'}`, background: dark ? '#121b17' : '#fff', boxShadow: '0 12px 30px -12px rgba(0,0,0,.25)', fontSize: 13 }}
                      labelStyle={{ fontWeight: 700, color: dark ? '#e7efea' : '#13201a' }}
                      formatter={(v: number) => [`${v}%`, t('Readiness', 'Kesiapan')]}
                    />
                    <Area type="monotone" dataKey="value" stroke="url(#rl)" strokeWidth={3} fill="url(#rd)" dot={{ r: 3, fill: '#0AB46A', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#FB9002', stroke: dark ? '#121b17' : '#fff', strokeWidth: 3 }} animationDuration={1200} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="border-t border-border bg-gradient-to-br from-mint to-cream p-5 sm:p-7 lg:border-l lg:border-t-0">
              <div className="flex items-end gap-3">
                <div className="font-display text-[48px] font-extrabold leading-none tracking-[-0.04em]">
                  <AnimatedNumber value={Math.round(current)} />
                  <span className="text-[24px] text-muted-foreground">%</span>
                </div>
                <div className="mb-1.5 text-[13px] text-muted-foreground">
                  {t('ready for', 'siap untuk')}
                  <br />
                  <strong className="text-foreground">{l(ROLE_BY_ID[profile.targetRole].name)}</strong>
                </div>
              </div>
              {sinceBaseline > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[12.5px] font-bold text-green-strong shadow-xs dark:text-green">
                  <TrendingUp className="size-3.5" /> +{sinceBaseline}% {t('from quests completed in Orbit', 'dari quest yang selesai di Orbit')}
                </div>
              )}
              <div className="mt-6 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{t('Main drivers', 'Pendorong utama')}</div>
              <ul className="mt-3 space-y-3">
                {drivers.map((d, i) => (
                  <motion.li key={d.label} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease }} className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-green shadow-xs">
                      <d.icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold">{d.label}</div>
                      <div className="text-[12.5px] leading-snug text-muted-foreground">{d.detail}</div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={CheckCircle2} label={t('Quests completed', 'Quest selesai')} value={<CountUp value={doneQuests.length} />} />
        <StatCard icon={Layers} label={t('Skills at Advanced+', 'Skill level Mahir+')} value={<CountUp value={advanced} />} tone="violet" />
        <StatCard icon={BookOpenCheck} label={t('Learning completed', 'Pembelajaran selesai')} value={<CountUp value={learning} />} tone="info" />
        <StatCard icon={Send} label={t('Applications', 'Lamaran')} value={<CountUp value={applications} />} tone="orange" />
        <StatCard icon={Flag} label={t('Milestones reached', 'Milestone tercapai')} value={<CountUp value={milestonesDone} suffix={`/${MILESTONES.length}`} />} className="col-span-2 lg:col-span-1" />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-orange/10 blur-3xl" aria-hidden />
          <SectionHeader icon={Zap} title={t('Level & streak', 'Level & streak')} description={t('XP comes from missions, quests and reflections.', 'XP didapat dari misi, quest, dan refleksi.')} />
          <div className="relative grid gap-5 md:grid-cols-2 md:items-center">
            <div className="flex items-center gap-4">
              <div className="relative flex size-20 shrink-0 items-center justify-center rounded-[22px] bg-[#13201a] text-white shadow-pop dark:bg-surface-3">
                <span className="font-display text-[30px] font-extrabold">{lvl.level}</span>
                <span className="absolute -bottom-2 rounded-full bg-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Lv</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[19px] font-bold">{l(lvl.title)}</div>
                <div className="tabular mt-0.5 text-[13px] text-muted-foreground">
                  {xp.toLocaleString('en-US')} / {lvl.ceil.toLocaleString('en-US')} XP
                </div>
                <ProgressBar value={lvl.progress} tone="gradient" className="mt-2.5" label="XP" />
                <div className="mt-1.5 text-[12px] text-subtle-foreground">{t('{n} XP to Level {l}', '{n} XP lagi ke Level {l}', { n: (lvl.ceil - xp).toLocaleString('en-US'), l: lvl.level + 1 })}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface-2/50 p-4">
              <div className="flex items-center gap-2 font-display text-[16px] font-bold">
                <Flame className="size-5 text-orange" /> {t('{n}-day growth streak', 'Growth streak {n} hari', { n: streak })}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date(Date.now() - (6 - i) * 86_400_000);
                  const active = 6 - i < streak;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }} className={cn('flex size-8 max-w-full items-center justify-center rounded-full', active ? 'bg-orange text-white shadow-orange' : 'bg-surface-3 text-subtle-foreground')}>
                        {active ? <Flame className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
                      </motion.div>
                      <span className="text-[10.5px] font-semibold text-subtle-foreground">{formatDate(d, 'EEEEE')}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[12.5px] text-muted-foreground">{t('Complete one mission or quest a day to keep it going.', 'Selesaikan satu misi atau quest per hari untuk menjaganya.')}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
          <Card className="@container p-5 sm:p-6">
            <SectionHeader icon={Award} title={t('Achievements', 'Achievement')} description={t('{a} of {b} unlocked', '{a} dari {b} terbuka', { a: ACHIEVEMENTS.filter((a) => { const p = a.progress(state); return p.value >= p.goal; }).length, b: ACHIEVEMENTS.length })} />
            <div className="grid gap-2.5 @xl:grid-cols-2 @6xl:grid-cols-4">
              {ACHIEVEMENTS.map((a, i) => {
                const p = a.progress(state);
                const unlocked = p.value >= p.goal;
                const Icon = ACH_ICON[a.icon];
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.04, duration: 0.35, ease }}
                    className={cn('relative flex items-start gap-3 rounded-2xl border p-3.5 transition', unlocked ? 'border-green/30 bg-gradient-to-br from-muted-green/70 to-surface' : 'border-border bg-surface-2/40')}
                  >
                    <div className={cn('relative flex size-11 shrink-0 items-center justify-center rounded-[14px]', unlocked ? 'bg-gradient-to-br from-green to-[#3fc06a] text-white shadow-green' : 'bg-surface-3 text-subtle-foreground')}>
                      <Icon className="size-5" />
                      {!unlocked && (
                        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-surface ring-2 ring-surface">
                          <Lock className="size-3" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className={cn('text-[13.5px] font-bold leading-tight', !unlocked && 'text-foreground/80')}>{l(a.title)}</div>
                        {unlocked ? (
                          <CheckCircle2 className="size-4 shrink-0 text-green" aria-label={t('Unlocked', 'Terbuka')} />
                        ) : (
                          <span className="tabular shrink-0 text-[11px] font-semibold text-subtle-foreground">
                            {p.value}/{p.goal}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{l(a.description)}</div>
                      {!unlocked && <ProgressBar value={(p.value / p.goal) * 100} size="xs" tone="orange" className="mt-2" label={l(a.title)} />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-5 sm:p-6">
          <SectionHeader icon={Route} title={t('Career timeline', 'Linimasa karier')} description={t('Every step you have taken with Orbit.', 'Setiap langkah yang kamu ambil bersama Orbit.')} />
          <ol className="relative ml-1 space-y-5 border-l-2 border-dashed border-border pl-6">
            {activity.slice(0, 12).map((a, i) => (
              <motion.li key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.35, ease }} className="relative">
                <span className={cn('absolute -left-[33px] top-0.5 flex size-4 items-center justify-center rounded-full ring-4 ring-surface', a.kind === 'achievement' ? 'bg-orange' : a.kind === 'apply' ? 'bg-info' : 'bg-green')} />
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="text-[14.5px] font-semibold">{l(a.title)}</div>
                  <div className="shrink-0 text-[12px] text-subtle-foreground">
                    {formatDate(a.at, 'd MMM yyyy')} · {relative(a.at)}
                  </div>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-[12.5px]">
                  {a.detail && <span className="text-muted-foreground">{l(a.detail)}</span>}
                  {a.xp ? <span className="font-semibold text-orange-strong dark:text-orange">+{a.xp} XP</span> : null}
                  {a.readiness ? <span className="font-semibold text-green-strong dark:text-green">+{a.readiness}% {t('readiness', 'kesiapan')}</span> : null}
                </div>
              </motion.li>
            ))}
          </ol>
        </Card>
      </motion.div>
    </motion.div>
  );
}
