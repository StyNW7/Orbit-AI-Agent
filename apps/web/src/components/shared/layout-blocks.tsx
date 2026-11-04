import * as React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, Info } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';
import { Card, IconBox } from '@/components/ui/primitives';
import { Tooltip } from '@/components/ui/overlays';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  stage,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  stage?: string;
}) {
  return (
    <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }} className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {(eyebrow || stage) && (
          <div className="mb-2 flex items-center gap-2">
            {stage && <span className="rounded-full bg-muted-green px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-green-strong dark:text-green">{stage}</span>}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          </div>
        )}
        <h1 className="font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[34px] lg:text-[38px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}

export function SectionHeader({ title, description, action, icon, className }: { title: string; description?: string; action?: React.ReactNode; icon?: LucideIcon; className?: string }) {
  const Icon = icon;
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && <Icon className="mt-0.5 size-[18px] shrink-0 text-green" aria-hidden />}
        <div className="min-w-0">
          <h2 className="font-display text-[17px] font-bold leading-snug tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-[13.5px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-1 rounded-md text-[13px] font-semibold text-green-strong transition hover:text-green dark:text-green">
      {children}
      <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'green',
  className,
  info,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'green' | 'orange' | 'info' | 'violet' | 'neutral';
  className?: string;
  info?: string;
}) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <IconBox icon={icon} tone={tone} size="sm" />
        {info && (
          <Tooltip content={info}>
            <button type="button" aria-label={info} className="rounded-full text-subtle-foreground transition hover:text-foreground">
              <Info className="size-4" />
            </button>
          </Tooltip>
        )}
      </div>
      <div className="mt-4 font-display text-[28px] font-extrabold leading-none tracking-[-0.03em]">{value}</div>
      <div className="mt-1.5 text-[13px] font-medium text-muted-foreground">{label}</div>
      {hint && <div className="mt-2 text-[12.5px] text-subtle-foreground">{hint}</div>}
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-6 py-14', className)}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -m-3 rounded-full border border-dashed border-border-strong" aria-hidden />
        <div className="absolute -right-2 -top-1 size-3 rounded-full bg-orange shadow-orange" aria-hidden />
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted-green text-green-strong dark:text-green">
          <Icon className="size-6" aria-hidden />
        </div>
      </div>
      <h3 className="font-display text-[18px] font-bold tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-[14px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

/** Wraps page content with a consistent enter transition. */
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className={className}>
      {children}
    </motion.div>
  );
}

export function ImpactPill({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('tabular inline-flex h-6 items-center gap-1 rounded-full bg-muted-green px-2 text-[12px] font-bold text-green-strong dark:text-green', className)}>
      <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
        <path d="M2 8.5 5 5.5l2 2L10 4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      +{value}%
    </span>
  );
}
