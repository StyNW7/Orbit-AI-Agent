/**
 * Orbit i18n — English and Bahasa Indonesia.
 *
 * Copy is authored side by side at the point of use: `t('Build My Orbit', 'Bangun Orbit Saya')`.
 * Content data carries `{ en, id }` objects (see `Text`), resolved with `l()`.
 */
import { useCallback } from 'react';
import { create } from 'zustand';
import { enUS, id as idLocale } from 'date-fns/locale';

export type Locale = 'en' | 'id';
export type Text = string | { en: string; id: string };

const STORAGE_KEY = 'orbit.locale';

function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'id') return saved;
  } catch {
    // storage unavailable
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('id')) return 'id';
  return 'en';
}

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  locale: detectLocale(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // the choice still applies for this visit
    }
    document.documentElement.lang = locale;
    set({ locale });
  },
}));

export const getLocale = (): Locale => useI18nStore.getState().locale;
export const dateLocale = (locale: Locale = getLocale()) => (locale === 'id' ? idLocale : enUS);
export const intlLocale = (locale: Locale = getLocale()) => (locale === 'id' ? 'id-ID' : 'en-US');

type Vars = Record<string, string | number>;

function interpolate(s: string, vars?: Vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Resolve a bilingual value outside React. */
export function tx(text: Text, locale: Locale = getLocale(), vars?: Vars): string {
  const s = typeof text === 'string' ? text : text[locale] ?? text.en;
  return interpolate(s, vars);
}

/** Translate outside React (toasts, engine output). */
export function tr(en: string, id: string, vars?: Vars, locale: Locale = getLocale()) {
  return interpolate(locale === 'id' ? id : en, vars);
}

export function useLocale(): Locale {
  return useI18nStore((s) => s.locale);
}

/** `t(en, id, vars?)` for inline copy and `l(text, vars?)` for bilingual data. */
export function useT() {
  const locale = useLocale();
  const t = useCallback((en: string, id: string, vars?: Vars) => interpolate(locale === 'id' ? id : en, vars), [locale]);
  const l = useCallback((text: Text, vars?: Vars) => tx(text, locale, vars), [locale]);
  return { t, l, locale };
}
