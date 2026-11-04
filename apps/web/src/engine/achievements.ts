import type { Text } from '@/lib/i18n';
import type { JournalEntry, Profile, Quest, SavedItem } from '@/data/types';

export interface AchievementState {
  profile: Profile;
  quests: Quest[];
  saved: Record<string, SavedItem>;
  journal: JournalEntry[];
  streak: number;
  readiness: number;
}

export interface Achievement {
  id: string;
  title: Text;
  description: Text;
  icon: 'route' | 'layers' | 'radar' | 'rocket' | 'flame' | 'users' | 'feather' | 'send';
  progress: (s: AchievementState) => { value: number; goal: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-journey',
    title: { en: 'First Journey', id: 'Journey Pertama' },
    description: { en: 'Start a career journey with at least one quest.', id: 'Memulai journey karier dengan minimal satu quest.' },
    icon: 'route',
    progress: (s) => ({ value: Math.min(s.quests.length, 1), goal: 1 }),
  },
  {
    id: 'skill-builder',
    title: { en: 'Skill Builder', id: 'Skill Builder' },
    description: { en: 'Reach Advanced in three skills.', id: 'Mencapai level Mahir di tiga skill.' },
    icon: 'layers',
    progress: (s) => ({ value: Math.min(Object.values(s.profile.skills).filter((l) => l >= 3).length, 3), goal: 3 }),
  },
  {
    id: 'first-application',
    title: { en: 'First Application', id: 'Lamaran Pertama' },
    description: { en: 'Track your first application in Orbit.', id: 'Melacak lamaran pertamamu di Orbit.' },
    icon: 'send',
    progress: (s) => ({ value: Math.min(Object.values(s.saved).filter((v) => v.status !== 'saved').length, 1), goal: 1 }),
  },
  {
    id: 'opportunity-hunter',
    title: { en: 'Opportunity Hunter', id: 'Opportunity Hunter' },
    description: { en: 'Save five opportunities that fit your goal.', id: 'Menyimpan lima peluang yang sesuai tujuanmu.' },
    icon: 'radar',
    progress: (s) => ({ value: Math.min(Object.keys(s.saved).length, 5), goal: 5 }),
  },
  {
    id: 'momentum',
    title: { en: 'Momentum', id: 'Momentum' },
    description: { en: 'Keep a seven-day growth streak.', id: 'Menjaga growth streak tujuh hari.' },
    icon: 'flame',
    progress: (s) => ({ value: Math.min(s.streak, 7), goal: 7 }),
  },
  {
    id: 'connector',
    title: { en: 'Connector', id: 'Connector' },
    description: { en: 'Complete a quest that connects you with people.', id: 'Menyelesaikan quest yang menghubungkanmu dengan orang lain.' },
    icon: 'users',
    progress: (s) => ({ value: Math.min(s.quests.filter((q) => q.kind === 'connect' && q.status === 'done').length, 1), goal: 1 }),
  },
  {
    id: 'reflective',
    title: { en: 'Reflective Mind', id: 'Reflective Mind' },
    description: { en: 'Write five journal entries.', id: 'Menulis lima catatan journal.' },
    icon: 'feather',
    progress: (s) => ({ value: Math.min(s.journal.length, 5), goal: 5 }),
  },
  {
    id: 'ready-to-apply',
    title: { en: 'Ready to Apply', id: 'Siap Melamar' },
    description: { en: 'Reach 85% Career Readiness for your target role.', id: 'Mencapai 85% Career Readiness untuk peran targetmu.' },
    icon: 'rocket',
    progress: (s) => ({ value: Math.min(Math.round(s.readiness), 85), goal: 85 }),
  },
];

export function unlockedIds(s: AchievementState) {
  return ACHIEVEMENTS.filter((a) => {
    const p = a.progress(s);
    return p.value >= p.goal;
  }).map((a) => a.id);
}
