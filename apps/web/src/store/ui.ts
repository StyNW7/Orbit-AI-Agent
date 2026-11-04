import { useSyncExternalStore, type ReactNode } from 'react';
import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface ConfirmRequest {
  title: string;
  description?: string;
  /** Items Orbit wants to add/change, shown as a list. */
  items?: { label: string; meta?: string }[];
  impact?: number;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  icon?: 'journey' | 'reminder' | 'reset' | 'delete' | 'apply';
  onConfirm: () => void | Promise<void>;
  extra?: ReactNode;
}

interface UiState {
  theme: ThemePreference;
  sidebarCollapsed: boolean;
  agentOpen: boolean;
  agentPrompt: { text: string; intent?: string; arg?: string } | null;
  commandOpen: boolean;
  notificationsOpen: boolean;
  confirm: ConfirmRequest | null;
  setTheme: (t: ThemePreference, origin?: { x: number; y: number }) => void;
  toggleSidebar: () => void;
  openAgent: (prompt?: { text: string; intent?: string; arg?: string }) => void;
  setAgentOpen: (open: boolean) => void;
  consumePrompt: () => UiState['agentPrompt'];
  setCommandOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  askConfirm: (req: ConfirmRequest) => void;
  closeConfirm: () => void;
}

const THEME_KEY = 'orbit.theme';
const SIDEBAR_KEY = 'orbit.sidebar';
const THEME_COLOR = { light: '#F8FAF9', dark: '#0C1310' } as const;
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

function readTheme(): ThemePreference {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

export function resolveTheme(theme: ThemePreference): 'light' | 'dark' {
  if (theme === 'system') return typeof window !== 'undefined' && darkQuery().matches ? 'dark' : 'light';
  return theme;
}

export function applyTheme(theme: ThemePreference) {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved]);
}

type VTDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

function transitionTheme(theme: ThemePreference, origin?: { x: number; y: number }) {
  const doc = document as VTDoc;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  if (!doc.startViewTransition || reduced || resolveTheme(theme) === current) {
    applyTheme(theme);
    return;
  }
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const t = doc.startViewTransition(() => applyTheme(theme));
  void t.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => undefined);
}

export const useUi = create<UiState>((set, get) => ({
  theme: readTheme(),
  sidebarCollapsed: (() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  })(),
  agentOpen: false,
  agentPrompt: null,
  commandOpen: false,
  notificationsOpen: false,
  confirm: null,
  setTheme: (theme, origin) => {
    try {
      if (theme === 'system') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
    transitionTheme(theme, origin);
    set({ theme });
  },
  toggleSidebar: () => {
    const v = !get().sidebarCollapsed;
    try {
      localStorage.setItem(SIDEBAR_KEY, v ? '1' : '0');
    } catch {
      // ignore
    }
    set({ sidebarCollapsed: v });
  },
  openAgent: (prompt) => set({ agentOpen: true, agentPrompt: prompt ?? null, notificationsOpen: false, commandOpen: false }),
  setAgentOpen: (agentOpen) => set({ agentOpen }),
  consumePrompt: () => {
    const p = get().agentPrompt;
    if (p) set({ agentPrompt: null });
    return p;
  },
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
  askConfirm: (confirm) => set({ confirm }),
  closeConfirm: () => set({ confirm: null }),
}));

function subscribeSystem(cb: () => void) {
  const mq = darkQuery();
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

export function useResolvedTheme(): 'light' | 'dark' {
  const theme = useUi((s) => s.theme);
  const sysDark = useSyncExternalStore(subscribeSystem, () => darkQuery().matches, () => false);
  return theme === 'system' ? (sysDark ? 'dark' : 'light') : theme;
}

export const useIsDark = () => useResolvedTheme() === 'dark';
