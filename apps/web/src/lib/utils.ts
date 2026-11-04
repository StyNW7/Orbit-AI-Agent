import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addDays, format, formatDistanceToNowStrict, isToday, isTomorrow, isYesterday } from 'date-fns';
import { dateLocale, tr } from '@/lib/i18n';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function centerOf(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return tr('Good morning', 'Selamat pagi');
  if (h < 15) return tr('Good afternoon', 'Selamat siang');
  if (h < 18) return tr('Good afternoon', 'Selamat sore');
  return tr('Good evening', 'Selamat malam');
}

/** ISO date `n` days from today (kept as date-only strings for stable demo data). */
export function daysFromNow(n: number): string {
  return format(addDays(new Date(), n), 'yyyy-MM-dd');
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T23:59:00` : iso);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - start.getTime()) / 86_400_000);
}

export function friendlyDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso.length === 10 ? `${iso}T09:00:00` : iso);
  if (isToday(d)) return tr('Today', 'Hari ini');
  if (isTomorrow(d)) return tr('Tomorrow', 'Besok');
  if (isYesterday(d)) return tr('Yesterday', 'Kemarin');
  return format(d, 'EEE, d MMM', { locale: dateLocale() });
}

export function deadlineLabel(iso: string | null | undefined): string {
  const n = daysUntil(iso);
  if (n === null) return '';
  if (n < 0) return tr('Closed', 'Ditutup');
  if (n === 0) return tr('Closes today', 'Tutup hari ini');
  if (n === 1) return tr('Closes tomorrow', 'Tutup besok');
  if (n <= 14) return tr('{n} days left', '{n} hari lagi', { n });
  return tr('Closes {d}', 'Tutup {d}', { d: format(new Date(iso!), 'd MMM', { locale: dateLocale() }) });
}

export function formatDate(iso: string | Date, pattern = 'd MMM yyyy'): string {
  return format(typeof iso === 'string' ? new Date(iso) : iso, pattern, { locale: dateLocale() });
}

export function relative(iso: string | null | undefined): string {
  if (!iso) return '';
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: dateLocale() });
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
}

export function fmtNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
