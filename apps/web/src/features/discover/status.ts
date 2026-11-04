import type { AppStatus } from '@/data/types';
import type { Text } from '@/lib/i18n';

export const APP_STATUS: Record<AppStatus, Text> = {
  saved: { en: 'Saved', id: 'Disimpan' },
  applied: { en: 'Applied', id: 'Dilamar' },
  interview: { en: 'Interview', id: 'Wawancara' },
  offer: { en: 'Offer', id: 'Tawaran' },
  closed: { en: 'Closed', id: 'Ditutup' },
};
