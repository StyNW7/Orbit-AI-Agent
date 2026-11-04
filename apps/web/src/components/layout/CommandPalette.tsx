import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  CornerDownLeft,
  FileText,
  GraduationCap,
  Languages,
  Layers,
  Moon,
  Route,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Users,
  Building2,
} from 'lucide-react';
import { useUi, useResolvedTheme } from '@/store/ui';
import { useOrbit } from '@/store/orbit';
import { requestReset } from '@/store/actions';
import { useI18nStore, useT } from '@/lib/i18n';
import { PRIMARY_NAV, SECONDARY_NAV, SETTINGS_NAV } from './nav';
import { OPPORTUNITIES, TYPE_LABEL } from '@/data/opportunities';
import { ROLES, SKILLS } from '@/data/catalog';
import { Kbd } from '@/components/ui/primitives';
import { ease } from '@/lib/motion';
import type { OpportunityType } from '@/data/types';

const TYPE_ICON: Record<OpportunityType, typeof Briefcase> = {
  job: Briefcase,
  internship: Briefcase,
  course: GraduationCap,
  event: CalendarDays,
  mentor: Users,
  book: BookOpen,
  research: FileText,
};

function Item({ onSelect, icon: Icon, label, hint, value }: { onSelect: () => void; icon: typeof Briefcase; label: string; hint?: string; value: string }) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] outline-none transition-colors data-[selected=true]:bg-surface-2"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-muted-foreground transition-colors group-data-[selected=true]:bg-muted-green group-data-[selected=true]:text-green-strong dark:group-data-[selected=true]:text-green">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      {hint && <span className="hidden shrink-0 text-[12px] text-subtle-foreground sm:block">{hint}</span>}
      <ArrowRight className="size-4 shrink-0 text-subtle-foreground opacity-0 transition group-data-[selected=true]:opacity-100" aria-hidden />
    </Command.Item>
  );
}

const groupCls =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-subtle-foreground';

export function CommandPalette() {
  const open = useUi((s) => s.commandOpen);
  const setOpen = useUi((s) => s.setCommandOpen);
  const openAgent = useUi((s) => s.openAgent);
  const setTheme = useUi((s) => s.setTheme);
  const theme = useResolvedTheme();
  const quests = useOrbit((s) => s.quests);
  const navigate = useNavigate();
  const { t, l, locale } = useT();
  const setLocale = useI18nStore((s) => s.setLocale);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const opps = useMemo(() => {
    const groups: Partial<Record<OpportunityType, typeof OPPORTUNITIES>> = {};
    for (const o of OPPORTUNITIES) (groups[o.type] ??= []).push(o);
    return groups;
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[70] bg-[var(--overlay)] backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
            </Dialog.Overlay>
            <div className="pointer-events-none fixed inset-0 z-[71] flex items-start justify-center px-3 pt-[10vh] sm:pt-[14vh]">
              <Dialog.Content asChild forceMount>
                <motion.div
                  data-lenis-prevent
                  initial={{ opacity: 0, scale: 0.97, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -6 }}
                  transition={{ duration: 0.22, ease }}
                  className="pointer-events-auto w-full max-w-[640px] overflow-hidden rounded-[22px] border border-border bg-surface shadow-pop"
                >
                  <Dialog.Title className="sr-only">{t('Search Orbit', 'Cari di Orbit')}</Dialog.Title>
                  <Dialog.Description className="sr-only">{t('Search pages, skills, roles, opportunities and quests.', 'Cari halaman, skill, peran, peluang, dan quest.')}</Dialog.Description>
                  <Command loop className="flex max-h-[min(560px,72dvh)] flex-col">
                    <div className="flex items-center gap-3 border-b border-border px-4">
                      <Search className="size-[18px] shrink-0 text-subtle-foreground" aria-hidden />
                      <Command.Input
                        autoFocus
                        placeholder={t('Search skills, roles, jobs, courses, mentors, pages…', 'Cari skill, peran, pekerjaan, kursus, mentor, halaman…')}
                        className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-subtle-foreground"
                      />
                      <Kbd>Esc</Kbd>
                    </div>
                    <Command.List className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2">
                      <Command.Empty className="px-4 py-10 text-center text-[14px] text-muted-foreground">{t('No results. Try “SQL”, “Mentor” or “Journey”.', 'Tidak ada hasil. Coba “SQL”, “Mentor”, atau “Journey”.')}</Command.Empty>

                      <Command.Group heading={t('Quick actions', 'Aksi cepat')} className={groupCls}>
                        <Item value="ask orbit agent tanya" icon={Sparkles} label={t('Ask Orbit Agent', 'Tanya Orbit Agent')} hint="A" onSelect={() => { setOpen(false); openAgent(); }} />
                        <Item value="theme dark light mode tema" icon={Moon} label={theme === 'dark' ? t('Switch to light mode', 'Ganti ke mode terang') : t('Switch to dark mode', 'Ganti ke mode gelap')} onSelect={() => { setOpen(false); setTheme(theme === 'dark' ? 'light' : 'dark'); }} />
                        <Item value="language bahasa english indonesia" icon={Languages} label={locale === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'} onSelect={() => { setOpen(false); setLocale(locale === 'en' ? 'id' : 'en'); }} />
                        <Item value="reset demo restore" icon={RotateCcw} label={t('Reset demo data', 'Reset data demo')} onSelect={() => { setOpen(false); requestReset(); }} />
                      </Command.Group>

                      <Command.Group heading={t('Pages', 'Halaman')} className={groupCls}>
                        {[...PRIMARY_NAV, ...SECONDARY_NAV, SETTINGS_NAV].map((n) => (
                          <Item key={n.to} value={`page ${l(n.label)} ${n.to}`} icon={n.icon} label={l(n.label)} hint={l(n.stage)} onSelect={() => go(n.to)} />
                        ))}
                        <Item value="campus orbit for campus kampus" icon={Building2} label="Orbit for Campus" onSelect={() => go('/campus')} />
                      </Command.Group>

                      <Command.Group heading={t('Journey', 'Journey')} className={groupCls}>
                        {quests.map((q) => (
                          <Item key={q.id} value={`quest ${l(q.title)}`} icon={Route} label={l(q.title)} hint={q.status === 'done' ? t('Completed', 'Selesai') : q.status === 'doing' ? t('In progress', 'Berjalan') : t('To do', 'To do')} onSelect={() => go(`/app/journey?quest=${q.id}`)} />
                        ))}
                      </Command.Group>

                      <Command.Group heading={t('Skills', 'Skill')} className={groupCls}>
                        {SKILLS.map((s) => (
                          <Item key={s.id} value={`skill ${l(s.name)}`} icon={Layers} label={l(s.name)} hint={t('Career Universe', 'Career Universe')} onSelect={() => go(`/app/universe?focus=skill:${s.id}`)} />
                        ))}
                      </Command.Group>

                      <Command.Group heading={t('Roles', 'Peran')} className={groupCls}>
                        {ROLES.map((r) => (
                          <Item key={r.id} value={`role ${l(r.name)}`} icon={Target} label={l(r.name)} hint={t('{n} openings', '{n} lowongan', { n: r.openings })} onSelect={() => go(`/app/settings?role=${r.id}`)} />
                        ))}
                      </Command.Group>

                      {(Object.keys(opps) as OpportunityType[]).map((type) => (
                        <Command.Group key={type} heading={l(TYPE_LABEL[type])} className={groupCls}>
                          {opps[type]!.map((o) => (
                            <Item key={o.id} value={`${type} ${o.title} ${o.org}`} icon={TYPE_ICON[type]} label={o.title} hint={o.org} onSelect={() => go(`/app/discover?open=${o.id}`)} />
                          ))}
                        </Command.Group>
                      ))}
                    </Command.List>
                    <div className="hidden items-center gap-4 border-t border-border px-4 py-2.5 text-[12px] text-subtle-foreground sm:flex">
                      <span className="inline-flex items-center gap-1.5">
                        <Kbd>↑</Kbd>
                        <Kbd>↓</Kbd> {t('navigate', 'navigasi')}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Kbd>
                          <CornerDownLeft className="size-3" />
                        </Kbd>{' '}
                        {t('open', 'buka')}
                      </span>
                      <span className="ml-auto">Orbit Search</span>
                    </div>
                  </Command>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
