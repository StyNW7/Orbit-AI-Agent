import { BookOpen, Hammer, MessageCircle, Mic, NotebookPen, Send, type LucideIcon } from 'lucide-react';
import type { QuestKind, QuestStatus } from '@/data/types';
import type { Text } from '@/lib/i18n';

export const KIND_ICON: Record<QuestKind, LucideIcon> = {
  learn: BookOpen,
  build: Hammer,
  connect: MessageCircle,
  apply: Send,
  practice: Mic,
  reflect: NotebookPen,
};

export const KIND_TONE: Record<QuestKind, string> = {
  learn: 'bg-muted-green text-green-strong dark:text-green',
  build: 'bg-muted-violet text-violet',
  connect: 'bg-muted-info text-info',
  apply: 'bg-muted-orange text-orange-strong dark:text-orange',
  practice: 'bg-muted-orange text-orange-strong dark:text-orange',
  reflect: 'bg-surface-2 text-muted-foreground',
};

export const STATUS_LABEL: Record<QuestStatus, Text> = {
  todo: { en: 'To do', id: 'To do' },
  doing: { en: 'In progress', id: 'Berjalan' },
  done: { en: 'Completed', id: 'Selesai' },
};

export const COLUMNS: QuestStatus[] = ['todo', 'doing', 'done'];
