# Orbit Web

The Orbit web app: **Smart Education & Career Ecosystem** for future-ready students.
Built for **INVOFEST 2026 Web Design** · Smart Education & Campus Innovation (SDG 4).

See the [main README](../../README-eng.md) ([Bahasa Indonesia](../../README.md)) for the full overview.

## Run

```bash
pnpm install
pnpm --filter @orbit/web dev      # http://localhost:5173
pnpm --filter @orbit/web build    # production build in apps/web/dist
```

The app is fully client-side: no backend, database or API key. Data persists in the browser (`localStorage`), and learning materials are analysed on-device by the engines in `src/engine`.

## Routes

| Route | Page |
| --- | --- |
| `/` | Landing page |
| `/why-orbit` | Why Orbit: the data, Naya's story, the 6 pillars, impact & SDG 4 |
| `/campus` | Orbit for Campus: aggregate campus insight dashboard |
| `/start` | Build My Orbit onboarding (`/start?demo=1` pre-fills Naya) |
| `/signin` | Sign in, or continue with Naya's demo account |
| `/app` | Today: Start-here guide and Next Best Action |
| `/app/learning` | Learn: Knowledge Vault & Learning Map |
| `/app/intelligence` | Career Intelligence: readiness, gaps, radar |
| `/app/universe` | Career Universe graph |
| `/app/journey` | Journey: roadmap and quest board |
| `/app/discover` | Discover: opportunities, saved & applied |
| `/app/progress` | Progress: readiness trend, achievements, streak |
| `/app/journal` | Career Journal |
| `/app/settings` | Profile, goal, skills, theme, language, data |

Global: Orbit Agent (`A` key), command search (`Ctrl/⌘ + K`), notifications & reminders, EN/ID, light/dark.
