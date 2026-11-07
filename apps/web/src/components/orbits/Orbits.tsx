import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Check, ChevronDown, Plus, Rocket, Settings2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { DropdownContent, DropdownItem, DropdownLabel, DropdownMenu, DropdownSeparator, DropdownTrigger, Modal, Tooltip } from '@/components/ui/overlays';
import { ROLES, ROLE_BY_ID } from '@/data/catalog';
import type { DreamOrbit, RoleId } from '@/data/types';
import { currentDims, readinessOf } from '@/engine/intelligence';
import { activeOrbitId, listOrbits, useInsights, useOrbit } from '@/store/orbit';
import { useUi } from '@/store/ui';
import { useGuide } from '@/store/guide';
import { tr, tx, useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';

/** Role dot that stays visible in dark mode (the software role colour is near-black). */
export function RoleDot({ roleId, className }: { roleId: RoleId; className?: string }) {
  const c = ROLE_BY_ID[roleId].color;
  return <span className={cn('inline-block size-2.5 shrink-0 rounded-full', c.toLowerCase() === '#13201a' && 'dark:!bg-[#e7efea]', className)} style={{ background: c }} aria-hidden />;
}

interface OrbitRow {
  orbit: DreamOrbit;
  roleId: RoleId;
  active: boolean;
  readiness: number;
  quests: number;
}

/** Every orbit with live numbers: the active one reads the store, inactive ones their snapshot. */
export function useOrbitRows(): OrbitRow[] {
  const profile = useOrbit((s) => s.profile);
  const orbits = useOrbit((s) => s.orbits);
  const onboardedAt = useOrbit((s) => s.onboardedAt);
  const stored = useOrbit((s) => s.activeOrbitId);
  const quests = useOrbit((s) => s.quests);
  const insights = useInsights();
  return useMemo(() => {
    if (!profile) return [];
    const st = { orbits, profile, onboardedAt, activeOrbitId: stored };
    const active = activeOrbitId(st);
    return listOrbits(st).map((o) => {
      const isActive = o.id === active;
      const roleId = isActive ? profile.targetRole : o.roleId;
      const q = isActive ? quests : (o.quests ?? []);
      return { orbit: o, roleId, active: isActive, readiness: isActive && insights ? insights.readiness : readinessOf(currentDims({ ...profile, targetRole: roleId }, q)), quests: q.length };
    });
  }, [profile, orbits, onboardedAt, stored, quests, insights]);
}

export function switchToOrbit(id: string) {
  const s = useOrbit.getState();
  const target = listOrbits(s).find((o) => o.id === id);
  if (!target || id === activeOrbitId(s)) return;
  s.switchOrbit(id);
  toast.success(tr('Now orbiting: {role}', 'Sekarang mengorbit: {role}', { role: tx(ROLE_BY_ID[target.roleId].name) }), {
    description: tr('Your journey, readiness and recommendations now follow this dream. Profile and Knowledge Vault stay shared.', 'Journey, kesiapan, dan rekomendasi kini mengikuti impian ini. Profil dan Knowledge Vault tetap sama.'),
  });
}

/** Compact orbit switcher for the top bar. */
export function OrbitSwitcher() {
  const rows = useOrbitRows();
  const setOpen = useUi((s) => s.setOrbitsOpen);
  const mark = useGuide((s) => s.mark);
  const { t, l } = useT();
  const active = rows.find((r) => r.active);
  if (!active) return null;
  return (
    <DropdownMenu onOpenChange={(o) => o && mark('orbit')}>
      <DropdownTrigger asChild>
        <button
          type="button"
          className="group flex h-10 min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-2.5 sm:shrink-0 text-left shadow-xs transition hover:border-border-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] sm:px-3"
          aria-label={t('Active orbit: {role}. Switch orbit', 'Orbit aktif: {role}. Ganti orbit', { role: l(ROLE_BY_ID[active.roleId].name) })}
        >
          <RoleDot roleId={active.roleId} />
          <span className="hidden min-w-0 flex-col leading-none min-[380px]:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-subtle-foreground">{t('Orbit', 'Orbit')}</span>
            <span className="mt-0.5 max-w-[92px] truncate text-[13px] font-semibold sm:max-w-[150px]">{l(ROLE_BY_ID[active.roleId].name)}</span>
          </span>
          <span className="tabular hidden rounded-full bg-muted-green px-1.5 py-0.5 text-[11px] font-bold text-green-strong md:inline dark:text-green">{Math.round(active.readiness)}%</span>
          <ChevronDown className="size-3.5 shrink-0 text-subtle-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden />
        </button>
      </DropdownTrigger>
      <DropdownContent align="start" className="w-72">
        <DropdownLabel>{t('Your dream orbits', 'Orbit impianmu')}</DropdownLabel>
        {rows.map((r) => (
          <DropdownItem key={r.orbit.id} onSelect={() => switchToOrbit(r.orbit.id)} className={cn(r.active && 'bg-muted-green/60')}>
            <RoleDot roleId={r.roleId} className="!size-2.5" />
            <span className="min-w-0 flex-1 truncate font-semibold text-foreground">{l(ROLE_BY_ID[r.roleId].name)}</span>
            <span className="tabular text-[12px] font-bold text-muted-foreground">{Math.round(r.readiness)}%</span>
            {r.active ? <Check className="!text-green" /> : <span className="size-4" />}
          </DropdownItem>
        ))}
        <DropdownSeparator />
        <DropdownItem onSelect={() => setOpen(true)}>
          <Plus /> {t('New dream orbit', 'Orbit impian baru')}
        </DropdownItem>
        <DropdownItem onSelect={() => setOpen(true)}>
          <Settings2 /> {t('Manage orbits', 'Kelola orbit')}
        </DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  );
}

/** Create, switch and remove dream orbits. */
export function OrbitsModal() {
  const open = useUi((s) => s.orbitsOpen);
  const setOpen = useUi((s) => s.setOrbitsOpen);
  const profile = useOrbit((s) => s.profile);
  const rows = useOrbitRows();
  const { t, l } = useT();
  const [pick, setPick] = useState<RoleId | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setPick(null);
      setNote('');
    }
  }, [open]);

  if (!profile) return null;
  const used = new Set(rows.map((r) => r.roleId));
  const free = ROLES.filter((r) => !used.has(r.id));

  const create = () => {
    if (!pick) return;
    useOrbit.getState().createOrbit(pick, note);
    toast.success(t('New orbit created: {role}', 'Orbit baru dibuat: {role}', { role: l(ROLE_BY_ID[pick].name) }), {
      description: t('Orbit built a starter journey from this career’s top skill gaps.', 'Orbit menyusun journey awal dari gap skill terpenting karier ini.'),
    });
    setOpen(false);
  };

  const remove = (id: string) => {
    const o = useOrbit.getState().removeOrbit(id);
    if (!o) return;
    toast(t('Orbit removed', 'Orbit dihapus'), {
      description: l(ROLE_BY_ID[o.roleId].name),
      action: { label: t('Undo', 'Urungkan'), onClick: () => useOrbit.getState().restoreOrbit(o) },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      size="lg"
      title={t('Your dream orbits', 'Orbit impianmu')}
      description={t(
        'Each orbit is one career dream with its own journey, readiness and recommendations. Your profile, skills and Knowledge Vault are shared across all of them.',
        'Setiap orbit adalah satu impian karier dengan journey, kesiapan, dan rekomendasinya sendiri. Profil, skill, dan Knowledge Vault dipakai bersama di semua orbit.',
      )}
    >
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.orbit.id} className={cn('flex items-center gap-3 rounded-2xl border p-3.5', r.active ? 'border-green/40 bg-muted-green/40' : 'border-border')}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface shadow-xs">
              <RoleDot roleId={r.roleId} className="!size-3" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-display text-[15px] font-bold">{l(ROLE_BY_ID[r.roleId].name)}</span>
                {r.active && <span className="rounded-full bg-green px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white">{t('Active', 'Aktif')}</span>}
              </div>
              <div className="truncate text-[12.5px] text-muted-foreground">
                {t('{r}% ready · {q} quests', '{r}% siap · {q} quest', { r: Math.round(r.readiness), q: r.quests })}
                {r.orbit.note ? ` · “${r.orbit.note}”` : ''}
              </div>
            </div>
            {!r.active && (
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    switchToOrbit(r.orbit.id);
                    setOpen(false);
                  }}
                >
                  {t('Switch', 'Pindah')}
                </Button>
                <Tooltip content={t('Remove orbit', 'Hapus orbit')}>
                  <Button size="icon-sm" variant="ghost" onClick={() => remove(r.orbit.id)} aria-label={t('Remove {role} orbit', 'Hapus orbit {role}', { role: l(ROLE_BY_ID[r.roleId].name) })}>
                    <Trash2 />
                  </Button>
                </Tooltip>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          <Rocket className="size-3.5 text-orange" aria-hidden /> {t('Dream another career', 'Impikan karier lain')}
        </div>
        {free.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-surface-2 p-4 text-[13.5px] text-muted-foreground">{t('You already have an orbit for every career Orbit covers today.', 'Kamu sudah punya orbit untuk semua karier yang tersedia saat ini.')}</p>
        ) : (
          <>
            <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('Choose a career', 'Pilih karier')}>
              {free.map((r) => {
                const ready = Math.round(readinessOf(currentDims({ ...profile, targetRole: r.id }, [])));
                const on = pick === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setPick(r.id)}
                    className={cn(
                      'flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-[border-color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]',
                      on ? 'border-green bg-muted-green/50 shadow-card' : 'border-border hover:border-border-strong hover:bg-surface-2',
                    )}
                  >
                    <RoleDot roleId={r.id} className="mt-1.5" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold">{l(r.name)}</span>
                      <span className="block text-[12.5px] text-muted-foreground">{l(r.tagline)}</span>
                      <span className="mt-1.5 inline-flex rounded-full bg-surface-2 px-2 py-0.5 text-[11.5px] font-semibold text-foreground">{t('You are already {r}% ready', 'Kamu sudah {r}% siap', { r: ready })}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {pick && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease }} className="mt-4 space-y-3">
                <Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={80} placeholder={t('Why this dream? (optional) — e.g. “I love working with data”', 'Kenapa impian ini? (opsional) — mis. “Aku suka bekerja dengan data”')} aria-label={t('Why this dream (optional)', 'Kenapa impian ini (opsional)')} />
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setPick(null)}>
                    {t('Cancel', 'Batal')}
                  </Button>
                  <Button onClick={create}>
                    <Plus /> {t('Create & switch', 'Buat & pindah')}
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
