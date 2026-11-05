import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Award, BellOff, BellRing, Bookmark, BookmarkCheck, CalendarClock, CheckCheck, Clock, GraduationCap, Route, Sparkles, Trash2, Users, X, type LucideIcon } from 'lucide-react';
import { Sheet, Tooltip } from '@/components/ui/overlays';
import { Segmented } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/layout-blocks';
import { useOrbit } from '@/store/orbit';
import { useUi } from '@/store/ui';
import { toggleSave } from '@/store/actions';
import { useT } from '@/lib/i18n';
import { cn, friendlyDate, relative } from '@/lib/utils';
import type { NotificationKind } from '@/data/types';
import { matchOpportunity } from '@/engine/intelligence';
import { OPP_BY_ID } from '@/data/opportunities';

const KIND: Record<NotificationKind, { icon: LucideIcon; cls: string }> = {
  deadline: { icon: Clock, cls: 'bg-muted-orange text-orange-strong dark:text-orange' },
  opportunity: { icon: Sparkles, cls: 'bg-muted-green text-green-strong dark:text-green' },
  mentor: { icon: Users, cls: 'bg-muted-violet text-violet' },
  review: { icon: CalendarClock, cls: 'bg-muted-info text-info' },
  course: { icon: GraduationCap, cls: 'bg-muted-green text-green-strong dark:text-green' },
  quest: { icon: Route, cls: 'bg-muted-green text-green-strong dark:text-green' },
  achievement: { icon: Award, cls: 'bg-muted-orange text-orange-strong dark:text-orange' },
  reminder: { icon: BellRing, cls: 'bg-muted-info text-info' },
};

export function NotificationsPanel() {
  const open = useUi((s) => s.notificationsOpen);
  const setOpen = useUi((s) => s.setNotificationsOpen);
  const notifications = useOrbit((s) => s.notifications);
  const reminders = useOrbit((s) => s.reminders);
  const saved = useOrbit((s) => s.saved);
  const profile = useOrbit((s) => s.profile);
  const markRead = useOrbit((s) => s.markRead);
  const markAll = useOrbit((s) => s.markAllRead);
  const dismiss = useOrbit((s) => s.dismissNotification);
  const toggleReminder = useOrbit((s) => s.toggleReminder);
  const deleteReminder = useOrbit((s) => s.deleteReminder);
  const navigate = useNavigate();
  const { t, l } = useT();
  const [tab, setTab] = useState<'all' | 'unread' | 'reminders'>('all');
  const unread = notifications.filter((n) => !n.read).length;
  const list = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={t('Notifications', 'Notifikasi')}
      description={unread ? t('{n} need your attention', '{n} perlu perhatianmu', { n: unread }) : t('You’re all caught up', 'Semua sudah terbaca')}
      width={440}
    >
      <div className="sticky top-0 z-10 -mx-1 flex items-center gap-2 bg-surface px-1 pb-3">
        <Segmented
          full
          className="min-w-0 flex-1"
          size="sm"
          label={t('Filter notifications', 'Filter notifikasi')}
          value={tab}
          onChange={setTab}
          options={[
            { value: 'all', label: t('All', 'Semua'), count: notifications.length },
            { value: 'unread', label: t('Unread', 'Belum dibaca'), count: unread },
            { value: 'reminders', label: t('Reminders', 'Pengingat'), count: reminders.filter((r) => !r.done).length },
          ]}
        />
        {tab !== 'reminders' && unread > 0 && (
          <Tooltip content={t('Mark all as read', 'Tandai semua sudah dibaca')}>
            <Button size="icon-sm" variant="secondary" onClick={markAll} aria-label={t('Mark all as read', 'Tandai semua sudah dibaca')}>
              <CheckCheck />
            </Button>
          </Tooltip>
        )}
      </div>

      {tab === 'reminders' ? (
        reminders.length === 0 ? (
          <EmptyState compact icon={BellOff} title={t('No reminders yet', 'Belum ada pengingat')} description={t('Create one from any opportunity or quest.', 'Buat dari peluang atau quest mana pun.')} />
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {reminders.map((r) => (
                <motion.li key={r.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} className="flex items-center gap-3 rounded-2xl border border-border p-3.5">
                  <button
                    type="button"
                    onClick={() => toggleReminder(r.id)}
                    aria-label={r.done ? t('Mark as not done', 'Tandai belum selesai') : t('Mark as done', 'Tandai selesai')}
                    className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition', r.done ? 'border-green bg-green text-white' : 'border-border-strong hover:border-green')}
                  >
                    {r.done && <CheckCheck className="size-3.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={cn('truncate text-[14px] font-semibold', r.done && 'text-subtle-foreground line-through')}>{r.title}</div>
                    <div className="text-[12.5px] text-muted-foreground">
                      {friendlyDate(r.date)} · {r.time}
                    </div>
                  </div>
                  {r.oppId && (
                    <Button size="xs" variant="ghost" onClick={() => go(`/app/discover?open=${r.oppId}`)}>
                      {t('View', 'Lihat')}
                    </Button>
                  )}
                  <button type="button" onClick={() => deleteReminder(r.id)} aria-label={t('Delete reminder', 'Hapus pengingat')} className="flex size-8 items-center justify-center rounded-lg text-subtle-foreground transition hover:bg-muted-danger hover:text-danger">
                    <Trash2 className="size-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )
      ) : list.length === 0 ? (
        <EmptyState compact icon={CheckCheck} title={t('You’re all caught up', 'Semua sudah terbaca')} description={t('New deadlines and opportunities will appear here.', 'Deadline dan peluang baru akan muncul di sini.')} />
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {list.map((n) => {
              const k = KIND[n.kind];
              const opp = n.oppId ? OPP_BY_ID[n.oppId] : undefined;
              const match = opp && profile ? matchOpportunity(opp, profile).score : undefined;
              return (
                <motion.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
                  className={cn('group relative rounded-2xl border p-4 transition-colors', n.read ? 'border-border' : 'border-green/25 bg-muted-green/40')}
                  onMouseEnter={() => !n.read && markRead(n.id)}
                >
                  <div className="flex gap-3">
                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', k.cls)}>
                      <k.icon className="size-[17px]" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 pr-6">
                      <div className="text-[14px] font-semibold leading-snug">{l(n.title)}</div>
                      <div className="mt-0.5 text-[13px] text-muted-foreground">{l(n.body)}</div>
                      <div className="mt-1.5 flex items-center gap-2 text-[12px] text-subtle-foreground">
                        {!n.read && <span className="size-1.5 rounded-full bg-orange" aria-label={t('Unread', 'Belum dibaca')} />}
                        {relative(n.createdAt)}
                        {match !== undefined && <span className="font-semibold text-green-strong dark:text-green">· {match}% match</span>}
                      </div>
                      {(opp || n.to) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {opp && (
                            <>
                              <Button size="xs" variant="secondary" onClick={() => { markRead(n.id); go(`/app/discover?open=${opp.id}`); }}>
                                {t('View opportunity', 'Lihat peluang')}
                              </Button>
                              <Button size="xs" variant={saved[opp.id] ? 'soft' : 'ghost'} onClick={() => toggleSave(opp.id)}>
                                {saved[opp.id] ? <BookmarkCheck /> : <Bookmark />}
                                {saved[opp.id] ? t('Saved', 'Tersimpan') : t('Save', 'Simpan')}
                              </Button>
                            </>
                          )}
                          {!opp && n.to && (
                            <Button size="xs" variant="secondary" onClick={() => { markRead(n.id); go(n.to!); }}>
                              {t('Open', 'Buka')}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(n.id)}
                    aria-label={t('Dismiss', 'Tutup')}
                    className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-lg text-subtle-foreground opacity-100 transition hover:bg-surface-2 hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </Sheet>
  );
}
