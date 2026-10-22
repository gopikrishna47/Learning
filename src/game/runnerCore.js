// ─────────────────────────────────────────────────────────────────
//  runnerCore.js — the engine behind every code level.
//
//  Pure JavaScript (no DOM, no React) so the very same code runs
//    • in a Web Worker in the browser (runner.worker.js), and
//    • in Node for `npm run verify:game`.
//
//  Player code is evaluated with *fake* timers, Date and fetch:
//    • `setTimeout`/`setInterval`/`Date.now()` follow a virtual clock that tests
//      advance with `await clock.tick(ms)` — debounce/throttle/retry tests are
//      instant and perfectly deterministic.
//    • `fetch` is a programmable mock (`mockFetch([...])`) — no network.
// ─────────────────────────────────────────────────────────────────

const realSetTimeout = setTimeout;
const realNow = () => Date.now();
const flush = () => new Promise((resolve) => realSetTimeout(resolve, 0));
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

class AssertionError extends Error {
  constructor(message) { super(message); this.name = 'AssertionError'; }
}

// ── virtual clock ───────────────────────────────────────────────
export function createClock(start = 1_700_000_000_000) {
  let now = start;
  let ids = 0;
  let tie = 0;
  const timers = new Map();
  const uncaught = [];

  const add = (fn, ms, args, repeat) => {
    const delay = Math.max(0, Number(ms) || 0);
    const id = ++ids;
    timers.set(id, { id, at: now + delay, tie: ++tie, fn, args, repeat });
    return id;
  };

  return {
    uncaught,
    now: () => now,
    pending: () => timers.size,
    setTimeout: (fn, ms, ...args) => add(fn, ms, args, 0),
    setInterval: (fn, ms, ...args) => add(fn, ms, args, Math.max(1, Number(ms) || 0)),
    clearTimeout: (id) => { timers.delete(id); },
    clearInterval: (id) => { timers.delete(id); },
    /** Advance virtual time by `ms`, firing due timers in order and letting promises settle in between. */
    async tick(ms = 0) {
      const target = now + ms;
      await flush();
      let guard = 0;
      for (;;) {
        let next = null;
        for (const t of timers.values()) {
          if (t.at <= target && (!next || t.at < next.at || (t.at === next.at && t.tie < next.tie))) next = t;
        }
        if (!next) break;
        if (++guard > 5000) throw new Error('Too many timers fired — is something looping with setInterval / setTimeout(…, 0)?');
        now = next.at;
        if (next.repeat) { next.at = now + next.repeat; next.tie = ++tie; } else timers.delete(next.id);
        try { if (typeof next.fn === 'function') next.fn(...next.args); } catch (error) { uncaught.push(error); }
        await flush();
      }
      now = target;
    },
  };
}

function createFakeDate(clock) {
  const RealDate = Date;
  function FakeDate(...args) {
    if (!new.target) return new RealDate(clock.now()).toString();
    return args.length ? new RealDate(...args) : new RealDate(clock.now());
  }
  FakeDate.now = () => clock.now();
  FakeDate.parse = RealDate.parse;
  FakeDate.UTC = RealDate.UTC;
  FakeDate.prototype = RealDate.prototype;
  return FakeDate;
}

// ── programmable fetch mock ─────────────────────────────────────
const STATUS_TEXT = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 429: 'Too Many Requests', 500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable' };

function makeResponse(step) {
  const status = step.status ?? 200;
  const headers = Object.fromEntries(Object.entries(step.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  const text = () => (typeof step.body === 'string' ? step.body : JSON.stringify(step.body ?? null));
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: STATUS_TEXT[status] || '',
    headers: { get: (name) => headers[String(name).toLowerCase()] ?? null },
    json: async () => {
      if (step.invalidJson) throw new SyntaxError('Unexpected token < in JSON');
      return JSON.parse(text());
    },
    text: async () => text(),
    clone() { return makeResponse(step); },
  };
}

function createFetchMock(clock) {
  const state = { impl: async () => { throw new TypeError('fetch was called but this test did not set up mockFetch(…)'); } };
  const fetch = (...args) => state.impl(...args);

  /** mockFetch([...steps]) → steps are used in order (the last one repeats).
   *  mockFetch((url, options, callIndex) => step) → decide per call.
   *  step = { status?, body?, headers?, delay?, reject? }. Returns the live `calls` array. */
  const install = (handler) => {
    const calls = [];
    state.impl = (url, options = {}) => {
      // Safety net: an endless retry/refresh loop would otherwise eat memory until the tab dies.
      if (calls.length >= 300) return Promise.reject(new Error('fetch was called 300+ times in one test — is your code stuck in an endless retry loop?'));
      const index = calls.length;
      calls.push({ url: String(url), options });
      const step = (typeof handler === 'function' ? handler(String(url), options, index) : handler[Math.min(index, handler.length - 1)]) || {};
      return new Promise((resolve, reject) => {
        const abort = () => reject(Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' }));
        const { signal } = options;
        if (signal && signal.aborted) { abort(); return; }
        const settle = () => (step.reject ? reject(new TypeError(step.reject === true ? 'Failed to fetch' : step.reject)) : resolve(makeResponse(step)));
        let timer = null;
        if (step.delay > 0) timer = clock.setTimeout(settle, step.delay); else settle();
        if (signal && signal.addEventListener) signal.addEventListener('abort', () => { clock.clearTimeout(timer); abort(); }, { once: true });
      });
    };
    return calls;
  };
  return { fetch, install };
}

// ── assertions & helpers available to tests ─────────────────────
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}

function show(value) {
  try {
    if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
    if (value === undefined) return 'undefined';
    const text = JSON.stringify(value);
    return text.length > 120 ? `${text.slice(0, 117)}…` : text;
  } catch { return String(value); }
}

export function expect(actual) {
  const fail = (message) => { throw new AssertionError(message); };
  const matchers = (negate) => {
    const check = (pass, message, negated) => { if (negate ? pass : !pass) fail(negate ? negated : message); };
    return {
      toBe: (expected) => check(Object.is(actual, expected), `Expected ${show(expected)} but got ${show(actual)}`, `Expected value NOT to be ${show(expected)}`),
      toEqual: (expected) => check(deepEqual(actual, expected), `Expected ${show(expected)} but got ${show(actual)}`, `Expected value NOT to equal ${show(expected)}`),
      toContain: (item) => check(actual != null && actual.includes(item), `Expected ${show(actual)} to contain ${show(item)}`, `Expected ${show(actual)} NOT to contain ${show(item)}`),
      toBeTruthy: () => check(Boolean(actual), `Expected a truthy value but got ${show(actual)}`, `Expected a falsy value but got ${show(actual)}`),
      toBeFalsy: () => check(!actual, `Expected a falsy value but got ${show(actual)}`, `Expected a truthy value but got ${show(actual)}`),
      toBeNull: () => check(actual === null, `Expected null but got ${show(actual)}`, 'Expected value NOT to be null'),
      toBeUndefined: () => check(actual === undefined, `Expected undefined but got ${show(actual)}`, 'Expected value NOT to be undefined'),
      toBeGreaterThan: (n) => check(actual > n, `Expected ${show(actual)} to be greater than ${n}`, `Expected ${show(actual)} NOT to be greater than ${n}`),
      toBeLessThan: (n) => check(actual < n, `Expected ${show(actual)} to be less than ${n}`, `Expected ${show(actual)} NOT to be less than ${n}`),
      toMatch: (re) => check(typeof actual === 'string' && re.test(actual), `Expected ${show(actual)} to match ${re}`, `Expected ${show(actual)} NOT to match ${re}`),
      toBeFunction: () => check(typeof actual === 'function', `Expected a function but got ${show(actual)}`, 'Expected value NOT to be a function'),
      toThrow: (re) => {
        let thrown = null;
        try { actual(); } catch (error) { thrown = error; }
        const pass = thrown !== null && (!re || re.test(thrown.message));
        check(pass, thrown ? `Expected the error message to match ${re} but got "${thrown.message}"` : 'Expected the function to throw, but it did not', 'Expected the function NOT to throw');
      },
    };
  };
  return { ...matchers(false), not: matchers(true) };
}

export function spy(impl = () => undefined) {
  const fn = function (...args) {
    fn.calls.push(args);
    fn.thisValues.push(this);
    return impl.apply(this, args);
  };
  fn.calls = [];
  fn.thisValues = [];
  Object.defineProperty(fn, 'callCount', { get: () => fn.calls.length });
  return fn;
}

async function rejects(promise) {
  try { await promise; } catch (error) { return error; }
  throw new AssertionError('Expected the promise to reject, but it resolved');
}

/** Watch a promise without awaiting it: { state: 'pending' | 'resolved' | 'rejected', value, error }. */
function track(promise) {
  const info = { state: 'pending', value: undefined, error: undefined };
  promise.then((value) => { info.state = 'resolved'; info.value = value; }, (error) => { info.state = 'rejected'; info.error = error; });
  return info;
}

const describeError = (error) => {
  if (error instanceof AssertionError) return error.message;
  const name = error && error.name ? error.name : 'Error';
  return `${name}: ${error && error.message !== undefined ? error.message : String(error)}`;
};

const formatLog = (args) => args.map((a) => (typeof a === 'string' ? a : show(a))).join(' ');

/**
 * Run `tests` against the player's `code`.
 * Resolves to { ok, compileError?, results: [{ name, pass, error? }], logs }.
 * `onResult` streams each result as soon as it is known.
 */
export async function runChallenge({ code, exports: exportNames = [], tests, onResult = () => {}, perTestTimeout = 1200 }) {
  const rt = { clock: createClock(), fetchMock: null };
  rt.fetchMock = createFetchMock(rt.clock);
  const logs = [];
  const push = (level) => (...args) => { if (logs.length < 200) logs.push({ level, text: formatLog(args) }); };
  const sandboxConsole = { log: push('log'), info: push('info'), warn: push('warn'), error: push('error'), debug: push('log') };

  // The player's code talks to stable wrappers; each test swaps in a fresh clock / fetch mock.
  const sandbox = {
    setTimeout: (...a) => rt.clock.setTimeout(...a),
    clearTimeout: (...a) => rt.clock.clearTimeout(...a),
    setInterval: (...a) => rt.clock.setInterval(...a),
    clearInterval: (...a) => rt.clock.clearInterval(...a),
    fetch: (...a) => rt.fetchMock.fetch(...a),
    Date: createFakeDate({ now: () => rt.clock.now() }),
    performance: { now: () => rt.clock.now() - 1_700_000_000_000 },
    console: sandboxConsole,
  };
  const names = Object.keys(sandbox);

  let api;
  try {
    const exportsLiteral = exportNames.map((n) => `${n}: typeof ${n} === 'undefined' ? undefined : ${n}`).join(', ');
    api = new Function(...names, `"use strict";\n${code}\n;return { ${exportsLiteral} };`)(...names.map((n) => sandbox[n]));
  } catch (error) {
    const hint = /\bexport\b|\bimport\b/.test(code) ? ' (hint: don\'t use import/export here — just define the function)' : '';
    return { ok: false, compileError: `${describeError(error)}${hint}`, results: [], logs };
  }
  const missing = exportNames.filter((n) => typeof api[n] !== 'function');
  if (missing.length) {
    return { ok: false, compileError: `Define ${missing.map((n) => `\`${n}\``).join(', ')} — the tests can't find ${missing.length > 1 ? 'them' : 'it'}.`, results: [], logs };
  }

  const registered = [];
  const testApi = {
    test: (name, fn) => registered.push({ name, fn }),
    expect,
    spy,
    rejects,
    track,
    clock: { tick: (ms) => rt.clock.tick(ms), now: () => rt.clock.now(), pending: () => rt.clock.pending() },
    mockFetch: (handler) => rt.fetchMock.install(handler),
    sleep: (ms) => new Promise((resolve) => rt.clock.setTimeout(resolve, ms)),
  };
  try {
    await new AsyncFunction('exports', ...Object.keys(testApi), tests)(api, ...Object.values(testApi));
  } catch (error) {
    return { ok: false, compileError: `Level test error: ${describeError(error)}`, results: [], logs };
  }

  const results = [];
  for (const { name, fn } of registered) {
    rt.clock = createClock();
    rt.fetchMock = createFetchMock(rt.clock);
    let result;
    try {
      await Promise.race([
        Promise.resolve().then(fn),
        new Promise((_, reject) => realSetTimeout(() => reject(new Error('Timed out — a promise never settled (forgot to resolve/reject, or to await?)')), perTestTimeout)),
      ]);
      if (rt.clock.uncaught.length) throw rt.clock.uncaught[0];
      result = { name, pass: true };
    } catch (error) {
      result = { name, pass: false, error: describeError(error) };
    }
    results.push(result);
    onResult(result);
  }
  return { ok: results.length > 0 && results.every((r) => r.pass), results, logs, startedAt: realNow() };
}
