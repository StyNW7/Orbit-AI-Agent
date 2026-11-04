import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Bookmark, BookmarkCheck, Check, CheckCircle2, Compass, GraduationCap, Route, Sparkles, Target, Users, BriefcaseBusiness } from 'lucide-react';
import { Sheet } from '@/components/ui/overlays';
import { Badge } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { ImpactPill } from '@/components/shared/layout-blocks';
import { MatchRing, ReadinessRing } from '@/components/brand/brand';
import { useOrbit, useInsights } from '@/store/orbit';
import { questForOpportunity, requestAddToJourney, toggleSave } from '@/store/actions';
import { LEVEL_LABEL, ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import { OPPORTUNITIES, OPP_BY_ID, TYPE_LABEL } from '@/data/opportunities';
import { demandFor, matchOpportunity, skillProfile } from '@/engine/intelligence';
import { HUBS, type UNode } from '@/engine/universe';
import { useT } from '@/lib/i18n';
import { cn, deadlineLabel, daysFromNow } from '@/lib/utils';
import { ease } from '@/lib/motion';

function Stat({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2/50 p-3.5">
      <div className="text-[11.5px] font-semibold uppercase tracking-wider text-subtle-foreground">{label}</div>
      <div className={cn('mt-1 font-display text-[18px] font-bold leading-tight', accent && 'text-green-strong dark:text-green')}>{value}</div>
    </div>
  );
}

export function NodeDrawer({ node, onClose, onFocus, allNodes }: { node: UNode | null; onClose: () => void; onFocus: (id: string) => void; allNodes: UNode[] }) {
  const { t, l } = useT();
  const title = node ? l(node.label) : '';
  return (
    <Sheet open={Boolean(node)} onOpenChange={(o) => !o && onClose()} title={title} width={480} header={node ? <DrawerHeader node={node} /> : undefined} footer={node ? <DrawerFooter node={node} onClose={onClose} /> : undefined}>
      {node && (
        <motion.div key={node.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}>
          {(node.cat === 'skill' || node.cat === 'gap') && <SkillBody node={node} onFocus={onFocus} allNodes={allNodes} />}
          {node.id.startsWith('opp:') && <OppBody node={node} />}
          {node.cat === 'role' && <RoleBody />}
          {node.cat === 'you' && <YouBody />}
          {node.cat === 'hub' && <HubBody node={node} allNodes={allNodes} onFocus={onFocus} />}
          {(node.cat === 'experience' || node.cat === 'project') && <EvidenceBody node={node} />}
        </motion.div>
      )}
      {!node && <p className="text-muted-foreground">{t('Select a node', 'Pilih node')}</p>}
    </Sheet>
  );
}

function DrawerHeader({ node }: { node: UNode }) {
  const { t, l } = useT();
  const kind =
    node.cat === 'gap'
      ? t('Skill gap', 'Gap skill')
      : node.cat === 'skill'
        ? t('Skill', 'Skill')
        : node.cat === 'hub'
          ? t('Category', 'Kategori')
          : node.cat === 'you'
            ? t('Center of your orbit', 'Pusat orbit-mu')
            : node.cat === 'role'
              ? t('Target role', 'Peran target')
              : node.refId && OPP_BY_ID[node.refId]
                ? l(TYPE_LABEL[OPP_BY_ID[node.refId].type])
                : node.cat === 'project'
                  ? t('Project', 'Proyek')
                  : t('Experience', 'Pengalaman');
  return (
    <div className="pr-2">
      <Badge tone={node.cat === 'gap' ? 'orange' : 'green'}>{kind}</Badge>
      <h2 className="mt-2.5 font-display text-[22px] font-bold leading-tight tracking-tight">{l(node.label)}</h2>
      {node.sub && <p className="mt-0.5 text-[13.5px] text-muted-foreground">{l(node.sub)}</p>}
    </div>
  );
}

function DrawerFooter({ node, onClose }: { node: UNode; onClose: () => void }) {
  const navigate = useNavigate();
  const profile = useOrbit((s) => s.profile)!;
  const saved = useOrbit((s) => (node.refId ? Boolean(s.saved[node.refId]) : false));
  useOrbit((s) => s.quests);
  const { t } = useT();
  const toJourney = (qid: string) => {
    onClose();
    navigate(`/app/journey?quest=${qid}`);
  };

  if (node.cat === 'skill' || node.cat === 'gap') {
    const g = skillProfile(profile).find((x) => x.skill === node.refId);
    const course = g?.course;
    const existing = course ? questForOpportunity(course.id) : undefined;
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        {course && node.cat === 'gap' ? (
          existing ? (
            <Button className="flex-1" variant="soft" onClick={() => toJourney(existing.id)}>
              <Check /> {t('In your Journey', 'Ada di Journey-mu')}
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => requestAddToJourney(course.id, toJourney)}>
              <Target /> {t('Add to Journey', 'Tambah ke Journey')}
            </Button>
          )
        ) : null}
        <Button
          className="flex-1"
          variant="secondary"
          onClick={() => {
            onClose();
            navigate(`/app/discover?skill=${node.refId}`);
          }}
        >
          <Compass /> {t('Related opportunities', 'Peluang terkait')}
        </Button>
      </div>
    );
  }
  if (node.id.startsWith('opp:') && node.refId) {
    const existing = questForOpportunity(node.refId);
    return (
      <div className="flex gap-2">
        {existing ? (
          <Button className="flex-1" variant="soft" onClick={() => toJourney(existing.id)}>
            <Check /> {t('In your Journey', 'Ada di Journey-mu')}
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => requestAddToJourney(node.refId!, toJourney)}>
            <Target /> {t('Add to Journey', 'Tambah ke Journey')}
          </Button>
        )}
        <Button variant={saved ? 'soft' : 'secondary'} onClick={() => toggleSave(node.refId!)} aria-pressed={saved}>
          {saved ? <BookmarkCheck /> : <Bookmark />}
          {saved ? t('Saved', 'Tersimpan') : t('Save', 'Simpan')}
        </Button>
      </div>
    );
  }
  if (node.cat === 'role' || node.cat === 'you') {
    return (
      <Button
        className="w-full"
        onClick={() => {
          onClose();
          navigate('/app/intelligence');
        }}
      >
        {t('Open Career Intelligence', 'Buka Career Intelligence')} <ArrowRight />
      </Button>
    );
  }
  return null;
}

function SkillBody({ node, onFocus, allNodes }: { node: UNode; onFocus: (id: string) => void; allNodes: UNode[] }) {
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const { t, l } = useT();
  const id = node.refId!;
  const g = skillProfile(profile).find((x) => x.skill === id);
  const level = profile.skills[id] ?? 0;
  const demand = demandFor(id, profile.targetRole);
  const related = OPPORTUNITIES.filter((o) => o.skills.includes(id));
  const count = (types: string[]) => related.filter((o) => types.includes(o.type)).length;
  const relatedQuests = quests.filter((q) => q.skill === id);
  const onGraph = new Set(allNodes.map((n) => n.id));

  return (
    <div className="space-y-5">
      <p className="text-[14px] leading-relaxed text-muted-foreground">{l(SKILL_BY_ID[id].description)}</p>
      {g ? (
        <div className="grid grid-cols-2 gap-2.5">
          <Stat label={t('Relevance', 'Relevansi')} value={`${Math.round(g.relevance)}%`} accent />
          <Stat label={t('Required by', 'Dibutuhkan oleh')} value={t('{n} openings', '{n} lowongan', { n: demand.length })} />
          <Stat label={t('Your level', 'Level kamu')} value={l(LEVEL_LABEL[g.level])} />
          <Stat label={t('Target', 'Target')} value={l(LEVEL_LABEL[g.target])} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <Stat label={t('Your level', 'Level kamu')} value={l(LEVEL_LABEL[level as 0])} accent />
          <Stat label={t('Used in', 'Dipakai di')} value={t('{n} opportunities', '{n} peluang', { n: related.length })} />
        </div>
      )}

      {g && (
        <div className={cn('rounded-2xl border p-4', g.isGap ? 'border-orange/30 bg-muted-orange/50' : 'border-green/30 bg-muted-green/50')}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[13px] font-bold">{g.isGap ? t('Readiness impact if closed', 'Dampak kesiapan jika ditutup') : t('You meet the target', 'Kamu sudah memenuhi target')}</div>
            {g.isGap && <ImpactPill value={g.potential} />}
          </div>
          <div className="mt-3">
            <div className="mb-1.5 flex justify-between text-[12px] text-muted-foreground">
              <span>{l(LEVEL_LABEL[g.level])}</span>
              <span>{l(LEVEL_LABEL[g.target])}</span>
            </div>
            <div className="relative h-2 rounded-full bg-surface-3">
              <motion.div className="absolute inset-y-0 left-0 rounded-full bg-green" initial={{ width: 0 }} animate={{ width: `${(g.level / 4) * 100}%` }} transition={{ duration: 0.8, ease }} />
              <span className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-orange" style={{ left: `calc(${(g.target / 4) * 100}% - 2px)` }} />
            </div>
          </div>
          {g.isGap && (
            <p className="mt-3 text-[13px] text-muted-foreground">
              {t('Improving {s} could unlock {n} relevant opportunities currently matching your profile.', 'Meningkatkan {s} bisa membuka {n} peluang relevan yang cocok dengan profilmu.', { s: l(SKILL_BY_ID[id].name), n: demand.length })}
            </p>
          )}
        </div>
      )}

      <div>
        <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-subtle-foreground">{t('Connected in your orbit', 'Terhubung di orbit-mu')}</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { icon: GraduationCap, n: count(['course', 'book']), l: t('Courses', 'Kursus') },
            { icon: Users, n: count(['mentor']), l: t('Mentors', 'Mentor') },
            { icon: BriefcaseBusiness, n: count(['job', 'internship']), l: t('Jobs', 'Kerja') },
            { icon: Route, n: relatedQuests.length, l: t('Quests', 'Quest') },
          ].map((x) => (
            <div key={x.l} className="rounded-xl border border-border py-2.5">
              <x.icon className="mx-auto size-4 text-green" />
              <div className="tabular mt-1 font-display text-[17px] font-bold">{x.n}</div>
              <div className="text-[11px] text-muted-foreground">{x.l}</div>
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-1.5">
        {related.slice(0, 6).map((o) => {
          const nid = `opp:${o.id}`;
          return (
            <li key={o.id}>
              <button
                type="button"
                disabled={!onGraph.has(nid)}
                onClick={() => onFocus(nid)}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition enabled:hover:bg-surface-2 disabled:cursor-default"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-green" />
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{o.title}</span>
                <span className="shrink-0 text-[12px] text-subtle-foreground">{l(TYPE_LABEL[o.type])}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function OppBody({ node }: { node: UNode }) {
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const { t, l } = useT();
  const o = OPP_BY_ID[node.refId!];
  const m = matchOpportunity(o, profile, quests);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-2/50 p-4">
        <MatchRing score={m.score} size={58} />
        <div className="min-w-0">
          <div className="font-display text-[16px] font-bold">{t('{s}% match', '{s}% cocok', { s: m.score })}</div>
          <div className="text-[13px] text-muted-foreground">
            {o.org}
            {o.deadlineInDays ? ` · ${deadlineLabel(daysFromNow(o.deadlineInDays))}` : ''}
          </div>
        </div>
        <ImpactPill value={o.readinessImpact} className="ml-auto" />
      </div>
      <p className="text-[14px] leading-relaxed text-muted-foreground">{l(o.summary)}</p>
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-subtle-foreground">
          <Sparkles className="size-3.5 text-green" /> {t('Why Orbit recommends this', 'Kenapa Orbit merekomendasikan ini')}
        </div>
        <ul className="space-y-2">
          {m.reasons.map((r, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className="flex items-start gap-2.5 text-[14px]">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green" /> {l(r)}
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {o.skills.map((s) => (
          <Badge key={s} tone={m.uses.includes(s) ? 'green' : 'outline'}>
            {m.uses.includes(s) && <Check className="size-3" />}
            {l(SKILL_BY_ID[s].name)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function RoleBody() {
  const profile = useOrbit((s) => s.profile)!;
  const insights = useInsights()!;
  const { t, l } = useT();
  const role = ROLE_BY_ID[profile.targetRole];
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <ReadinessRing score={insights.readiness} size={120} stroke={10} />
        <div>
          <p className="text-[14px] text-muted-foreground">{l(role.description)}</p>
          <p className="mt-2 text-[13px] font-semibold text-green-strong dark:text-green">{l(role.demand)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Stat label={t('Open roles', 'Lowongan')} value={role.openings} />
        <Stat label={t('Required skills', 'Skill dibutuhkan')} value={role.requirements.length} />
      </div>
    </div>
  );
}

function YouBody() {
  const profile = useOrbit((s) => s.profile)!;
  const insights = useInsights()!;
  const { t, l } = useT();
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-muted-foreground">{profile.headline}</p>
      <div className="grid grid-cols-2 gap-2.5">
        <Stat label={t('Readiness', 'Kesiapan')} value={`${Math.round(insights.readiness)}%`} accent />
        <Stat label={t('Goal', 'Tujuan')} value={l(ROLE_BY_ID[profile.targetRole].name)} />
        <Stat label={t('Experiences', 'Pengalaman')} value={profile.experiences.length} />
        <Stat label={t('Projects', 'Proyek')} value={profile.projects.length} />
      </div>
      <p className="text-[13px] text-muted-foreground">{t('Everything in your Universe is connected to you. Click any node to see why it matters.', 'Semua yang ada di Universe-mu terhubung denganmu. Klik node mana pun untuk melihat kenapa itu penting.')}</p>
    </div>
  );
}

function HubBody({ node, allNodes, onFocus }: { node: UNode; allNodes: UNode[]; onFocus: (id: string) => void }) {
  const { t, l } = useT();
  const items = allNodes.filter((n) => n.hub === node.hub && n.cat !== 'hub');
  const hub = HUBS.find((h) => h.key === node.hub);
  return (
    <div>
      <p className="mb-4 text-[14px] text-muted-foreground">{t('{n} items in {h}. Select one to see how it connects.', '{n} item di {h}. Pilih salah satu untuk melihat hubungannya.', { n: items.length, h: hub ? l(hub.label) : '' })}</p>
      <ul className="space-y-1.5">
        {items.map((n) => (
          <li key={n.id}>
            <button type="button" onClick={() => onFocus(n.id)} className="flex w-full items-center gap-3 rounded-xl border border-border px-3.5 py-3 text-left transition hover:border-border-strong hover:bg-surface-2">
              <span className={cn('size-2 shrink-0 rounded-full', n.cat === 'gap' ? 'bg-orange' : 'bg-green')} />
              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{l(n.label)}</span>
              {n.score !== undefined && <span className="tabular text-[12px] font-bold text-muted-foreground">{Math.round(n.score)}%</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EvidenceBody({ node }: { node: UNode }) {
  const profile = useOrbit((s) => s.profile)!;
  const { t, l } = useT();
  if (node.cat === 'experience') {
    const e = profile.experiences.find((x) => x.id === node.refId);
    if (!e) return null;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2.5">
          <Stat label={t('Period', 'Periode')} value={e.period} />
          <Stat label={t('Strengthens', 'Memperkuat')} value={t('Experience', 'Pengalaman')} accent />
        </div>
        {e.highlight && <p className="rounded-2xl bg-surface-2/60 p-4 text-[14px] leading-relaxed">“{e.highlight}”</p>}
        <p className="text-[13px] text-muted-foreground">{t('Use this as a STAR story for interviews — it shows ownership and outcomes.', 'Gunakan ini sebagai cerita STAR untuk wawancara — menunjukkan kepemilikan dan hasil.')}</p>
      </div>
    );
  }
  const p = profile.projects.find((x) => x.id === node.refId);
  if (!p) return null;
  return (
    <div className="space-y-4">
      {p.description && <p className="text-[14px] leading-relaxed text-muted-foreground">{p.description}</p>}
      <div className="grid grid-cols-2 gap-2.5">
        <Stat label={t('Strengthens', 'Memperkuat')} value={t('Projects', 'Proyek')} accent />
        <Stat label={t('Skills proven', 'Skill terbukti')} value={p.skills.length} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {p.skills.map((s) => (
          <Badge key={s} tone="green">
            {l(SKILL_BY_ID[s].name)}
          </Badge>
        ))}
      </div>
    </div>
  );
}
