import { code, quiz } from './helpers.js';

export default {
  id: 'w1',
  title: 'Fetch Fields',
  icon: '📡',
  color: '#00ffd1',
  blurb: 'Talk to servers without getting burned: errors, query strings, timeouts and retries.',
  levels: [
    quiz('w1-quiz-basics', {
      title: 'Fetch Basics',
      difficulty: 'Easy',
      xp: 60,
      story: 'Before you write code, can you predict what the Fetch API does?',
      questions: [
        {
          q: 'The server answers `GET /api/users/999` with HTTP 404. What happens to the promise returned by `fetch`?',
          options: ['It rejects with an Error', 'It resolves — `response.ok` is false', 'It resolves with `null`', 'It throws synchronously'],
          answer: 1,
          explain: '`fetch` only rejects on network failures, CORS errors or aborts. HTTP error statuses still resolve, so you must check `res.ok` (or `res.status`) yourself.',
        },
        {
          q: 'What is missing so the server can parse this body as JSON?',
          code: "fetch('/api/login', {\n  method: 'POST',\n  body: JSON.stringify({ email, password }),\n});",
          options: ['Nothing — fetch detects JSON automatically', "A `headers: { 'Content-Type': 'application/json' }` entry", "`mode: 'json'`", "`credentials: 'json'`"],
          answer: 1,
          explain: 'A string body is sent as `text/plain;charset=UTF-8`. Without the Content-Type header, most servers will not parse the body as JSON.',
        },
        {
          q: 'In a React component, how should you start a request and avoid acting on stale responses after unmount?',
          options: ['Directly in the render body', 'In `useEffect`, with an `AbortController` aborted in the cleanup function', 'In a `useMemo` callback', 'In a class-style constructor'],
          answer: 1,
          explain: 'Side effects belong in `useEffect`. Returning `() => controller.abort()` cancels the in-flight request on unmount or when dependencies change — no state updates from stale requests.',
        },
      ],
      learn: 'Interview classic: "Does fetch reject on a 404?" — No. Say it, then mention `res.ok` and AbortController.',
    }),
    code('w1-fetch-json', {
      title: 'The JSON Fetcher',
      difficulty: 'Easy',
      xp: 80,
      exports: ['fetchJson'],
      story: 'Every call site in the Verdant Core repeats the same fetch boilerplate — and forgets to check the status.',
      goal: 'Write `fetchJson(url, options)`: return the parsed JSON body, and throw `Error("HTTP <status>")` for any non-2xx response.',
      hints: [
        'fetch resolves even for 404 and 500. You have to look at `res.ok` before you read the body.',
        '1) `const res = await fetch(url, options)`\n2) if `!res.ok` → `throw new Error(`HTTP ${res.status}`)`\n3) `return res.json()`',
      ],
      learn: 'Wrap fetch once in a helper like this and every caller gets correct error handling for free. Libraries like axios do exactly this (they reject on non-2xx).',
    }),
    code('w1-build-url', {
      title: 'The Query Builder',
      difficulty: 'Easy',
      xp: 80,
      exports: ['buildUrl'],
      story: 'A search page glued strings together by hand… and a user searched for "R&D". The query broke in half.',
      goal: 'Write `buildUrl(base, params)` that appends a safely-encoded query string. Skip `null`/`undefined`, keep `0`/`false`, repeat keys for arrays.',
      hints: [
        '`URLSearchParams` does all the encoding for you. Loop over `Object.entries(params)` and `append` each value.',
        '1) `const query = new URLSearchParams()`\n2) for each entry: skip null/undefined; arrays → append each item; else append\n3) `qs = query.toString()` — empty → return base\n4) join with `?` — or `&` if base already has a `?`',
      ],
      learn: 'Never build query strings by concatenation: unescaped `&`, `=` or `#` silently change the meaning of the request (and open the door to parameter injection).',
    }),
    code('w1-fetch-timeout', {
      title: 'The Impatient Request',
      difficulty: 'Medium',
      xp: 120,
      exports: ['fetchWithTimeout'],
      story: 'The reports service sometimes never answers. Your spinner has been spinning since Tuesday.',
      goal: 'Write `fetchWithTimeout(url, ms, options)` that aborts the request after `ms` and rejects with `Request timed out after <ms>ms`.',
      hints: [
        '`fetch` has no timeout option. Create an `AbortController`, pass `controller.signal` to fetch, and call `controller.abort()` from a `setTimeout`.',
        '1) controller + `setTimeout(() => controller.abort(), ms)`\n2) `try { return await fetch(url, { ...options, signal }) }`\n3) catch: if `err.name === "AbortError"` → throw the timeout Error, otherwise rethrow\n4) `finally { clearTimeout(timer) }`',
      ],
      learn: 'AbortController is the universal cancellation primitive — timeouts, "user navigated away", and React effect cleanup all use it. Modern browsers also offer `AbortSignal.timeout(ms)`.',
    }),
    code('w1-fetch-retry', {
      title: 'Boss: The Flaky Gateway',
      difficulty: 'Boss',
      xp: 250,
      exports: ['fetchWithRetry'],
      boss: { name: 'The Flaky Gateway', emoji: '🐙', taunt: '503… 503… maybe a 200? Mwahaha!' },
      story: 'The gateway guarding World 2 fails one request in three. Retry smartly — never hammer it, never retry a request that can\'t succeed.',
      goal: 'Write `fetchWithRetry`: retry network errors, 429 and 5xx with exponential backoff (100, 200, 400 ms…). Fail fast on other 4xx. Throw the last error when retries run out.',
      hints: [
        'Loop `attempt = 0..retries`. Before every attempt except the first, wait `baseDelay * 2 ** (attempt - 1)`. Decide per response whether it is worth retrying.',
        '1) `for (attempt = 0; attempt <= retries; attempt++)`\n2) `if (attempt > 0) await sleep(baseDelay * 2 ** (attempt - 1))`\n3) try fetch; on a network error remember it and `continue`\n4) `res.ok` → return · status 429 or ≥ 500 → remember `HTTP <status>` and loop · other 4xx → throw immediately\n5) after the loop → `throw lastError`',
      ],
      learn: 'Exponential backoff (plus jitter in production) protects a struggling server. Retrying 4xx is pointless — the request itself is wrong — and retrying non-idempotent POSTs needs an idempotency key.',
    }),
  ],
};
