import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { ArrowRight, Award, BriefcaseBusiness, Check, FolderKanban, GraduationCap, Layers, Lightbulb, Mic, Orbit, Palette, RefreshCw, Target, TrendingUp, type LucideIcon } from 'lucide-react';
import { ReadinessRing } from '@/components/brand/brand';
import { Badge, Card, ProgressBar } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { ImpactPill, PageHeader, SectionHeader } from '@/components/shared/layout-blocks';
import { IntelligenceLoader } from '@/components/shared/IntelligenceLoader';
import { LevelDots } from '@/components/shared/SkillLevel';
import { useOrbit, useInsights } from '@/store/orbit';
import { questForOpportunity, requestAddToJourney } from '@/store/actions';
import { bandOf, DIMENSIONS, DIM_SHORT, DIM_LONG, DIM_WHY, skillProfile } from '@/engine/intelligence';
import { LEVEL_LABEL, ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import type { Dimension } from '@/data/types';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, stagger } from '@/lib/motion';
import { useIsDark } from '@/store/ui';

const DIM_ICON: Record<Dimension, LucideIcon> = { skills: Layers, experience: BriefcaseBusiness, projects: FolderKanban, education: GraduationCap, portfolio: Palette, interview: Mic };

const DIM_MOVE: Record<Dimension, { en: string; id: string; to: string }> = {
  skills: { en: 'Close a core skill gap', id: 'Tutup gap skill inti', to: '/app/universe' },
  experience: { en: 'Join an event or talk to a mentor', id: 'Ikuti event atau ngobrol dengan mentor', to: '/app/discover?type=mentor' },
  projects: { en: 'Turn a project into a case study', id: 'Ubah proyek menjadi studi kasus', to: '/app/journey' },
  education: { en: 'Keep academic consistency', id: 'Jaga konsistensi akademik', to: '/app/settings' },
  portfolio: { en: 'Publish your portfolio page', id: 'Publikasikan halaman portofolio', to: '/app/journey' },
  interview: { en: 'Practise behavioral interviews', id: 'Latihan wawancara behavioral', to: '/app/journey' },
};

export default function IntelligencePage() {
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const insights = useInsights()!;
  const navigate = useNavigate();
  const dark = useIsDark();
  const { t, l } = useT();
  const [analyzing, setAnalyzing] = useState(false);
  const role = ROLE_BY_ID[profile.targetRole];
  const skills = useMemo(() => skillProfile(profile), [profile]);
  const opp = insights.opportunity;
  const data = DIMENSIONS.map((d) => ({ dim: l(DIM_SHORT[d]), you: Math.round(insights.dims[d]), target: 85 }));

  return (
    <div className="space-y-6">
      <PageHeader
        stage={t('Understand', 'Pahami')}
        eyebrow={t('Career Intelligence', 'Career Intelligence')}
        title={t('Where you stand for {role}', 'Posisimu untuk {role}', { role: l(role.name) })}
        description={t('Every score is explained and every insight comes with an action.', 'Setiap skor dijelaskan dan setiap insight disertai aksi.')}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/app/settings')}>
              <Target /> {t('Change goal', 'Ganti tujuan')}
            </Button>
            <Button onClick={() => setAnalyzing(true)}>
              <RefreshCw /> {t('Re-analyze', 'Analisis ulang')}
            </Button>
          </>
        }
      />

      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="py-12">
              <IntelligenceLoader stepMs={480} onDone={() => setAnalyzing(false)} />
            </Card>
          </motion.div>
        ) : (
          <motion.div key="content" variants={stagger(0.07)} initial="hidden" animate="show" className="space-y-6">
            {/* Overview */}
            <motion.div variants={fadeUp}>
              <Card className="overflow-hidden">
                <div className="grid lg:grid-cols-[1fr_1.1fr]">
                  <div className="flex flex-col items-center justify-center gap-5 border-b border-border p-6 text-center sm:p-8 lg:border-b-0 lg:border-r">
                    <ReadinessRing score={insights.readiness} size={208} stroke={15} />
                    <div>
                      <div className="font-display text-[20px] font-bold">{l(bandOf(insights.readiness))}</div>
                      <p className="mx-auto mt-1.5 max-w-sm text-[14px] text-muted-foreground">
                        {t('Career Readiness is the average of six dimensions measured against what {role} openings expect.', 'Career Readiness adalah rata-rata enam dimensi yang diukur terhadap ekspektasi lowongan {role}.', { role: l(role.name) })}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="eyebrow">{t('Readiness profile', 'Profil kesiapan')}</span>
                      <span className="flex items-center gap-3 text-[12px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-2.5 rounded-full bg-green" /> {t('You', 'Kamu')}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-2.5 rounded-full border-2 border-dashed border-orange" /> {t('Ready-to-apply level', 'Level siap melamar')}
                        </span>
                      </span>
                    </div>
                    <div className="h-[300px] sm:h-[340px]" role="img" aria-label={t('Radar chart of six readiness dimensions', 'Grafik radar enam dimensi kesiapan')}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data} outerRadius="72%">
                          <PolarGrid stroke={dark ? '#2d3d35' : '#dfe7e3'} />
                          <PolarAngleAxis dataKey="dim" tick={{ fill: dark ? '#9aa9a1' : '#5f6d66', fontSize: 12, fontWeight: 600 }} />
                          <Radar dataKey="target" stroke="#FB9002" strokeDasharray="5 5" strokeWidth={1.5} fill="transparent" isAnimationActive={false} />
                          <Radar dataKey="you" stroke="#0AB46A" strokeWidth={2.5} fill="#0AB46A" fillOpacity={0.18} dot={{ r: 3.5, fill: '#0AB46A', strokeWidth: 0 }} animationDuration={900} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Insights */}
            <div className="grid gap-5 md:grid-cols-3 [&>*]:min-w-0">
              <InsightCard
                icon={Award}
                tone="green"
                label={t('Top strength', 'Kekuatan utama')}
                title={l(DIM_LONG[insights.strength.dim])}
                score={insights.strength.score}
                body={t('Your strongest evidence. Lead with it in your CV and interviews.', 'Bukti terkuatmu. Tonjolkan di CV dan wawancara.')}
              />
              <InsightCard
                icon={TrendingUp}
                tone="orange"
                label={t('Priority gap', 'Gap prioritas')}
                title={l(DIM_LONG[insights.priorityGap.dim])}
                score={insights.priorityGap.score}
                body={l(DIM_WHY[insights.priorityGap.dim])}
                action={
                  <Button size="sm" variant="secondary" asChild>
                    <Link to={DIM_MOVE[insights.priorityGap.dim].to}>{l(DIM_MOVE[insights.priorityGap.dim])}</Link>
                  </Button>
                }
              />
              {opp && (
                <InsightCard
                  icon={Lightbulb}
                  tone="green"
                  highlight
                  label={t('Biggest opportunity', 'Peluang terbesar')}
                  title={l(SKILL_BY_ID[opp.skill].name)}
                  body={t('Improving {s} could unlock {n} relevant opportunities currently matching your profile.', 'Meningkatkan {s} bisa membuka {n} peluang relevan yang cocok dengan profilmu saat ini.', { s: l(SKILL_BY_ID[opp.skill].name), n: opp.demand })}
                  impact={opp.impact}
                  action={
                    opp.course && !questForOpportunity(opp.course.id) ? (
                      <Button size="sm" onClick={() => requestAddToJourney(opp.course!.id, (q) => navigate(`/app/journey?quest=${q}`))}>
                        <Target /> {t('Add to Journey', 'Tambah ke Journey')}
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" asChild>
                        <Link to={`/app/universe?focus=skill:${opp.skill}`}>
                          <Orbit /> {t('See in Universe', 'Lihat di Universe')}
                        </Link>
                      </Button>
                    )
                  }
                />
              )}
            </div>

            {/* Dimensions */}
            <motion.section variants={fadeUp}>
              <SectionHeader title={t('Six readiness dimensions', 'Enam dimensi kesiapan')} description={t('What each one measures and what moves it.', 'Apa yang diukur dan apa yang menggerakkannya.')} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {DIMENSIONS.map((d, i) => {
                  const Icon = DIM_ICON[d];
                  const score = insights.dims[d];
                  const weak = d === insights.priorityGap.dim;
                  return (
                    <motion.div key={d} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease }}>
                      <Card interactive className="flex h-full flex-col p-5">
                        <div className="flex items-center justify-between">
                          <span className={cn('flex size-10 items-center justify-center rounded-xl', weak ? 'bg-muted-orange text-orange' : 'bg-muted-green text-green-strong dark:text-green')}>
                            <Icon className="size-[18px]" />
                          </span>
                          <span className="tabular font-display text-[26px] font-extrabold tracking-tight">{Math.round(score)}</span>
                        </div>
                        <div className="mt-3 font-display text-[16px] font-bold">{l(DIM_LONG[d])}</div>
                        <ProgressBar value={score} size="sm" tone={weak ? 'orange' : 'green'} className="mt-2.5" label={l(DIM_LONG[d])} />
                        <p className="mt-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">{l(DIM_WHY[d])}</p>
                        <Link to={DIM_MOVE[d].to} className="group mt-4 self-start rounded-md text-[13px] font-semibold leading-snug text-green-strong hover:underline dark:text-green">
                          {l(DIM_MOVE[d])}
                          <ArrowRight className="ml-1 inline size-3.5 align-[-2px] transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </Link>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Skills */}
            <motion.section variants={fadeUp}>
              <Card className="overflow-hidden">
                <div className="p-5 sm:p-6">
                  <SectionHeader className="mb-0" icon={Layers} title={t('Skill gap analysis', 'Analisis gap skill')} description={t('Ranked by importance for {role} and demand across matching openings.', 'Diurutkan berdasarkan kepentingan untuk {role} dan permintaan di lowongan yang cocok.', { role: l(role.name) })} />
                </div>
                <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.6fr)_184px] gap-4 border-y border-border bg-surface-2/60 px-6 py-2.5 text-[11.5px] font-bold uppercase tracking-wider text-subtle-foreground lg:grid">
                  <span>{t('Skill', 'Skill')}</span>
                  <span>{t('You → Target', 'Kamu → Target')}</span>
                  <span>{t('Demand', 'Permintaan')}</span>
                  <span>{t('Impact', 'Dampak')}</span>
                  <span className="text-right">{t('Action', 'Aksi')}</span>
                </div>
                <ul className="divide-y divide-border border-t border-border lg:border-t-0">
                  {skills.map((g) => {
                    const inJourney = g.course ? questForOpportunity(g.course.id) : undefined;
                    return (
                      <li key={g.skill} className="grid grid-cols-2 items-center gap-x-4 gap-y-3 px-5 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.6fr)_184px]">
                        <div className="col-span-2 min-w-0 lg:col-span-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link to={`/app/universe?focus=skill:${g.skill}`} className="text-[14.5px] font-semibold hover:text-green-strong dark:hover:text-green">
                              {l(SKILL_BY_ID[g.skill].name)}
                            </Link>
                            {g.weight === 3 && <Badge tone="neutral">{t('Core', 'Inti')}</Badge>}
                            {g.isGap ? <Badge tone="orange">{t('Gap', 'Gap')}</Badge> : <Badge tone="green"><Check className="size-3" /> {t('On target', 'Sesuai')}</Badge>}
                          </div>
                          <div className="mt-0.5 text-[12.5px] text-muted-foreground">{t('Relevance {r}%', 'Relevansi {r}%', { r: Math.round(g.relevance) })}</div>
                        </div>
                        <div className="flex min-w-0 items-center gap-3">
                          <LevelDots level={g.level} target={g.target} />
                          <span className="text-[12.5px] leading-snug text-muted-foreground">
                            {l(LEVEL_LABEL[g.level])} → {l(LEVEL_LABEL[g.target])}
                          </span>
                        </div>
                        <div className="text-[13px] text-muted-foreground">
                          <span className="tabular font-semibold text-foreground">{g.demand}</span> {t('openings', 'lowongan')}
                        </div>
                        <div>{g.isGap ? <ImpactPill value={g.impact} /> : <span className="text-[12.5px] text-subtle-foreground">—</span>}</div>
                        <div className="flex justify-end lg:justify-end">
                          {g.isGap && g.course ? (
                            inJourney ? (
                              <Button size="xs" variant="soft" asChild>
                                <Link to={`/app/journey?quest=${inJourney.id}`}>
                                  <Check /> {t('In Journey', 'Di Journey')}
                                </Link>
                              </Button>
                            ) : (
                              <Button size="xs" onClick={() => requestAddToJourney(g.course!.id, (q) => navigate(`/app/journey?quest=${q}`))}>
                                <Target /> {t('Add to Journey', 'Tambah ke Journey')}
                              </Button>
                            )
                          ) : (
                            <span className="text-[12.5px] text-subtle-foreground">{t('Keep it sharp', 'Pertahankan')}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </motion.section>
            <p className="text-center text-[12.5px] text-subtle-foreground">{t('Based on {q} quests, {e} experiences and {p} projects in your profile.', 'Berdasarkan {q} quest, {e} pengalaman, dan {p} proyek di profilmu.', { q: quests.length, e: profile.experiences.length, p: profile.projects.length })}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  tone,
  label,
  title,
  score,
  body,
  action,
  impact,
  highlight,
}: {
  icon: LucideIcon;
  tone: 'green' | 'orange';
  label: string;
  title: string;
  score?: number;
  body: string;
  action?: ReactNode;
  impact?: number;
  highlight?: boolean;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className={cn('relative flex h-full flex-col overflow-hidden p-5 sm:p-6', highlight && 'border-green/40 bg-gradient-to-br from-mint to-surface')}>
        <div className="flex items-center justify-between">
          <div className={cn('flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider', tone === 'orange' ? 'text-orange-strong dark:text-orange' : 'text-green-strong dark:text-green')}>
            <Icon className="size-4" /> {label}
          </div>
          {score !== undefined && <span className="tabular text-[15px] font-bold">{Math.round(score)}%</span>}
          {impact !== undefined && <ImpactPill value={impact} />}
        </div>
        <div className="mt-3 font-display text-[21px] font-bold tracking-tight">{title}</div>
        <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">{body}</p>
        {action && <div className="mt-4 [&>*]:h-auto [&>*]:min-h-8 [&>*]:max-w-full [&>*]:whitespace-normal [&>*]:py-1.5 [&>*]:text-left">{action}</div>}
      </Card>
    </motion.div>
  );
}
