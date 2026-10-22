import { code, quiz } from './helpers.js';

export default {
  id: 'w5',
  title: 'Entra Embassy',
  icon: '🪪',
  color: '#38bdf8',
  blurb: 'Microsoft identity: MSAL in the browser, tokens and scopes, and Managed Identity (MSI) on the server.',
  levels: [
    quiz('w5-quiz-msal', {
      title: 'MSAL & MSI Basics',
      difficulty: 'Easy',
      xp: 80,
      story: 'Welcome to the Entra Embassy — Microsoft\'s identity platform (formerly Azure AD).',
      questions: [
        {
          q: 'Which OAuth 2.0 grant does MSAL.js use for single-page apps?',
          options: ['Implicit flow', 'Authorization Code flow with PKCE', 'Client credentials', 'Resource owner password'],
          answer: 1,
          explain: 'MSAL.js 2.x+ uses the Authorization Code flow with PKCE — no client secret in the browser, and tokens never travel in the URL.',
        },
        {
          q: 'With `@azure/msal-react`, which component makes the `PublicClientApplication` instance available to hooks like `useMsal`?',
          options: ['`MsalProvider`', '`AuthProvider`', '`MsalContext.Consumer`', '`UnauthenticatedTemplate`'],
          answer: 0,
          explain: 'Wrap your app in `<MsalProvider instance={msalInstance}>`. `AuthenticatedTemplate` / `UnauthenticatedTemplate` then render by sign-in state.',
        },
        {
          q: 'MSAL caches tokens in `sessionStorage` by default. Why might a team switch to `localStorage`, and what is the cost?',
          options: ['Faster tokens, no cost', 'Single sign-on across tabs; a larger XSS blast radius', 'Longer-lived tokens; no cost', 'It is required for refresh tokens'],
          answer: 1,
          explain: 'localStorage shares the session across tabs and survives restarts, but any injected script can read it. It is a convenience vs. security trade-off.',
        },
        {
          q: 'An Azure Function (server-side) must read secrets from Key Vault without storing any credentials. Best option?',
          options: ['A client secret in an environment variable committed to the repo', 'A Managed Identity (MSI) assigned to the Function', 'MSAL.js with an interactive popup', 'A shared password in app settings'],
          answer: 1,
          explain: 'Managed Identity gives the Azure resource its own identity; the platform issues tokens (via the metadata endpoint) — nothing to store, rotate or leak. Use it server-side; MSAL is for user sign-in.',
        },
      ],
      learn: 'Rule of thumb: users sign in with MSAL (auth code + PKCE); Azure workloads authenticate with Managed Identity; secrets in code are a last resort.',
    }),
    quiz('w5-quiz-tokens', {
      title: 'Tokens, Scopes & Interaction',
      difficulty: 'Medium',
      xp: 90,
      story: 'The embassy guards issue three kinds of tokens. Know which one to hand over.',
      questions: [
        {
          q: '`acquireTokenSilent` throws an `InteractionRequiredAuthError` (expired session, MFA or consent needed). What should the app do?',
          options: ['Show a generic error and stop', 'Fall back to `acquireTokenPopup` or `acquireTokenRedirect`', 'Retry silently in a loop', 'Clear all storage and reload'],
          answer: 1,
          explain: 'Silent first (no UI), interactive as the fallback. Always branch on the error type — other errors (network etc.) should not open a popup.',
        },
        {
          q: 'Which token should your SPA send as the `Bearer` token to your own web API?',
          options: ['The ID token', 'The access token issued for that API\'s scope', 'The refresh token', 'Any token — they are interchangeable'],
          answer: 1,
          explain: 'The ID token is for the client app (who signed in). The access token — whose audience (`aud`) is your API — is what the API validates.',
        },
        {
          q: 'What do the `scopes` in `{ scopes: ["api://<app-id>/access_as_user"] }` decide?',
          options: ['Which browser tabs may use the token', 'Which permissions on which resource the access token grants', 'How long the token lives', 'Which users may sign in'],
          answer: 1,
          explain: 'Scopes request permissions for a resource; the resulting access token\'s audience and `scp` claim reflect them. Ask for the minimum you need.',
        },
      ],
      learn: 'Interview line: "ID token = who you are, access token = what you may call, refresh token = how MSAL renews silently."',
    }),
    code('w5-get-token', {
      title: 'Silent First, Popup Second',
      difficulty: 'Medium',
      xp: 120,
      exports: ['getAccessToken'],
      story: 'Users keep getting popups on every page. Most of the time a silent token request would have worked.',
      goal: 'Write `getAccessToken(msal, request)`: pick the active (or first) account, try `acquireTokenSilent`, and fall back to `acquireTokenPopup` only on `InteractionRequiredAuthError`.',
      hints: [
        'Branch on `err.name`. Only the interaction error justifies a popup — rethrow everything else.',
        '1) `account = msal.getActiveAccount() || msal.getAllAccounts()[0]`; none → throw "No signed-in account"\n2) `try { (await msal.acquireTokenSilent({ ...request, account })).accessToken }`\n3) `catch (err)`: `err.name === "InteractionRequiredAuthError"` → popup; else `throw err`',
      ],
      learn: 'This try-silent-then-interactive wrapper is the pattern from the MSAL docs. In msal-react the `useMsalAuthentication` hook and `MsalAuthenticationTemplate` do it for you.',
    }),
    code('w5-managed-identity', {
      title: 'The Secretless Server',
      difficulty: 'Hard',
      xp: 150,
      exports: ['createManagedIdentityTokenProvider'],
      story: 'Your VM talks to Key Vault. There are no secrets in the repo — the platform vouches for it via the instance metadata service.',
      goal: 'Write `createManagedIdentityTokenProvider(resource)` returning `getToken()`: call the IMDS endpoint, cache the token until 60 s before expiry, and share one in-flight request.',
      hints: [
        'Cache `{ token, expiresAt }` where `expiresAt = Number(expires_on) * 1000`. Keep a separate `inFlight` promise so parallel callers share one request.',
        '1) URL: `http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=` + `encodeURIComponent(resource)` with header `Metadata: "true"`\n2) `!res.ok` → `throw new Error(`IMDS ${res.status}`)`\n3) `getToken`: cached and `Date.now() < expiresAt - 60000` → return it\n4) else `inFlight ||= fetchToken().finally(() => inFlight = null)` and return it',
      ],
      learn: 'In real code use `DefaultAzureCredential` from `@azure/identity` — it does exactly this (plus App Service/Functions endpoints and local-dev fallbacks). Managed identity only works inside Azure.',
    }),
    code('w5-msal-client', {
      title: 'Boss: The Token Warden',
      difficulty: 'Boss',
      xp: 300,
      exports: ['createMsalApiClient'],
      boss: { name: 'The Token Warden', emoji: '🛡️', taunt: 'Your token has been revoked. Prove yourself again!' },
      story: 'The API revoked a session. Cached tokens still look valid to MSAL — until the API says 401.',
      goal: 'Build `createMsalApiClient(msal, { baseUrl, scopes })` with `request(path, options)`: bearer tokens from MSAL, silent→popup fallback, and ONE retry with `forceRefresh: true` after a 401.',
      hints: [
        'Write one `getToken(forceRefresh)` helper that does account lookup + silent + popup fallback. `request` calls it once, and again with `true` only after a 401.',
        '1) `getToken(forceRefresh = false)`: account (or throw) → `acquireTokenSilent({ scopes, account, forceRefresh })` → on InteractionRequiredAuthError → `acquireTokenPopup({ scopes, account })`\n2) `send(path, options, token)` merges the Authorization header\n3) `request`: `res = send(…, await getToken())`; if `res.status !== 401` return it; else `return send(…, await getToken(true))`',
      ],
      learn: '`forceRefresh: true` bypasses the token cache. Pair it with a hard cap on retries — the client must never loop on a 401.',
    }),
  ],
};
