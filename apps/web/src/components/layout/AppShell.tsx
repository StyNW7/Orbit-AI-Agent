import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, BookOpenText, Compass, Gauge, LineChart, NotebookPen, ChevronsLeft, ChevronsRight, Globe, LogOut, RotateCcw, Search, Settings, Sparkles, Zap } from 'lucide-react';
import { Logo, OrbitMark } from '@/components/brand/brand';
import { Avatar, Kbd, ProgressBar } from '@/components/ui/primitives';
import { DropdownContent, DropdownItem, DropdownLabel, DropdownMenu, DropdownSeparator, DropdownTrigger, Tooltip } from '@/components/ui/overlays';
import { LanguageToggle, ThemeToggle } from '@/components/shared/toggles';
import { Button } from '@/components/ui/button';
import { PRIMARY_NAV, SECONDARY_NAV, SETTINGS_NAV, type NavItem } from './nav';
import { CommandPalette } from './CommandPalette';
import { NotificationsPanel } from './NotificationsPanel';
import { AgentPanel } from '@/components/agent/AgentPanel';
import { OrbitSwitcher, OrbitsModal, useOrbitRows } from '@/components/orbits/Orbits';
import { AddMaterialModal } from '@/features/learning/AddMaterialModal';
import { ReturnToStory } from '@/components/shared/ReturnToStory';
import { useOrbit, useInsights } from '@/store/orbit';
import { useUi } from '@/store/ui';
import { useGuide } from '@/store/guide';
import { requestReset } from '@/store/actions';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { levelInfo } from '@/engine/intelligence';
import { ROLE_BY_ID } from '@/data/catalog';
import { ease } from '@/lib/motion';

function SideLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { l } = useT();
  return (
    <Tooltip content={l(item.label)} side="right" disabled={!collapsed}>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn(
            'group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-semibold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-[var(--ring)]',
            isActive ? 'text-green-strong dark:text-green' : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
            collapsed && 'justify-center px-0',
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span layoutId="side-active" className="absolute inset-0 rounded-xl bg-muted-green" transition={{ type: 'spring', stiffness: 500, damping: 40 }}>
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-x-[1px] -translate-y-1/2 rounded-full bg-green" />
              </motion.span>
            )}
            <item.icon className="relative z-10 size-[19px] shrink-0" aria-hidden />
            {!collapsed && <span className="relative z-10 truncate">{l(item.label)}</span>}
          </>
        )}
      </NavLink>
    </Tooltip>
  );
}

function Sidebar() {
  const collapsed = useUi((s) => s.sidebarCollapsed);
  const toggle = useUi((s) => s.toggleSidebar);
  const openAgent = useUi((s) => s.openAgent);
  const setNotif = useUi((s) => s.setNotificationsOpen);
  const unread = useOrbit((s) => s.notifications.filter((n) => !n.read).length);
  const profile = useOrbit((s) => s.profile);
  const xp = useOrbit((s) => s.xp);
  const insights = useInsights();
  const setOrbitsOpen = useUi((s) => s.setOrbitsOpen);
  const orbitCount = useOrbitRows().length;
  const { t, l } = useT();
  const lvl = levelInfo(xp);

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 272 }}
      transition={{ duration: 0.32, ease }}
      className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-surface/80 backdrop-blur-xl lg:flex"
    >
      <div className={cn('flex h-[72px] shrink-0 items-center', collapsed ? 'justify-center px-3' : 'justify-between px-5')}>
        <Link to="/" className="rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]" aria-label="Orbit">
          <Logo compact={collapsed} />
        </Link>
        {!collapsed && (
          <Tooltip content={t('Collapse sidebar', 'Ciutkan sidebar')}>
            <button type="button" onClick={toggle} aria-label={t('Collapse sidebar', 'Ciutkan sidebar')} className="flex size-8 items-center justify-center rounded-lg text-subtle-foreground transition hover:bg-surface-2 hover:text-foreground">
              <ChevronsLeft className="size-4" />
            </button>
          </Tooltip>
        )}
      </div>

      <nav aria-label={t('Main', 'Utama')} className={cn('scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto pb-4', collapsed ? 'px-3' : 'px-4')}>
        {!collapsed && <div className="eyebrow mb-2 mt-2 px-3 text-[11px]">{t('Your orbit', 'Orbit-mu')}</div>}
        <div className="space-y-1">
          {PRIMARY_NAV.map((item) => (
            <SideLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>
        <div className="my-4 h-px bg-border" />
        <div className="space-y-1">
          <Tooltip content={t('Orbit Agent', 'Orbit Agent')} side="right" disabled={!collapsed}>
            <button
              type="button"
              onClick={() => openAgent()}
              className={cn('group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-semibold text-muted-foreground transition hover:bg-surface-2 hover:text-foreground', collapsed && 'justify-center px-0')}
            >
              <span className="relative flex size-[19px] items-center justify-center">
                <Sparkles className="size-[19px] text-orange" aria-hidden />
              </span>
              {!collapsed && <span>Orbit Agent</span>}
              {!collapsed && <Kbd className="ml-auto">A</Kbd>}
            </button>
          </Tooltip>
          <Tooltip content={t('Notifications', 'Notifikasi')} side="right" disabled={!collapsed}>
            <button
              type="button"
              onClick={() => setNotif(true)}
              className={cn('relative flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-semibold text-muted-foreground transition hover:bg-surface-2 hover:text-foreground', collapsed && 'justify-center px-0')}
            >
              <Bell className="size-[19px]" aria-hidden />
              {!collapsed && <span>{t('Notifications', 'Notifikasi')}</span>}
              {unread > 0 && (
                <span className={cn('tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1.5 text-[11px] font-bold text-white', collapsed ? 'absolute right-3 top-1.5' : 'ml-auto')}>{unread}</span>
              )}
            </button>
          </Tooltip>
          {SECONDARY_NAV.map((item) => (
            <SideLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>

        <div className="mt-auto pt-4">
          {!collapsed && profile && insights && (
            <motion.button
              type="button"
              onClick={() => setOrbitsOpen(true)}
              aria-label={t('Manage your dream orbits', 'Kelola orbit impianmu')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-3 block w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-mint to-cream p-4 text-left transition hover:border-border-strong hover:shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[10.5px]">{orbitCount > 1 ? t('Active orbit · {n} dreams', 'Orbit aktif · {n} impian', { n: orbitCount }) : t('Active orbit', 'Orbit aktif')}</span>
                <span className="tabular inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11.5px] font-bold text-green-strong shadow-xs dark:text-green">
                  <span className="size-1.5 rounded-full bg-green" />
                  {Math.round(insights.readiness)}%
                </span>
              </div>
              <div className="mt-1.5 truncate font-display text-[15px] font-bold">{l(ROLE_BY_ID[profile.targetRole].name)}</div>
              <div className="mt-3 flex items-center justify-between text-[11.5px] font-semibold text-muted-foreground">
                <span>
                  Lv. {lvl.level} · {l(lvl.title)}
                </span>
                <span className="tabular">
                  {xp.toLocaleString('en-US')}/{lvl.ceil.toLocaleString('en-US')}
                </span>
              </div>
              <ProgressBar value={lvl.progress} size="sm" tone="gradient" className="mt-1.5" label="XP" />
            </motion.button>
          )}
          <SideLink item={SETTINGS_NAV} collapsed={collapsed} />
          {collapsed && (
            <Tooltip content={t('Expand sidebar', 'Lebarkan sidebar')} side="right">
              <button type="button" onClick={toggle} aria-label={t('Expand sidebar', 'Lebarkan sidebar')} className="mt-1 flex h-11 w-full items-center justify-center rounded-xl text-subtle-foreground transition hover:bg-surface-2 hover:text-foreground">
                <ChevronsRight className="size-[18px]" />
              </button>
            </Tooltip>
          )}
        </div>
      </nav>
    </motion.aside>
  );
}

function UserMenu() {
  const profile = useOrbit((s) => s.profile);
  const signOut = useOrbit((s) => s.signOut);
  const showGuide = useGuide((s) => s.setDismissed);
  const navigate = useNavigate();
  const { t } = useT();
  if (!profile) return null;
  return (
    <DropdownMenu>
      <DropdownTrigger asChild>
        <button type="button" className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]" aria-label={t('Account menu', 'Menu akun')}>
          <Avatar name={profile.name} hue={profile.avatarHue} size={38} />
        </button>
      </DropdownTrigger>
      <DropdownContent className="w-64">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Avatar name={profile.name} hue={profile.avatarHue} size={36} />
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold">{profile.name}</div>
            <div className="truncate text-[12px] text-muted-foreground">{profile.email}</div>
          </div>
        </div>
        <DropdownSeparator />
        <DropdownItem onSelect={() => navigate('/app/settings')}>
          <Settings /> {t('Profile & settings', 'Profil & pengaturan')}
        </DropdownItem>
        <DropdownItem onSelect={() => navigate('/app/progress')}>
          <LineChart /> Progress
        </DropdownItem>
        <DropdownItem onSelect={() => navigate('/app/intelligence')}>
          <Gauge /> Career Intelligence
        </DropdownItem>
        <DropdownItem onSelect={() => navigate('/app/journal')}>
          <NotebookPen /> Career Journal
        </DropdownItem>
        <DropdownItem onSelect={() => navigate('/')}>
          <Globe /> {t('Orbit website', 'Website Orbit')}
        </DropdownItem>
        <DropdownItem onSelect={() => navigate('/why-orbit')}>
          <BookOpenText /> Why Orbit
        </DropdownItem>
        <DropdownItem onSelect={() => navigate('/campus')}>
          <Zap /> Orbit for Campus
        </DropdownItem>
        <DropdownItem
          onSelect={() => {
            showGuide(false);
            navigate('/app');
          }}
        >
          <Compass /> {t('Getting-started guide', 'Panduan memulai')}
        </DropdownItem>
        <DropdownSeparator />
        <DropdownLabel>{t('Demo', 'Demo')}</DropdownLabel>
        <DropdownItem onSelect={() => requestReset(() => navigate('/app'))}>
          <RotateCcw /> {t('Reset demo data', 'Reset data demo')}
        </DropdownItem>
        <DropdownItem
          danger
          onSelect={() => {
            signOut();
            navigate('/');
          }}
        >
          <LogOut /> {t('Sign out', 'Keluar')}
        </DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  );
}

function Topbar() {
  const setCommand = useUi((s) => s.setCommandOpen);
  const setNotif = useUi((s) => s.setNotificationsOpen);
  const openAgent = useUi((s) => s.openAgent);
  const unread = useOrbit((s) => s.notifications.filter((n) => !n.read).length);
  const { t } = useT();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="glass sticky top-0 z-30 border-b border-border">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link to="/app" className="lg:hidden" aria-label="Orbit">
          <Logo className="hidden sm:inline-flex" />
          <OrbitMark className="sm:hidden" />
        </Link>
        <OrbitSwitcher />
        <button
          type="button"
          onClick={() => setCommand(true)}
          className="group ml-auto flex h-10 items-center gap-2.5 rounded-xl border border-border bg-surface px-3 text-[13.5px] text-subtle-foreground shadow-xs transition hover:border-border-strong hover:text-muted-foreground sm:ml-0 sm:w-[300px] lg:w-[380px]"
          aria-label={t('Search Orbit', 'Cari di Orbit')}
        >
          <Search className="size-[17px] shrink-0" aria-hidden />
          <span className="hidden flex-1 text-left sm:block">{t('Search skills, roles, opportunities…', 'Cari skill, peran, peluang…')}</span>
          <span className="hidden items-center gap-1 sm:flex">
            <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <div className="flex items-center gap-1.5 sm:ml-auto">
          <LanguageToggle className="hidden md:inline-flex" />
          <ThemeToggle className="hidden sm:flex" />
          <Tooltip content={t('Notifications', 'Notifikasi')}>
            <button
              type="button"
              onClick={() => setNotif(true)}
              className="relative flex size-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
              aria-label={t('Notifications ({n} unread)', 'Notifikasi ({n} belum dibaca)', { n: unread })}
            >
              <Bell className="size-[18px]" />
              <AnimatePresence>
                {unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="tabular absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange px-1 text-[10.5px] font-bold text-white ring-2 ring-surface"
                  >
                    {unread}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </Tooltip>
          <Button variant="gradient" size="sm" className="hidden md:inline-flex" onClick={() => openAgent()}>
            <Sparkles /> {t('Ask Orbit', 'Tanya Orbit')}
          </Button>
          <div className="ml-1">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const { l } = useT();
  return (
    <nav aria-label="Primary" className="glass safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border lg:hidden">
      <div className="mx-auto grid h-[68px] max-w-xl grid-cols-5 px-2">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="relative flex flex-col items-center justify-center gap-1 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]">
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="bottom-active" className="absolute top-0 h-[3px] w-8 rounded-b-full bg-green" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                <motion.span animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.06 : 1 }} className={cn('flex size-8 items-center justify-center rounded-[10px] transition-colors', isActive ? 'bg-muted-green text-green-strong dark:text-green' : 'text-subtle-foreground')}>
                  <item.icon className="size-[19px]" aria-hidden />
                </motion.span>
                <span className={cn('text-[11px] font-semibold leading-none', isActive ? 'text-foreground' : 'text-subtle-foreground')}>{l(item.short ?? item.label)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function AgentFab() {
  const open = useUi((s) => s.agentOpen);
  const openAgent = useUi((s) => s.openAgent);
  const { t } = useT();
  return (
    <AnimatePresence>
      {!open && (
        <motion.button
          type="button"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => openAgent()}
          aria-label={t('Open Orbit Agent', 'Buka Orbit Agent')}
          className="orbit-gradient fixed bottom-[88px] right-4 z-40 flex size-14 items-center justify-center rounded-full text-white shadow-[0_14px_34px_-10px_rgba(10,180,106,0.85)] ring-4 ring-surface lg:bottom-7 lg:right-7"
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-green/40" aria-hidden />
          <Sparkles className="relative size-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function AppShell() {
  const collapsed = useUi((s) => s.sidebarCollapsed);
  const setCommand = useUi((s) => s.setCommandOpen);
  const openAgent = useUi((s) => s.openAgent);
  const markGuide = useGuide((s) => s.mark);
  const location = useLocation();
  const { t } = useT();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest('input, textarea, select, [contenteditable="true"]');
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommand(true);
      } else if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'a' && !document.querySelector('[role="dialog"]')) {
        e.preventDefault();
        openAgent();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCommand, openAgent]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const area = location.pathname.split('/')[2];
    if (area === 'intelligence' || area === 'universe' || area === 'journey') markGuide(area);
  }, [location.pathname, markGuide]);

  const agentOpen = useUi((s) => s.agentOpen);
  useEffect(() => {
    if (agentOpen) markGuide('agent');
  }, [agentOpen, markGuide]);
  const orbitsOpen = useUi((s) => s.orbitsOpen);
  useEffect(() => {
    if (orbitsOpen) markGuide('orbit');
  }, [orbitsOpen, markGuide]);

  return (
    <div className="min-h-dvh bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-pop">
        {t('Skip to content', 'Lompat ke konten')}
      </a>
      <Sidebar />
      <div className={cn('transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]', collapsed ? 'lg:pl-[84px]' : 'lg:pl-[272px]')}>
        <Topbar />
        <main id="main" className="mx-auto max-w-[1360px] px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, ease }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
      <BottomNav />
      <AgentFab />
      <ReturnToStory />
      <AgentPanel />
      <CommandPalette />
      <NotificationsPanel />
      <OrbitsModal />
      <AddMaterialModal />
    </div>
  );
}
