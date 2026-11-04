# Orbit Web — INVOFEST 2026 build

**Orbit — Smart Career & Learning Ecosystem for Future-Ready Students**
Theme: *Smart Ecosystems: Digital Solutions for a Sustainable Future* · Subtheme: *Smart Education & Campus Innovation (SDG 4)*

This app is a **standalone frontend**. It does not need the API, database, Langflow or any LLM key. All data persists in the browser (`localStorage`) and Career Intelligence is computed by a deterministic, explainable engine in `src/engine`. The full-stack version (NestJS API, Langflow agent) stays in `apps/api` and `ai/`.

## Run

```bash
pnpm install
pnpm --filter @orbit/web dev      # http://localhost:5173
pnpm --filter @orbit/web build    # production build in apps/web/dist
```

## Routes

| Route | Experience |
| --- | --- |
| `/` | Storytelling landing page (problem → connected orbit → how it works → universe → journey → intelligence → impact → campus → SDG 4 → FAQ) |
| `/start` | Build My Orbit onboarding (`/start?demo=1` pre-fills the Naya persona) |
| `/signin` | Sign in, or continue with Naya's demo account |
| `/campus` | Orbit for Campus — aggregate Campus Intelligence dashboard |
| `/app` | Today (Mission Control) |
| `/app/intelligence` | Career Intelligence (six dimensions, gaps, radar) |
| `/app/universe` | Career Universe graph (React Flow) |
| `/app/journey` | Adaptive Journey — Roadmap + Kanban (dnd-kit) |
| `/app/discover` | Opportunity Intelligence + saved & applications |
| `/app/progress` | Readiness trend, achievements, streak, timeline |
| `/app/journal` | Career Journal (CRUD, tags, pin, autosave) |
| `/app/settings` | Profile, career goal, skills, theme, language, export, reset demo |

Global: Orbit Agent (`A` key or floating button), command search (`Ctrl/⌘ + K`), notifications & reminders, EN/ID, light/dark.

## Golden demo flow (≈2–3 minutes)

1. Landing → **Try the 2-minute demo as Naya** (or *Build My Orbit* → *Explore as Naya*).
2. Continue through Career Profile → **Product Manager** → Skills → **Analyze my career** → 74% readiness, top strength, priority gap.
3. **Explore my Career Universe** → click **Product Analytics** → drawer explains relevance, demand and impact.
4. **Add to Journey** → confirmation modal (human-in-the-loop) → **Confirm & Add** → Journey board opens with the quest highlighted.
5. Drag the quest to **In progress** (or complete it to see the XP + readiness celebration).
6. Discover → save **Product Analyst Internship** → open it → **Create reminder**.
7. Back to **Today** → Next Best Action now says *Complete Product Analytics Foundations*; ask Orbit Agent *"What should I do next?"*.

Reset anytime: account menu → **Reset demo data**, or Settings → *Your data*.
