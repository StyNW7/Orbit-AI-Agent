import type { Text } from '@/lib/i18n';

/** 0 None · 1 Beginner · 2 Intermediate · 3 Advanced · 4 Expert */
export type Level = 0 | 1 | 2 | 3 | 4;

export type SkillCategory = 'product' | 'data' | 'design' | 'engineering' | 'marketing' | 'human';

export interface Skill {
  id: string;
  name: Text;
  category: SkillCategory;
  description: Text;
}

export interface RoleRequirement {
  skill: string;
  target: Level;
  /** 1 – nice to have · 2 – important · 3 – core */
  weight: 1 | 2 | 3;
}

export type RoleId = 'product-manager' | 'data-analyst' | 'ui-ux-designer' | 'software-engineer' | 'digital-marketer';

export interface Role {
  id: RoleId;
  name: Text;
  tagline: Text;
  description: Text;
  requirements: RoleRequirement[];
  demand: Text;
  openings: number;
  color: string;
}

export type OpportunityType = 'job' | 'internship' | 'course' | 'event' | 'mentor' | 'book' | 'research';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  org: string;
  summary: Text;
  skills: string[];
  /** The skill gap this opportunity helps close, if any. */
  closesGap?: string;
  roles: RoleId[];
  impact: 'high' | 'medium' | 'low';
  /** Estimated readiness change (percentage points) when pursued. */
  readinessImpact: number;
  location?: Text;
  mode?: 'Remote' | 'Hybrid' | 'On-site';
  /** Days from today; resolved to a date at runtime so the data stays current. */
  deadlineInDays?: number;
  postedDaysAgo: number;
  duration?: Text;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  /** Small employer / market signal used in match scoring (−6 … +6). */
  signal?: number;
  /** Mentor / author / venue specific detail. */
  meta?: Text;
  rating?: number;
  seats?: number;
}

export type Dimension = 'skills' | 'experience' | 'projects' | 'education' | 'portfolio' | 'interview';
export type DimScores = Record<Dimension, number>;

export type ExperienceKind = 'internship' | 'organization' | 'part-time' | 'volunteer' | 'competition';

export interface Experience {
  id: string;
  title: string;
  org: string;
  kind: ExperienceKind;
  period: string;
  highlight?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
}

export interface Profile {
  name: string;
  email: string;
  headline: string;
  university: string;
  major: string;
  /** 1–8 for students, 9 = graduated */
  semester: number;
  gpa: number;
  targetRole: RoleId;
  skills: Record<string, Level>;
  experiences: Experience[];
  projects: Project[];
  portfolioUrl: string;
  portfolioArtifacts: number;
  /** Self-rated, 1–5 */
  interviewConfidence: number;
  mockInterviews: number;
  interests: string[];
  avatarHue: number;
}

export type QuestStatus = 'todo' | 'doing' | 'done';
export type QuestKind = 'learn' | 'build' | 'connect' | 'apply' | 'practice' | 'reflect';

export interface QuestStep {
  id: string;
  title: Text;
  done: boolean;
}

export interface Quest {
  id: string;
  templateId?: string;
  title: Text;
  description: Text;
  milestoneId: string;
  status: QuestStatus;
  kind: QuestKind;
  xp: number;
  /** Readiness points this quest adds when completed. */
  impact: number;
  dims: Partial<Record<Dimension, number>>;
  skill?: string;
  resourceId?: string;
  due?: string;
  createdAt: string;
  completedAt?: string;
  /** Completed before Orbit measured the baseline — already reflected in the profile. */
  baseline?: boolean;
  steps: QuestStep[];
  order: number;
}

export interface Milestone {
  id: string;
  title: Text;
  description: Text;
}

export interface Mission {
  id: string;
  title: Text;
  minutes: number;
  done: boolean;
  xp: number;
  to?: string;
}

export type AppStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'closed';

export interface SavedItem {
  oppId: string;
  status: AppStatus;
  savedAt: string;
  updatedAt: string;
  note?: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  oppId?: string;
  questId?: string;
  done: boolean;
  createdAt: string;
}

export type NotificationKind = 'deadline' | 'course' | 'quest' | 'mentor' | 'review' | 'opportunity' | 'achievement' | 'reminder';

export interface OrbitNotification {
  id: string;
  kind: NotificationKind;
  title: Text;
  body: Text;
  createdAt: string;
  read: boolean;
  oppId?: string;
  to?: string;
}

export type JournalTag = 'interview' | 'learning' | 'mentorship' | 'reflection' | 'opportunity' | 'decision';

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  tags: JournalTag[];
  pinned: boolean;
  mood?: 'great' | 'good' | 'okay' | 'tough';
  createdAt: string;
  updatedAt: string;
}

export type ActivityKind = 'quest' | 'skill' | 'save' | 'apply' | 'journal' | 'achievement' | 'reminder' | 'journey' | 'profile';

export interface Activity {
  id: string;
  kind: ActivityKind;
  title: Text;
  detail?: Text;
  at: string;
  xp?: number;
  readiness?: number;
}

export interface HistoryPoint {
  label: string;
  value: number;
  note?: Text;
}
