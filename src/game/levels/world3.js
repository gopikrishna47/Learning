import { code, quiz } from './helpers.js';

export default {
  id: 'w3',
  title: 'JWT Jungle',
  icon: '🔑',
  color: '#a78bfa',
  blurb: 'Decode tokens, spot expiry, store them safely and refresh them silently.',
  levels: [
    quiz('w3-quiz-jwt', {
      title: 'Anatomy of a JWT',
      difficulty: 'Easy',
      xp: 60,
      story: 'You find `eyJhbGciOi…` in a network tab. What are you looking at?',
      questions: [
        {
          q: 'A JWT consists of three dot-separated parts. Which?',
          options: ['header.payload.signature', 'header.body.footer', 'key.value.expiry', 'id.secret.hash'],
          answer: 0,
          explain: 'Header (algorithm, type), payload (claims) and signature — each base64url-encoded.',
        },
        {
          q: 'Is the payload of a normal (signed) JWT encrypted?',
          options: ['Yes, with the signing key', 'No — it is only base64url-encoded; anyone can read it', 'Only with RS256', 'Yes, as long as HTTPS is used'],
          answer: 1,
          explain: 'Signing proves the token was not tampered with — it does not hide anything. Never put secrets or sensitive data in claims. (Encrypted tokens are a different thing: JWE.)',
        },
        {
          q: 'Which claim holds the expiry time, and in what unit?',
          options: ['`exp` — seconds since the Unix epoch', '`exp` — milliseconds since the Unix epoch', '`ttl` — seconds from now', '`expires` — an ISO date string'],
          answer: 0,
          explain: '`exp` is seconds since the epoch, while `Date.now()` is milliseconds. Mixing them up is a very common bug.',
        },
      ],
      learn: 'Remember: signed ≠ secret. The client may read a token, but only the server can verify it.',
    }),
    code('w3-decode-jwt', {
      title: 'The Token Reader',
      difficulty: 'Medium',
      xp: 100,
      exports: ['decodeJwt'],
      story: 'The UI wants to show "Hello, Ada" from the token claims — without a server round trip.',
      goal: 'Write `decodeJwt(token)` returning the payload object. Handle base64url, missing padding and UTF-8; throw `Invalid token` for bad input.',
      hints: [
        'The payload is base64URL: `-`→`+`, `_`→`/`, plus `=` padding. `atob` returns a binary string; percent-encode its bytes and use `decodeURIComponent` to get proper UTF-8.',
        '1) split on "." → must be 3 parts\n2) `base64 = parts[1].replace(/-/g,"+").replace(/_/g,"/")` and `padEnd` to a multiple of 4\n3) `atob(padded)` → map every char to `%xx` → `decodeURIComponent` → `JSON.parse`\n4) wrap in try/catch and throw `new Error("Invalid token")`',
      ],
      learn: 'Decoding is NOT verifying. The UI may read claims for display, but authorization decisions must be made by the server after verifying the signature.',
    }),
    code('w3-token-expiry', {
      title: 'The Expiry Clock',
      difficulty: 'Medium',
      xp: 100,
      exports: ['isTokenExpired'],
      story: 'A request failed because the token expired mid-flight. Check expiry BEFORE sending.',
      goal: 'Write `isTokenExpired(token, skewSeconds = 30)`. Compare `exp` (seconds) with `Date.now()` (ms), treat tokens as expired early by the skew, and fail closed on bad tokens.',
      hints: [
        'Convert: `exp * 1000` is milliseconds. Subtract the skew first: `(exp - skewSeconds) * 1000`.',
        '1) `try { const { exp } = decodeJwt(token) … } catch { return true }`\n2) `typeof exp !== "number"` → return true\n3) `return Date.now() >= (exp - skewSeconds) * 1000`',
      ],
      learn: '"Fail closed" is a core security habit: when you cannot prove a token is valid, treat it as invalid.',
    }),
    quiz('w3-quiz-storage', {
      title: 'Where Do Tokens Live?',
      difficulty: 'Medium',
      xp: 70,
      story: 'The most debated question in frontend auth. Choose carefully.',
      questions: [
        {
          q: 'Which place exposes an access token the LEAST to an XSS attack?',
          options: ['`localStorage`', 'A JavaScript variable in memory (with the refresh token in an httpOnly cookie)', 'A cookie readable from JavaScript', '`sessionStorage`, because it clears when the tab closes'],
          answer: 1,
          explain: 'Anything JavaScript can read (localStorage, sessionStorage, normal cookies) can be stolen by an injected script. In-memory tokens plus an httpOnly refresh cookie shrink that window.',
        },
        {
          q: 'You move the session into an httpOnly cookie. Which attack becomes relevant again?',
          options: ['XSS reading the cookie', 'CSRF — the browser attaches the cookie automatically', 'SQL injection', 'Clickjacking only'],
          answer: 1,
          explain: 'Cookies are sent automatically, so a malicious site can trigger requests on the user\'s behalf. Defend with SameSite=Lax/Strict cookies and/or anti-CSRF tokens.',
        },
        {
          q: 'Which OAuth 2.0 flow should a modern single-page app use?',
          options: ['Implicit flow', 'Authorization Code flow with PKCE', 'Resource Owner Password Credentials', 'Client Credentials'],
          answer: 1,
          explain: 'The implicit flow is deprecated. Authorization Code + PKCE keeps tokens out of the URL and works without a client secret.',
        },
      ],
      learn: 'A great interview answer names the trade-off: XSS risk (JS-readable storage) vs CSRF risk (cookies) — and how you mitigate each.',
    }),
    code('w3-auth-client', {
      title: 'Boss: The Silent Refresh',
      difficulty: 'Boss',
      xp: 300,
      exports: ['createAuthClient'],
      boss: { name: 'The Silent Refresh', emoji: '🐍', taunt: 'Five requests, five 401s, five refreshes… hssss!' },
      story: 'Access tokens last 5 minutes. When they expire, five parallel requests all get a 401 — and each starts its own refresh. Tame the serpent.',
      goal: 'Build `createAuthClient({ baseUrl })` with `login`, `request` and `logout`: bearer headers, one retry after a refresh, and a single shared refresh for simultaneous 401s.',
      hints: [
        'Keep `token` and a `refreshing` promise in the closure. While a refresh is in flight, every caller awaits that same promise instead of starting a new one.',
        '1) `login`: POST JSON → store `accessToken` in a variable\n2) `send(path, options)` adds `Authorization: Bearer <token>` (merge existing headers)\n3) `refresh()`: `if (!refreshing) refreshing = fetch(…).then(store token).catch(clear token + rethrow).finally(() => refreshing = null)`; return it\n4) `request`: no token → throw; `res.status !== 401` → return; else `await refresh()` and `send` again',
      ],
      learn: 'The shared in-flight promise ("single-flight") is a pattern you will reuse for any expensive idempotent call. Axios interceptors implement this exact queue.',
    }),
  ],
};
