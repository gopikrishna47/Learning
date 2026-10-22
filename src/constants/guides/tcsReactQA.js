// ─────────────────────────────────────────────────────────────────
//  TCS React (5–10 yrs) interview additions — ids 2889–2901.
//  Added after cross-checking the "React Developer interview at TCS" notes
//  against the existing bank: these are the questions that were missing or
//  only partly covered. Same shape as guides/guideQA.js:
//    answer + code (shown on the card) · realWorld / body → ['h'|'p'|'quote'|'ul'|'ol'|'code'|'table', …] blocks
//  Spread into INTERVIEW_QA in ../interviewQA.js — nothing else needs editing.
// ─────────────────────────────────────────────────────────────────
export const TCS_REACT_QA = [
  {
    "id": 2889,
    "category": "React",
    "difficulty": "Junior",
    "question": "What causes a React component to re-render? (state, props, parent, context, store)",
    "answer": "A re-render means React calls your component function again to compute fresh JSX. It happens for five reasons: (1) the component's own state changes to a value that is not Object.is-equal to the old one (useState / useReducer), (2) its props change, (3) its parent re-renders — by default every child re-renders with it even when its props are identical, (4) a Context value it consumes changes, or (5) an external store it subscribes to (Redux useSelector, useSyncExternalStore) reports a new value. A re-render is NOT a DOM update: React diffs the new output against the old one and commits only the real differences, so re-renders are usually cheap — until they cascade through a big tree.",
    "code": "import { useState, createContext, useContext, memo } from 'react';\n\nconst ThemeContext = createContext({ mode: 'light' });\n\nfunction Parent() {\n  const [count, setCount] = useState(0);\n  console.log('Parent render');                    // (1) its own state changed\n\n  return (\n    // (4) a NEW object on every render → every consumer sees \"context changed\"\n    <ThemeContext.Provider value={{ mode: 'dark' }}>\n      <button onClick={() => setCount(count + 1)}>Clicked {count}</button>\n\n      <PlainChild />                               {/* (3) re-renders whenever Parent does */}\n      <MemoChild label=\"static\" />                 {/* skipped: props did not change */}\n      <ThemeConsumer />                            {/* memo can't block a context update */}\n    </ThemeContext.Provider>\n  );\n}\n\nfunction PlainChild() {\n  console.log('PlainChild render');\n  return <p>No props at all, yet I re-render with my parent.</p>;\n}\n\nconst MemoChild = memo(function MemoChild({ label }) {\n  console.log('MemoChild render');                 // logs once, never again\n  return <p>{label}</p>;\n});\n\nconst ThemeConsumer = memo(function ThemeConsumer() {\n  const theme = useContext(ThemeContext);          // (4) re-renders: provider value is a new object\n  console.log('ThemeConsumer render');\n  return <p>Theme: {theme.mode}</p>;\n});\n\n// ── Things that do NOT trigger a re-render ──────────────────────────────────\n// setCount(count);                      → same value, React bails out\n// items.push(x); setItems(items);       → same array reference (you mutated it), React sees \"no change\"\n// ref.current = 5;                      → refs never schedule a render\n// Fix for the provider: const value = useMemo(() => ({ mode: 'dark' }), []);",
    "highlights": [
      "State, props, parent, context, store",
      "Re-render ≠ DOM update",
      "Same reference = no re-render"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** A search page keeps `query` state in the page root, so every keystroke re-renders a 2,000-row table that is a child of that page. Moving `query` down into a `SearchBox` component (push state down), or wrapping the table in `memo` with stable props, removes the lag with no extra library."
      ]
    ],
    "body": [
      [
        "h",
        "Render phase vs commit phase"
      ],
      [
        "p",
        "**Render** = React calls your function and builds a new element tree (pure computation, may run more than once). **Commit** = React applies only the differences to the real DOM. Many renders end with zero DOM changes, which is why a render count alone is not a performance bug."
      ],
      [
        "h",
        "The five triggers"
      ],
      [
        "table",
        [
          "Trigger",
          "Re-renders?",
          "Notes"
        ],
        [
          [
            "State setter called",
            "Yes, if the new value differs (`Object.is`)",
            "Mutating an object/array and re-setting it does nothing — you passed the same reference."
          ],
          [
            "Props change",
            "Yes",
            "Props only change because the **parent re-rendered** and passed something new (new object/array/function literals count as new)."
          ],
          [
            "Parent re-renders",
            "Yes (default)",
            "Even with identical props. `React.memo` opts a child out."
          ],
          [
            "Context value changes",
            "Yes — every consumer",
            "`memo` does not protect consumers. Memoize the provider value or split contexts."
          ],
          [
            "External store (Redux, `useSyncExternalStore`)",
            "Yes, when the selected slice changes",
            "Select the smallest slice you need so unrelated updates are ignored."
          ]
        ]
      ],
      [
        "h",
        "The trap interviewers fish for"
      ],
      [
        "p",
        "Saying *\"props changing re-renders a child\"* is only half the story. A child with **no props at all** still re-renders when its parent does. That is the reason `React.memo`, `useMemo` and `useCallback` exist: to keep props referentially stable so memoized children can skip work."
      ],
      [
        "h",
        "How to stop unnecessary re-renders (in order of preference)"
      ],
      [
        "ol",
        [
          "**Move state down** to the smallest component that needs it.",
          "**Lift content up / pass children** — elements passed as `children` are created by the parent and are not re-created when the wrapper's own state changes.",
          "**`React.memo`** on expensive children + stable props (`useCallback` for functions, `useMemo` for objects).",
          "**Memoize context values** or split one big context into several small ones.",
          "**Narrow Redux selectors** (`useSelector(s => s.cart.count)` rather than `useSelector(s => s.cart)`)."
        ]
      ],
      [
        "h",
        "How to see why something rendered"
      ],
      [
        "p",
        "React DevTools → Profiler → enable *\"Record why each component rendered\"*. For quick checks, a `console.log` in the component body counts renders (remember Strict Mode doubles them in development)."
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "A component re-renders when its state changes, when its parent re-renders, when a context it consumes changes, or when an external store it subscribes to updates. Props changing is really the parent re-rendering. A re-render only means React re-ran the function; it commits DOM changes only where the output differs. I fix real problems by moving state down, memoizing with stable props, and narrowing context and store subscriptions — after profiling."
      ]
    ]
  },
  {
    "id": 2890,
    "category": "React",
    "difficulty": "Mid",
    "question": "How do you handle API errors globally in React using Axios interceptors?",
    "answer": "Create one Axios instance and attach interceptors so cross-cutting concerns live in ONE place: a request interceptor adds the auth token; a response interceptor owns the global error policy — on 401 it refreshes the token once and replays the failed request, on 403/5xx/network errors it shows a consistent message, and it always rejects with one normalized error shape. Screen-specific errors (400/422 validation, 404, 409) are deliberately left for the calling component, otherwise users get duplicate toasts and components lose control of their own UX.",
    "code": "// api/client.js\nimport axios from 'axios';\nimport { tokenStore, refreshAccessToken, logout } from './auth';\nimport { toast } from '../ui/toast';\n\nexport const api = axios.create({ baseURL: '/api', timeout: 10_000 });\n\n// ── Request interceptor: attach the access token to every call ──\napi.interceptors.request.use((config) => {\n  const token = tokenStore.get();\n  if (token) config.headers.Authorization = 'Bearer ' + token;\n  return config;\n});\n\n// One predictable error shape for the whole UI\nfunction normalizeError(error) {\n  const res = error.response;\n  return {\n    status: res?.status ?? 0,                          // 0 = no response (offline / timeout / CORS)\n    code: res?.data?.code ?? error.code ?? 'UNKNOWN',\n    message: res?.data?.message ?? 'Something went wrong. Please try again.',\n    fieldErrors: res?.data?.errors ?? null,            // 400 / 422 validation details\n    original: error,\n  };\n}\n\nlet refreshing = null;   // single-flight: ten parallel 401s share ONE refresh call\n\n// ── Response interceptor: the global error policy ──\napi.interceptors.response.use(\n  (response) => response,\n  async (error) => {\n    const { response, config } = error;\n\n    // 1) 401 → refresh the token once, then replay the original request\n    if (response?.status === 401 && !config._retried && !config.url.includes('/auth/refresh')) {\n      config._retried = true;                          // prevents an infinite 401 loop\n      try {\n        refreshing = refreshing || refreshAccessToken().finally(() => { refreshing = null; });\n        const newToken = await refreshing;\n        config.headers.Authorization = 'Bearer ' + newToken;\n        return api(config);                            // replay\n      } catch {\n        logout();                                      // refresh failed → session is over\n        return Promise.reject(normalizeError(error));\n      }\n    }\n\n    // 2) Cross-cutting UX for everything else\n    if (!response)                    toast.error('Network problem. Check your connection.');\n    else if (response.status === 403) toast.error('You do not have permission to do that.');\n    else if (response.status >= 500)  toast.error('Server error. Please try again shortly.');\n    // 400 / 404 / 409 / 422 are NOT toasted here — the calling screen knows how to show them.\n\n    return Promise.reject(normalizeError(error));\n  }\n);\n\n// ── In a component: only handle what is specific to this screen ──\nasync function submitClaim(form) {\n  try {\n    await api.post('/claims', form);\n  } catch (err) {\n    if (err.status === 422) setFieldErrors(err.fieldErrors);   // shown next to the inputs\n    // everything else was already handled globally\n  }\n}",
    "highlights": [
      "Request + response interceptors",
      "401 → refresh once → replay",
      "Normalize every error"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** An enterprise dashboard fires 8 requests on load when the access token has just expired. Without a single-flight lock each 401 triggers its own refresh and the refresh token gets invalidated; with the shared `refreshing` promise, one refresh runs, all 8 requests replay with the new token, and the user never notices."
      ]
    ],
    "body": [
      [
        "h",
        "Why interceptors instead of try/catch everywhere"
      ],
      [
        "ul",
        [
          "**One policy, one place** — auth headers, token refresh, logging, correlation IDs and error toasts are written once.",
          "**Consistency** — every screen receives the same error shape (`status`, `code`, `message`, `fieldErrors`).",
          "**Testability** — mock one Axios instance instead of dozens of `fetch` calls."
        ]
      ],
      [
        "h",
        "A bug in the common beginner version"
      ],
      [
        "p",
        "The popular snippet `if (error.response.status === 401) logout()` throws a `TypeError` for network errors and timeouts, because `error.response` is `undefined` when the server never answered. Always use `error.response?.status`, and treat `!error.response` as its own case (offline / timeout / CORS)."
      ],
      [
        "h",
        "What belongs where"
      ],
      [
        "table",
        [
          "Status",
          "Global interceptor",
          "Calling component"
        ],
        [
          [
            "Network / timeout (no response)",
            "Toast + normalized error",
            "Optionally show retry button"
          ],
          [
            "400 / 422 validation",
            "Normalize only",
            "Show field errors next to inputs"
          ],
          [
            "401",
            "Refresh token once, replay, else logout",
            "Nothing"
          ],
          [
            "403",
            "Toast / redirect to a 403 page",
            "Hide the feature if possible"
          ],
          [
            "404 / 409",
            "Normalize only",
            "Screen-specific message (e.g. \"already exists\")"
          ],
          [
            "5xx",
            "Toast; log with correlation ID",
            "Offer retry"
          ]
        ]
      ],
      [
        "h",
        "Pitfalls"
      ],
      [
        "ul",
        [
          "**Infinite loop** — the refresh endpoint itself returning 401 must not trigger another refresh (`_retried` flag + URL check).",
          "**Toast spam** — don't toast 4xx errors that the screen already renders.",
          "**Cancelled requests** — ignore `axios.isCancel(error)` so `AbortController` cancellations don't show an error.",
          "**Retries** — only retry idempotent requests (GET) and use exponential backoff with a limit."
        ]
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "I create a shared Axios instance. The request interceptor attaches the token. The response interceptor handles global concerns: on a 401 it refreshes the token once using a single-flight promise and replays the request, on 403, 5xx and network errors it shows a consistent message, and it always rejects with a normalized error object. Validation and business errors are left to the component so each screen controls its own UX."
      ]
    ]
  },
  {
    "id": 2891,
    "category": "JavaScript",
    "difficulty": "Mid",
    "question": "Promise vs async/await: what is the difference, and what mistakes do people make?",
    "answer": "async/await is not a different mechanism — it is syntax built on top of Promises. An async function always returns a Promise, and `await` pauses ONLY that function (never the thread); the rest of the function resumes later as a microtask. The practical differences are readability and error handling: async/await reads top-to-bottom and uses try/catch, while chains use .then/.catch. Because both are the same thing underneath, you can mix them — and the classic mistakes are awaiting independent calls one by one (slow), using await inside forEach (does not wait), and forgetting `return await` inside try/catch.",
    "code": "// 1) Promise chain\nfunction loadOrdersPromise(userId) {\n  return fetch('/api/users/' + userId)\n    .then((res) => {\n      if (!res.ok) throw new Error('HTTP ' + res.status);\n      return res.json();\n    })\n    .then((user) => fetch('/api/orders?user=' + user.id))\n    .then((res) => res.json())\n    .catch((err) => { console.error(err); throw err; });\n}\n\n// 2) Same logic with async/await — reads like synchronous code\nasync function loadOrders(userId) {\n  try {\n    const res = await fetch('/api/users/' + userId);\n    if (!res.ok) throw new Error('HTTP ' + res.status);\n    const user = await res.json();\n    const ordersRes = await fetch('/api/orders?user=' + user.id);\n    return await ordersRes.json();            // \"return await\" so THIS try/catch sees a rejection\n  } catch (err) {\n    console.error(err);\n    throw err;\n  }\n}\n\n// 3) Classic mistake: independent calls awaited one after another (inside an async function)\nconst profile  = await getProfile();          // 300 ms\nconst settings = await getSettings();         // 300 ms → 600 ms total\n\n//    Fix: start both, then wait together\nconst [p, s] = await Promise.all([getProfile(), getSettings()]);   // ≈ 300 ms\n\n// 4) forEach does NOT wait for async callbacks\nids.forEach(async (id) => { await save(id); });          // returns immediately ✗\nawait Promise.all(ids.map((id) => save(id)));            // waits for all ✓\nfor (const id of ids) { await save(id); }                // one by one, when order matters ✓\n\n// 5) Execution order — await schedules a microtask\nconsole.log('1');\n(async () => {\n  console.log('2');\n  await null;                                 // function pauses here, caller continues\n  console.log('4');                           // resumes as a microtask\n})();\nconsole.log('3');\n// Output: 1 2 3 4",
    "highlights": [
      "async/await = syntax over Promises",
      "Promise.all for parallel work",
      "forEach + await doesn't wait"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** A dashboard awaited five independent API calls in sequence and took ~3 s to load. Switching to `Promise.all` (or `Promise.allSettled` when one failure should not block the rest) cut it to the slowest single call, about 700 ms, with a three-line change."
      ]
    ],
    "body": [
      [
        "h",
        "Side-by-side"
      ],
      [
        "table",
        [
          "",
          "Promise (.then/.catch)",
          "async/await"
        ],
        [
          [
            "What it is",
            "The core object representing a future value",
            "Syntax sugar over Promises"
          ],
          [
            "Return value",
            "A Promise",
            "Always a Promise (even if you `return 5`)"
          ],
          [
            "Error handling",
            "`.catch()` / second argument of `.then`",
            "`try/catch/finally`"
          ],
          [
            "Readability",
            "Fine for 1–2 steps; chains get nested",
            "Linear, easier to debug and step through"
          ],
          [
            "Parallelism",
            "`Promise.all`, `race`, `allSettled`, `any`",
            "Same combinators — you just `await` them"
          ],
          [
            "Where usable",
            "Everywhere",
            "Inside `async` functions (and top-level in ES modules)"
          ]
        ]
      ],
      [
        "h",
        "Under the hood"
      ],
      [
        "p",
        "`await x` is roughly `Promise.resolve(x).then(continueRestOfFunction)`. The continuation is queued as a **microtask**, so it runs after the current synchronous code but before timers (`setTimeout`). The JavaScript thread is never blocked — other code runs while the function is paused."
      ],
      [
        "h",
        "Mistakes to name in an interview"
      ],
      [
        "ol",
        [
          "**Sequential awaits for independent work** → use `Promise.all`.",
          "**`await` inside `forEach`** → the loop doesn't wait; use `for...of` or `Promise.all(map(...))`.",
          "**`return promise` vs `return await promise` inside `try`** → without `await`, a rejection escapes your `catch`.",
          "**Unhandled rejections** → every async call needs a `catch` somewhere (or a global handler for logging).",
          "**Forgetting `async` fns return Promises** → `const x = getData()` without `await` gives you a Promise, not data."
        ]
      ],
      [
        "h",
        "Which combinator?"
      ],
      [
        "ul",
        [
          "`Promise.all` — all must succeed; fails fast on the first rejection.",
          "`Promise.allSettled` — wait for all, inspect each result (good for dashboards).",
          "`Promise.race` — first to settle wins (timeouts).",
          "`Promise.any` — first to **fulfil** wins (fallback mirrors)."
        ]
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "Async/await is syntax on top of Promises: an async function returns a Promise and await pauses only that function while the event loop keeps running, resuming as a microtask. I prefer it for readability and try/catch error handling, but I still use Promise combinators — mainly Promise.all — for independent calls, because awaiting them one by one serialises the work."
      ]
    ]
  },
  {
    "id": 2892,
    "category": "React",
    "difficulty": "Mid",
    "question": "How do you secure a React application? (XSS, tokens, CSRF, secrets, headers)",
    "answer": "React itself escapes every value you render in JSX, which blocks most XSS — so security work is mostly about the places where you bypass or sit outside that protection: dangerouslySetInnerHTML and user-controlled URLs (sanitize / allow-list), where tokens are stored (prefer HttpOnly cookies over localStorage), CSRF when cookies are used (SameSite + tokens), secrets (anything in the bundle is public), HTTP security headers (CSP, frame-ancestors), dependency hygiene, and — most importantly — enforcing authorization on the server, because everything in the browser can be changed by the user. JWT is a token format, not a protection by itself; how you issue, store and validate it is what matters.",
    "code": "import DOMPurify from 'dompurify';\n\n// 1) JSX escapes automatically — safe even if comment.text contains <script>\nfunction Comment({ comment }) {\n  return <p>{comment.text}</p>;\n}\n\n// 2) The dangerous escape hatch: only ever with SANITIZED html\nfunction RichText({ html }) {\n  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });\n  return <div dangerouslySetInnerHTML={{ __html: clean }} />;\n}\n\n// 3) User-controlled URLs can be \"javascript:...\" payloads — allow-list the protocol\nfunction SafeLink({ href, children }) {\n  let safe = '#';\n  try {\n    const url = new URL(href, window.location.origin);\n    if (['http:', 'https:', 'mailto:'].includes(url.protocol)) safe = url.href;\n  } catch { /* malformed URL → '#' */ }\n  return <a href={safe} target=\"_blank\" rel=\"noopener noreferrer\">{children}</a>;\n}\n\n// 4) Tokens: let the SERVER set an HttpOnly cookie — JavaScript can't read it,\n//    so an XSS bug can't steal the session\nawait fetch('/api/login', {\n  method: 'POST',\n  credentials: 'include',                                  // send / receive the cookie\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ email, password }),\n});\n\n// 5) Never ship secrets — everything in VITE_* / REACT_APP_* is PUBLIC in the bundle\n// const key = import.meta.env.VITE_PAYMENT_SECRET_KEY;    ✗ keep secrets on the server\n// const key = import.meta.env.VITE_PAYMENT_PUBLISHABLE_KEY; ✓ publishable keys only\n\n// 6) Server response headers (set in nginx / CDN / Express helmet):\n// Content-Security-Policy: default-src 'self'; script-src 'self'; frame-ancestors 'none'\n// X-Content-Type-Options: nosniff\n// Referrer-Policy: strict-origin-when-cross-origin\n// Strict-Transport-Security: max-age=31536000; includeSubDomains",
    "highlights": [
      "Sanitize before dangerouslySetInnerHTML",
      "HttpOnly cookie > localStorage",
      "Server enforces authorization"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** A support portal rendered customer-written HTML notes with `dangerouslySetInnerHTML`. One crafted note ran a script in every agent's browser and read the JWT from `localStorage`. The fix was layered: DOMPurify on render, the session moved to an HttpOnly SameSite cookie, and a CSP that blocks inline scripts."
      ]
    ],
    "body": [
      [
        "h",
        "Threat → defence"
      ],
      [
        "table",
        [
          "Threat",
          "How it happens in React apps",
          "Defence"
        ],
        [
          [
            "**XSS**",
            "`dangerouslySetInnerHTML`, `href={userInput}`, `eval`, unsafe third-party widgets",
            "Render as text, sanitize with DOMPurify, allow-list URL protocols, CSP, avoid `eval`/`new Function`"
          ],
          [
            "**Token theft**",
            "JWT in `localStorage` read by any injected script",
            "HttpOnly + Secure + SameSite cookie, or short-lived in-memory token + refresh cookie"
          ],
          [
            "**CSRF**",
            "Browser auto-sends cookies to your API from another site",
            "`SameSite=Lax/Strict`, CSRF token for state-changing requests, check `Origin`"
          ],
          [
            "**Broken access control**",
            "Hiding a button but leaving the API open",
            "Authorization on **every** server endpoint; UI guards are only UX"
          ],
          [
            "**Secrets in bundle**",
            "API keys in `.env` with a public prefix",
            "Keep secrets server-side; proxy third-party calls through your backend"
          ],
          [
            "**Supply chain**",
            "Malicious or vulnerable npm package",
            "Lockfile, `npm audit`, Dependabot/Renovate, review new deps, Subresource Integrity for CDN scripts"
          ],
          [
            "**Clickjacking**",
            "Your app is framed by another site",
            "`frame-ancestors 'none'` (CSP) / `X-Frame-Options`"
          ],
          [
            "**Data leakage**",
            "Tokens/PII in logs, URLs, source maps",
            "Redact logs, never put tokens in query strings, restrict public source maps"
          ]
        ]
      ],
      [
        "h",
        "Token storage — the honest trade-off"
      ],
      [
        "ul",
        [
          "**`localStorage`** — easy, but any XSS can read it.",
          "**HttpOnly cookie** — not readable by JS; needs CSRF protection because the browser sends it automatically.",
          "**In-memory token + HttpOnly refresh cookie** — a common compromise for SPAs: the access token lives only in a variable and dies on refresh, the refresh cookie silently renews it."
        ]
      ],
      [
        "h",
        "What the \"JWT, HTTPS, XSS, CSRF\" checklist leaves out"
      ],
      [
        "ol",
        [
          "**Authorization on the server** — the single most important rule.",
          "**Validate on the server** — client validation is for UX only.",
          "**CSP** — the safety net when an XSS bug slips through.",
          "**Dependency and build hygiene** — audit, pin, and don't expose source maps carelessly."
        ]
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "React escapes rendered values, so I focus on the gaps: sanitize anything passed to dangerouslySetInnerHTML, allow-list URL protocols, and keep tokens out of localStorage by using HttpOnly SameSite cookies with CSRF protection. Secrets never go in the bundle, I add a CSP and other security headers, keep dependencies audited, and always enforce authorization on the server because client-side checks are only UX."
      ]
    ]
  },
  {
    "id": 2893,
    "category": "React",
    "difficulty": "Senior",
    "question": "How would you handle authentication and authorization in a React application?",
    "answer": "Authentication answers \"who are you?\", authorization answers \"what may you do?\". In React: (1) an AuthProvider holds the user and a status ('loading' | 'authed' | 'anon') and restores the session on page load by calling a /me endpoint; (2) a ProtectedRoute wrapper redirects anonymous users to /login (remembering where they were going) and sends authenticated-but-unauthorized users to a 403 page; (3) tokens are handled with HttpOnly cookies or a short-lived access token plus refresh, with an Axios interceptor to renew it; (4) for enterprise SSO you use OIDC Authorization Code + PKCE (Auth0, Azure Entra ID/MSAL, Okta) instead of building login yourself. The crucial point: route guards protect the UI experience, the API protects the data.",
    "code": "// auth/AuthContext.jsx\nimport { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';\nimport { api } from '../api/client';\n\nconst AuthContext = createContext(null);\nexport const useAuth = () => useContext(AuthContext);\n\nexport function AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const [status, setStatus] = useState('loading');            // 'loading' | 'authed' | 'anon'\n\n  // Restore the session on page load (cookie / refresh token → \"who am I?\")\n  useEffect(() => {\n    api.get('/auth/me')\n      .then((res) => { setUser(res.data); setStatus('authed'); })\n      .catch(() => setStatus('anon'));\n  }, []);\n\n  const login = useCallback(async (credentials) => {\n    const res = await api.post('/auth/login', credentials);\n    setUser(res.data.user);\n    setStatus('authed');\n  }, []);\n\n  const logout = useCallback(async () => {\n    await api.post('/auth/logout').catch(() => {});\n    setUser(null);\n    setStatus('anon');\n  }, []);\n\n  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);\n  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;\n}\n\n// auth/ProtectedRoute.jsx  (React Router v6 / v7)\nimport { Navigate, Outlet, useLocation } from 'react-router-dom';\n\nexport function ProtectedRoute({ allowedRoles }) {\n  const { user, status } = useAuth();\n  const location = useLocation();\n\n  if (status === 'loading') return <FullPageSpinner />;       // don't flash /login while restoring\n  if (status === 'anon')    return <Navigate to=\"/login\" replace state={{ from: location }} />;\n  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to=\"/403\" replace />;\n\n  return <Outlet />;\n}\n\n// Routes\n<Routes>\n  <Route path=\"/login\" element={<Login />} />\n  <Route element={<ProtectedRoute />}>\n    <Route path=\"/dashboard\" element={<Dashboard />} />\n  </Route>\n  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>\n    <Route path=\"/admin\" element={<AdminPanel />} />\n  </Route>\n  <Route path=\"/403\" element={<Forbidden />} />\n</Routes>\n\n// In <Login/>: after success, return the user to where they were heading\nconst navigate = useNavigate();\nconst from = useLocation().state?.from?.pathname ?? '/dashboard';\nawait login(form);\nnavigate(from, { replace: true });",
    "highlights": [
      "AuthProvider + session restore",
      "ProtectedRoute + role check",
      "Guards = UX, API = security"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** A bank's customer portal uses Azure Entra ID (OIDC + PKCE). After login the SPA calls `/me`, receives `{ id, role: 'CUSTOMER' }`, and `ProtectedRoute` gates `/accounts`. An agent opening `/admin` by typing the URL is redirected to `/403`, while a hand-crafted `GET /api/admin/users` still returns `403` from the server — the guard is for experience, the API is for security."
      ]
    ],
    "body": [
      [
        "h",
        "Authentication vs authorization"
      ],
      [
        "table",
        [
          "",
          "Authentication (AuthN)",
          "Authorization (AuthZ)"
        ],
        [
          [
            "Question",
            "Who are you?",
            "What are you allowed to do?"
          ],
          [
            "Typical tools",
            "Password + MFA, OIDC/SSO, passkeys",
            "Roles, permissions, resource ownership (ABAC)"
          ],
          [
            "Failure status",
            "`401 Unauthorized`",
            "`403 Forbidden`"
          ],
          [
            "In React",
            "AuthProvider, login page, token/session handling",
            "ProtectedRoute, `<Can>`, hiding actions"
          ],
          [
            "Source of truth",
            "Identity provider / auth server",
            "API endpoints + policy"
          ]
        ]
      ],
      [
        "h",
        "End-to-end flow"
      ],
      [
        "ol",
        [
          "User signs in (own form, or redirect to the IdP using **Authorization Code + PKCE**).",
          "Server sets an HttpOnly session cookie, or returns a short-lived access token + refresh token.",
          "On every page load the SPA calls `/me` → AuthProvider knows the user and role.",
          "Axios/fetch layer attaches credentials; an interceptor refreshes on `401` (see the Axios interceptors answer).",
          "ProtectedRoute and UI gates use `user.role` / permissions for experience only.",
          "The API validates the token and authorizes **each** request.",
          "Logout clears server session + client state and notifies other tabs (`BroadcastChannel`)."
        ]
      ],
      [
        "h",
        "Details that separate senior answers"
      ],
      [
        "ul",
        [
          "**`loading` state** — without it, a hard refresh flashes the login page or redirects logged-in users.",
          "**Return-to URL** — keep `location` in navigation state so users land where they intended.",
          "**Don't store the user's role as the only truth** — re-fetch on `403`, since roles can change mid-session.",
          "**Multi-tab logout** — `BroadcastChannel('auth')` so logging out in one tab logs out all.",
          "**Lazy-load protected areas** (`React.lazy`) so unauthorized users never even download admin code (still not a security boundary)."
        ]
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "I keep an AuthProvider that restores the session through a /me call and exposes user and status. ProtectedRoute redirects anonymous users to login with a return URL and sends unauthorized users to a 403 page. Tokens live in HttpOnly cookies or as short-lived tokens refreshed by an interceptor, and for enterprise I use OIDC with PKCE rather than custom login. I stress that front-end guards are only UX — every API endpoint independently validates the token and authorizes the action."
      ]
    ]
  },
  {
    "id": 2894,
    "category": "React",
    "difficulty": "Mid",
    "question": "How do you implement role-based access control (RBAC) in a React app?",
    "answer": "Model access as permissions, not scattered role checks: map roles to permissions (ideally the server sends the user's permissions from /me), expose one `can(user, permission)` helper, and wrap it in a usePermission hook and a declarative <Can> component for UI gating, plus a role-aware ProtectedRoute for whole pages. This keeps rules in one place so adding a role never means hunting for `if (role === 'ADMIN')` across 80 files. Remember there are three layers — route guard, component gating, and API enforcement — and only the API layer is real security; the first two just keep the UI honest.",
    "code": "// auth/permissions.js — roles map to permissions (best: the server sends these from /me)\nexport const ROLE_PERMISSIONS = {\n  ADMIN:   ['user:read', 'user:write', 'report:read', 'claim:read', 'claim:approve'],\n  MANAGER: ['report:read', 'claim:read', 'claim:approve'],\n  AGENT:   ['claim:read', 'claim:write'],\n  VIEWER:  ['claim:read'],\n};\n\nexport const can = (user, permission) =>\n  !!user && (ROLE_PERMISSIONS[user.role] ?? []).includes(permission);\n\n// Resource-level rule (ABAC): \"agents may edit only claims they own\"\nexport const canEditClaim = (user, claim) =>\n  can(user, 'claim:write') && claim.ownerId === user.id;\n\n// auth/usePermission.js\nimport { useAuth } from './AuthContext';\n\nexport function usePermission() {\n  const { user } = useAuth();\n  return (permission) => can(user, permission);\n}\n\n// auth/Can.jsx — declarative UI gating\nexport function Can({ permission, fallback = null, children }) {\n  const check = usePermission();\n  return check(permission) ? children : fallback;\n}\n\n// usage in a screen\nfunction ClaimRow({ claim }) {\n  return (\n    <tr>\n      <td>{claim.id}</td>\n      <td>\n        <Can permission=\"claim:approve\">\n          <button onClick={() => approve(claim.id)}>Approve</button>\n        </Can>\n      </td>\n    </tr>\n  );\n}\n\n// route level (from the authentication answer):\n// <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}> ... </Route>\n\n// ── The REAL enforcement — server side (Express example) ──\nconst requirePermission = (permission) => (req, res, next) => {\n  if (!permissionsFor(req.user).includes(permission)) {\n    return res.status(403).json({ message: 'Forbidden' });\n  }\n  next();\n};\napp.post('/api/claims/:id/approve', authenticate, requirePermission('claim:approve'), approveClaim);",
    "highlights": [
      "Permissions over raw roles",
      "<Can> + usePermission + route guard",
      "Server enforces the rule"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** In a claims system, `AGENT` can create and edit their own claims, `MANAGER` can approve payouts, `AUDITOR` is read-only. The UI hides the Approve button for agents, but the approve endpoint also checks `claim:approve` — so even a user calling the API from Postman gets a `403`."
      ]
    ],
    "body": [
      [
        "h",
        "Three layers, three jobs"
      ],
      [
        "table",
        [
          "Layer",
          "Purpose",
          "Is it security?"
        ],
        [
          [
            "Route guard (`ProtectedRoute`)",
            "Stop users landing on pages they can't use",
            "No — UX"
          ],
          [
            "Component gating (`<Can>`)",
            "Hide or disable actions the user can't perform",
            "No — UX"
          ],
          [
            "API authorization",
            "Reject the request if the user lacks the permission",
            "**Yes — the only real control**"
          ]
        ]
      ],
      [
        "h",
        "RBAC vs ABAC"
      ],
      [
        "ul",
        [
          "**RBAC** — access depends on the user's role (`MANAGER` can approve).",
          "**ABAC / ownership rules** — access also depends on attributes of the resource or context (\"only your own claims\", \"only in your region\", \"only while the claim is open\").",
          "Real apps combine them: role gives the permission, the attribute rule narrows it."
        ]
      ],
      [
        "h",
        "Design tips"
      ],
      [
        "ol",
        [
          "**Check permissions, not roles**, in components — `can(user, 'claim:approve')` survives role renames and merges.",
          "**Let the server own the mapping.** Return `permissions: [...]` from `/me` so the UI never drifts from the API.",
          "**Fail closed** — unknown role or missing permission means no access.",
          "**Handle stale permissions** — if the API returns `403` for something the UI allowed, refetch `/me` and re-render.",
          "**Test both sides** — unit-test `can()`, and integration-test the API rejects unauthorized calls."
        ]
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "I model access as permissions mapped from roles, coming from the server via /me, and expose a can() helper, a usePermission hook and a <Can> component so UI rules live in one place. Route-level guards handle whole pages, and ownership rules are layered on top for resource-specific cases. All of that is UX; the real enforcement is middleware on the API that checks the permission on every request and returns 403."
      ]
    ]
  },
  {
    "id": 2895,
    "category": "React",
    "difficulty": "Senior",
    "question": "How do you reduce bundle size in a React application?",
    "answer": "Measure first, then cut. Run a bundle analyzer (rollup-plugin-visualizer for Vite, webpack-bundle-analyzer for Webpack, source-map-explorer) to see what is actually big. Then apply, roughly in order of payoff: route-level code splitting with React.lazy, lazy-loading heavy libraries only when needed (PDF, charts, editors) via dynamic import(), tree shaking by using ESM and modular imports (lodash-es, date-fns instead of whole lodash/moment), replacing or removing heavy dependencies, deduplicating packages, serving Brotli/gzip, optimizing images and fonts, and keeping it from regressing with a size budget in CI. The goal is a small initial bundle — what the user needs for the first screen — not just a small total.",
    "code": "// 1) Route-level code splitting — every page becomes its own chunk\nimport { lazy, Suspense } from 'react';\nconst Reports   = lazy(() => import('./pages/Reports'));\nconst AdminPage = lazy(() => import('./pages/AdminPage'));\n\n<Suspense fallback={<Spinner />}>\n  <Routes>\n    <Route path=\"/reports\" element={<Reports />} />\n    <Route path=\"/admin\"   element={<AdminPage />} />\n  </Routes>\n</Suspense>\n\n// 2) Load a heavy library only when it is needed (PDF export on button click)\nasync function exportPdf(data) {\n  const { default: jsPDF } = await import('jspdf');       // downloaded on first click only\n  const doc = new jsPDF();\n  doc.text(JSON.stringify(data), 10, 10);\n  doc.save('report.pdf');\n}\n\n// 3) Import only what you use (tree shaking works with ES modules)\nimport debounce from 'lodash-es/debounce';                // ✓ one function\n// import _ from 'lodash';                                // ✗ pulls in the entire library\nimport { format } from 'date-fns';                        // ✓ modular — instead of moment + all locales\nimport { FiSearch } from 'react-icons/fi';                // ✓ one icon, not the whole pack\n\n// 4) vite.config.js — split rarely-changing vendor code so browsers cache it\nimport { defineConfig } from 'vite';\nexport default defineConfig({\n  build: {\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          react:  ['react', 'react-dom', 'react-router-dom'],\n          charts: ['recharts'],\n        },\n      },\n    },\n  },\n});\n\n// 5) Find the heavy parts\n// npm i -D rollup-plugin-visualizer  → add visualizer({ open: true }) to Vite plugins\n// Webpack: webpack-bundle-analyzer · any build: npx source-map-explorer dist/assets/*.js\n\n// 6) Stop regressions — fail CI when the bundle grows (package.json, \"size-limit\")\n// [{ \"path\": \"dist/assets/index-*.js\", \"limit\": \"170 kB\" }]",
    "highlights": [
      "Analyze first",
      "Lazy-load routes & heavy libs",
      "Tree shaking + modular imports"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** A portal's entry bundle was 1.4 MB because `moment`, the full `lodash` and a charting library were imported at the top of `App.jsx`. Route-level `lazy()` for the reports area, `date-fns` instead of `moment`, and `lodash-es` named imports cut the initial JS by more than half, and a `size-limit` check in CI stopped it creeping back."
      ]
    ],
    "body": [
      [
        "h",
        "Techniques and when they pay off"
      ],
      [
        "table",
        [
          "Technique",
          "What it does",
          "Typical payoff"
        ],
        [
          [
            "Route-based code splitting",
            "Each page loads on demand",
            "Very high"
          ],
          [
            "Lazy-load heavy components/libs",
            "PDF, charts, rich-text editors, maps load on interaction",
            "High"
          ],
          [
            "Replace heavy dependencies",
            "moment → date-fns/dayjs, big UI kit → lighter one",
            "High"
          ],
          [
            "Tree shaking + modular imports",
            "Drops unused exports (ESM + `sideEffects: false`)",
            "Medium–High"
          ],
          [
            "Deduplicate packages",
            "`npm dedupe`, check analyzer for two versions of the same lib",
            "Medium"
          ],
          [
            "Compression (Brotli/gzip)",
            "Smaller transfer size (not parsed size)",
            "High on transfer"
          ],
          [
            "Modern build target",
            "Drop unneeded polyfills / legacy transforms via browserslist",
            "Medium"
          ],
          [
            "Images & fonts",
            "WebP/AVIF, lazy `<img loading=\"lazy\">`, subset fonts",
            "High for page weight"
          ],
          [
            "Remove dead code",
            "Unused components, feature-flagged leftovers, dev-only code",
            "Low–Medium"
          ]
        ]
      ],
      [
        "h",
        "Transfer size vs parsed size"
      ],
      [
        "p",
        "Compression reduces what travels over the network, but the browser still has to **parse and execute** the full JavaScript. That is why code splitting matters more for CPU-bound devices than compression alone."
      ],
      [
        "h",
        "Pitfalls"
      ],
      [
        "ul",
        [
          "**Lazy-loading everything** creates a waterfall of tiny requests — split at route and feature boundaries, and prefetch likely next routes (`import()` on hover).",
          "**Barrel files** (`index.js` re-exporting everything) can defeat tree shaking in some setups.",
          "**CommonJS packages** can't be tree-shaken well — prefer ESM builds.",
          "**Lazy components need `Suspense`** and an error boundary for failed chunk loads (e.g. after a redeploy)."
        ]
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "I start by analyzing the bundle to find the real offenders. Then I split by route with React.lazy, dynamically import heavy libraries only when used, make sure tree shaking works with modular imports, swap heavy dependencies for lighter ones, enable Brotli, optimize images and fonts, and add a size budget in CI so it can't regress. I aim at a small initial bundle for the first screen."
      ]
    ]
  },
  {
    "id": 2896,
    "category": "React",
    "difficulty": "Senior",
    "question": "How do you monitor frontend performance and errors in production?",
    "answer": "Combine Real User Monitoring (RUM) with synthetic checks. RUM collects Core Web Vitals — LCP (loading), INP (responsiveness, which replaced FID) and CLS (visual stability) — from real users with the `web-vitals` library and sends them via navigator.sendBeacon to your analytics or a tool like Datadog RUM, Sentry, New Relic or Grafana Faro. Add error tracking (React ErrorBoundary for render errors + window 'error' and 'unhandledrejection' listeners for everything else, with source maps and release tags), long-task and API-timing metrics, and alert on the 75th percentile rather than the average. Lighthouse CI covers synthetic/regression checks in the pipeline; the React Profiler is for diagnosing locally.",
    "code": "// monitoring.js — real-user monitoring (RUM) bootstrap, called once in main.jsx\nimport { onLCP, onINP, onCLS, onTTFB } from 'web-vitals';\n\nfunction report(payload) {\n  const body = JSON.stringify({\n    ...payload,\n    page: location.pathname,\n    release: __APP_VERSION__,                     // injected at build time (e.g. Vite `define`)\n    ua: navigator.userAgent,\n  });\n  // sendBeacon survives page unload; fall back to fetch + keepalive\n  if (!navigator.sendBeacon('/rum', body)) {\n    fetch('/rum', { method: 'POST', body, keepalive: true });\n  }\n}\n\n// Core Web Vitals from REAL users\nconst sendVital = (m) => report({ type: 'vital', name: m.name, value: m.value, rating: m.rating });\nonLCP(sendVital);   // Largest Contentful Paint  — good ≤ 2.5 s\nonINP(sendVital);   // Interaction to Next Paint — good ≤ 200 ms\nonCLS(sendVital);   // Cumulative Layout Shift   — good ≤ 0.1\nonTTFB(sendVital);  // Time to First Byte\n\n// Errors outside React's render phase (an ErrorBoundary only catches render errors)\nwindow.addEventListener('error', (e) =>\n  report({ type: 'error', message: e.message, source: e.filename, line: e.lineno }));\nwindow.addEventListener('unhandledrejection', (e) =>\n  report({ type: 'promise', message: String(e.reason) }));\n\n// Long tasks (> 50 ms) block the main thread and hurt INP\nnew PerformanceObserver((list) => {\n  list.getEntries().forEach((t) => report({ type: 'longtask', duration: Math.round(t.duration) }));\n}).observe({ type: 'longtask', buffered: true });\n\n// Slow React subtrees in production-like builds\nimport { Profiler } from 'react';\n<Profiler id=\"OrderTable\" onRender={(id, phase, actualDuration) => {\n  if (actualDuration > 50) report({ type: 'slow-render', id, phase, ms: Math.round(actualDuration) });\n}}>\n  <OrderTable />\n</Profiler>\n\n// Or use a vendor SDK that does most of this (Sentry shown):\n// Sentry.init({ dsn, release: __APP_VERSION__, tracesSampleRate: 0.1, integrations: [Sentry.browserTracingIntegration()] });",
    "highlights": [
      "RUM: LCP, INP, CLS",
      "Error tracking + source maps",
      "Alert on p75, not average"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** Lighthouse scored a retail site 95 in the lab, yet RUM showed p75 LCP of 4.8 s on mid-range Android phones in India. The slow metric was traced to an unoptimized hero image and a blocking third-party script; after fixing both, p75 LCP fell to 2.3 s and a Grafana alert now fires if it crosses 2.5 s."
      ]
    ],
    "body": [
      [
        "h",
        "RUM vs synthetic"
      ],
      [
        "table",
        [
          "",
          "Real User Monitoring (RUM)",
          "Synthetic (Lighthouse CI, WebPageTest)"
        ],
        [
          [
            "Data source",
            "Real users' devices, networks, locations",
            "Scripted runs on controlled machines"
          ],
          [
            "Best for",
            "What users actually experience; long-tail devices",
            "Regression gates in CI; repeatable comparisons"
          ],
          [
            "Weakness",
            "Noisy; needs enough traffic and sampling",
            "Doesn't reflect real devices/networks"
          ],
          [
            "Use together?",
            "Yes — synthetic catches regressions before release, RUM confirms reality after.",
            ""
          ]
        ]
      ],
      [
        "h",
        "What to measure"
      ],
      [
        "ul",
        [
          "**Core Web Vitals** — LCP, INP, CLS at the 75th percentile, segmented by page, device and country.",
          "**Errors** — JS errors, unhandled rejections, failed chunk loads, API failures with status and correlation ID.",
          "**API latency** — via Resource Timing or an instrumented Axios layer.",
          "**Long tasks and slow renders** — to find main-thread blockers.",
          "**Business signals** — checkout abandonment, form errors; performance problems show up here first."
        ]
      ],
      [
        "h",
        "Make errors actionable"
      ],
      [
        "ol",
        [
          "Upload **source maps** to your error tool (not publicly) so stack traces are readable.",
          "Tag every event with a **release/version** to see which deploy caused a spike.",
          "Wrap major sections in **ErrorBoundaries** that report and show a fallback UI.",
          "Attach a **correlation/request ID** to API calls so a frontend error links to the backend trace.",
          "**Sample** high-volume events and **redact** PII."
        ]
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "I combine RUM and synthetic monitoring. In production I collect Core Web Vitals — LCP, INP and CLS — with the web-vitals library, track errors with an ErrorBoundary plus global error and unhandledrejection handlers using source maps and release tags, and measure API latency and long tasks. I alert on p75 per page and device, and run Lighthouse CI in the pipeline to catch regressions before release."
      ]
    ]
  },
  {
    "id": 2897,
    "category": "React",
    "difficulty": "Senior",
    "question": "How do you manage state across multiple applications (micro-frontends)?",
    "answer": "The best answer is: share as little state as possible. Each micro-frontend owns its own state; apps share identity and events, not stores. Practical channels: the URL for navigation state, a single sign-on session (cookie / identity provider) for authentication, a small versioned event contract (CustomEvent / event bus) for cross-app notifications like 'cart updated', BroadcastChannel for cross-tab sync, the backend as the source of truth for data (each app fetches and caches its own), and a shared design-token/package for UI constants. Sharing one global Redux store across teams couples deployments and defeats the point of independent releases. If you use Module Federation, share singletons like react and react-dom — not application state.",
    "code": "// shared/event-bus.js — a tiny, framework-agnostic contract between micro-frontends\nexport const bus = {\n  emit(type, detail) {\n    window.dispatchEvent(new CustomEvent('mfe:' + type, { detail }));\n  },\n  on(type, handler) {\n    const listener = (e) => handler(e.detail);\n    window.addEventListener('mfe:' + type, listener);\n    return () => window.removeEventListener('mfe:' + type, listener);   // unsubscribe\n  },\n};\n\n// App A (cart) publishes a FACT — it doesn't know who listens\nbus.emit('cart:updated', { count: 3 });\n\n// App B (header) subscribes — wrapped in a React hook\nimport { useEffect, useState, useCallback } from 'react';\n\nfunction useBus(type, handler) {\n  useEffect(() => bus.on(type, handler), [type, handler]);\n}\n\nfunction CartBadge() {\n  const [count, setCount] = useState(0);\n  useBus('cart:updated', useCallback((d) => setCount(d.count), []));\n  return <span aria-label=\"items in cart\">{count}</span>;\n}\n\n// Across browser TABS of the same app: BroadcastChannel\nconst channel = new BroadcastChannel('auth');\nchannel.postMessage({ type: 'logout' });\nchannel.onmessage = (e) => {\n  if (e.data.type === 'logout') window.location.assign('/login');\n};\n\n// Module Federation (webpack): share ONE copy of React — never a global app store\nnew ModuleFederationPlugin({\n  name: 'cart',\n  filename: 'remoteEntry.js',\n  exposes: { './CartWidget': './src/CartWidget' },\n  shared: {\n    react:       { singleton: true, requiredVersion: '^18.2.0' },\n    'react-dom': { singleton: true, requiredVersion: '^18.2.0' },\n  },\n});",
    "highlights": [
      "Each app owns its state",
      "Share events & identity, not stores",
      "Singleton react via Module Federation"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** An insurance platform has separate Policy, Claims and Billing apps. They share login through the company IdP (one SSO session), deep-link with URLs like `/claims/123`, and a header badge listens for a `claims:changed` event. Each app fetches its own data with its own cache, so the Claims team can deploy on Tuesday without coordinating with Billing."
      ]
    ],
    "body": [
      [
        "h",
        "What to share, and how"
      ],
      [
        "table",
        [
          "Need",
          "Recommended mechanism",
          "Avoid"
        ],
        [
          [
            "Who is the user?",
            "SSO session (cookie / OIDC) — each app validates independently",
            "Copying tokens between apps via globals"
          ],
          [
            "Where am I / deep links",
            "URL + query params; a shared route contract",
            "Hidden in-memory state"
          ],
          [
            "\"Something happened\" notifications",
            "Versioned CustomEvent / event bus, or a messaging service",
            "Calling another app's internals"
          ],
          [
            "Business data",
            "Backend is the source of truth; each app fetches + caches (React Query/RTK Query)",
            "Syncing copies of data between apps"
          ],
          [
            "Cross-tab state",
            "`BroadcastChannel` or the `storage` event",
            "Polling"
          ],
          [
            "Look and feel",
            "Shared design-token / component package",
            "Copy-pasted CSS"
          ],
          [
            "Libraries (react, react-dom)",
            "Module Federation `shared` singletons",
            "Multiple React copies (hooks break)"
          ]
        ]
      ],
      [
        "h",
        "Anti-patterns"
      ],
      [
        "ul",
        [
          "**One shared Redux store for every team** — couples release cycles and invites hidden dependencies.",
          "**Reading another app's `window` globals** — undocumented, unversioned, breaks silently.",
          "**Sharing mutable objects** — share immutable payloads (events/data), not references."
        ]
      ],
      [
        "h",
        "Make the contract explicit"
      ],
      [
        "ol",
        [
          "Document event names and payload shapes (`cart:updated` → `{ count: number }`).",
          "**Version** them and keep backward compatibility during rollouts.",
          "Validate payloads at the boundary (e.g. with a schema) and ignore unknown fields.",
          "Handle the \"listener loaded late\" case — consumers should also be able to **fetch** current state, not rely only on events."
        ]
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "I try to minimise shared state. Each micro-frontend owns its state; they share identity through SSO, navigation through the URL, and notifications through a small versioned event contract, with the backend as the source of truth for data. Cross-tab sync uses BroadcastChannel, and with Module Federation I only share singletons like React, not a global store, so teams can still deploy independently."
      ]
    ]
  },
  {
    "id": 2898,
    "category": "React",
    "difficulty": "Senior",
    "question": "How do you implement feature flags in a React application?",
    "answer": "Feature flags separate deployment from release: you ship code dark and turn it on later, per user, per percentage or per environment. In React: a FlagProvider loads the evaluated flags (from a service such as LaunchDarkly, Unleash, GrowthBook, Flagsmith or your own /flags API) with safe defaults, exposes them through a useFlag hook and a <Feature> component, and renders after flags are ready to avoid flicker. Percentage rollouts use a stable hash of userId + flag name so a user never flip-flops between variants. Treat flags as temporary: delete them once fully rolled out, test both states, and never make a client-side flag the only guard for something security-sensitive.",
    "code": "// flags/FlagProvider.jsx\nimport { createContext, useContext, useEffect, useState } from 'react';\n\nconst DEFAULTS = { newCheckout: false, darkMode: false };   // safe values if the flag service is down\nconst FlagContext = createContext(DEFAULTS);\n\nexport function FlagProvider({ user, children }) {\n  const [flags, setFlags] = useState(DEFAULTS);\n  const [ready, setReady] = useState(false);\n\n  useEffect(() => {\n    let cancelled = false;\n    fetch('/api/flags?user=' + encodeURIComponent(user.id))   // server evaluates targeting rules\n      .then((r) => (r.ok ? r.json() : DEFAULTS))\n      .then((remote) => { if (!cancelled) setFlags({ ...DEFAULTS, ...remote }); })\n      .catch(() => {})                                         // keep defaults on failure\n      .finally(() => { if (!cancelled) setReady(true); });\n    return () => { cancelled = true; };\n  }, [user.id]);\n\n  if (!ready) return null;                                     // avoid UI flicker (or show a splash)\n  return <FlagContext.Provider value={flags}>{children}</FlagContext.Provider>;\n}\n\nexport const useFlag = (name) => useContext(FlagContext)[name] ?? false;\n\nexport function Feature({ flag, fallback = null, children }) {\n  return useFlag(flag) ? children : fallback;\n}\n\n// usage\nfunction Checkout() {\n  return (\n    <Feature flag=\"newCheckout\" fallback={<OldCheckout />}>\n      <NewCheckout />\n    </Feature>\n  );\n}\n\n// ── Percentage rollout: a STABLE bucket so a user never flips between variants ──\nfunction bucket(userId, flagName) {\n  let h = 0;\n  for (const ch of userId + ':' + flagName) h = (h * 31 + ch.charCodeAt(0)) >>> 0;\n  return h % 100;                                              // 0–99\n}\nconst inRollout = bucket(user.id, 'newCheckout') < 20;         // 20% of users",
    "highlights": [
      "Deploy ≠ release",
      "Safe defaults + stable rollout",
      "Remove flags when done"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** A team rebuilt checkout behind `newCheckout`. It shipped to production dark, was enabled for employees, then 5% → 25% → 100% of customers over a week. When errors rose at 25%, product switched the flag off in seconds — no redeploy, no rollback pipeline."
      ]
    ],
    "body": [
      [
        "h",
        "Types of flags"
      ],
      [
        "table",
        [
          "Type",
          "Purpose",
          "Lifetime"
        ],
        [
          [
            "Release flag",
            "Hide unfinished or risky features until ready",
            "Days–weeks; **delete after rollout**"
          ],
          [
            "Ops / kill switch",
            "Turn off a costly or failing feature instantly",
            "Long-lived"
          ],
          [
            "Experiment (A/B)",
            "Compare variants and measure impact",
            "Until the test concludes"
          ],
          [
            "Permission / entitlement",
            "Features by plan or customer",
            "Long-lived (often belongs in RBAC)"
          ]
        ]
      ],
      [
        "h",
        "Implementation checklist"
      ],
      [
        "ol",
        [
          "**Safe defaults** — if the flag service fails, the app must still work (usually flag = off).",
          "**Evaluate on the server** where possible, so targeting rules and user data don't leak to the client.",
          "**No flicker** — load flags before first render, or bootstrap them inline from the server.",
          "**Stable bucketing** — hash the user ID so rollouts are sticky.",
          "**Keep flag checks shallow** — branch at a component boundary, not scattered inside logic.",
          "**Test both states** (on/off) in unit and e2e tests.",
          "**Clean up** — track owner and expiry; stale flags become tech debt and untested code paths."
        ]
      ],
      [
        "h",
        "Security note"
      ],
      [
        "p",
        "Anything shipped to the browser is visible. A client flag can hide a button, but the API must still enforce access — never rely on a front-end flag as the only protection for a sensitive feature."
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "Feature flags decouple deployment from release. I load evaluated flags into a provider with safe defaults, expose useFlag and a Feature component, and avoid flicker by waiting for flags or bootstrapping them. Rollouts use a stable hash of the user ID for percentages, and kill switches let us turn things off without a deploy. I test both states, keep flag checks at component boundaries, remove flags after rollout, and never rely on a client flag for security."
      ]
    ]
  },
  {
    "id": 2899,
    "category": "React",
    "difficulty": "Senior",
    "question": "What Webpack optimization techniques do you use? (bundle size, caching, build speed)",
    "answer": "Group them by goal. SMALLER bundles: production mode (minification, tree shaking, scope hoisting), splitChunks for vendor/common code, dynamic import() for code splitting, `sideEffects` in package.json, Terser/CSS minimizers, and Brotli compression. BETTER caching: [contenthash] filenames plus a single runtimeChunk so vendor hashes stay stable between deploys. FASTER builds: filesystem cache, babel-loader cacheDirectory, narrowing loader `include`, and swc/esbuild loaders. DIAGNOSIS: webpack-bundle-analyzer and performance budgets. Pick settings that match the goal — build speed and runtime bundle size are different problems.",
    "code": "// webpack.config.js (Webpack 5)\nconst path = require('path');\nconst TerserPlugin = require('terser-webpack-plugin');\nconst CssMinimizerPlugin = require('css-minimizer-webpack-plugin');\nconst CompressionPlugin = require('compression-webpack-plugin');\nconst { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');\n\nmodule.exports = (env, argv) => {\n  const isProd = argv.mode === 'production';    // production mode already enables minify + tree shaking + scope hoisting\n\n  return {\n    entry: './src/index.jsx',\n    output: {\n      path: path.resolve(__dirname, 'dist'),\n      filename: isProd ? '[name].[contenthash:8].js' : '[name].js',              // long-term caching\n      chunkFilename: isProd ? '[name].[contenthash:8].chunk.js' : '[name].chunk.js',\n      clean: true,\n    },\n    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',            // fast in dev, debuggable in prod\n    cache: { type: 'filesystem' },                                               // 2nd build is much faster\n\n    module: {\n      rules: [{\n        test: /\\.[jt]sx?$/,\n        include: path.resolve(__dirname, 'src'),                                 // never transpile node_modules\n        use: { loader: 'babel-loader', options: { cacheDirectory: true } },\n      }],\n    },\n\n    optimization: {\n      splitChunks: {\n        chunks: 'all',                                                           // split async + initial chunks\n        cacheGroups: {\n          vendor: { test: /[\\\\/]node_modules[\\\\/]/, name: 'vendor', priority: -10 },\n        },\n      },\n      runtimeChunk: 'single',                                                    // small runtime → stable vendor hash\n      minimizer: [new TerserPlugin({ extractComments: false }), new CssMinimizerPlugin()],\n    },\n\n    plugins: [\n      isProd && new CompressionPlugin({ algorithm: 'brotliCompress', test: /\\.(js|css|html|svg)$/ }),\n      env && env.analyze && new BundleAnalyzerPlugin(),                          // npx webpack --env analyze\n    ].filter(Boolean),\n\n    performance: { maxAssetSize: 250000, maxEntrypointSize: 400000, hints: 'warning' },\n  };\n};\n\n// package.json — let Webpack drop unused modules safely\n// { \"sideEffects\": [\"*.css\"] }\n\n// Code splitting in source\n// const Reports = React.lazy(() => import(/* webpackChunkName: \"reports\" */ './Reports'));\n// <link rel=\"prefetch\"> hint:  import(/* webpackPrefetch: true */ './HeavyModal');",
    "highlights": [
      "splitChunks + dynamic import",
      "contenthash + runtimeChunk",
      "Filesystem cache for build speed"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** CI builds took 6 minutes and every release invalidated users' cached `main.js`. Enabling `cache: { type: 'filesystem' }`, `babel-loader` caching and `include: src` cut rebuilds to under a minute, while `[contenthash]` + `runtimeChunk: 'single'` meant returning users re-downloaded only the changed app chunk, not the 400 KB vendor bundle."
      ]
    ],
    "body": [
      [
        "h",
        "Techniques grouped by goal"
      ],
      [
        "table",
        [
          "Goal",
          "Technique",
          "Config / tool"
        ],
        [
          [
            "Smaller bundle",
            "Minification",
            "`mode: 'production'`, TerserPlugin, CssMinimizerPlugin"
          ],
          [
            "Smaller bundle",
            "Tree shaking",
            "ES modules + `sideEffects` in package.json + `usedExports`"
          ],
          [
            "Smaller bundle",
            "Code splitting",
            "`import()`, `React.lazy`, `splitChunks`"
          ],
          [
            "Smaller bundle",
            "Drop unused locales/code",
            "`IgnorePlugin` (e.g. moment locales), alias lighter libs"
          ],
          [
            "Smaller transfer",
            "Compression",
            "CompressionPlugin (Brotli/gzip) or CDN-level compression"
          ],
          [
            "Better caching",
            "Content hashes + stable vendor chunk",
            "`[contenthash]`, `runtimeChunk: 'single'`, `moduleIds: 'deterministic'`"
          ],
          [
            "Faster builds",
            "Persistent cache",
            "`cache: { type: 'filesystem' }`"
          ],
          [
            "Faster builds",
            "Faster transpiling",
            "babel-loader `cacheDirectory`, `include`, or swc-loader / esbuild-loader"
          ],
          [
            "Faster dev",
            "Cheap source maps, HMR",
            "`devtool: 'eval-cheap-module-source-map'`"
          ],
          [
            "Diagnosis",
            "See what's big",
            "webpack-bundle-analyzer, `performance` budgets, `stats.json`"
          ],
          [
            "Shared code",
            "Don't duplicate libs across apps",
            "`externals` (CDN) or Module Federation `shared`"
          ]
        ]
      ],
      [
        "h",
        "Why contenthash + runtimeChunk matter"
      ],
      [
        "p",
        "A content hash changes only when a file's **content** changes, so unchanged chunks stay cached in users' browsers. Webpack's tiny runtime (the module map) changes on every build; extracting it with `runtimeChunk: 'single'` stops it from invalidating the vendor chunk hash."
      ],
      [
        "h",
        "Webpack vs Vite in practice"
      ],
      [
        "p",
        "Vite (used by many new React apps, including this portal) serves source via native ES modules in dev and bundles with Rollup for production, so it needs far less tuning for dev speed. The production concepts — code splitting, tree shaking, hashed filenames, manual chunks — are the same, and the interview answer is the same: measure, split, cache, compress."
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "I optimize Webpack by goal. For bundle size: production mode, tree shaking with ES modules and sideEffects, splitChunks and dynamic imports, minimizers and Brotli. For caching: contenthash filenames and a single runtime chunk so vendor hashes stay stable. For build speed: filesystem cache, babel-loader caching, limiting loaders to src, or swc/esbuild loaders. I verify with webpack-bundle-analyzer and performance budgets rather than guessing."
      ]
    ]
  },
  {
    "id": 2900,
    "category": "React",
    "difficulty": "Senior",
    "question": "How do you design a reusable React component library?",
    "answer": "Treat it as a product with consumers, not a folder of components. Start from design tokens (colours, spacing, radius, typography as CSS variables) so theming is a data change. Design small, composable APIs: sensible defaults, spread the remaining props onto the root element, forward refs, prefer composition (children, compound components like Tabs.List / Tabs.Tab) over a 20-prop config object. Build accessibility in (semantic elements, keyboard support, ARIA, focus management). Document with Storybook, test with React Testing Library, axe and visual regression, publish as tree-shakeable ESM with peerDependencies on React, and version with semver (changesets) and a clear deprecation policy.",
    "code": "// Button.jsx — a library-grade button: variants, forwarded ref, a11y, prop spreading\nimport { forwardRef } from 'react';\nimport './button.css';        // uses design tokens: var(--ds-color-primary), var(--ds-radius-md) …\n\nexport const Button = forwardRef(function Button(\n  { variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...rest },\n  ref\n) {\n  const classes = ['ds-btn', 'ds-btn--' + variant, 'ds-btn--' + size, className].join(' ').trim();\n  return (\n    <button\n      ref={ref}                                    // consumers can focus / measure it\n      className={classes}\n      disabled={disabled || loading}\n      aria-busy={loading || undefined}\n      {...rest}                                    // onClick, type, aria-*, data-* all just work\n    >\n      {loading && <Spinner aria-hidden=\"true\" />}\n      {children}\n    </button>\n  );\n});\n\n// Tabs.jsx — compound components: flexible composition instead of a giant props object\nimport { createContext, useContext, useState } from 'react';\nconst TabsContext = createContext(null);\n\nexport function Tabs({ defaultValue, children }) {\n  const [value, setValue] = useState(defaultValue);\n  return (\n    <TabsContext.Provider value={{ value, setValue }}>\n      <div>{children}</div>\n    </TabsContext.Provider>\n  );\n}\nTabs.List = function TabList({ children }) {\n  return <div role=\"tablist\">{children}</div>;\n};\nTabs.Tab = function Tab({ value, children }) {\n  const ctx = useContext(TabsContext);\n  const selected = ctx.value === value;\n  return (\n    <button role=\"tab\" aria-selected={selected} tabIndex={selected ? 0 : -1}\n            onClick={() => ctx.setValue(value)}>\n      {children}\n    </button>\n  );\n};\nTabs.Panel = function Panel({ value, children }) {\n  return useContext(TabsContext).value === value ? <div role=\"tabpanel\">{children}</div> : null;\n};\n\n// How an app team uses it — they control the layout, the library controls behaviour + a11y\n<Tabs defaultValue=\"claims\">\n  <Tabs.List>\n    <Tabs.Tab value=\"claims\">Claims</Tabs.Tab>\n    <Tabs.Tab value=\"docs\">Documents</Tabs.Tab>\n  </Tabs.List>\n  <Tabs.Panel value=\"claims\"><ClaimsTable /></Tabs.Panel>\n  <Tabs.Panel value=\"docs\"><DocumentList /></Tabs.Panel>\n</Tabs>\n\n// package.json of the library — tree-shakeable, React is a peer dependency\n// {\n//   \"name\": \"@acme/ui\", \"version\": \"2.3.0\", \"type\": \"module\",\n//   \"sideEffects\": [\"**/*.css\"],\n//   \"exports\": { \".\": { \"types\": \"./dist/index.d.ts\", \"import\": \"./dist/index.js\" },\n//                \"./styles.css\": \"./dist/styles.css\" },\n//   \"peerDependencies\": { \"react\": \">=18\", \"react-dom\": \">=18\" }\n// }",
    "highlights": [
      "Design tokens + composable APIs",
      "Accessibility + Storybook + tests",
      "ESM, peer deps, semver"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** Five product teams in a large insurer each had their own button and modal. A shared `@acme/ui` library with tokens, an accessible `Modal` and a `DataTable` let teams ship screens ~30% faster, and when an accessibility bug was found in `Modal`, one patch release fixed it in every app instead of fifty separate pull requests."
      ]
    ],
    "body": [
      [
        "h",
        "Design principles"
      ],
      [
        "ol",
        [
          "**Design tokens first** — colours, spacing, typography, radii, shadows as CSS variables → theming and dark mode become configuration.",
          "**Small API surface** — fewer props are easier to keep stable. Offer sensible defaults.",
          "**Composition over configuration** — `children`, slots and compound components rather than `renderHeader`, `renderFooter`, `headerProps`, … props.",
          "**Spread rest props + forward refs** — so consumers can add `data-testid`, `aria-*`, handlers, and focus the element.",
          "**Controlled and uncontrolled** — support both (`value`/`onChange` and `defaultValue`).",
          "**Accessible by default** — semantic HTML, keyboard navigation (arrow keys for tabs/menus), ARIA roles, visible focus, focus trapping in dialogs.",
          "**No hidden global side effects** — styles scoped (CSS modules / vars / Tailwind), no global resets."
        ]
      ],
      [
        "h",
        "Engineering practices"
      ],
      [
        "table",
        [
          "Area",
          "Practice"
        ],
        [
          [
            "Documentation",
            "Storybook with usage examples, props tables, do/don't guidance"
          ],
          [
            "Testing",
            "React Testing Library for behaviour, `jest-axe` for a11y, visual regression (Chromatic/Playwright)"
          ],
          [
            "Types",
            "TypeScript definitions shipped with the package; polymorphic `as` prop where useful"
          ],
          [
            "Packaging",
            "ESM (+CJS if needed), `sideEffects`, per-component imports, `peerDependencies` for React"
          ],
          [
            "Versioning",
            "Semver + changesets; deprecate with warnings before removing; migration guides/codemods"
          ],
          [
            "Distribution",
            "Private npm registry; monorepo (pnpm/Turborepo/Nx) for library + docs + example app"
          ],
          [
            "Governance",
            "Contribution guide, design review, owners; avoid one-off props requested by a single team"
          ]
        ]
      ],
      [
        "h",
        "Note on keyboard accessibility"
      ],
      [
        "p",
        "The `Tabs` example shows the structure. A production tab list also needs roving `tabIndex` with Left/Right/Home/End keys, and `aria-controls`/`id` pairing — exactly the kind of detail that justifies a shared, well-tested library."
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "I treat the library as a product: design tokens for theming, small composable APIs with forwarded refs and spread props, and compound components where flexibility matters. Accessibility is built in and verified with testing-library and axe. I document in Storybook, publish tree-shakeable ESM with React as a peer dependency, and use semver with changesets and a deprecation policy so teams can upgrade safely."
      ]
    ]
  },
  {
    "id": 2901,
    "category": "React",
    "difficulty": "Mid",
    "question": "How do you implement internationalization (i18n) in a React application?",
    "answer": "Use an i18n library — react-i18next (i18next) or react-intl (FormatJS, ICU messages) — and keep all user-facing text in per-language resource files instead of hardcoding strings. Use interpolation and plural keys rather than string concatenation, format numbers, currencies and dates with the built-in Intl APIs, lazy-load language files so users download only their language, detect and persist the language (URL, cookie or localStorage) with a fallback language, and set the `lang` and `dir` attributes on <html> to support right-to-left languages. Also plan for text expansion in layouts (German is often ~30% longer), locale-aware sorting, and a translation workflow with key extraction.",
    "code": "// i18n.js — setup with react-i18next\nimport i18n from 'i18next';\nimport { initReactI18next } from 'react-i18next';\nimport LanguageDetector from 'i18next-browser-languagedetector';\nimport HttpBackend from 'i18next-http-backend';       // lazy-loads /locales/{lng}/{ns}.json\n\ni18n\n  .use(HttpBackend)\n  .use(LanguageDetector)                              // localStorage → browser language → <html lang>\n  .use(initReactI18next)\n  .init({\n    fallbackLng: 'en',\n    supportedLngs: ['en', 'ta', 'hi', 'ar'],\n    ns: ['common'],\n    defaultNS: 'common',\n    interpolation: { escapeValue: false },            // React already escapes output\n  });\n\n// Keep <html lang> and <html dir> in sync (important for screen readers and RTL)\ni18n.on('languageChanged', (lng) => {\n  document.documentElement.lang = lng;\n  document.documentElement.dir = i18n.dir(lng);       // 'rtl' for Arabic, 'ltr' otherwise\n});\n\nexport default i18n;\n\n// /public/locales/en/common.json\n// { \"welcome\": \"Welcome, {{name}}!\", \"items_one\": \"{{count}} item\", \"items_other\": \"{{count}} items\" }\n// /public/locales/ta/common.json\n// { \"welcome\": \"வணக்கம், {{name}}!\", \"items_one\": \"{{count}} பொருள்\", \"items_other\": \"{{count}} பொருட்கள்\" }\n\n// CartHeader.jsx\nimport { useTranslation } from 'react-i18next';\n\nfunction CartHeader({ user, itemCount, total }) {\n  const { t, i18n } = useTranslation();\n  const lang = i18n.resolvedLanguage;\n\n  return (\n    <header>\n      <h1>{t('welcome', { name: user.name })}</h1>                    {/* interpolation, no concatenation */}\n      <p>{t('items', { count: itemCount })}</p>                       {/* correct plural form per language */}\n      <p>{new Intl.NumberFormat(lang, { style: 'currency', currency: 'INR' }).format(total)}</p>\n      <p>{new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date())}</p>\n\n      <select value={lang} onChange={(e) => i18n.changeLanguage(e.target.value)}>\n        <option value=\"en\">English</option>\n        <option value=\"ta\">தமிழ்</option>\n        <option value=\"hi\">हिन्दी</option>\n        <option value=\"ar\">العربية</option>\n      </select>\n    </header>\n  );\n}\n\n// ✗ Never build sentences by concatenation — word order differs between languages\n// t('hello') + ' ' + user.name + t('youHave') + count + t('items')\n// ✓ One key with placeholders: \"greeting\": \"Hello {{name}}, you have {{count}} items\"",
    "highlights": [
      "Resource files + t() keys",
      "Intl for dates/numbers/currency",
      "RTL via lang/dir + lazy-load"
    ],
    "realWorld": [
      [
        "p",
        "**Example.** An e-commerce site launched in English and Tamil. Translators edit JSON files (extracted automatically from code), prices show as ₹1,23,456.00 through `Intl.NumberFormat`, plural forms are correct in both languages, and each language bundle loads only when selected. Adding Arabic later needed only a new JSON file and the `dir=\"rtl\"` switch, because layouts used logical CSS properties like `margin-inline-start`."
      ]
    ],
    "body": [
      [
        "h",
        "Library choice"
      ],
      [
        "table",
        [
          "",
          "react-i18next (i18next)",
          "react-intl (FormatJS)"
        ],
        [
          [
            "Message format",
            "Key-based JSON, plural suffixes (`_one`, `_other`), interpolation",
            "ICU MessageFormat (`{count, plural, one {# item} other {# items}}`)"
          ],
          [
            "Strengths",
            "Huge ecosystem, lazy-loading backends, language detector, namespaces",
            "Powerful ICU syntax, tight Intl integration, good for complex plural/select messages"
          ],
          [
            "Typical choice",
            "Most apps and teams",
            "Teams that already use ICU/translation tooling"
          ]
        ]
      ],
      [
        "h",
        "What 'i18n done properly' includes"
      ],
      [
        "ol",
        [
          "**No hardcoded text** — every user-visible string comes from resources, including `aria-label`, `title`, placeholders and validation messages.",
          "**Plurals and gender** via the library, not `count === 1 ? ... : ...`.",
          "**Formatting with `Intl`** — `NumberFormat`, `DateTimeFormat`, `RelativeTimeFormat`, `ListFormat`, and `Intl.Collator` for sorting.",
          "**RTL support** — set `dir`, use CSS logical properties (`margin-inline-start`, `padding-inline-end`) and mirror directional icons.",
          "**Text expansion** — avoid fixed-width buttons; test with long strings and pseudo-localization.",
          "**Lazy loading** — per-language and per-namespace so users download only what they need.",
          "**Language persistence** — URL segment (`/ta/...`, best for SEO), cookie or localStorage, with `fallbackLng`.",
          "**Workflow** — key extraction, a translation management system, review context for translators, CI check for missing keys."
        ]
      ],
      [
        "h",
        "i18n vs l10n"
      ],
      [
        "p",
        "**Internationalization (i18n)** is engineering the app so it *can* support many locales; **localization (l10n)** is adapting it for a specific locale (translations, formats, imagery, legal text)."
      ],
      [
        "h",
        "Interview answer"
      ],
      [
        "quote",
        "I use react-i18next with per-language JSON resources loaded lazily, so no text is hardcoded. I use interpolation and plural keys instead of concatenation, format numbers, currencies and dates with Intl, detect and persist the language with a fallback, and update the lang and dir attributes so RTL languages work, using logical CSS properties. I also plan for text expansion and a translation workflow with key extraction and missing-key checks in CI."
      ]
    ]
  }
];
