import { Compass, Gauge, LayoutDashboard, LineChart, Orbit, Route, Settings, NotebookPen, type LucideIcon } from 'lucide-react';
import type { Text } from '@/lib/i18n';

export interface NavItem {
  to: string;
  label: Text;
  short?: Text;
  icon: LucideIcon;
  stage: Text;
  end?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/app', label: { en: 'Today', id: 'Hari Ini' }, icon: LayoutDashboard, stage: { en: 'Act', id: 'Aksi' }, end: true },
  { to: '/app/universe', label: { en: 'Career Universe', id: 'Career Universe' }, short: { en: 'Universe', id: 'Universe' }, icon: Orbit, stage: { en: 'Explore', id: 'Eksplorasi' } },
  { to: '/app/journey', label: { en: 'Journey', id: 'Journey' }, icon: Route, stage: { en: 'Plan', id: 'Rencana' } },
  { to: '/app/discover', label: { en: 'Discover', id: 'Discover' }, icon: Compass, stage: { en: 'Explore', id: 'Eksplorasi' } },
  { to: '/app/progress', label: { en: 'Progress', id: 'Progress' }, icon: LineChart, stage: { en: 'Grow', id: 'Tumbuh' } },
];

export const SECONDARY_NAV: NavItem[] = [
  { to: '/app/intelligence', label: { en: 'Career Intelligence', id: 'Career Intelligence' }, icon: Gauge, stage: { en: 'Understand', id: 'Pahami' } },
  { to: '/app/journal', label: { en: 'Career Journal', id: 'Career Journal' }, icon: NotebookPen, stage: { en: 'Grow', id: 'Tumbuh' } },
];

export const SETTINGS_NAV: NavItem = { to: '/app/settings', label: { en: 'Profile & Settings', id: 'Profil & Pengaturan' }, icon: Settings, stage: { en: 'You', id: 'Kamu' } };
