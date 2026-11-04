import * as React from 'react';
import { motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

const fieldBase =
  'w-full rounded-xl border border-border bg-surface text-[14.5px] text-foreground shadow-xs transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-subtle-foreground hover:border-border-strong focus:border-green focus:outline-none focus:ring-4 focus:ring-[var(--ring)] disabled:opacity-60 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-[color-mix(in_oklab,var(--danger)_25%,transparent)]';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, 'h-11 px-3.5', className)} {...props} />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, 'min-h-[110px] resize-y px-3.5 py-3 leading-relaxed', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn(fieldBase, 'h-11 appearance-none pl-3.5 pr-10', className)} {...props}>
      {children}
    </select>
    <svg className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
));
Select.displayName = 'Select';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1.5 block text-[13px] font-semibold text-foreground', className)} {...props} />;
}

export function Field({ label, htmlFor, hint, error, children, className }: { label: string; htmlFor: string; hint?: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-[12.5px] font-medium text-danger" role="alert">
          {error}
        </motion.p>
      ) : hint ? (
        <p className="mt-1.5 text-[12.5px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
  label,
  count,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  label?: string;
  count?: number;
}) {
  const { t } = useT();
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-subtle-foreground" aria-hidden />
      <input
        ref={ref}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className={cn(fieldBase, 'h-11 pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden')}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('');
            ref.current?.focus();
          }}
          className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-surface-2 text-muted-foreground transition hover:bg-surface-3 hover:text-foreground"
          aria-label={t('Clear search', 'Hapus pencarian')}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
      {value && count !== undefined && (
        <span className="sr-only" aria-live="polite">
          {t('{n} results', '{n} hasil', { n: count })}
        </span>
      )}
    </div>
  );
}

export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]',
        checked ? 'bg-green' : 'bg-surface-3',
      )}
    >
      <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} className={cn('block size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]', checked ? 'ml-[22px]' : 'ml-0.5')} />
    </button>
  );
}

/** A range slider styled for Orbit (used for self-assessment). */
export function Range({ value, min, max, onChange, label, id }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string; id?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-green [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-green [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
      style={{ background: `linear-gradient(90deg, var(--orbit-green) ${pct}%, var(--surface-3) ${pct}%)` }}
    />
  );
}
