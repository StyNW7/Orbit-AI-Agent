import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { BellRing, Bookmark, BookmarkCheck, CalendarClock, Check, CheckCircle2, Clock, GraduationCap, MapPin, Send, Sparkles, Star, Target, Users, X } from 'lucide-react';
import { Sheet } from '@/components/ui/overlays';
import { Badge } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { MatchRing } from '@/components/brand/brand';
import { ImpactPill } from '@/components/shared/layout-blocks';
import { useOrbit } from '@/store/orbit';
import { questForOpportunity, requestAddToJourney, setStatus, toggleSave } from '@/store/actions';
import { useUi } from '@/store/ui';
import { OPP_BY_ID, TYPE_LABEL } from '@/data/opportunities';
import { SKILL_BY_ID } from '@/data/catalog';
import { matchOpportunity } from '@/engine/intelligence';
import { useT } from '@/lib/i18n';
import { daysFromNow, deadlineLabel, formatDate } from '@/lib/utils';
import { ease } from '@/lib/motion';
import { IMPACT_LABEL, TYPE_TONE } from './OpportunityCard';
import { APP_STATUS } from './status';
import type { ReminderTarget } from '@/components/shared/ReminderModal';

function Meta({ icon: Icon, children }: { icon: typeof Clock; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
      <Icon className="size-4 shrink-0 text-subtle-foreground" /> {children}
    </div>
  );
}

export function OpportunityDrawer({ id, onClose, onRemind }: { id: string | null; onClose: () => void; onRemind: (t: ReminderTarget) => void }) {
  const profile = useOrbit((s) => s.profile)!;
  const quests = useOrbit((s) => s.quests);
  const saved = useOrbit((s) => (id ? s.saved[id] : undefined));
  const askConfirm = useUi((s) => s.askConfirm);
  const navigate = useNavigate();
  const { t, l } = useT();
  const o = id ? OPP_BY_ID[id] : undefined;
  const m = o ? matchOpportunity(o, profile, quests) : undefined;
  const inJourney = o ? questForOpportunity(o.id) : undefined;
  const canApply = o && (o.type === 'job' || o.type === 'internship');

  const markApplied = () => {
    if (!o) return;
    askConfirm({
      title: t('Mark as applied?', 'Tandai sudah melamar?'),
      description: t('Orbit will track this application and move it to your Applications.', 'Orbit akan melacak lamaran ini dan memindahkannya ke Applications.'),
      items: [{ label: o.title, meta: o.org }],
      icon: 'apply',
      confirmLabel: t('Mark applied', 'Tandai melamar'),
      onConfirm: () => setStatus(o.id, 'applied'),
    });
  };

  return (
    <Sheet
      open={Boolean(o)}
      onOpenChange={(v) => !v && onClose()}
      title={o?.title ?? ''}
      width={500}
      header={
        o && (
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={TYPE_TONE[o.type]}>{l(TYPE_LABEL[o.type])}</Badge>
              {o.mode && <Badge tone="outline">{o.mode}</Badge>}
              {saved && saved.status !== 'saved' && <Badge tone="info">{l(APP_STATUS[saved.status])}</Badge>}
            </div>
            <h2 className="mt-2.5 font-display text-[22px] font-bold leading-tight tracking-tight">{o.title}</h2>
            <p className="mt-0.5 text-[14px] text-muted-foreground">{o.type === 'mentor' && o.meta ? `${l(o.meta)} · ${o.org}` : o.org}</p>
          </div>
        )
      }
      footer={
        o && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {inJourney ? (
                <Button
                  className="flex-1"
                  variant="soft"
                  onClick={() => {
                    onClose();
                    navigate(`/app/journey?quest=${inJourney.id}`);
                  }}
                >
                  <Check /> {t('In your Journey', 'Ada di Journey-mu')}
                </Button>
              ) : (
                <Button className="flex-1" onClick={() => requestAddToJourney(o.id)}>
                  <Target /> {t('Add to Journey', 'Tambah ke Journey')}
                </Button>
              )}
              <Button variant={saved ? 'soft' : 'secondary'} onClick={() => toggleSave(o.id)} aria-pressed={Boolean(saved)}>
                {saved ? <BookmarkCheck /> : <Bookmark />} {saved ? t('Saved', 'Tersimpan') : t('Save', 'Simpan')}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => onRemind({ title: o.title, oppId: o.id, suggestedDate: o.deadlineInDays ? daysFromNow(Math.max(o.deadlineInDays - 2, 1)) : undefined })}
              >
                <BellRing /> {t('Create reminder', 'Buat pengingat')}
              </Button>
              {canApply && (!saved || saved.status === 'saved') && (
                <Button variant="secondary" size="sm" className="flex-1" onClick={markApplied}>
                  <Send /> {t('Mark as applied', 'Tandai melamar')}
                </Button>
              )}
            </div>
          </div>
        )
      }
    >
      {o && m && (
        <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }} className="space-y-5">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-mint to-surface p-4">
            <MatchRing score={m.score} size={64} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-[17px] font-bold">{t('{s}% match', '{s}% cocok', { s: m.score })}</div>
              <div className="text-[13px] text-muted-foreground">
                {t('Career impact', 'Dampak karier')}: <strong className="text-foreground">{l(IMPACT_LABEL[o.impact])}</strong>
              </div>
            </div>
            <ImpactPill value={o.readinessImpact} />
          </div>

          <div>
            <div className="mb-2.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-subtle-foreground">
              <Sparkles className="size-3.5 text-green" /> {t('Why it fits', 'Kenapa cocok')}
            </div>
            <ul className="space-y-2.5">
              {m.reasons.map((r, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.07 }} className="flex items-start gap-2.5 text-[14px]">
                  <CheckCircle2 className="mt-0.5 size-[18px] shrink-0 text-green" /> {l(r)}
                </motion.li>
              ))}
              {m.missing.length > 0 && (
                <li className="flex items-start gap-2.5 text-[14px] text-muted-foreground">
                  <X className="mt-0.5 size-[18px] shrink-0 text-subtle-foreground" />
                  {t('New for you: {s}', 'Baru bagimu: {s}', { s: m.missing.map((s) => l(SKILL_BY_ID[s].name)).join(', ') })}
                </li>
              )}
            </ul>
          </div>

          <p className="text-[14px] leading-relaxed text-muted-foreground">{l(o.summary)}</p>

          <div className="space-y-2 rounded-2xl border border-border p-4">
            {o.location && <Meta icon={MapPin}>{`${l(o.location)}${o.mode ? ` · ${o.mode}` : ''}`}</Meta>}
            {o.deadlineInDays !== undefined && (
              <Meta icon={CalendarClock}>
                {deadlineLabel(daysFromNow(o.deadlineInDays))} · {formatDate(daysFromNow(o.deadlineInDays), 'EEEE, d MMM')}
              </Meta>
            )}
            {o.duration && <Meta icon={Clock}>{l(o.duration)}</Meta>}
            {o.level && <Meta icon={GraduationCap}>{o.level}</Meta>}
            {o.rating && <Meta icon={Star}>{t('{r} rating from learners', 'Rating {r} dari peserta', { r: o.rating })}</Meta>}
            {o.seats && <Meta icon={Users}>{t('{n} seats', '{n} kursi', { n: o.seats })}</Meta>}
          </div>

          <div>
            <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-subtle-foreground">{t('Skill connection', 'Koneksi skill')}</div>
            <div className="flex flex-wrap gap-1.5">
              {o.skills.map((s) => (
                <Badge key={s} tone={s === m.closes ? 'orange' : m.uses.includes(s) ? 'green' : 'outline'}>
                  {s === m.closes ? <Target className="size-3" /> : m.uses.includes(s) ? <Check className="size-3" /> : null}
                  {l(SKILL_BY_ID[s].name)}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-subtle-foreground">{t('Green: you have it · Orange: closes a gap · Outline: new to learn', 'Hijau: sudah dimiliki · Oranye: menutup gap · Garis: baru dipelajari')}</p>
          </div>
        </motion.div>
      )}
    </Sheet>
  );
}
