import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, BookmarkCheck, CalendarClock, Check, Clock, MapPin, Sparkles, Star, Target, Users } from 'lucide-react';
import { MatchRing } from '@/components/brand/brand';
import { Badge } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/overlays';
import { useOrbit } from '@/store/orbit';
import { questForOpportunity, requestAddToJourney, toggleSave } from '@/store/actions';
import { TYPE_LABEL } from '@/data/opportunities';
import { SKILL_BY_ID } from '@/data/catalog';
import type { Opportunity, OpportunityType } from '@/data/types';
import type { Match } from '@/engine/intelligence';
import { useT } from '@/lib/i18n';
import { cn, daysFromNow, deadlineLabel } from '@/lib/utils';

export const TYPE_TONE: Record<OpportunityType, 'green' | 'orange' | 'info' | 'violet' | 'neutral'> = {
  job: 'orange',
  internship: 'orange',
  course: 'green',
  event: 'info',
  mentor: 'violet',
  book: 'neutral',
  research: 'neutral',
};

export const IMPACT_LABEL = { high: { en: 'High', id: 'Tinggi' }, medium: { en: 'Medium', id: 'Sedang' }, low: { en: 'Low', id: 'Rendah' } };

export function SaveButton({ id, size = 'md' }: { id: string; size?: 'sm' | 'md' }) {
  const saved = useOrbit((s) => Boolean(s.saved[id]));
  const { t } = useT();
  return (
    <Tooltip content={saved ? t('Remove from saved', 'Hapus dari tersimpan') : t('Save opportunity', 'Simpan peluang')}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.stopPropagation();
          toggleSave(id);
        }}
        aria-pressed={saved}
        aria-label={saved ? t('Remove from saved', 'Hapus dari tersimpan') : t('Save opportunity', 'Simpan peluang')}
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-xl transition-colors',
          size === 'sm' ? 'size-8' : 'size-10',
          saved ? 'bg-muted-green text-green-strong dark:text-green' : 'text-subtle-foreground hover:bg-surface-2 hover:text-foreground',
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(saved)} initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.4 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} className="flex">
            {saved ? <BookmarkCheck className="size-[18px]" /> : <Bookmark className="size-[18px]" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </Tooltip>
  );
}

export function OpportunityCard({ o, m, onOpen, index = 0 }: { o: Opportunity; m: Match; onOpen: () => void; index?: number }) {
  const { t, l } = useT();
  useOrbit((s) => s.quests.length);
  const inJourney = questForOpportunity(o.id);
  const reason = m.closes ? t('Closes your {g} gap', 'Menutup gap {g}-mu', { g: l(SKILL_BY_ID[m.closes].name) }) : m.reasons[0] ? l(m.reasons[0]) : l(o.summary);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.03, 0.3) }}
      className="card card-interactive group flex flex-col p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={TYPE_TONE[o.type]}>{l(TYPE_LABEL[o.type])}</Badge>
          {o.mode && <Badge tone="outline">{o.mode}</Badge>}
        </div>
        <SaveButton id={o.id} size="sm" />
      </div>
      <button type="button" onClick={onOpen} className="mt-3 flex items-start gap-3 text-left">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[17px] font-bold leading-snug tracking-tight transition-colors group-hover:text-green-strong dark:group-hover:text-green">{o.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground">
            <span className="font-medium">{o.type === 'mentor' && o.meta ? l(o.meta) : o.org}</span>
            {o.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {l(o.location)}
              </span>
            )}
          </div>
        </div>
        <Tooltip content={t('{s}% match — tap Why It Fits for the reasons', '{s}% cocok — buka Why It Fits untuk alasannya', { s: m.score })}>
          <span>
            <MatchRing score={m.score} size={48} />
          </span>
        </Tooltip>
      </button>

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-surface-2/70 px-3 py-2.5 text-[13px]">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-green" aria-hidden />
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{t('Why relevant', 'Kenapa relevan')}:</span> {reason}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {o.skills.slice(0, 4).map((s) => {
          const has = m.uses.includes(s);
          const gap = s === m.closes;
          return (
            <span
              key={s}
              className={cn(
                'inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11.5px] font-semibold',
                gap ? 'bg-muted-orange text-orange-strong dark:text-orange' : has ? 'bg-muted-green text-green-strong dark:text-green' : 'border border-border text-muted-foreground',
              )}
            >
              {gap ? <Target className="size-3" /> : has ? <Check className="size-3" /> : null}
              {l(SKILL_BY_ID[s].name)}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3.5 text-[12.5px]">
        <span className="text-muted-foreground">
          {t('Career impact', 'Dampak karier')}: <span className={cn('font-bold', o.impact === 'high' ? 'text-green-strong dark:text-green' : 'text-foreground')}>{l(IMPACT_LABEL[o.impact])}</span>
        </span>
        {o.deadlineInDays !== undefined ? (
          <span className={cn('inline-flex items-center gap-1', o.deadlineInDays <= 7 ? 'font-semibold text-orange-strong dark:text-orange' : 'text-muted-foreground')}>
            <CalendarClock className="size-3.5" /> {deadlineLabel(daysFromNow(o.deadlineInDays))}
          </span>
        ) : o.duration ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" /> {l(o.duration)}
          </span>
        ) : null}
        {o.rating && (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Star className="size-3.5 fill-orange text-orange" /> {o.rating}
          </span>
        )}
        {o.seats && (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Users className="size-3.5" /> {o.seats}
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {inJourney ? (
          <Button size="sm" variant="soft" className="flex-1" disabled>
            <Check /> {t('In Journey', 'Di Journey')}
          </Button>
        ) : (
          <Button size="sm" className="flex-1" onClick={() => requestAddToJourney(o.id)}>
            <Target /> {t('Add to Journey', 'Tambah ke Journey')}
          </Button>
        )}
        <Button size="sm" variant="secondary" className="flex-1" onClick={onOpen}>
          {t('Why It Fits', 'Kenapa Cocok')}
        </Button>
      </div>
    </motion.article>
  );
}
