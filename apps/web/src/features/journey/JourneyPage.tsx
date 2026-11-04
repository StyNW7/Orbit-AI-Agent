import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Columns3, Map as MapIcon, Plus, Route, Target, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared/layout-blocks';
import { Segmented } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, ProgressBar } from '@/components/ui/primitives';
import { ReminderModal, type ReminderTarget } from '@/components/shared/ReminderModal';
import { useOrbit, useInsights } from '@/store/orbit';
import { ROLE_BY_ID } from '@/data/catalog';
import { useT } from '@/lib/i18n';
import { ease } from '@/lib/motion';
import { Roadmap } from './Roadmap';
import { Board } from './Board';
import { QuestDrawer } from './QuestDrawer';
import { AddQuestModal } from './AddQuestModal';
import { requestAddToJourney } from '@/store/actions';

type View = 'roadmap' | 'board';

export default function JourneyPage() {
  const [params, setParams] = useSearchParams();
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const baselineReadiness = useOrbit((s) => s.readiness30dAgo);
  const insights = useInsights()!;
  const { t, l } = useT();
  const questParam = params.get('quest');
  const [view, setView] = useState<View>(() => (params.get('view') === 'board' || questParam ? 'board' : (localStorage.getItem('orbit.journeyView') as View) || 'roadmap'));
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState<{ milestone?: string } | null>(null);
  const [remind, setRemind] = useState<ReminderTarget | null>(null);
  const [highlight, setHighlight] = useState<string | null>(questParam);

  useEffect(() => {
    if (!questParam) return;
    setHighlight(questParam);
    setView('board');
    const t1 = setTimeout(() => document.getElementById(`quest-${questParam}`)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }), 450);
    const t2 = setTimeout(() => setHighlight(null), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [questParam]);

  const changeView = (v: View) => {
    setView(v);
    localStorage.setItem('orbit.journeyView', v);
    if (questParam) setParams({}, { replace: true });
  };

  const total = quests.length;
  const done = quests.filter((q) => q.status === 'done').length;
  const xpEarned = quests.filter((q) => q.status === 'done').reduce((s, q) => s + q.xp, 0);
  const gained = Math.max(0, Math.round((insights.readiness - baselineReadiness) * 10) / 10);
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (total === 0) {
    return (
      <div className="space-y-6">
        <PageHeader stage={t('Plan', 'Rencana')} eyebrow={t('Adaptive Career Journey', 'Adaptive Career Journey')} title={t('Your Journey', 'Journey-mu')} />
        <Card>
          <EmptyState
            icon={Route}
            title={t('Your journey starts with one goal.', 'Journey-mu dimulai dari satu tujuan.')}
            description={t('Choose your target career and Orbit will help map the steps. Start with your Next Best Action.', 'Pilih karier targetmu dan Orbit akan membantu memetakan langkahnya. Mulai dari Next Best Action-mu.')}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {insights.opportunity?.course && (
                  <Button onClick={() => requestAddToJourney(insights.opportunity!.course!.id)}>
                    <Target /> {t('Add Next Best Action', 'Tambah Next Best Action')}
                  </Button>
                )}
                <Button variant="secondary" asChild>
                  <Link to="/app/settings">{t('Choose Career Goal', 'Pilih Tujuan Karier')}</Link>
                </Button>
                <Button variant="ghost" onClick={() => setAdding({})}>
                  <Plus /> {t('Add your own quest', 'Tambah quest sendiri')}
                </Button>
              </div>
            }
          />
        </Card>
        <AddQuestModal open={Boolean(adding)} onClose={() => setAdding(null)} defaultMilestone={adding?.milestone} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        stage={t('Plan', 'Rencana')}
        eyebrow={t('Adaptive Career Journey', 'Adaptive Career Journey')}
        title={t('{role} Career Path', '{role} Career Path', { role: l(ROLE_BY_ID[profile.targetRole].name) })}
        description={t('Six stages from discovery to your first application. Drag quests on the board or tick them off on the roadmap.', 'Enam tahap dari eksplorasi hingga lamaran pertama. Seret quest di board atau centang di roadmap.')}
        actions={
          <>
            <Segmented<View>
              label={t('Journey view', 'Tampilan journey')}
              value={view}
              onChange={changeView}
              options={[
                { value: 'roadmap', label: t('Roadmap', 'Roadmap'), icon: MapIcon },
                { value: 'board', label: t('Board', 'Board'), icon: Columns3 },
              ]}
            />
            <Button onClick={() => setAdding({})}>
              <Plus /> {t('Add quest', 'Tambah quest')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="col-span-2 p-4 sm:p-5 lg:col-span-1">
          <div className="flex items-center justify-between text-[12.5px] font-semibold text-muted-foreground">
            <span>{t('Journey progress', 'Progres journey')}</span>
            <span className="tabular font-display text-[20px] font-bold text-foreground">{pct}%</span>
          </div>
          <ProgressBar value={pct} tone="gradient" className="mt-2.5" label={t('Journey progress', 'Progres journey')} />
        </Card>
        {[
          { icon: CheckCircle2, label: t('Quests completed', 'Quest selesai'), value: `${done}/${total}`, tone: 'text-green' },
          { icon: Zap, label: t('XP from journey', 'XP dari journey'), value: xpEarned.toLocaleString('en-US'), tone: 'text-orange' },
          { icon: TrendingUp, label: t('Readiness gained (30d)', 'Kesiapan naik (30h)'), value: `+${gained}%`, tone: 'text-green' },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4 sm:p-5">
            <s.icon className={`size-5 shrink-0 ${s.tone}`} />
            <div className="min-w-0">
              <div className="tabular font-display text-[19px] font-bold leading-none">{s.value}</div>
              <div className="mt-1 truncate text-[12px] text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }}>
          {view === 'roadmap' ? <Roadmap highlight={highlight} onOpen={setOpen} onAdd={(m) => setAdding({ milestone: m })} /> : <Board highlight={highlight} onOpen={setOpen} onAdd={() => setAdding({})} />}
        </motion.div>
      </AnimatePresence>

      <QuestDrawer questId={open} onClose={() => setOpen(null)} onRemind={setRemind} />
      <AddQuestModal open={Boolean(adding)} onClose={() => setAdding(null)} defaultMilestone={adding?.milestone} />
      <ReminderModal target={remind} onClose={() => setRemind(null)} />
    </div>
  );
}
