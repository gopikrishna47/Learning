import { code, quiz } from './helpers.js';

export default {
  id: 'w4',
  title: 'Login Citadel',
  icon: '🏰',
  color: '#f472b6',
  blurb: 'Build the login page defences: validation, XSS, open redirects, CSRF and brute-force protection.',
  levels: [
    code('w4-validate-login', {
      title: 'The Gatekeeper',
      difficulty: 'Easy',
      xp: 80,
      exports: ['validateLogin'],
      story: 'The login form sends everything to the API — even an empty email. Stop bad input at the door.',
      goal: 'Write `validateLogin({ email, password })` returning an errors object (`{}` when valid). Trim the email, never trim the password.',
      hints: [
        'Build an `errors` object and add a key only when something is wrong. Check "required" before "format".',
        '1) `const trimmed = email.trim()`\n2) empty → `errors.email = "Email is required"`; else regex `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/` → "Enter a valid email"\n3) password: empty → required; `length < 8` → "Password must be at least 8 characters"',
      ],
      learn: 'Client-side validation is for UX only — the server must validate again. And never trim or silently alter passwords: spaces are legal characters.',
    }),
    code('w4-escape-html', {
      title: 'The Script Sweeper',
      difficulty: 'Easy',
      xp: 80,
      exports: ['escapeHtml'],
      story: 'A comment containing `<script>` was injected straight into the page. Welcome to Cross-Site Scripting.',
      goal: 'Write `escapeHtml(value)` turning `& < > " \'` into HTML entities. `null`/`undefined` → empty string.',
      hints: [
        'Use chained `.replace(/x/g, "…")` calls. Replace `&` FIRST — otherwise you would re-escape the `&` of the entities you just created.',
        '`String(value)` → replace `&`→`&amp;`, `<`→`&lt;`, `>`→`&gt;`, `"`→`&quot;`, `\'`→`&#39;`',
      ],
      learn: 'React escapes text by default; `dangerouslySetInnerHTML` bypasses it. If you must render user HTML, sanitize with a library (DOMPurify) and add a Content-Security-Policy as a second layer.',
    }),
    code('w4-safe-redirect', {
      title: 'The Wrong Turn',
      difficulty: 'Medium',
      xp: 100,
      exports: ['isSafeRedirect'],
      story: 'After login the app sends users to `?redirect=…`. A phisher sends `?redirect=//evil.com`.',
      goal: 'Write `isSafeRedirect(url)` — true only for same-site paths. Block `//host`, backslash tricks, absolute URLs, `javascript:` and whitespace/control characters.',
      hints: [
        'Allow-list instead of block-list: the URL must START with a single `/`. Then reject anything that browsers might reinterpret.',
        '1) not a string → false\n2) must start with "/" and NOT with "//"\n3) reject control characters, whitespace and backslashes with one regex: `/[\\x00-\\x1f\\x7f\\s\\\\]/`',
      ],
      learn: 'Open redirects turn your trusted domain into a phishing launchpad. Always allow-list: relative paths or a fixed set of origins.',
    }),
    quiz('w4-quiz-security', {
      title: 'Attack & Defence',
      difficulty: 'Medium',
      xp: 80,
      story: 'Match the attack to the defence before the Citadel falls.',
      questions: [
        {
          q: 'A stored comment `<img src=x onerror=alert(1)>` runs script for every visitor because it is rendered with `dangerouslySetInnerHTML`. What is this?',
          options: ['CSRF', 'Stored XSS', 'SQL injection', 'A CORS misconfiguration'],
          answer: 1,
          explain: 'Untrusted data was stored and later rendered as HTML — stored (persistent) XSS. Escape or sanitize on output, and add CSP.',
        },
        {
          q: 'An API sends `Access-Control-Allow-Origin: *` together with `Access-Control-Allow-Credentials: true`. What happens in the browser?',
          options: ['Works — it is the most permissive setup', 'The browser blocks it: credentialed requests need an explicit origin', 'Cookies are dropped silently but the request succeeds', 'Only preflight requests fail'],
          answer: 1,
          explain: 'The wildcard is not allowed with credentials. (Blindly echoing the Origin header "fixes" the error but recreates the hole — use an allow-list.)',
        },
        {
          q: 'Which response header gives the strongest defence-in-depth against XSS?',
          options: ['X-Frame-Options', 'Content-Security-Policy', 'Strict-Transport-Security', 'Referrer-Policy'],
          answer: 1,
          explain: 'A strict CSP (no inline scripts, allow-listed sources/nonces) limits what injected script can do. HSTS forces HTTPS; X-Frame-Options stops clickjacking.',
        },
        {
          q: 'Which combination best protects a cookie-based session against CSRF?',
          options: ['`HttpOnly` only', '`SameSite=Lax/Strict` cookies plus an anti-CSRF token for state-changing requests', 'Hiding the form with CSS', 'Using GET for all actions'],
          answer: 1,
          explain: 'HttpOnly stops JavaScript from reading the cookie (XSS), not CSRF. SameSite limits cross-site sends; tokens prove the request came from your page.',
        },
      ],
      learn: 'Security answers are about layers: escape output (XSS), SameSite + tokens (CSRF), allow-lists (CORS/redirects), CSP + HSTS as seatbelts.',
    }),
    code('w4-login-limiter', {
      title: 'Boss: The Brute Forcer',
      difficulty: 'Boss',
      xp: 250,
      exports: ['createLoginLimiter'],
      boss: { name: 'The Brute Forcer', emoji: '🤖', taunt: 'password1… password2… password3…' },
      story: 'A bot is trying ten thousand passwords per minute against one account. Time to lock the door.',
      goal: 'Write `createLoginLimiter({ maxAttempts, windowMs, lockMs })` with `check`, `fail` and `success`: lock a key after too many failures in the window, and report `retryAfterMs`.',
      hints: [
        'Per key, store the timestamps of recent failures and a `lockedUntil` time. Use `Date.now()` for everything.',
        '1) `entries = new Map()`; each entry `{ failures: [], lockedUntil: 0 }`\n2) `fail`: drop failures older than `windowMs`, push now; at `maxAttempts` set `lockedUntil = now + lockMs`\n3) `check`: still locked → `{ allowed: false, retryAfterMs }`; lock over → reset the entry; else `{ allowed: true }`\n4) `success` deletes the entry',
      ],
      learn: 'Rate limiting belongs on the server (per account AND per IP). Add generic error messages ("invalid credentials"), MFA and breached-password checks for real protection.',
    }),
  ],
};
