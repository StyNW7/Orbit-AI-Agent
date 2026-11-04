import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';
import { useIsMobile } from '@/hooks/use-media';
import { useT } from '@/lib/i18n';

// ───────────────────────────────────────────── Tooltip

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <TooltipPrimitive.Provider delayDuration={350} skipDelayDuration={150}>
    {children}
  </TooltipPrimitive.Provider>
);

export function Tooltip({ content, children, side = 'top', disabled }: { content: React.ReactNode; children: React.ReactNode; side?: 'top' | 'right' | 'bottom' | 'left'; disabled?: boolean }) {
  if (disabled) return <>{children}</>;
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={8}
          className="z-[80] max-w-64 rounded-[10px] bg-[#13201a] px-2.5 py-1.5 text-[12.5px] font-medium leading-snug text-white shadow-pop data-[state=delayed-open]:animate-in dark:bg-[#e7efea] dark:text-[#13201a]"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

// ───────────────────────────────────────────── Modal

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  hideTitle,
  size = 'md',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hideTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { t } = useT();
  const w = { sm: 'max-w-[420px]', md: 'max-w-[520px]', lg: 'max-w-[680px]' }[size];
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[70] bg-[var(--overlay)] backdrop-blur-[3px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </Dialog.Overlay>
            <div className="pointer-events-none fixed inset-0 z-[71] flex items-end justify-center p-0 sm:items-center sm:p-6">
              <Dialog.Content asChild forceMount aria-describedby={description ? undefined : undefined}>
                <motion.div
                  data-lenis-prevent
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98 }}
                  transition={{ duration: 0.32, ease }}
                  className={cn(
                    'pointer-events-auto relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[26px] border border-border bg-surface p-6 shadow-pop focus:outline-none sm:rounded-[24px] sm:p-7',
                    'safe-bottom',
                    w,
                    className,
                  )}
                >
                  <Dialog.Title className={cn('pr-10 font-display text-[20px] font-bold tracking-tight', hideTitle && 'sr-only')}>{title}</Dialog.Title>
                  {description ? <Dialog.Description className={cn('mt-1.5 text-[14px] text-muted-foreground', hideTitle && 'sr-only')}>{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
                  <Dialog.Close
                    className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
                    aria-label={t('Close', 'Tutup')}
                  >
                    <X className="size-[18px]" />
                  </Dialog.Close>
                  <div className={cn(!hideTitle && 'mt-5')}>{children}</div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// ───────────────────────────────────────────── Sheet (side drawer on desktop, bottom sheet on mobile)

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  header,
  width = 460,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  width?: number;
  className?: string;
}) {
  const mobile = useIsMobile();
  const { t } = useT();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[70] bg-[var(--overlay)] backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLElement | null)?.focus();
              }}
            >
              <motion.div
                tabIndex={-1}
                data-lenis-prevent
                initial={mobile ? { y: '100%' } : { x: '100%' }}
                animate={mobile ? { y: 0 } : { x: 0 }}
                exit={mobile ? { y: '100%' } : { x: '100%' }}
                transition={{ duration: 0.38, ease }}
                drag={mobile ? 'y' : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 120 || info.velocity.y > 600) onOpenChange(false);
                }}
                className={cn(
                  'fixed z-[71] flex flex-col bg-surface shadow-pop focus:outline-none',
                  mobile ? 'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[26px] border-t border-border' : 'inset-y-3 right-3 rounded-[24px] border border-border',
                  className,
                )}
                style={mobile ? undefined : { width: `min(${width}px, calc(100vw - 24px))` }}
              >
                {mobile && <div className="mx-auto mt-2.5 h-1.5 w-11 shrink-0 rounded-full bg-border-strong" aria-hidden />}
                <div className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-4 sm:px-6 sm:pt-5">
                  <div className="min-w-0 flex-1">
                    {header}
                    <Dialog.Title className={cn('font-display text-[19px] font-bold leading-tight tracking-tight', header && 'sr-only')}>{title}</Dialog.Title>
                    {description ? <Dialog.Description className="mt-1 text-[13.5px] text-muted-foreground">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
                  </div>
                  <Dialog.Close
                    className="-mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
                    aria-label={t('Close', 'Tutup')}
                  >
                    <X className="size-[18px]" />
                  </Dialog.Close>
                </div>
                <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6">{children}</div>
                {footer && <div className="safe-bottom shrink-0 border-t border-border px-5 py-4 sm:px-6">{footer}</div>}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// ───────────────────────────────────────────── Dropdown menu

export const DropdownMenu = Menu.Root;
export const DropdownTrigger = Menu.Trigger;

export function DropdownContent({ children, align = 'end', className }: { children: React.ReactNode; align?: 'start' | 'end' | 'center'; className?: string }) {
  return (
    <Menu.Portal>
      <Menu.Content
        align={align}
        sideOffset={8}
        className={cn('z-[75] min-w-[200px] overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-pop', className)}
      >
        {children}
      </Menu.Content>
    </Menu.Portal>
  );
}

export function DropdownItem({ children, onSelect, danger, className }: { children: React.ReactNode; onSelect?: () => void; danger?: boolean; className?: string }) {
  return (
    <Menu.Item
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13.5px] font-medium outline-none transition-colors data-[highlighted]:bg-surface-2 [&_svg]:size-4 [&_svg]:text-muted-foreground',
        danger && 'text-danger data-[highlighted]:bg-muted-danger [&_svg]:text-danger',
        className,
      )}
    >
      {children}
    </Menu.Item>
  );
}

export function DropdownSeparator() {
  return <Menu.Separator className="my-1 h-px bg-border" />;
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return <Menu.Label className="px-3 pb-1 pt-2 text-[11.5px] font-semibold uppercase tracking-wider text-subtle-foreground">{children}</Menu.Label>;
}
