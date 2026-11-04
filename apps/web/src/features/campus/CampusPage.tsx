import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, BookOpen, Building2, CalendarCheck, Check, GraduationCap, HeartHandshake, LifeBuoy, Lock, Route, Sparkles, Target, TrendingUp, UsersRound, Briefcase, Plus } from 'lucide-react';
import { MarketingFooter, MarketingNav, SectionIntro, useLenis } from '@/features/landing/chrome';
import { Card, ProgressBar } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/form';
import { CountUp } from '@/components/brand/brand';
import { FACULTIES, GOAL_LABEL, GUIDANCE_SEGMENTS, PROGRAMS, type FacultyId, type FacultyStats } from '@/data/campus';
import { useOrbit } from '@/store/orbit';
import { useIsDark } from '@/store/ui';
import { useT, intlLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';

const GOAL_COLORS = ['#0AB46A', '#13201A', '#3B82C4', '#FB9002', '#7C6CD8'];

export default function CampusPage() {
  useLenis();
  const { t, l } = useT();
  return (
    <div className="min-h-dvh bg-background">
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden pb-12 pt-32 sm:pt-40">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-70 [mask-image:radial-gradient(ellipse_at_top,#000_25%,transparent_70%)]" aria-hidden />
          <div className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-green/12 blur-3xl" aria-hidden />
          <div className="container-orbit relative text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-semibold shadow-xs">
              <Building2 className="size-4 text-green" /> Orbit for Campus
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.05 }} className="mx-auto mt-5 max-w-4xl font-display text-[38px] font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-[56px] lg:text-[64px]">
              {t('Individual career intelligence,', 'Career intelligence individu,')} <span className="orbit-gradient-text">{t('actionable campus insight.', 'insight kampus yang actionable.')}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.12 }} className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              {t('Career centers see where students stand, which skill gaps are growing and which programs will move readiness most — using aggregate data only.', 'Career center bisa melihat posisi mahasiswa, gap skill yang membesar, dan program yang paling meningkatkan kesiapan — hanya dengan data agregat.')}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.2 }} className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}>
                {t('Explore the dashboard', 'Jelajahi dashboard')} <ArrowRight />
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/start?demo=1">{t('See the student experience', 'Lihat pengalaman mahasiswa')}</Link>
              </Button>
            </motion.div>
            <EcosystemFlow />
          </div>
        </section>
        <Dashboard />
        <section className="py-20 sm:py-24">
          <div className="container-orbit">
            <SectionIntro center eyebrow={t('Why it matters', 'Kenapa penting')} title={t('From reactive advising to data-informed student development.', 'Dari bimbingan reaktif ke pengembangan mahasiswa berbasis data.')} />
            <motion.div variants={stagger(0.08)} {...reveal} className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                { icon: Target, title: t('See gaps early', 'Lihat gap lebih awal'), body: t('Spot the skills a cohort is missing months before recruitment season.', 'Temukan skill yang kurang di suatu angkatan berbulan-bulan sebelum musim rekrutmen.') },
                { icon: CalendarCheck, title: t('Plan programs that work', 'Rencanakan program yang efektif'), body: t('Every recommended program shows who it reaches and its expected readiness impact.', 'Setiap program yang direkomendasikan menunjukkan siapa sasarannya dan perkiraan dampaknya.') },
                { icon: LifeBuoy, title: t('Reach students who need help', 'Jangkau yang butuh bantuan'), body: t('Anonymised segments show where guidance matters most — without exposing individuals.', 'Segmen anonim menunjukkan di mana bimbingan paling dibutuhkan — tanpa membuka data individu.') },
              ].map((c) => (
                <motion.div key={c.title} variants={fadeUp}>
                  <Card className="h-full p-6">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-muted-green text-green-strong dark:text-green">
                      <c.icon className="size-5" />
                    </span>
                    <h3 className="mt-5 font-display text-[19px] font-bold">{c.title}</h3>
                    <p className="mt-2 text-[14.5px] text-muted-foreground">{c.body}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            <p className="mt-8 flex items-center justify-center gap-2 text-center text-[13px] text-muted-foreground">
              <Lock className="size-4 text-green" /> {l({ en: 'Students own their data. Campuses only ever see aggregated, anonymised insight.', id: 'Mahasiswa memiliki datanya. Kampus hanya melihat insight agregat yang dianonimkan.' })}
            </p>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function EcosystemFlow() {
  const { t } = useT();
  const steps = [
    { icon: GraduationCap, label: t('Students', 'Mahasiswa'), sub: t('Build readiness', 'Membangun kesiapan') },
    { icon: Building2, label: t('Career Center', 'Career Center'), sub: t('Sees aggregate gaps', 'Melihat gap agregat') },
    { icon: BookOpen, label: t('Learning', 'Pembelajaran'), sub: t('Targets programs', 'Program terarah') },
    { icon: Briefcase, label: t('Employers', 'Perusahaan'), sub: t('Meet ready talent', 'Bertemu talenta siap') },
  ];
  return (
    <motion.ol variants={stagger(0.12, 0.3)} initial="hidden" animate="show" className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
      {steps.map((s, i) => (
        <motion.li key={s.label} variants={fadeUp} className="relative">
          <div className="card flex h-full flex-col items-center p-5 text-center">
            <span className={cn('flex size-12 items-center justify-center rounded-2xl', i % 2 ? 'bg-muted-orange text-orange' : 'bg-muted-green text-green-strong dark:text-green')}>
              <s.icon className="size-5" />
            </span>
            <div className="mt-3 font-display text-[15px] font-bold">{s.label}</div>
            <div className="text-[12.5px] text-muted-foreground">{s.sub}</div>
          </div>
          {i < steps.length - 1 && (
            <span className="absolute -right-3 top-1/2 z-10 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-green sm:flex" aria-hidden>
              <ArrowRight className="size-3.5" />
            </span>
          )}
        </motion.li>
      ))}
    </motion.ol>
  );
}

function Dashboard() {
  const { t, l, locale } = useT();
  const dark = useIsDark();
  const planned = useOrbit((s) => s.campusPlanned);
  const togglePlan = useOrbit((s) => s.toggleCampusProgram);
  const [fid, setFid] = useState<FacultyId>('all');
  const f = FACULTIES.find((x) => x.id === fid)!;
  const scale = f.needGuidance / FACULTIES[0].needGuidance;
  const months = useMemo(() => {
    const now = new Date();
    return f.trend.map((v, i) => ({ m: new Date(now.getFullYear(), now.getMonth() - (f.trend.length - 1 - i), 1).toLocaleDateString(intlLocale(locale), { month: 'short' }), v }));
  }, [f, locale]);
  const dist = ['<50', '50–59', '60–69', '70–79', '80+'].map((b, i) => ({ b, v: f.distribution[i] }));
  const goals = (Object.keys(f.goals) as (keyof FacultyStats['goals'])[]).map((k) => ({ k, label: l(GOAL_LABEL[k]), v: f.goals[k] })).sort((a, b) => b.v - a.v);
  const goalTotal = goals.reduce((s, g) => s + g.v, 0);
  const axis = { fill: dark ? '#9aa9a1' : '#5f6d66', fontSize: 12 };
  const tooltipStyle = { borderRadius: 12, border: `1px solid ${dark ? '#212e28' : '#e4ebe7'}`, background: dark ? '#121b17' : '#fff', fontSize: 13 };

  return (
    <section id="dashboard" className="scroll-mt-20 border-y border-border bg-surface-2/40 py-16 sm:py-20">
      <div className="container-orbit">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow">Campus Intelligence</div>
            <h2 className="mt-2 font-display text-[28px] font-extrabold tracking-[-0.03em] sm:text-[36px]">{t('Career readiness, campus-wide', 'Kesiapan karier, seluruh kampus')}</h2>
            <p className="mt-1.5 text-[14.5px] text-muted-foreground">{t('Sample campus · current semester · aggregated and anonymised', 'Contoh kampus · semester ini · agregat dan anonim')}</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="faculty" className="text-[13px] font-semibold text-muted-foreground">
              {t('Faculty', 'Fakultas')}
            </label>
            <Select id="faculty" value={fid} onChange={(e) => setFid(e.target.value as FacultyId)} className="h-10 w-60">
              {FACULTIES.map((x) => (
                <option key={x.id} value={x.id}>
                  {l(x.name)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <motion.div key={fid} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: UsersRound, label: t('Students', 'Mahasiswa'), value: f.students, suffix: '', tone: 'bg-muted-green text-green-strong dark:text-green' },
            { icon: TrendingUp, label: t('Average readiness', 'Rata-rata kesiapan'), value: f.readiness, suffix: '%', tone: 'bg-muted-green text-green-strong dark:text-green', hint: `+${f.readinessDelta}% ${t('this semester', 'semester ini')}` },
            { icon: LifeBuoy, label: t('Need guidance', 'Butuh bimbingan'), value: f.needGuidance, suffix: '', tone: 'bg-muted-orange text-orange-strong dark:text-orange', hint: `${Math.round((f.needGuidance / f.students) * 100)}% ${t('of students', 'mahasiswa')}` },
            { icon: Route, label: t('Active journeys', 'Journey aktif'), value: f.activeJourneys, suffix: '', tone: 'bg-muted-info text-info', hint: `${Math.round((f.activeJourneys / f.students) * 100)}% ${t('engaged', 'aktif')}` },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <span className={cn('flex size-9 items-center justify-center rounded-xl', s.tone)}>
                <s.icon className="size-[18px]" />
              </span>
              <div className="mt-4 font-display text-[30px] font-extrabold leading-none tracking-tight">
                <CountUp value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1.5 text-[13px] font-medium text-muted-foreground">{s.label}</div>
              {s.hint && <div className="mt-1 text-[12px] font-semibold text-green-strong dark:text-green">{s.hint}</div>}
            </Card>
          ))}
        </motion.div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Card className="p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[17px] font-bold">{t('Readiness distribution', 'Distribusi kesiapan')}</h3>
              <span className="text-[12.5px] text-muted-foreground">{t('students per band', 'mahasiswa per rentang')}</span>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {t('{n} students are within 10 points of “ready to apply”.', '{n} mahasiswa berada dalam 10 poin dari “siap melamar”.', { n: f.distribution[3] })}
            </p>
            <div className="mt-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dist} margin={{ left: -20, right: 4, top: 8 }}>
                  <XAxis dataKey="b" tickLine={false} axisLine={false} tick={axis} />
                  <YAxis tickLine={false} axisLine={false} tick={axis} />
                  <RTooltip cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} contentStyle={tooltipStyle} formatter={(v: number) => [v, t('Students', 'Mahasiswa')]} />
                  <Bar dataKey="v" radius={[10, 10, 4, 4]} animationDuration={800}>
                    {dist.map((d, i) => (
                      <Cell key={d.b} fill={i < 2 ? '#FB9002' : i === 4 ? '#078A51' : '#0AB46A'} fillOpacity={i === 2 ? 0.75 : 1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-[17px] font-bold">{t('Readiness trend', 'Tren kesiapan')}</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">{t('Average across active students', 'Rata-rata mahasiswa aktif')}</p>
            <div className="mt-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={months} margin={{ left: -24, right: 6, top: 8 }}>
                  <defs>
                    <linearGradient id="ct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0AB46A" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0AB46A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tickLine={false} axisLine={false} tick={axis} />
                  <YAxis domain={[55, 80]} tickLine={false} axisLine={false} tick={axis} />
                  <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, t('Readiness', 'Kesiapan')]} />
                  <Area dataKey="v" type="monotone" stroke="#0AB46A" strokeWidth={2.5} fill="url(#ct)" dot={{ r: 3, fill: '#0AB46A' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-[17px] font-bold">{t('Top skill gaps', 'Gap skill teratas')}</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">{t('% of students below target level', '% mahasiswa di bawah level target')}</p>
            <ol className="mt-5 space-y-4">
              {f.gaps.map((g, i) => (
                <li key={l(g.skill)}>
                  <div className="mb-1.5 flex items-center justify-between text-[13.5px]">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="tabular flex size-5 items-center justify-center rounded-md bg-surface-2 text-[11px] font-bold text-muted-foreground">{i + 1}</span>
                      {l(g.skill)}
                    </span>
                    <span className="tabular font-bold">{g.pct}%</span>
                  </div>
                  <ProgressBar value={g.pct} tone={i === 0 ? 'orange' : 'green'} label={l(g.skill)} />
                </li>
              ))}
            </ol>
          </Card>
          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-[17px] font-bold">{t('Career goal distribution', 'Distribusi tujuan karier')}</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">{t('Where students want to go', 'Ke mana mahasiswa ingin melangkah')}</p>
            <div className="mt-5 flex h-3 overflow-hidden rounded-full">
              {goals.map((g, i) => (
                <motion.div key={g.k} initial={{ width: 0 }} whileInView={{ width: `${(g.v / goalTotal) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease, delay: i * 0.05 }} style={{ background: GOAL_COLORS[i] }} className="h-full dark:[&:nth-child(2)]:!bg-[#e7efea]" />
              ))}
            </div>
            <ul className="mt-5 space-y-3">
              {goals.map((g, i) => (
                <li key={g.k} className="flex items-center justify-between text-[13.5px]">
                  <span className="flex items-center gap-2.5">
                    <span className={cn('size-2.5 rounded-full', i === 1 && 'dark:!bg-[#e7efea]')} style={{ background: GOAL_COLORS[i] }} />
                    {g.label}
                  </span>
                  <span className="tabular text-muted-foreground">
                    <strong className="text-foreground">{Math.round((g.v / goalTotal) * 100)}%</strong> · {g.v}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-[17px] font-bold">{t('Students needing guidance', 'Mahasiswa yang butuh bimbingan')}</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">{t('Anonymised segments — no individual data', 'Segmen anonim — tanpa data individu')}</p>
            <div className="mt-5 font-display text-[40px] font-extrabold leading-none tracking-tight text-orange-strong dark:text-orange">
              <CountUp value={f.needGuidance} />
            </div>
            <ul className="mt-5 space-y-3">
              {GUIDANCE_SEGMENTS.map((s) => (
                <li key={l(s.label)} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between text-[13.5px]">
                    <span className="font-medium">{l(s.label)}</span>
                    <span className="tabular font-bold">{Math.round(s.count * scale)}</span>
                  </div>
                  <ProgressBar value={s.share} size="xs" tone="orange" className="mt-2" label={l(s.label)} />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-5 overflow-hidden">
          <div className="flex flex-col gap-2 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="flex items-center gap-2 font-display text-[17px] font-bold">
                <Sparkles className="size-[18px] text-orange" /> {t('Recommended campus programs', 'Program kampus yang direkomendasikan')}
              </h3>
              <p className="mt-1 text-[13px] text-muted-foreground">{t('Ranked by expected readiness impact across the cohort.', 'Diurutkan berdasarkan perkiraan dampak kesiapan di seluruh angkatan.')}</p>
            </div>
            <span className="text-[13px] font-semibold text-muted-foreground">{t('{n} planned', '{n} direncanakan', { n: planned.length })}</span>
          </div>
          <ul className="divide-y divide-border">
            {[...PROGRAMS]
              .sort((a, b) => b.impact * b.students - a.impact * a.students)
              .map((p) => {
                const on = planned.includes(p.id);
                return (
                  <li key={p.id} className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1.5fr)_1fr_0.7fr_auto] sm:items-center sm:px-6">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', on ? 'bg-green text-white' : 'bg-muted-green text-green-strong dark:text-green')}>
                        {on ? <Check className="size-[18px]" /> : <HeartHandshake className="size-[18px]" />}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold">{l(p.title)}</div>
                        <div className="text-[12.5px] text-muted-foreground">{l(p.format)}</div>
                      </div>
                    </div>
                    <div className="text-[13px]">
                      <div className="text-muted-foreground">{t('Closes', 'Menutup')}</div>
                      <div className="font-semibold">{l(p.gap)}</div>
                    </div>
                    <div className="text-[13px]">
                      <div className="tabular font-bold text-green-strong dark:text-green">+{p.impact}%</div>
                      <div className="text-muted-foreground">{t('{n} students', '{n} mahasiswa', { n: Math.round(p.students * (f.students / FACULTIES[0].students)) })}</div>
                    </div>
                    <Button
                      size="sm"
                      variant={on ? 'soft' : 'secondary'}
                      onClick={() => {
                        togglePlan(p.id);
                        if (!on) toast.success(t('Program added to the semester plan', 'Program ditambahkan ke rencana semester'), { description: l(p.title) });
                      }}
                      aria-pressed={on}
                    >
                      {on ? (
                        <>
                          <Check /> {t('Planned', 'Direncanakan')}
                        </>
                      ) : (
                        <>
                          <Plus /> {t('Plan program', 'Rencanakan')}
                        </>
                      )}
                    </Button>
                  </li>
                );
              })}
          </ul>
        </Card>
      </div>
    </section>
  );
}
