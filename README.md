# Full Stack Dev

React 18 + Vite + Redux + React Router study portal: concept notes, code, and Q&A per subject. All progress is saved in `localStorage`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Architecture

| Path | Purpose |
| --- | --- |
| `src/constants/topics.js` | **Single registry of subjects.** Hub cards, header menu, routes, topic pages and search deep-links are all generated from it. |
| `src/constants/sections.js` | Study sections (`id`, `title`, `sub`, `color`, `level`, `concepts[]`). Concept = `description[]`, `list[]`, `code` (HTML-highlighted), `interviewTip`, `blog`. |
| `src/constants/legacySections.js` | Sections 124–141 (TypeScript, GraphQL, Microservices, Next.js, Testing, RAG & AI). Code is pre-escaped. |
| `src/constants/jsApp/` | WayFar JS-in-a-real-app topic: `sections.js`, `qa.js` and `samples/` (real, lintable code files imported with `?raw` and highlighted by `utils/highlight.js`). |
| `src/constants/youtubeChannels.js` | Curated Tamil + Indian-English channels; `videos(topic)` builds the YouTube lesson links. |
| `src/constants/guides/guideQA.js` | 175 de-duplicated guide Q&As (ids 2714–2888) with `body` / `realWorld` blocks, rendered by `QARichContent.jsx`. |
| `src/constants/interviewQA.js` | Q&A bank (`id`, `category`, `difficulty`, `question`, `answer`, `code`, `highlights`). **Source of truth only — the app never imports it directly** (see below). |
| `src/pages/topics/TopicPage.jsx` | Generic subject page driven by a `TOPICS` entry. |
| `src/redux/store.js` | Progress store; persists to `rcu_done` via `store.subscribe` and syncs across tabs. |
| `src/constants/generated/` | **Auto-generated, git-ignored.** Small per-topic / per-category modules split out of the big source files (see below). |
| `src/data/index.js` | Cached on-demand loaders: `loadSections(topicKey)`, `loadQA(categories)`, `loadSearchIndex()` … |
| `build/` | The generator (`generate-data.mjs`) and the Vite plugin that runs it. |

## Code Quest (the game)

`/game` is a playable course: **6 worlds × 5 levels** (9 quizzes, 21 coding levels, a boss at the end of each world).

| World | Topics |
|---|---|
| 📡 Fetch Fields | `fetch` errors, query strings, timeouts (AbortController), retry with exponential backoff |
| ⏱️ Timing Temple | debounce, throttle, cancel/flush, typeahead race conditions |
| 🔑 JWT Jungle | decoding, expiry, token storage, silent refresh with a single-flight lock |
| 🏰 Login Citadel | form validation, XSS escaping, open redirects, CSRF/CORS/CSP, brute-force limiter |
| 🪪 Entra Embassy | MSAL (silent → popup, forceRefresh), scopes/tokens, Managed Identity (MSI) |
| 🧭 Code Crossroads | event loop, closures, hooks pitfalls, memoize, `Promise.all`, LRU cache |

**How a coding level works.** You edit a function in the in-app editor and press *Run tests* (Ctrl/⌘+Enter). The code runs in a **Web Worker** (`src/game/runner.worker.js`) so an infinite loop can't freeze the page (a 7 s watchdog stops it). Inside the sandbox `setTimeout`, `Date.now()` and `fetch` are **fakes**: tests advance a virtual clock with `await clock.tick(ms)` and script responses with `mockFetch([...])`, so timing/network challenges are instant and deterministic. Hints cost XP (idea −25 %, structure −50 %, solution −75 %); stars and XP are saved in `localStorage` (`fsd_game_v1`).

**Adding a level.** Create three plain files in `src/game/content/` — `<id>.starter.js`, `<id>.solution.js`, `<id>.tests.js` (tests use `test(name, fn)`, `expect`, `spy`, `rejects`, `track`, `clock`, `mockFetch`, `sleep`) — then add a `code('<id>', { title, story, goal, hints: [idea, structure], learn, xp, difficulty, exports })` entry to a `src/game/levels/worldN.js`. Quiz levels are just data (`quiz(id, { questions })`).

**`npm run verify:game`** runs every reference solution against its tests (all must pass), checks every starter fails, and validates quiz data. Run it after editing any level.

## How content is delivered (performance)

The source data files total ~1.5 MB of JavaScript. Shipping them whole made every page download almost all of it, so a Vite plugin (`build/dataPlugin.mjs`) splits them at build time into `src/constants/generated/`:

- `sections/<topic>.js` — only that topic's sections, fetched when its page opens (hub cards prefetch on hover).
- `qa/<category>.js` — full answers of one category, fetched when the Q&A tab / a card opens.
- `qa-cards.js` — question, difficulty and 3 pills for every Q&A (powers the Q&A list and checklist).
- `catalog.js`, `hub.js`, `qa-ids.js`, `search-index.js` — tiny files for counts, previews, the header counter and header search.

You keep editing the source files exactly as before. The plugin regenerates the output on `npm run dev` / `npm run build` and whenever a file in `src/constants/` changes while the dev server runs (manual run: `npm run gen:data`). If you add a new data field that cards or search need, extend `build/generate-data.mjs`.

Other rules of thumb used in this codebase: scroll position is never kept in React/Redux state (`utils/scrollProgress.js` writes straight to the DOM), long lists render progressively (`hooks/useIncremental.js`), and collapsed accordions don't mount their bodies until first opened.

## Adding a subject

1. Add sections to `sections.js` (or a new data file spread into `SECTIONS`) using unused ids (next free id: **150**).
2. Add Q&As to `interviewQA.js` (or a data file spread into it) with a new `category` (optional).
3. Append an entry to `TOPICS` in `constants/topics.js`. Nothing else needs editing.

Code in `code:` fields is injected as HTML — escape `<`, `>`, `&` or wrap tokens in `c-keyword`, `c-str`, `c-comment`, `c-fn`, `c-num`, `c-tag`, `c-kw2` spans.
