import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Bookmark, BookmarkCheck, Check, Compass, Eraser, Loader2, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { Sheet } from '@/components/ui/overlays';
import { Button } from '@/components/ui/button';
import { OrbitMark } from '@/components/brand/brand';
import { ImpactPill } from '@/components/shared/layout-blocks';
import { useOrbit, useInsights } from '@/store/orbit';
import { useUi } from '@/store/ui';
import { moveQuest, requestAddToJourney, toggleSave } from '@/store/actions';
import { composeReply, detectIntent, SUGGESTIONS, type AgentAction, type AgentMessage, type AgentReply } from '@/engine/agent';
import { useT } from '@/lib/i18n';
import { cn, uid } from '@/lib/utils';
import { OPP_BY_ID, TYPE_LABEL } from '@/data/opportunities';
import { ROLE_BY_ID } from '@/data/catalog';
import { matchOpportunity } from '@/engine/intelligence';
import { ease } from '@/lib/motion';

const PAGE_LABEL: Record<string, { en: string; id: string }> = {
  '/app': { en: 'Today', id: 'Hari Ini' },
  '/app/universe': { en: 'Career Universe', id: 'Career Universe' },
  '/app/journey': { en: 'Journey', id: 'Journey' },
  '/app/discover': { en: 'Discover', id: 'Discover' },
  '/app/progress': { en: 'Progress', id: 'Progress' },
  '/app/intelligence': { en: 'Career Intelligence', id: 'Career Intelligence' },
  '/app/journal': { en: 'Journal', id: 'Journal' },
  '/app/settings': { en: 'Settings', id: 'Pengaturan' },
};

const THINKING = [
  { en: 'Reading your career profile', id: 'Membaca profil kariermu' },
  { en: 'Checking your journey and gaps', id: 'Memeriksa journey dan gap-mu' },
  { en: 'Ranking the best next actions', id: 'Mengurutkan aksi terbaik berikutnya' },
];

function Thinking() {
  const { l } = useT();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, THINKING.length - 1)), 420);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3" aria-live="polite">
      <OrbitMark className="size-8 shrink-0" animated />
      <div className="space-y-1.5 rounded-2xl rounded-tl-md border border-border bg-surface-2/60 px-4 py-3">
        {THINKING.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: i <= step ? 1 : 0.35 }} className="flex items-center gap-2 text-[13px]">
            {i < step ? <Check className="size-3.5 text-green" /> : i === step ? <Loader2 className="size-3.5 animate-spin text-green" /> : <span className="size-3.5 rounded-full border border-border-strong" />}
            <span className={i <= step ? 'text-foreground' : 'text-subtle-foreground'}>{l(s)}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function OppMini({ id }: { id: string }) {
  const o = OPP_BY_ID[id];
  const profile = useOrbit((s) => s.profile);
  const saved = useOrbit((s) => Boolean(s.saved[id]));
  const navigate = useNavigate();
  const setOpen = useUi((s) => s.setAgentOpen);
  const { l, t } = useT();
  if (!o || !profile) return null;
  const m = matchOpportunity(o, profile);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <div className="min-w-0 flex-1">
        <button type="button" onClick={() => { setOpen(false); navigate(`/app/discover?open=${o.id}`); }} className="block max-w-full truncate text-left text-[13.5px] font-semibold hover:text-green-strong dark:hover:text-green">
          {o.title}
        </button>
        <div className="truncate text-[12px] text-muted-foreground">
          {l(TYPE_LABEL[o.type])} · {o.org}
        </div>
      </div>
      <span className="tabular shrink-0 text-[12px] font-bold text-green-strong dark:text-green">{m.score}%</span>
      <button type="button" onClick={() => toggleSave(o.id)} aria-label={saved ? t('Unsave', 'Batal simpan') : t('Save', 'Simpan')} className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg transition', saved ? 'bg-muted-green text-green-strong dark:text-green' : 'text-subtle-foreground hover:bg-surface-2 hover:text-foreground')}>
        {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      </button>
    </div>
  );
}

function ReplyCard({ reply, onAction, latest }: { reply: AgentReply; onAction: (a: AgentAction) => void; latest: boolean }) {
  const { t } = useT();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="flex gap-3">
      <OrbitMark className="size-8 shrink-0" />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-surface p-4 shadow-xs">
        {reply.context && <div className="mb-1.5 text-[12px] font-medium text-subtle-foreground">{reply.context}</div>}
        <div className="font-display text-[15.5px] font-bold leading-snug">{reply.headline}</div>
        {reply.reason && (
          <div className="mt-2.5 rounded-xl bg-surface-2/70 px-3 py-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-subtle-foreground">{t('Why', 'Alasan')}</div>
            <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted-foreground">{reply.reason}</p>
          </div>
        )}
        {reply.bullets && (
          <ul className="mt-3 space-y-1.5">
            {reply.bullets.map((b, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className="flex items-center justify-between gap-3 text-[13.5px]">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-green" />
                  <span className="truncate text-muted-foreground">{b.label}</span>
                </span>
                {b.value && <span className="shrink-0 text-right font-semibold">{b.value}</span>}
              </motion.li>
            ))}
          </ul>
        )}
        {reply.oppIds && (
          <div className="mt-3 space-y-2">
            {reply.oppIds.map((id) => (
              <OppMini key={id} id={id} />
            ))}
          </div>
        )}
        {reply.impact !== undefined && reply.impact > 0 && (
          <div className="mt-3 flex items-center gap-2 text-[12.5px] text-muted-foreground">
            {t('Estimated impact', 'Perkiraan dampak')} <ImpactPill value={reply.impact} />
          </div>
        )}
        {reply.actions && reply.actions.length > 0 && (
          <div className={cn('mt-4 flex flex-wrap gap-2', !latest && 'opacity-80')}>
            {reply.actions.map((a, i) => (
              <Button key={i} size="sm" variant={a.primary ? 'primary' : 'secondary'} onClick={() => onAction(a)}>
                {a.kind === 'add-opp' && <Target />}
                {a.kind === 'alternatives' && <Compass />}
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AgentPanel() {
  const open = useUi((s) => s.agentOpen);
  const setOpen = useUi((s) => s.setAgentOpen);
  const consumePrompt = useUi((s) => s.consumePrompt);
  const messages = useOrbit((s) => s.agent);
  const push = useOrbit((s) => s.pushAgent);
  const clear = useOrbit((s) => s.clearAgent);
  const profile = useOrbit((s) => s.profile);
  const insights = useInsights();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, l, locale } = useT();
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const page = PAGE_LABEL[location.pathname] ?? PAGE_LABEL['/app'];

  const ask = (text: string, intent?: string, arg?: string) => {
    if (!profile || thinking) return;
    const userMsg: AgentMessage = { id: uid('m'), role: 'user', text, at: new Date().toISOString() };
    push(userMsg);
    setThinking(true);
    setTimeout(() => {
      const s = useOrbit.getState();
      if (!s.profile) return;
      const reply = composeReply(intent ?? detectIntent(text), { profile: s.profile, quests: s.quests, saved: s.saved, streak: s.streak, readiness30dAgo: s.readiness30dAgo, page: location.pathname }, arg);
      push({ id: uid('m'), role: 'agent', reply, at: new Date().toISOString() });
      setThinking(false);
    }, 1350);
  };

  useEffect(() => {
    if (!open) return;
    const p = consumePrompt();
    if (p) ask(p.text, p.intent, p.arg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current?.parentElement;
    if (el) setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }), 60);
  }, [messages.length, thinking]);

  const onAction = (a: AgentAction) => {
    switch (a.kind) {
      case 'add-opp':
        requestAddToJourney(a.oppId, (qid) => {
          setOpen(false);
          navigate(`/app/journey?quest=${qid}`);
        });
        break;
      case 'move-quest':
        moveQuest(a.questId, a.status);
        break;
      case 'open':
        setOpen(false);
        navigate(a.to);
        break;
      case 'save-opp':
        toggleSave(a.oppId);
        break;
      case 'alternatives':
        ask(t('Show me alternatives', 'Tunjukkan alternatif'), 'alternatives', a.skill);
        break;
    }
  };

  const send = () => {
    const v = input.trim();
    if (!v) return;
    setInput('');
    ask(v);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="Orbit Career Agent"
      width={500}
      header={
        <div className="flex items-center gap-3">
          <div className="relative">
            <OrbitMark className="size-10" animated />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-green ring-2 ring-surface" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="font-display text-[17px] font-bold leading-tight">Orbit Career Agent</div>
            <div className="text-[12.5px] text-muted-foreground">{t('Context-aware career guidance', 'Panduan karier yang memahami konteksmu')}</div>
          </div>
        </div>
      }
      footer={
        <div>
          <AnimatePresence>
            {messages.length > 0 && !thinking && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="no-scrollbar mask-fade-r -mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pr-8">
                {SUGGESTIONS.map((s) => (
                  <button key={s.en} type="button" onClick={() => ask(l(s))} className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground transition hover:border-green/40 hover:text-foreground">
                    {l(s)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2 rounded-2xl border border-border bg-surface-2/60 p-1.5 transition focus-within:border-green focus-within:ring-4 focus-within:ring-[var(--ring)]"
          >
            <label htmlFor="agent-input" className="sr-only">
              {t('Ask Orbit', 'Tanya Orbit')}
            </label>
            <textarea
              id="agent-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t('Ask about your next step, gaps or opportunities…', 'Tanya tentang langkah berikutnya, gap, atau peluang…')}
              className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-[14px] outline-none placeholder:text-subtle-foreground"
            />
            <Button type="submit" size="icon-sm" disabled={!input.trim() || thinking} aria-label={t('Send', 'Kirim')}>
              <ArrowUp />
            </Button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11.5px] text-subtle-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-green" /> {t('Orbit asks before changing your plan', 'Orbit selalu bertanya sebelum mengubah rencanamu')}
            </span>
            {messages.length > 0 && (
              <button type="button" onClick={clear} className="inline-flex items-center gap-1 rounded-md font-medium transition hover:text-foreground">
                <Eraser className="size-3.5" /> {t('Clear', 'Bersihkan')}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div ref={scrollRef} className="space-y-5" lang={locale}>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-green" />
          {t('Looking at', 'Sedang melihat')}: <span className="font-semibold text-foreground">{l(page)}</span>
        </div>

        {messages.length === 0 && profile && insights && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
            <div className="overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-mint via-surface to-cream p-5">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-green-strong dark:text-green">
                <Sparkles className="size-3.5" /> {t('Your context', 'Konteksmu')}
              </div>
              <p className="mt-2 font-display text-[18px] font-bold leading-snug">
                {t('Hi {n}. You are {r}% ready for {role}.', 'Hai {n}. Kamu {r}% siap untuk {role}.', {
                  n: profile.name.split(' ')[0],
                  r: Math.round(insights.readiness),
                  role: l(ROLE_BY_ID[profile.targetRole].name),
                })}
              </p>
              <p className="mt-1.5 text-[13.5px] text-muted-foreground">
                {t('I know your profile, journey and saved opportunities. Ask me anything — I’ll explain the reason behind every suggestion.', 'Aku memahami profil, journey, dan peluang tersimpanmu. Tanyakan apa saja — aku akan menjelaskan alasan setiap saran.')}
              </p>
            </div>
            <div className="mt-4 space-y-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s.en}
                  type="button"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  onClick={() => ask(l(s))}
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left text-[14px] font-medium transition hover:-translate-y-px hover:border-green/40 hover:shadow-card"
                >
                  {l(s)}
                  <ArrowUp className="size-4 rotate-45 text-subtle-foreground transition group-hover:text-green" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#13201a] px-4 py-2.5 text-[14px] text-white dark:bg-surface-3">{m.text}</div>
            </motion.div>
          ) : m.reply ? (
            <ReplyCard key={m.id} reply={m.reply} onAction={onAction} latest={i === messages.length - 1} />
          ) : null,
        )}
        {thinking && <Thinking />}
      </div>
    </Sheet>
  );
}
