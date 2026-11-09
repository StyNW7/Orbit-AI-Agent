import { create } from 'zustand';
import type { Text } from '@/lib/i18n';

/**
 * Remembers where a visitor left a storytelling page (e.g. /why-orbit) before jumping
 * into a live feature, so one click brings them back to the exact spot.
 * Kept in sessionStorage: it survives reloads within the tab, never leaks across visits.
 */
export interface StoryReturn {
  /** Path to come back to, e.g. `/why-orbit`. */
  path: string;
  /** Short label for the return pill, e.g. the pillar name. */
  label: Text;
  /** Pillar that was open when the visitor left. */
  pillar?: string;
  /** Exact scroll position to restore. */
  scrollY: number;
  at: number;
}

/** The pitch-style storytelling page. */
export const STORY_PATH = '/why-orbit';

const KEY = 'orbit.storyReturn';
const MAX_AGE = 1000 * 60 * 60 * 6; // stale after six hours

function read(): StoryReturn | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as StoryReturn;
    if (typeof r?.path !== 'string' || typeof r.scrollY !== 'number' || Date.now() - (r.at ?? 0) > MAX_AGE) return null;
    return r;
  } catch {
    return null;
  }
}

function write(r: StoryReturn | null) {
  try {
    if (r) sessionStorage.setItem(KEY, JSON.stringify(r));
    else sessionStorage.removeItem(KEY);
  } catch {
    // storage unavailable — the in-memory value still works for this visit
  }
}

interface StoryState {
  ret: StoryReturn | null;
  save: (r: Omit<StoryReturn, 'at'>) => void;
  clear: () => void;
}

export const useStoryReturn = create<StoryState>((set) => ({
  ret: read(),
  save: (r) => {
    const next = { ...r, at: Date.now() };
    write(next);
    set({ ret: next });
  },
  clear: () => {
    write(null);
    set({ ret: null });
  },
}));
