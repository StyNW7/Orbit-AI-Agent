import { create } from 'zustand';

/** Steps of the in-app "Start here" guide that are tracked by visiting a place rather than by data. */
export type GuideMark = 'intelligence' | 'universe' | 'journey' | 'agent';

interface GuideState {
  seen: Partial<Record<GuideMark, true>>;
  dismissed: boolean;
  mark: (k: GuideMark) => void;
  setDismissed: (v: boolean) => void;
  reset: () => void;
}

const KEY = 'orbit.guide';

function read(): Pick<GuideState, 'seen' | 'dismissed'> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const v = JSON.parse(raw) as Partial<GuideState>;
      return { seen: v.seen ?? {}, dismissed: Boolean(v.dismissed) };
    }
  } catch {
    // ignore corrupt storage
  }
  return { seen: {}, dismissed: false };
}

function write(s: Pick<GuideState, 'seen' | 'dismissed'>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ seen: s.seen, dismissed: s.dismissed }));
  } catch {
    // ignore
  }
}

export const useGuide = create<GuideState>((set, get) => ({
  ...read(),
  mark: (k) => {
    if (get().seen[k]) return;
    const seen = { ...get().seen, [k]: true as const };
    write({ seen, dismissed: get().dismissed });
    set({ seen });
  },
  setDismissed: (dismissed) => {
    write({ seen: get().seen, dismissed });
    set({ dismissed });
  },
  reset: () => {
    write({ seen: {}, dismissed: false });
    set({ seen: {}, dismissed: false });
  },
}));
