import { useGuide } from './guide';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useMemo } from 'react';
import type {
  Activity,
  AppStatus,
  HistoryPoint,
  JournalEntry,
  Mission,
  OrbitNotification,
  Profile,
  Quest,
  QuestStatus,
  Reminder,
  SavedItem,
} from '@/data/types';
import { NAYA, NAYA_30D_AGO, NAYA_HISTORY, seedActivity, seedJournal, seedMissions, seedNotifications, seedReminders, seedSaved } from '@/data/persona';
import { seedQuests } from '@/data/journey';
import { insightsFor, readinessOf, currentDims } from '@/engine/intelligence';
import { unlockedIds } from '@/engine/achievements';
import type { AgentMessage } from '@/engine/agent';
import { uid } from '@/lib/utils';

export type Mode = 'none' | 'demo' | 'custom';

export interface OrbitData {
  mode: Mode;
  profile: Profile | null;
  quests: Quest[];
  missions: Mission[];
  saved: Record<string, SavedItem>;
  reminders: Reminder[];
  notifications: OrbitNotification[];
  journal: JournalEntry[];
  activity: Activity[];
  xp: number;
  streak: number;
  lastActive: string;
  history: number[];
  readiness30dAgo: number;
  baselineAt: string;
  achievements: string[];
  agent: AgentMessage[];
  campusPlanned: string[];
  onboardedAt: string;
}

interface OrbitActions {
  loadDemo: () => void;
  completeOnboarding: (profile: Profile, demo: boolean) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  signOut: () => void;
  resetDemo: () => void;

  addQuest: (q: Quest) => void;
  updateQuest: (id: string, patch: Partial<Quest>) => void;
  moveQuest: (id: string, status: QuestStatus, beforeId?: string | null) => { completed: boolean; quest?: Quest; readinessDelta: number };
  toggleStep: (questId: string, stepId: string) => void;
  deleteQuest: (id: string) => Quest | undefined;
  restoreQuest: (q: Quest) => void;

  toggleMission: (id: string) => void;

  toggleSave: (oppId: string) => boolean;
  setAppStatus: (oppId: string, status: AppStatus) => void;
  setSavedNote: (oppId: string, note: string) => void;

  addReminder: (r: Omit<Reminder, 'id' | 'createdAt' | 'done'>) => Reminder;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => void;

  addJournal: (e: Pick<JournalEntry, 'title' | 'body' | 'tags' | 'mood'>) => JournalEntry;
  updateJournal: (id: string, patch: Partial<JournalEntry>) => void;
  deleteJournal: (id: string) => JournalEntry | undefined;
  restoreJournal: (e: JournalEntry) => void;

  pushAgent: (m: AgentMessage) => void;
  clearAgent: () => void;

  toggleCampusProgram: (id: string) => void;
  logActivity: (a: Omit<Activity, 'id' | 'at'>) => void;
  /** Returns ids of achievements unlocked by the latest change. */
  syncAchievements: () => string[];
}

export type OrbitState = OrbitData & OrbitActions;

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY: OrbitData = {
  mode: 'none',
  profile: null,
  quests: [],
  missions: [],
  saved: {},
  reminders: [],
  notifications: [],
  journal: [],
  activity: [],
  xp: 0,
  streak: 0,
  lastActive: '',
  history: [],
  readiness30dAgo: 0,
  baselineAt: '',
  achievements: [],
  agent: [],
  campusPlanned: ['prog-sql'],
  onboardedAt: '',
};

function demoData(profile: Profile = NAYA): OrbitData {
  const quests = seedQuests();
  const saved = seedSaved();
  const journal = seedJournal();
  const readiness = readinessOf(currentDims(profile, quests));
  return {
    ...EMPTY,
    mode: 'demo',
    profile,
    quests,
    missions: seedMissions(),
    saved,
    reminders: seedReminders(),
    notifications: seedNotifications(),
    journal,
    activity: seedActivity(),
    xp: 2450,
    streak: 5,
    lastActive: today(),
    history: NAYA_HISTORY,
    readiness30dAgo: NAYA_30D_AGO,
    baselineAt: new Date().toISOString(),
    achievements: unlockedIds({ profile, quests, saved, journal, streak: 5, readiness }),
    onboardedAt: new Date().toISOString(),
  };
}

function customData(profile: Profile): OrbitData {
  const readiness = readinessOf(currentDims(profile, []));
  const base = Math.round(readiness);
  return {
    ...EMPTY,
    mode: 'custom',
    profile,
    quests: [],
    missions: [
      { id: 'm0', title: { en: 'See what your classes are for in the Learning Map', id: 'Lihat kegunaan mata kuliahmu di Learning Map' }, minutes: 5, done: false, xp: 20, to: '/app/learning' },
      { id: 'm1', title: { en: 'Explore your Career Universe', id: 'Jelajahi Career Universe-mu' }, minutes: 5, done: false, xp: 20, to: '/app/universe' },
      { id: 'm2', title: { en: 'Add your first quest to the Journey', id: 'Tambahkan quest pertama ke Journey' }, minutes: 5, done: false, xp: 30, to: '/app/journey' },
      { id: 'm3', title: { en: 'Save one opportunity that fits', id: 'Simpan satu peluang yang cocok' }, minutes: 10, done: false, xp: 20, to: '/app/discover' },
    ],
    notifications: [
      {
        id: 'welcome',
        kind: 'review',
        title: { en: 'Your Orbit is ready', id: 'Orbit-mu sudah siap' },
        body: { en: 'Start with your Next Best Action on the Today page.', id: 'Mulai dari Next Best Action di halaman Today.' },
        createdAt: new Date().toISOString(),
        read: false,
        to: '/app',
      },
    ],
    activity: [{ id: uid('a'), kind: 'profile', title: { en: 'Built your Career Profile', id: 'Membangun Career Profile' }, at: new Date().toISOString(), xp: 100 }],
    xp: 100,
    streak: 1,
    lastActive: today(),
    history: [Math.max(base - 6, 20), Math.max(base - 3, 20)],
    readiness30dAgo: base,
    baselineAt: new Date().toISOString(),
    onboardedAt: new Date().toISOString(),
  };
}

function bumpStreak(s: OrbitData): Pick<OrbitData, 'streak' | 'lastActive'> {
  const t = today();
  if (s.lastActive === t) return { streak: s.streak, lastActive: t };
  const y = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  return { streak: s.lastActive === y ? s.streak + 1 : 1, lastActive: t };
}

const activity = (a: Omit<Activity, 'id' | 'at'>): Activity => ({ ...a, id: uid('a'), at: new Date().toISOString() });

export const useOrbit = create<OrbitState>()(
  persist(
    (set, get) => ({
      ...EMPTY,

      loadDemo: () => {
        useGuide.getState().reset();
        set(demoData());
      },
      completeOnboarding: (profile, demo) => {
        useGuide.getState().reset();
        set(demo ? demoData(profile) : customData(profile));
      },
      updateProfile: (patch) => {
        const p = get().profile;
        if (!p) return;
        set({ profile: { ...p, ...patch } });
      },
      signOut: () => {
        useGuide.getState().reset();
        set({ ...EMPTY });
      },
      resetDemo: () => set({ ...demoData(), agent: [] }),

      addQuest: (q) =>
        set((s) => ({
          quests: [...s.quests, { ...q, order: Math.min(0, ...s.quests.map((x) => x.order)) - 1 }],
          activity: [activity({ kind: 'journey', title: { en: `Added “${typeof q.title === 'string' ? q.title : q.title.en}” to Journey`, id: `Menambahkan “${typeof q.title === 'string' ? q.title : q.title.id}” ke Journey` } }), ...s.activity],
          ...bumpStreak(s),
        })),
      updateQuest: (id, patch) => set((s) => ({ quests: s.quests.map((q) => (q.id === id ? { ...q, ...patch } : q)) })),
      moveQuest: (id, status, beforeId) => {
        const s = get();
        const quest = s.quests.find((q) => q.id === id);
        if (!quest) return { completed: false, readinessDelta: 0 };
        const before = s.profile ? readinessOf(currentDims(s.profile, s.quests)) : 0;
        const completed = status === 'done' && quest.status !== 'done';
        const uncompleted = status !== 'done' && quest.status === 'done';
        const now = new Date().toISOString();
        const updated: Quest = {
          ...quest,
          status,
          completedAt: completed ? now : uncompleted ? undefined : quest.completedAt,
          baseline: uncompleted ? false : quest.baseline,
          steps: completed ? quest.steps.map((st) => ({ ...st, done: true })) : quest.steps,
        };
        // Reorder: place before `beforeId` within the new column, else at the end.
        const others = s.quests.filter((q) => q.id !== id);
        const col = others.filter((q) => q.status === status).sort((a, b) => a.order - b.order);
        const idx = beforeId ? col.findIndex((q) => q.id === beforeId) : -1;
        const ordered = idx >= 0 ? [...col.slice(0, idx), updated, ...col.slice(idx)] : [...col, updated];
        const orderMap = new Map(ordered.map((q, i) => [q.id, i]));
        const quests = [...others.filter((q) => q.status !== status), ...ordered].map((q) => (orderMap.has(q.id) ? { ...q, order: orderMap.get(q.id)! } : q));
        const after = s.profile ? readinessOf(currentDims(s.profile, quests)) : 0;
        const delta = Math.round((after - before) * 10) / 10;
        const patch: Partial<OrbitData> = { quests };
        if (completed) {
          patch.xp = s.xp + quest.xp;
          patch.activity = [activity({ kind: 'quest', title: { en: `Completed “${typeof quest.title === 'string' ? quest.title : quest.title.en}”`, id: `Menyelesaikan “${typeof quest.title === 'string' ? quest.title : quest.title.id}”` }, xp: quest.xp, readiness: delta }), ...s.activity];
          Object.assign(patch, bumpStreak(s));
        } else if (uncompleted) {
          patch.xp = Math.max(0, s.xp - quest.xp);
        } else if (status === 'doing' && quest.status === 'todo') {
          Object.assign(patch, bumpStreak(s));
        }
        set(patch);
        return { completed, quest: updated, readinessDelta: delta };
      },
      toggleStep: (questId, stepId) =>
        set((s) => ({
          quests: s.quests.map((q) => {
            if (q.id !== questId) return q;
            const steps = q.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st));
            const status: QuestStatus = q.status === 'todo' && steps.some((st) => st.done) ? 'doing' : q.status;
            return { ...q, steps, status };
          }),
        })),
      deleteQuest: (id) => {
        const q = get().quests.find((x) => x.id === id);
        set((s) => ({ quests: s.quests.filter((x) => x.id !== id) }));
        return q;
      },
      restoreQuest: (q) => set((s) => ({ quests: [...s.quests, q] })),

      toggleMission: (id) =>
        set((s) => {
          const m = s.missions.find((x) => x.id === id);
          if (!m) return {};
          return {
            missions: s.missions.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
            xp: s.xp + (m.done ? -m.xp : m.xp),
            ...(m.done ? {} : bumpStreak(s)),
          };
        }),

      toggleSave: (oppId) => {
        const s = get();
        const exists = Boolean(s.saved[oppId]);
        if (exists) {
          const { [oppId]: _removed, ...rest } = s.saved;
          set({ saved: rest });
          return false;
        }
        const now = new Date().toISOString();
        set({ saved: { ...s.saved, [oppId]: { oppId, status: 'saved', savedAt: now, updatedAt: now } }, ...bumpStreak(s) });
        return true;
      },
      setAppStatus: (oppId, status) =>
        set((s) => {
          const now = new Date().toISOString();
          const cur = s.saved[oppId] ?? { oppId, status: 'saved' as AppStatus, savedAt: now, updatedAt: now };
          return {
            saved: { ...s.saved, [oppId]: { ...cur, status, updatedAt: now } },
            xp: status === 'applied' && cur.status === 'saved' ? s.xp + 60 : s.xp,
            ...bumpStreak(s),
          };
        }),
      setSavedNote: (oppId, note) => set((s) => (s.saved[oppId] ? { saved: { ...s.saved, [oppId]: { ...s.saved[oppId], note } } } : {})),

      addReminder: (r) => {
        const reminder: Reminder = { ...r, id: uid('r'), createdAt: new Date().toISOString(), done: false };
        set((s) => ({
          reminders: [...s.reminders, reminder].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
          notifications: [
            {
              id: uid('n'),
              kind: 'reminder',
              title: { en: `Reminder set: ${r.title}`, id: `Pengingat dibuat: ${r.title}` },
              body: { en: `Orbit will remind you on ${r.date} at ${r.time}.`, id: `Orbit akan mengingatkanmu pada ${r.date} pukul ${r.time}.` },
              createdAt: new Date().toISOString(),
              read: false,
              oppId: r.oppId,
            },
            ...s.notifications,
          ],
          activity: [activity({ kind: 'reminder', title: { en: `Created a reminder: ${r.title}`, id: `Membuat pengingat: ${r.title}` } }), ...s.activity],
        }));
        return reminder;
      },
      toggleReminder: (id) => set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) })),
      deleteReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      dismissNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      addJournal: (e) => {
        const now = new Date().toISOString();
        const entry: JournalEntry = { ...e, id: uid('j'), pinned: false, createdAt: now, updatedAt: now };
        set((s) => ({
          journal: [entry, ...s.journal],
          xp: s.xp + 15,
          activity: [activity({ kind: 'journal', title: { en: `Wrote “${e.title}”`, id: `Menulis “${e.title}”` }, xp: 15 }), ...s.activity],
          ...bumpStreak(s),
        }));
        return entry;
      },
      updateJournal: (id, patch) => set((s) => ({ journal: s.journal.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: new Date().toISOString() } : j)) })),
      deleteJournal: (id) => {
        const e = get().journal.find((j) => j.id === id);
        set((s) => ({ journal: s.journal.filter((j) => j.id !== id) }));
        return e;
      },
      restoreJournal: (e) => set((s) => ({ journal: [e, ...s.journal] })),

      pushAgent: (m) => set((s) => ({ agent: [...s.agent, m].slice(-60) })),
      clearAgent: () => set({ agent: [] }),

      toggleCampusProgram: (id) => set((s) => ({ campusPlanned: s.campusPlanned.includes(id) ? s.campusPlanned.filter((x) => x !== id) : [...s.campusPlanned, id] })),
      logActivity: (a) => set((s) => ({ activity: [activity(a), ...s.activity] })),

      syncAchievements: () => {
        const s = get();
        if (!s.profile) return [];
        const readiness = readinessOf(currentDims(s.profile, s.quests));
        const ids = unlockedIds({ profile: s.profile, quests: s.quests, saved: s.saved, journal: s.journal, streak: s.streak, readiness });
        const fresh = ids.filter((id) => !s.achievements.includes(id));
        if (fresh.length) set({ achievements: [...s.achievements, ...fresh] });
        return fresh;
      },
    }),
    {
      name: 'orbit.app.v3',
      version: 3,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Live Career Intelligence derived from the profile and journey. */
export function useInsights() {
  const profile = useOrbit((s) => s.profile);
  const quests = useOrbit((s) => s.quests);
  return useMemo(() => (profile ? insightsFor(profile, quests) : null), [profile, quests]);
}

/** Readiness history points including the live value. */
export function useHistory(): HistoryPoint[] {
  const history = useOrbit((s) => s.history);
  const insights = useInsights();
  return useMemo(() => {
    const now = new Date();
    const pts: HistoryPoint[] = history.map((v, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (history.length - i), 1);
      return { label: d.toLocaleDateString('en-US', { month: 'short' }), value: v };
    });
    pts.push({ label: 'Now', value: Math.round((insights?.readiness ?? 0) * 10) / 10 });
    return pts;
  }, [history, insights]);
}
